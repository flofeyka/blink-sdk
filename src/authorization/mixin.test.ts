import elliptic from "elliptic";
import { describe, expect, it, vi } from "vitest";
import { encodeAuthorizaionData, hashRequest } from ".";
import { JsonRpcClient } from "../jsonrpc";
import { HttpClient } from "../jsonrpc/http";
import { AuthorizationError, createAuthorizedClient, MethodKind } from "./mixin";

describe("AuthorizationMixin", () => {
  it("private method authentication data", async () => {
    const mockNow = 1337;
    vi.spyOn(Date, "now").mockReturnValueOnce(mockNow);

    class MockClient implements JsonRpcClient {
      isHttp(): boolean {
        return true;
      }

      async send(method: string, params: any[], options?: HttpClient.Options): Promise<unknown> {
        console.log(options);

        expect(options).toBeDefined();
        expect(options?.headers).toBeDefined();
        expect(options?.headers?.["Authorization"]).toBeDefined();

        const authorization = <string>options!.headers!["Authorization"]!;

        const nonce = mockNow + 10000;
        const hash = await hashRequest(nonce, method, params);

        const signature = keyPair.sign(hash);
        const authorizationData = encodeAuthorizaionData(nonce, signature);

        expect(authorization).eq(authorizationData);

        return true;
      }
    }

    const ec = new elliptic.ec("p256");
    const keyPair = ec.genKeyPair();

    const client = createAuthorizedClient(MockClient, keyPair, () => MethodKind.Private);

    await client.send("privateMethod", []);
  });

  it("private nonce method authentication data", async () => {
    class MockClient implements JsonRpcClient {
      isHttp(): boolean {
        return true;
      }

      async send(method: string, params: any[], options?: HttpClient.Options): Promise<unknown> {
        if (method === "getNonce") {
          return 1234;
        }

        console.log(options);

        expect(options).toBeDefined();
        expect(options?.headers).toBeDefined();
        expect(options?.headers?.["Authorization"]).toBeDefined();

        const authorization = <string>options!.headers!["Authorization"]!;

        const nonce = 1234;
        const hash = await hashRequest(nonce, method, params);

        const signature = keyPair.sign(hash);
        const authorizationData = encodeAuthorizaionData(nonce, signature);

        expect(authorization).eq(authorizationData);

        return true;
      }
    }

    const ec = new elliptic.ec("p256");
    const keyPair = ec.genKeyPair();

    const client = createAuthorizedClient(MockClient, keyPair, (method) => {
      return method === "getNonce" ? MethodKind.Private : MethodKind.PrivateNonce;
    });

    await client.send("privateNonceMethod", []);
  });

  it("getNonce getMethodKind", async () => {
    class MockClient implements JsonRpcClient {
      isHttp(): boolean {
        throw new Error("Method not implemented.");
      }
      send(method: string, params: any[]): Promise<unknown> {
        throw new Error("Method not implemented.");
      }
    }

    expect(() => createAuthorizedClient(MockClient, null, () => MethodKind.Public)).toThrowError(
      new AuthorizationError({ tag: "InvalidGetNonceMethodKind" })
    );

    expect(() =>
      createAuthorizedClient(MockClient, null, () => MethodKind.PrivateNonce)
    ).toThrowError(new AuthorizationError({ tag: "InvalidGetNonceMethodKind" }));
  });
});
