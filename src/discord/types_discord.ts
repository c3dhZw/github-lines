import { Intents } from "discord.js";
import { CooldownOptions } from "@sapphire/framework";

/**
 * Discord-specific configuration.
 */
export class DiscordConfig {
  readonly DISCORD_TOKEN: string;

  readonly owner: string;

  readonly defaultPrefix: string;

  readonly caseInsensitiveCommands: boolean;

  readonly intents: Intents;

  readonly defaultCooldown: CooldownOptions;

  readonly baseUserDirectory: string;

  constructor(dstoken: string) {
    this.DISCORD_TOKEN = dstoken;
    this.owner = "131283250042634241"; // fooooooooooooooo#4786
    this.defaultPrefix = ";";
    this.caseInsensitiveCommands = true;
    this.intents = new Intents([
      "GUILDS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS"
    ]);
    this.defaultCooldown = { delay: 15000, limit: 1 };
    this.baseUserDirectory = __dirname;
  }
}
