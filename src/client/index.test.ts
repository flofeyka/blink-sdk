import { describe, expect, it } from "vitest";
import { AuthorizationError } from "../authorization/mixin";
import { BlinkClient } from "../index";

describe(BlinkClient, () => {
  it("getUsersLeaderboard", async () => {
    const client = BlinkClient.http(process.env.URL!, null);

    console.log(await client.getUsersLeaderboard(150));
  });

  it("getNonce", async () => {
    const client = BlinkClient.http(process.env.URL!, null);

    await expect(client.getNonce()).rejects.toThrowError(
      new AuthorizationError({ tag: "KeypairNotProvided" })
    );
  });

  it("subscribeTransactionsStatuses", async () => {
    const client = BlinkClient.websocket(process.env.URL!, null);

    await expect(client.subscribeTransactionsStatuses(() => {})).rejects.toThrowError(
      new AuthorizationError({ tag: "KeypairNotProvided" })
    );
  });
});
