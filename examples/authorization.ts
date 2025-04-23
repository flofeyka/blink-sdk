import { configDotenv } from "dotenv";
import { createInterface } from "node:readline/promises";
import { BlinkClient, decryptSessionKeyPair, initSession } from "../src";

async function main() {
  configDotenv();

  const readline = createInterface(process.stdin, process.stdout);
  const { privateKey, url } = await initSession();

  console.log(url);

  const searchParams = await readline.question("searchParams: ");
  const keyPair = await decryptSessionKeyPair(privateKey, searchParams);

  const client = BlinkClient.http(process.env.URL!, keyPair);

  console.log("nonce:", await client.getNonce());
  readline.close();
}

main();
