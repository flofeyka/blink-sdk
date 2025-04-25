import { type ec } from "elliptic";
import { createAuthorizedClient, MethodKind } from "../authorization/mixin";
import { HttpClient } from "../jsonrpc/http";
import { Subscription } from "../jsonrpc/subscription";
import { WebsocketClient } from "../jsonrpc/ws";
import schema, {
  GetOrdersResponse,
  GetPositionsResponse,
  GetUsersLeaderboardResponse,
  ReferralsInfo,
  SwapParams,
  SwapResponse,
  TransactionStatusItem,
  UpdatePresetSettingsParams,
  UpdateSettingsParams,
  UserPreset,
  UserSettings,
  WithdrawParams,
  WithdrawResponse,
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

  async send(method: string, params: any[]): Promise<unknown> {
    return this._client.send(method, params);
  }

  async getNonce(): Promise<number> {
    return this._client.getNonce();
  }

  async getPositions(): Promise<GetPositionsResponse> {
    const result = await this._client.send("getPositions", []);
    return schema.getPositionsResponse.parse(result);
  }

  async getOrders(): Promise<GetOrdersResponse> {
    const result = await this._client.send("getOrders", []);
    return schema.getOrdersResponse.parse(result);
  }

  async getReferrals(): Promise<ReferralsInfo> {
    const result = await this._client.send("getReferrals", []);
    return schema.referralsInfo.parse(result);
  }

  async getSettings(): Promise<UserSettings> {
    const result = await this._client.send("getSettings", []);
    return schema.userSettings.parse(result);
  }

  async updateSettings(params: UpdateSettingsParams): Promise<UserSettings> {
    const result = await this._client.send("updateSettings", [params]);
    return schema.userSettings.parse(result);
  }

  async getPresetSettings(): Promise<UserPreset> {
    const result = await this._client.send("getPresetSettings", []);
    return schema.userPreset.parse(result);
  }

  async updatePresetSettings(params: UpdatePresetSettingsParams): Promise<UserPreset> {
    const result = await this._client.send("updatePresetSettings", [params]);
    return schema.userPreset.parse(result);
  }

  async swap(params: SwapParams): Promise<SwapResponse> {
    const result = await this._client.send("swap", [params]);
    return schema.swapResponse.parse(result);
  }

  async withdraw(params: WithdrawParams): Promise<WithdrawResponse> {
    const result = await this._client.send("withdraw", [params]);
    return schema.withdrawResponse.parse(result);
  }

  async getUsersLeaderboard(limit: number): Promise<GetUsersLeaderboardResponse> {
    const result = await this._client.send("getUsersLeaderboard", [limit]);
    return schema.getUsersLeaderboardResponse.parse(result);
  }

  async subscribeTransactionsStatuses(
    callback: (result: TransactionStatusItem) => void
  ): Promise<Subscription> {
    if (!this._client.subscribe) {
      throw new Error("`subscribe` unsupported");
    }
    return this._client.subscribe(
      "subscribeTransactionsStatuses",
      "unsubscribeTransactionsStatuses",
      (result) => callback(schema.transactionStatusItem.parse(result)),
      []
    );
  }
}
