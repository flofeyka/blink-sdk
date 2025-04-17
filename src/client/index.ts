import { HttpClient } from "../jsonrpc/http";
import { JsonRpcClient } from "../jsonrpc/interface";
import { Subscription } from "../jsonrpc/subscription";
import { WebsocketClient } from "../jsonrpc/ws";
import schema, {
  GetNonceResponse,
  GetUsersLeaderboardResponse,
  ReferralsInfo,
  TransactionStatusItem,
  UserSettings,
} from "./schema";

export class BlinkClient {
  private constructor(private _client: JsonRpcClient, private _token: string | undefined) {}

  static http(url: string | URL, token?: string): BlinkClient {
    const client = new HttpClient(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return new BlinkClient(client, undefined);
  }

  static websocket(url: string | URL, token?: string): BlinkClient {
    const client = new WebsocketClient(url);
    return new BlinkClient(client, token);
  }

  async getReferrals(): Promise<ReferralsInfo> {
    const result = await this._client.send("getReferrals");
    return schema.referralsInfo.parse(result);
  }

  async getSettings(): Promise<UserSettings> {
    const result = await this._client.send("getSettings");
    return schema.userSettings.parse(result);
  }

  async getNonce(): Promise<GetNonceResponse> {
    const result = await this._client.send("getNonce");
    return schema.getNonceResponse.parse(result);
  }

  async getUsersLeaderboard(limit: number): Promise<GetUsersLeaderboardResponse> {
    const result = await this._client.send("getUsersLeaderboard", limit);
    return schema.getUsersLeaderboardResponse.parse(result);
  }

  async subscribeTransactionsStatuses(
    callback: (result: TransactionStatusItem) => void
  ): Promise<Subscription> {
    if (!this._client.subscribe) {
      throw new Error("`subscribe` unsuppprted");
    }
    if (!this._token) {
      throw new Error("`token` missing");
    }
    return this._client.subscribe(
      "subscribeTransactionsStatuses",
      "unsubscribeTransactionsStatuses",
      (result) => callback(schema.transactionStatusItem.parse(result)),
      this._token
    );
  }
}
