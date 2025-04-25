import { z } from "zod";

type Checked<TSchema extends z.ZodType, TType> = TType extends z.infer<TSchema> ? TType : never;

const tipPercentile = z.union([
  z.literal("_25"),
  z.literal("_50"),
  z.literal("_75"),
  z.literal("_95"),
  z.literal("_99"),
]);
export type TipPercentile = z.infer<typeof tipPercentile>;

const slippage = z.number().refine((x) => x <= 10000);

const tradeSide = z.union([z.literal("buy"), z.literal("sell")]);
export type TradeSide = z.infer<typeof tradeSide>;

const referralsInfo = z.object({
  count: z.string(),
  volume: z.string(),
  volume_usd: z.string(),
  fees: z.string(),
  fees_usd: z.string(),
  level_1_reward: z.number(),
  level_2_reward: z.number(),
  level_3_reward: z.number(),
});

export type ReferralsInfo = Checked<
  typeof referralsInfo,
  {
    count: string; // "25"
    volume: string; // "1.5"
    volume_usd: string; // "1.5"
    fees: string; // "1.5"
    fees_usd: string; // "1.5"
    level_1_reward: number; // 4500 => 45%
    level_2_reward: number; // 300 => 3%
    level_3_reward: number; // 10 => 0.1%
  }
>;

const userSettings = z.object({
  percentile: tipPercentile,
  slippage: slippage,
});

export type UserSettings = Checked<
  typeof userSettings,
  {
    percentile: TipPercentile; // "_25"
    slippage: number; // 100
  }
>;

export type UpdateSettingsParams = {
  slippage?: number;
  percentile?: TipPercentile;
};

const userPreset = userSettings.extend({
  id: z.number(),
  amount: z.string().transform(BigInt),
});

export type UserPreset = Checked<
  typeof userPreset,
  {
    id: number;
    slippage: number;
    percentile: TipPercentile;
    amount: bigint;
  }
>;

export type UpdatePresetSettingsParams = {
  slippage?: number;
  percentile?: TipPercentile;
  amount?: string;
};

const transactionStatus = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("FAILED_TO_CONFIRM"),
  }),
  z.object({
    status: z.literal("FAILED"),
    transaction_error: z.unknown(),
  }),
  z.object({
    status: z.literal("CONFIRMED"),
  }),
  z.object({
    status: z.literal("TAKES_TOO_LONG"),
  }),
]);

export type TransactionStatus = z.infer<typeof transactionStatus>;

const transactionStatusItem = z.object({
  signature: z.string(),
  status: transactionStatus,
});
export type TransactionStatusItem = z.infer<typeof transactionStatusItem>;

const usersLeaderboardEntry = z.object({
  username: z.string().nullable(),
  pubkey: z.string(),
  volume: z.string().transform(BigInt),
  volume_ui: z.string(),
});
export type UsersLeaderboardEntry = z.infer<typeof usersLeaderboardEntry>;

const getUsersLeaderboardResponse = usersLeaderboardEntry.array();
export type GetUsersLeaderboardResponse = UsersLeaderboardEntry[];

const asset = z.object({
  mint: z.string(),
  balance: z.string().transform(BigInt),
  balance_ui: z.string(),
  balance_ui_usd: z.string(),
  price: z.string(),
  price_usd: z.string(),
  market_cap: z.string(),
  decimals: z.number(),
  avg_price: z.string(),
  avg_price_usd: z.string(),
  avg_market_cap: z.string(),
  pnl_percent: z.string(),
  pnl_usd: z.string(),
  liquidity: z.string(),
  name: z.string(),
  symbol: z.string(),
});
export type Asset = z.infer<typeof asset>;

const getPositionsResponse = asset.array();
export type GetPositionsResponse = Asset[];

const assetInfo = z.object({
  mint: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  supply: z.string(),
  price: z.string(),
  price_usd: z.string(),
  liquidity: z.string().nullable(),
  market_cap: z.string(),
});
export type AssetInfo = z.infer<typeof assetInfo>;

const openOrderAccount = z.object({
  borrowMakingAmount: z.string().transform(BigInt),
  createdAt: z.string(),
  expiredAt: z.string().nullable(),
  makingAmount: z.string().transform(BigInt),
  oriMakingAmount: z.string().transform(BigInt),
  oriTakingAmount: z.string().transform(BigInt),
  takingAmount: z.string().transform(BigInt),
  uniqueId: z.string().transform(BigInt),
  updatedAt: z.string(),
  feeAccount: z.string(),
  inputMint: z.string(),
  inputMintReserve: z.string(),
  inputTokenProgram: z.string(),
  maker: z.string(),
  outputMint: z.string(),
  outputTokenProgram: z.string(),
  feeBps: z.number(),
  bump: z.number(),
});

export type OpenOrderAccount = z.infer<typeof openOrderAccount>;

const openOrder = z.object({
  account: openOrderAccount,
  publicKey: z.string(),
});

export type OpenOrder = Checked<
  typeof openOrder,
  {
    account: OpenOrderAccount;
    publicKey: string;
  }
>;

const getOrdersResponse = z.object({
  orders: openOrder.array(),
  token_infos: assetInfo.array(),
});

export type GetOrdersResponse = Checked<
  typeof getOrdersResponse,
  {
    orders: OpenOrder[];
    token_infos: AssetInfo[];
  }
>;

const swapResponse = z.object({
  out_amount: z.string().transform(BigInt),
  signature: z.string(),
  bundle_id: z.string(),
  nonce: z.number(),
});
export type SwapResponse = z.infer<typeof swapResponse>;

export type SwapParams = {
  side: TradeSide;
  mint: string;
  amount: string;
  slippage: number;
  percentile: TipPercentile;
};

const withdrawResponse = z.object({
  signature: z.string(),
  nonce: z.number(),
});
export type WithdrawResponse = z.infer<typeof withdrawResponse>;

export type WithdrawParams = {
  mint: string;
  recipient: string;
  amount: string;
};

export default {
  tipPercentile,
  tradeSide,
  referralsInfo,
  userSettings,
  userPreset,
  transactionStatus,
  transactionStatusItem,
  usersLeaderboardEntry,
  getUsersLeaderboardResponse,
  getPositionsResponse,
  getOrdersResponse,
  swapResponse,
  withdrawResponse,
};
