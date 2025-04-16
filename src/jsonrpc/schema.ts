import { z } from "zod";

const jsonrpc = z.literal("2.0");

const id = z.union([z.number(), z.string(), z.null()]);

const error = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown(),
});

const response = z.object({
  jsonrpc,
  id,
  result: z.unknown(),
  error: error.optional(),
});

const notification = z.object({
  jsonrpc,
  method: z.string(),
  params: z.object({
    subscription: z.number(),
    result: z.unknown(),
  }),
});

const incomingMessage = z.union([response, notification]);

export type Id = z.infer<typeof id>;

export default {
  incomingMessage,
};
