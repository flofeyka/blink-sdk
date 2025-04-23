import { describe, it } from "vitest";
import { hashRequest } from "./mixin";

describe("hashRequest", () => {
  it("test #0", async () => {
    const hash = Buffer.from(await hashRequest(0, "", [])).toString("hex");
    console.log(hash);
  });
});
