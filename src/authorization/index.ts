import base64url from "base64url";
import { Buffer } from "buffer";
import elliptic, { type ec } from "elliptic";
import { z } from "zod";

export async function initSession(): Promise<{ privateKey: string; url: string }> {
  const ec = new elliptic.ec("p256");
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate("hex");
  const publicKey = base64url.encode(Buffer.from(keyPair.getPublic(true, "array")));
  return {
    privateKey,
    url: `https://t.me/magick_dev277_development3_bot?start=${publicKey}`,
  };
}

export async function decryptSessionKeyPair(
  privateKey: string,
  searchParams: string | URLSearchParams | Record<string, string>
): Promise<ec.KeyPair> {
  const ec = new elliptic.ec("p256");

  const base64urlSchema = z.string().transform((t) => base64url.toBuffer(t));

  const searchParamsSchema = z.object({
    publicKey: base64urlSchema.transform((t) => ec.keyFromPublic(t)),
    sessionKey: base64urlSchema,
    iv: base64urlSchema,
  });

  const { publicKey, sessionKey, iv } = searchParamsSchema.parse(
    typeof searchParams === "string" || searchParams instanceof URLSearchParams
      ? Object.fromEntries(new URLSearchParams(searchParams).entries())
      : searchParams
  );

  const keyPair = ec.keyFromPrivate(privateKey, "hex");

  const sharedSecret = keyPair.derive(publicKey.getPublic());

  const rawAesKey = await crypto.subtle.digest("SHA-256", sharedSecret.toBuffer());

  const aesKey = await crypto.subtle.importKey("raw", rawAesKey, { name: "AES-GCM" }, false, [
    "decrypt",
  ]);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, sessionKey);

  return ec.keyFromPrivate(Buffer.from(decrypted));
}

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
    signature.r.toBuffer("be", 32),
    signature.s.toBuffer("be", 32),
    Buffer.of(signature.recoveryParam!),
  ]);
  return data.toString("base64");
}

function toBigInt64Le(value: bigint): Buffer {
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeBigInt64LE(value);
  return buffer;
}
