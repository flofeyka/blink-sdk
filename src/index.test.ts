import { describe, it } from "vitest";
import { BlinkClient } from "./index";

describe("BlinkClient", () => {
  const client = BlinkClient.http(process.env.URL!, process.env.TOKEN!);

  it("getUsersLeaderboard", async () => {
    console.log(await client.getUsersLeaderboard(150));
  });
});
