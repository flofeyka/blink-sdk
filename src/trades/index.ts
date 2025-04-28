import { JsonRpcClient } from "../jsonrpc";
import { HttpClient } from "../jsonrpc/http";
import { Subscription } from "../jsonrpc/subscription";
import { WebsocketClient } from "../jsonrpc/ws";
import schema, {
  GetCandlesticks2Params,
  GetCandlesticksParams,
  GetCandlesticksResponse,
  GetTotalsParams,
  GetTotalsResponse,
  GetTradesParams,
  GetTradesResponse,
  SubscribeTradesParams,
  Trade,
} from "./schema";

export class TradesClient {
  private constructor(private _client: JsonRpcClient) {}

  static http(url: string | URL): TradesClient {
    const client = new HttpClient(url);
    return new TradesClient(client);
  }

  static websocket(address: string | URL): TradesClient {
    const client = new WebsocketClient(address);
    return new TradesClient(client);
  }

  async send(method: string, params: any[]): Promise<unknown> {
    return this._client.send(method, params);
  }

  async getTrades(params: GetTradesParams): Promise<GetTradesResponse> {
    const result = await this._client.send("getTrades", [params]);
    return schema.getTradesResponse.parse(result);
  }

  async getCandlesticks(params: GetCandlesticksParams): Promise<GetCandlesticksResponse> {
    const result = await this._client.send("getCandlesticks", [params]);
    return schema.getCandlesticksResponse.parse(result);
  }

  async getCandlesticks2(params: GetCandlesticks2Params): Promise<GetCandlesticksResponse> {
    const result = await this._client.send("getCandlesticks2", [params]);
    return schema.getCandlesticksResponse.parse(result);
  }

  async getTotals(params: GetTotalsParams): Promise<GetTotalsResponse> {
    const result = await this._client.send("getTotals", [params]);
    return schema.getTotalsResponse.parse(result);
  }

  async subscribeTrades(
    params: SubscribeTradesParams,
    callback: (result: Trade) => void
  ): Promise<Subscription> {
    if (!this._client.subscribe) {
      throw new Error("`subscribe` unsupported");
    }
    return this._client.subscribe(
      "subscribeTrades",
      "unsubscribeTrades",
      (result) => callback(schema.trade.parse(result)),
      [params]
    );
  }
}
