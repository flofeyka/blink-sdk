import { WebsocketClient } from "./jsonrpc/ws";
import { configDotenv } from "dotenv";

async function main() {
  configDotenv();

  const ws = new WebsocketClient(process.env.URL);

  const subscription = await ws.subscribe(
    "subscribeTrades",
    "unsubscribeTrades",
    (result) => console.dir(result, { depth: null }),
    { amm: "9kJhmes6wBSUuXP5EnLNwbYaKxD3ajQYP4Xjh9NrrVDS" }
  );

  console.log({ subscription });
}

main();
