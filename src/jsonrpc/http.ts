import { z } from "zod";
import { JsonRpcClient, JsonRpcError } from ".";
import schema from "./schema";

export class HttpClient implements JsonRpcClient {
  private id = 0;

  constructor(readonly url: string | URL) {}

  isHttp(): boolean {
    return true;
  }

  async send(method: string, params: any[], options?: HttpClient.Options): Promise<unknown> {
    this.id += 1;
    const id = this.id;
    const response = await fetch(this.url, {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params,
      }),
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
      },
    });

    const json = parseJson(await response.text());
    const jsonRpcResponse = parseResponse(json);

    if (jsonRpcResponse.error !== undefined) {
      const { code, message, data } = jsonRpcResponse.error;
      throw new HttpClientError({
        tag: "JsonRpc",
        e: new JsonRpcError(code, message, data),
      });
    } else if (jsonRpcResponse.result !== undefined) {
      return jsonRpcResponse.result;
    } else {
      throw new HttpClientError({ tag: "ResultUndefined" });
    }
  }
}

export namespace HttpClient {
  export type Options = Pick<RequestInit, "headers">;
}

export class HttpClientError extends Error {
  readonly s: Readonly<HttpClientError.Struct>;

  constructor(s: HttpClientError.Struct) {
    switch (s.tag) {
      case "Syntax": {
        super(`HttpClientError::Syntax(e = ${s.e}, text = ${s.text})`);
        break;
      }
      case "Zod": {
        super(`HttpClientError::Zod(e = ${s.e})`);
        break;
      }
      case "JsonRpc": {
        super(`HttpClientError::Zod(e = ${s.e})`);
        break;
      }
      case "ResultUndefined": {
        super(`HttpClientError::ResultUndefined`);
        break;
      }
      default: {
        super("HttpClientError::default");
        break;
      }
    }
    this.s = Object.freeze(s);
  }
}

export namespace HttpClientError {
  export type Struct =
    | { tag: "Syntax"; e: SyntaxError; text: string }
    | { tag: "Zod"; e: z.ZodError }
    | { tag: "JsonRpc"; e: JsonRpcError }
    | { tag: "ResultUndefined" };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new HttpClientError({ tag: "Syntax", e, text });
    }
    throw e;
  }
}

function parseResponse(json: unknown): z.infer<typeof schema.response> {
  try {
    return schema.response.parse(json);
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new HttpClientError({ tag: "Zod", e });
    }
    throw e;
  }
}
