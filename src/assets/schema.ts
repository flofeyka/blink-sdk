import { z } from "zod";
import { Checked } from "../utils";

const dexType = z.union([
  z.literal("raydium_v4"),
  z.literal("raydium_clmm"),
  z.literal("raydium_cpmm"),
  z.literal("whirlpool"),
  z.literal("pumpswap"),
]);
export type DexType = z.infer<typeof dexType>;

const dexInfo = z.object({
  ty: dexType,
  address: z.string(),
  dir: z.number(),
});
export type DexInfo = Checked<typeof dexInfo, { ty: DexType; address: string; dir: number }>;

const assetInfo = z.object({
  mint: z.string(),
  name: z.string(),
  symbol: z.string(),
  uri: z.string().optional(),
  decimals: z.number(),
  supply: z.string().transform(BigInt),
  price: z.string(),
  price_usd: z.string(),
  market_cap: z.string(),
  liquidity: z.string(),
  dex_info: dexInfo.optional(),
});
export type AssetInfo = Checked<
  typeof assetInfo,
  {
    symbol: string;
    mint: string;
    name: string;
    decimals: number;
    supply: bigint;
    price: string;
    price_usd: string;
    market_cap: string;
    liquidity: string;
    uri?: string;
    dex_info?: DexInfo;
  }
>;

const getAssetsInfoResponse = assetInfo.array();
export type GetAssetsInfoResponse = Checked<typeof getAssetsInfoResponse, AssetInfo[]>;

export type GetAssetsInfoParams = string[];

export default {
  getAssetsInfoResponse,
};
