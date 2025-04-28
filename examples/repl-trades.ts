import { configDotenv } from "dotenv";
import { createInterface } from "node:readline/promises";
import { TradesClient } from "../src";

async function main() {
  configDotenv();

  const readline = createInterface(process.stdin, process.stdout);

  const url = await readline.question("tradesInfoServiceUrl: ");

  const client = TradesClient.http(url);

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
