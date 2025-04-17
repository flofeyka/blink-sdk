import type { ClientRequestArgs } from "http";
import WebSocket, { ClientOptions, Data, MessageEvent } from "ws";
import { z } from "zod";
import { JsonRpcError } from ".";
import schema, { Id } from "./schema";

export class WebsocketClient {
  readonly open: Promise<void>;

  private _send: SendFunction;
  private _subscribe: SubscribeFunction;

  constructor(readonly address: string | URL, options?: ClientOptions | ClientRequestArgs) {
    const ws =
      "WebSocket" in window ? new window.WebSocket(address) : new WebSocket(address, options);

    const requests = new Map<Id, RequestHandle>([]);
    const subscriptions = new Map<number, SubscriptionHandle>();

    const open = new Promise<void>((resolve) => ws.addEventListener("open", () => resolve()));

    const send = buildSendFunction(ws, open, requests);
    const subscribe = buildSubscribeFunction(send, subscriptions);

    const messageHandler = buildMessageHandler(requests, subscriptions);
    ws.addEventListener("message", messageHandler);

    this.open = open;
    this._send = send;
    this._subscribe = subscribe;
  }

  send(method: string, ...params: any[]): Promise<unknown> {
    return this._send(method, ...params);
  }

  subscribe(
    subscribeMethod: string,
    unsubscribeMethod: string,
    callback: (result: unknown) => void,
    ...params: any[]
  ): Promise<Subscription> {
    return this._subscribe(subscribeMethod, unsubscribeMethod, callback, ...params);
  }
}

export class WebsocketClientError extends Error {
  readonly struct: Readonly<WebsocketClientError.Struct>;

  constructor(struct: WebsocketClientError.Struct) {
    switch (struct.type) {
      case "InvalidSubscribeMethodReturnType": {
        super(`invalid subscribe method return type \`${struct.ty}\`, expected \`number\``);
        break;
      }
      case "InvalidUnsubscribeMethodReturnValue": {
        super(`invalid unsubscribe method return value \`${struct.value}\`, expected \`true\``);
        break;
      }
      default: {
        super("unreachable");
        break;
      }
    }
    this.struct = Object.freeze(struct);
  }
}

export namespace WebsocketClientError {
  export type Struct =
    | { type: "InvalidSubscribeMethodReturnType"; ty: string; e: z.ZodError }
    | { type: "InvalidUnsubscribeMethodReturnValue"; value: unknown };
}

export class Subscription {
  constructor(
    readonly id: number,
    readonly method: string,
    private _unsubscribe: () => Promise<void>
  ) {}

  unsubscribe(): Promise<void> {
    return this._unsubscribe();
  }
}

type SendFunction = (method: string, ...params: any[]) => Promise<unknown>;

type SubscribeFunction = (
  subscribeMethod: string,
  unsubscribeMethod: string,
  callback: (result: unknown) => void,
  ...params: any[]
) => Promise<Subscription>;

type RequestHandle = {
  resolve: (data: unknown) => void;
  reject: (reason?: any) => void;
};

type SubscriptionHandle = {
  callback: (result: unknown) => void;
};

function buildSendFunction(
  ws: WebSocket | globalThis.WebSocket,
  open: Promise<void>,
  requests: Map<Id, RequestHandle>
): SendFunction {
  let id = 0;
  return async (method: string, ...params: any[]): Promise<unknown> => {
    await open;
    id++;
    const message = JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    });
    ws.send(message);
    return new Promise((resolve, reject) => {
      requests.set(id, { resolve, reject });
    });
  };
}

function buildSubscribeFunction(
  send: SendFunction,
  subscriptions: Map<number, SubscriptionHandle>
): SubscribeFunction {
  return async (
    subscribeMethod: string,
    unsubscribeMethod: string,
    callback: (result: unknown) => void,
    ...params: any[]
  ): Promise<Subscription> => {
    const result = await send(subscribeMethod, ...params);

    let id: number;
    try {
      id = z.number().parse(result);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new WebsocketClientError({
          type: "InvalidSubscribeMethodReturnType",
          ty: typeof result,
          e,
        });
      }
      throw e;
    }
    subscriptions.set(id, { callback });

    const unsubscribe = async () => {
      const result = await send(unsubscribeMethod);
      if (result !== true) {
        throw new WebsocketClientError({
          type: "InvalidUnsubscribeMethodReturnValue",
          value: result,
        });
      }
      subscriptions.delete(id);
    };

    return new Subscription(id, subscribeMethod, unsubscribe);
  };
}

function buildMessageHandler(
  requests: Map<Id, RequestHandle>,
  subscriptions: Map<number, SubscriptionHandle>
) {
  return (event: MessageEvent | globalThis.MessageEvent<any>) => {
    const incomingMessage = parseIncomingMessage(event.data);

    if ("id" in incomingMessage) {
      const response = incomingMessage;

      const request = requests.get(response.id);
      requests.delete(response.id);

      if (request !== undefined) {
        if (response.error !== undefined) {
          const error = response.error;
          const reason = new JsonRpcError(error.code, error.message, error.data);
          request.reject(reason);
        } else if (response.result !== undefined) {
          request.resolve(response.result);
        }
      }
    } else if ("params" in incomingMessage) {
      const params = incomingMessage.params;

      const subscription = subscriptions.get(params.subscription);
      if (subscription !== undefined) {
        subscription.callback(params.result);
      }
    }
  };
}

function parseIncomingMessage(data: Data): z.infer<typeof schema.incomingMessage> {
  if (Array.isArray(data)) {
    throw new Error("invalid data type");
  }
  const text = data.toString("utf-8");
  const json = JSON.parse(text);
  return schema.incomingMessage.parse(json);
}
