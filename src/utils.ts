import type { z } from "zod";

export type Checked<TSchema extends z.ZodType, TType> = TType extends z.infer<TSchema>
  ? TType
  : never;
