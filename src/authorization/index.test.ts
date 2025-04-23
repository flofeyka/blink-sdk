import elliptic from "elliptic";
import { describe, expect, it } from "vitest";
import { initSession, decryptSessionKeyPair } from ".";

describe(initSession, () => {
  it("pass", () => {
    console.log(initSession());
  });
});

describe(decryptSessionKeyPair, () => {
  it("pass", async () => {
    const privateKey = "f3ad29ed43606839819fe25c2c112880052d574fc2ca85816f34ba13a1a0ca03";
    const searchParams =
      "publicKey=BLaX_RN4bvWwHGnKxN6BNV6Y0ppTCjAdU0Tz5VhFkgJRE5x8X8U6ZJPyJeqB07A7TPUO561xK3-4_oHu00HlDZI=&sessionKey=5AvJxdrlyUuBPBBMDQJfUpHjyXHd1lB2RmV0sLj6v6i5GTTd8bIZJpBk_ndJ3e_I&iv=OkhZEAO6Br5uJ5Um";

    const ec = new elliptic.ec("p256");

    const expectedSessionKeyPair = ec.keyFromPrivate([
      218, 60, 37, 39, 222, 68, 193, 193, 153, 138, 255, 49, 82, 76, 182, 64, 64, 206, 48, 210, 132,
      179, 233, 213, 137, 143, 199, 1, 204, 2, 230, 43,
    ]);

    const sessionKeyPair = await decryptSessionKeyPair(
      privateKey,
      new URLSearchParams(searchParams)
    );
    expect(sessionKeyPair.getPrivate("hex")).eq(expectedSessionKeyPair.getPrivate("hex"));

    // console.log(sessionKeyPair);
  });
});
