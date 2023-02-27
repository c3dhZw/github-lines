import * as dotenv from "dotenv";
dotenv.config();

import { Core } from "./core/core";
import * as discord from "./discord/bot_discord";
import { DiscordConfig } from "./discord/types_discord";

const { DISCORD_TOKEN, GITHUB_TOKEN } = process.env;

async function main(): Promise<void> {
  const core = new Core(GITHUB_TOKEN);

  if (DISCORD_TOKEN != null) {
    const discordBot = new discord.GHLDiscordBot(core, new DiscordConfig(DISCORD_TOKEN));

    discordBot.start();
  } else {
    console.error("DISCORD_TOKEN is null/undefined");
  }
}

main().catch(console.error);
