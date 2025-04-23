import { Subscription } from "./subscription";

export type SendFunction = (method: string, params: any[]) => Promise<unknown>;

export type SubscribeFunction = (
  subscribeMethod: string,
  unsubscribeMethod: string,
  callback: (result: unknown) => void,
  params: any[]
) => Promise<Subscription>;

export interface JsonRpcClient {
  isHttp(): boolean;

  send(method: string, params: any[]): Promise<unknown>;

  subscribe?(
    subscribeMethod: string,
    unsubscribeMethod: string,
    callback: (result: unknown) => void,
    params: any[]
  ): Promise<Subscription>;
}

export class JsonRpcError extends Error {
  readonly data: Readonly<any | undefined>;

  constructor(readonly code: number, readonly message: string, data?: any) {
    super(`JsonRpcError(code = ${code}, message = ${message})`);
    this.data = Object.freeze(data);
  }
}
