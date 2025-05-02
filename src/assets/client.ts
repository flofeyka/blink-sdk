import { JsonRpcClient } from "../jsonrpc";
import { HttpClient } from "../jsonrpc/http";
import schema, { GetAssetsInfoParams, GetAssetsInfoResponse, TokenMetadata } from "./schema";

export class AssetsClient {
  private constructor(private _client: JsonRpcClient) {}

  static http(url: string | URL): AssetsClient {
    const client = new HttpClient(url);
    return new AssetsClient(client);
  }

  async getAssetsInfo(pubkeys: GetAssetsInfoParams): Promise<GetAssetsInfoResponse> {
    const result = await this._client.send("getAssetsInfo", [pubkeys]);
    return schema.getAssetsInfoResponse.parse(result);
  }

  async getTokenMetadata(uri: string): Promise<TokenMetadata> {
    const result = await this._client.send("getTokenMetadata", [uri]);
    return schema.tokenMetadata.parse(result);
  }

  async send(method: string, params: any[]): Promise<unknown> {
    return this._client.send(method, params);
  }
}
