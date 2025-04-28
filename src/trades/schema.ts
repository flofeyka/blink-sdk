import { z } from "zod";

type Checked<TSchema extends z.ZodType, TType> = TType extends z.infer<TSchema> ? TType : never;

export const enum TradeDirection {
  AtoB = 0,
  BtoA = 1,
}
const tradeDirection = z
  .number()
  .refine((arg) => arg === 0 || arg === 1)
  .transform((arg) => (arg === 0 ? TradeDirection.AtoB : TradeDirection.BtoA));

const trade = z.object({
  block_timestamp: z.number(),
  index: z.number(),
  trader: z.string(),
  amm: z.string(),
  direction: tradeDirection,
  input_amount: z.string().transform(BigInt),
  output_amount: z.string().transform(BigInt),
  signature: z.string(),
});

export type Trade = Checked<
  typeof trade,
  {
    block_timestamp: number;
    index: number;
    trader: string;
    amm: string;
    direction: TradeDirection;
    input_amount: bigint;
    output_amount: bigint;
    signature: string;
  }
>;

const getTradesResponse = trade.array();
export type GetTradesResponse = Checked<typeof getTradesResponse, Trade[]>;

export type GetTradesParams = {
  amm: string;
  limit?: number;
};

const candlestick = z.object({
  t: z.number(),
  h: z.number(),
  l: z.number(),
  o: z.number(),
  c: z.number(),
});

export type Candlestick = Checked<
  typeof candlestick,
  {
    /** Timestamp */
    t: number;
    /** High Price */
    h: number;
    /** Low Price */
    l: number;
    /** Open Price */
    o: number;
    /** Close Price */
    c: number;
  }
>;

const getCandlesticksResponse = candlestick.array();
export type GetCandlesticksResponse = Checked<typeof getCandlesticksResponse, Candlestick[]>;

export type GetCandlesticksParams = {
  amm: string;
  dir: TradeDirection;
  interval: number;
  start: number;
  limit?: number;
  /** exponent, used to normalize price when assets have different decimals */
  e: number;
};

export type GetCandlesticks2Params = Omit<GetCandlesticksParams, "amm" | "dir"> & {
  amm1: string;
  amm2: string;
  dir1: TradeDirection;
  dir2: TradeDirection;
};

const totals = z.object({
  period: z.number(),
  buys: z.number(),
  sells: z.number(),
  buyers: z.number(),
  sellers: z.number(),
  price_change_percentage: z.number(),
});
export type Totals = z.infer<typeof totals>;

const getTotalsResponse = totals.array();
export type GetTotalsResponse = Checked<typeof getTotalsResponse, Totals[]>;

export type GetTotalsParams = {
  amm: string;
  dir: TradeDirection;
};

export type SubscribeTradesParams = {
  amm: string;
};

export default {
  trade,
  getTradesResponse,
  getCandlesticksResponse,
  getTotalsResponse,
};
