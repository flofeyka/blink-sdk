import { type ec } from "elliptic";
import { createAuthorizedClient, MethodKind } from "../authorization/mixin";
import { HttpClient } from "../jsonrpc/http";
import { JsonRpcClient } from "../jsonrpc";
import { Subscription } from "../jsonrpc/subscription";
import { WebsocketClient } from "../jsonrpc/ws";
import schema, {
  GetUsersLeaderboardResponse,
  ReferralsInfo,
  TransactionStatusItem,
  UserSettings,
} from "./schema";

function getMethodKind(method: string): MethodKind {
  if (method === "getUsersLeaderboard") {
    return MethodKind.Public;
  } else if (method === "swap" || method === "withdraw") {
    return MethodKind.PrivateNonce;
  } else {
    return MethodKind.Private;
  }
}

export class BlinkClient {
  private constructor(private _client: ReturnType<typeof createAuthorizedClient>) {}

  static http(url: string | URL, keyPair: ec.KeyPair | null): BlinkClient {
    const client = createAuthorizedClient(HttpClient, keyPair, getMethodKind, url);
    return new BlinkClient(client);
  }

  static websocket(url: string | URL, keyPair: ec.KeyPair | null): BlinkClient {
    const client = createAuthorizedClient(WebsocketClient, keyPair, getMethodKind, url);
    return new BlinkClient(client);
  }

  async getNonce(): Promise<number> {
    return this._client.getNonce();
  }

  async getReferrals(): Promise<ReferralsInfo> {
    const result = await this._client.send("getReferrals", []);
    return schema.referralsInfo.parse(result);
  }

  async getSettings(): Promise<UserSettings> {
    const result = await this._client.send("getSettings", []);
    return schema.userSettings.parse(result);
  }

  async getUsersLeaderboard(limit: number): Promise<GetUsersLeaderboardResponse> {
    const result = await this._client.send("getUsersLeaderboard", [limit]);
    return schema.getUsersLeaderboardResponse.parse(result);
  }

  async subscribeTransactionsStatuses(
    callback: (result: TransactionStatusItem) => void
  ): Promise<Subscription> {
    if (!this._client.subscribe) {
      throw new Error("`subscribe` unsuppprted");
    }
    return this._client.subscribe(
      "subscribeTransactionsStatuses",
      "unsubscribeTransactionsStatuses",
      (result) => callback(schema.transactionStatusItem.parse(result)),
      []
    );
  }
}
