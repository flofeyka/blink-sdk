import { describe, it } from "vitest";
import { BlinkClient } from "./index";

describe("BlinkClient", () => {
  const client = new BlinkClient(process.env.URL!, process.env.TOKEN!);

  it("getUsersLeaderboard", async () => {
    console.log(await client.getUsersLeaderboard(150));
  });
});
