import { z } from "zod";

const metadata = z
  .object({
    name: z.string(),
    symbol: z.string(),
    description: z.string(),
    image: z.string(),
  })
  .partial();
export type Metadata = z.infer<typeof metadata>;

export async function fetchMetadata(uri: string): Promise<Metadata> {
  return metadata.parse(await (await fetch(uri)).json());
}
