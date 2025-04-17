import type { ClientRequestArgs } from "http";
import { ClientOptions } from "ws";
import { Subscription, WebsocketClient } from "../jsonrpc/ws";
import schema, {
  GetNonceResponse,
  GetUsersLeaderboardResponse,
  ReferralsInfo,
  TransactionStatusItem,
  UserSettings,
} from "./schema";

export class BlinkClient extends WebsocketClient {
  constructor(address: string | URL, token?: string) {
    const options: ClientOptions | ClientRequestArgs = {};
    if (token !== undefined) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    super(address, options);
  }

  async getReferrals(): Promise<ReferralsInfo> {
    const result = await this.send("getReferrals");
    return schema.referralsInfo.parse(result);
  }

  async getSettings(): Promise<UserSettings> {
    const result = await this.send("getSettings");
    return schema.userSettings.parse(result);
  }

  async getNonce(): Promise<GetNonceResponse> {
    const result = await this.send("getNonce");
    return schema.getNonceResponse.parse(result);
  }

  async getUsersLeaderboard(limit: number): Promise<GetUsersLeaderboardResponse> {
    const result = await this.send("getUsersLeaderboard", limit);
    return schema.getUsersLeaderboardResponse.parse(result);
  }

  async subscribeTransactionsStatuses(
    callback: (result: TransactionStatusItem) => void
  ): Promise<Subscription> {
    return this.subscribe(
      "subscribeTransactionsStatuses",
      "unsubscribeTransactionsStatuses",
      (result) => callback(schema.transactionStatusItem.parse(result))
    );
  }
}
