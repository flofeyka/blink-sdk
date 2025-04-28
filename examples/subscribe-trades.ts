import { configDotenv } from "dotenv";
import { createInterface } from "node:readline/promises";
import { TradesClient } from "../src";

async function main() {
  configDotenv();

  const readline = createInterface(process.stdin, process.stdout);

  const url = await readline.question("tradesInfoServiceUrl: ");

  const client = TradesClient.websocket(url);

  const amm = await readline.question("amm: ");

  const s = client.subscribeTrades({ amm }, (trade) => {
    console.log({ trade });
  });

  readline.close();
}

main();
