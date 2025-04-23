import elliptic, { type ec } from "elliptic";
import { z } from "zod";

export async function initSession(): Promise<{ privateKey: string; url: string }> {
  const ec = new elliptic.ec("p256");
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate("hex");
  const publicKey = Buffer.from(keyPair.getPublic(true, "array")).toString("base64url");
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

  const base64url = z.string().transform((t) => Buffer.from(t, "base64url"));

  const searchParamsSchema = z.object({
    publicKey: base64url.transform((t) => ec.keyFromPublic(t)),
    sessionKey: base64url,
    iv: base64url,
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
