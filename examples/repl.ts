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

  while (true) {
    const input = await readline.question("input: ");
    if (input === "\\q") {
      break;
    } else {
      const [method, json] = input.split(" ");
      try {
        const params = JSON.parse(json);
        const result =
          typeof (<any>client)[method] === "function"
            ? await (<any>client)[method](...params)
            : await client.send(method, params);
        console.log("result:", result);
      } catch (e) {
        console.error(e);
      }
    }
  }

  readline.close();
}

main();
