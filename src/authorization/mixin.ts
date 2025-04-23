import { ec } from "elliptic";
import { z } from "zod";
import { HttpClient } from "../jsonrpc/http";
import { JsonRpcClient } from "../jsonrpc";

export const enum MethodKind {
  Public,
  Private,
  PrivateNonce,
}

export function createAuthorizedClient<TCtor extends new (...args: any[]) => JsonRpcClient>(
  Base: TCtor,
  keyPair: ec.KeyPair | null,
  getMethodKind: (method: string) => MethodKind,
  ...args: ConstructorParameters<TCtor>
) {
  const Authorized = AuthorizationMixin(Base, keyPair, getMethodKind);
  return new Authorized(...args);
}

function AuthorizationMixin<TCtor extends new (...args: any[]) => JsonRpcClient>(
  Base: TCtor,
  keyPair: ec.KeyPair | null,
  getMethodKind: (method: string) => MethodKind
) {
  return class Authorization extends Base {
    async send(method: string, params: any[]): Promise<unknown> {
      const methodKind = getMethodKind(method);

      if (methodKind === MethodKind.Public) {
        return super.send(method, params);
      }

      if (keyPair === null) {
        throw new AuthorizationError({ tag: "KeypairNotProvided" });
      }

      const nonce =
        methodKind === MethodKind.PrivateNonce ? await this.getNonce() : Date.now() + 1000;

      const hash = await hashRequest(nonce, method, params);

      const signature = keyPair.sign(hash);
      const authorizationData = encodeAuthorizaionData(nonce, signature);

      if (super.isHttp()) {
        const options: HttpClient.Options = {
          headers: { Authorization: authorizationData },
        };
        return (super.send as HttpClient["send"])(method, params, options);
      } else {
        return super.send(method, [...params, authorizationData]);
      }
    }

    async getNonce(): Promise<number> {
      const result = await this.send("getNonce", []);
      try {
        return getNonceResponse.parse(result);
      } catch (e) {
        if (e instanceof z.ZodError) {
          throw new AuthorizationError({ tag: "Zod", e });
        }
        throw e;
      }
    }
  };
}

export class AuthorizationError extends Error {
  readonly s: Readonly<AuthorizationError.S>;

  constructor(s: AuthorizationError.S) {
    switch (s.tag) {
      case "KeypairNotProvided": {
        super("AuthorizationError::KeypairNotProvided");
        break;
      }
      case "Zod": {
        super(`AuthorizationError::Zod(error = ${s.e})`, { cause: s.e });
        break;
      }
      default: {
        super("AuthorizationError::default");
        break;
      }
    }
    this.s = Object.freeze(s);
  }
}

export namespace AuthorizationError {
  export type S = { tag: "KeypairNotProvided" } | { tag: "Zod"; e: z.ZodError };
}

const getNonceResponse = z.number();

export async function hashRequest(
  nonce: bigint | number,
  method: string,
  params: any[]
): Promise<Buffer> {
  const data = Buffer.concat([
    toBigInt64Le(BigInt(nonce)),
    Buffer.from(method, "utf-8"),
    Buffer.from(JSON.stringify(params), "utf-8"),
  ]);
  return Buffer.from(await crypto.subtle.digest("SHA-256", data));
}

export function encodeAuthorizaionData(nonce: bigint | number, signature: ec.Signature): string {
  const data = Buffer.concat([
    toBigInt64Le(BigInt(nonce)),
    signature.r.toBuffer("le", 32),
    signature.s.toBuffer("le", 32),
    Buffer.of(signature.recoveryParam!),
  ]);
  return data.toString("base64");
}

function toBigInt64Le(value: bigint): Buffer {
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeBigInt64LE(value);
  return buffer;
}
