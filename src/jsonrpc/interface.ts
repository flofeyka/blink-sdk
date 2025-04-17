import { Subscription } from "./subscription";

export interface JsonRpcClient {
  send(method: string, ...params: any[]): Promise<unknown>;

  subscribe?(
    subscribeMethod: string,
    unsubscribeMethod: string,
    callback: (result: unknown) => void,
    ...params: any[]
  ): Promise<Subscription>;
}
