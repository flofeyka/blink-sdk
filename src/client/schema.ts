import { z } from "zod";

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

export type ReferralsInfo = {
  count: string; // "25"
  volume: string; // "1.5"
  volume_usd: string; // "1.5"
  fees: string; // "1.5"
  fees_usd: string; // "1.5"
  level_1_reward: number; // 4500 => 45%
  level_2_reward: number; // 300 => 3%
  level_3_reward: number; // 10 => 0.1%
};

const userSettings = z.object({
  percentile: tipPercentile,
  slippage: slippage,
});

export type UserSettings = {
  percentile: TipPercentile; // "_25"
  slippage: number; // 100
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

export default {
  tipPercentile,
  tradeSide,
  referralsInfo,
  userSettings,
  transactionStatus,
  transactionStatusItem,
  usersLeaderboardEntry,
  getUsersLeaderboardResponse,
};
