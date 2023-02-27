/**
 * Discord Bot. It takes advantage of the functions defined in core.ts.
 */

import * as SapphireBot from "@sapphire/framework";
import * as DiscordBot from "discord.js";

import type { DiscordConfig } from "./types_discord";
import type { Core } from "../core/core";

export class GHLDiscordBot extends SapphireBot.SapphireClient {
  readonly core: Core;

  readonly config: DiscordConfig;

  constructor(core: Core, config: DiscordConfig) {
    super({
      defaultPrefix: config.defaultPrefix,
      caseInsensitiveCommands: config.caseInsensitiveCommands,
      intents: config.intents,
      defaultCooldown: config.defaultCooldown,
      baseUserDirectory: config.baseUserDirectory
    });

    this.core = core;
    this.config = config;

    this.login(this.config.DISCORD_TOKEN);
  }

  /**
   * Starts listening to new messages.
   */
  start(): void {
    // Handles all messages and checks whether they contain a resolvable link
    this.on("messageCreate", async (msg) => {
      if (msg.author.bot) {
        return;
      }

      const { botMsg, toDelete } = await this.handleMessage(msg);
      if (botMsg) {
        const sentmsg = await msg.channel.send(botMsg);
        const botGuildMember = sentmsg.guild?.members.me;

        if (toDelete) {
          setTimeout(() => sentmsg.delete().catch(() => {}), 5000); // errors ignored - someone else deleted
        } else if (
          sentmsg.channel.partial ||
          sentmsg.channel instanceof DiscordBot.DMChannel ||
          (botGuildMember && sentmsg.guild.members.me?.permissionsIn(sentmsg.channel).has("ADD_REACTIONS"))
        ) {
          const botReaction = await sentmsg.react("🗑️");

          const filter = (reaction, user): boolean => reaction.emoji.name === "🗑️" && user.id === msg.author.id;
          const collector = sentmsg.createReactionCollector({ filter, time: 15000 });
          collector.on("collect", () => {
            sentmsg.delete().catch(() => {}); // error ignored - someone else deleted
          });
          collector.on("end", () => {
            botReaction.users.remove().catch(() => {}); // error ignored - someone else removed
          });
        }
      }
    });

    this.on("ready", () => {
      this?.user?.setActivity("for GitHub links", {
        type: "WATCHING"
      });
    });

    this.on("guildCreate", (guild) => {
      console.log(`Joined new server ${guild.name}`);
    });

    console.log("Started Discord bot.");
  }

  /**
   * This is Discord-level handleMessage(). It calls core-level handleMesasge() and then
   * performs necessary formatting and validation.
   * @param msg Discord message object
   */
  async handleMessage(msg: DiscordBot.Message): Promise<{ botMsg: null | string; toDelete: boolean }> {
    const { msgList, totalLines } = await this.core.handleMessage(msg.content);

    if (totalLines > 50) {
      return { botMsg: "Sorry, but to prevent spam, we limit the number of lines displayed at 50", toDelete: true };
    }

    const messages = msgList.map(
      (el) => `\`\`\`${el.toDisplay.search(/\S/) !== -1 ? el.extension : " "}\n${el.toDisplay}\n\`\`\``
    );

    const botMsg = messages.join("\n") || null;

    if (botMsg && botMsg.length >= 2000) {
      return {
        botMsg:
          "Sorry but there is a 2000 character limit on Discord, so we were unable to display the desired snippet",
        toDelete: true
      };
    }

    if (botMsg) {
      if (msg.deletable) {
        // can always supress embed if deletable
        // it can take a few ms before the supress can be registered
        setTimeout(() => msg.suppressEmbeds(true).catch(console.error), 100);
      }
    }

    return { botMsg, toDelete: false };
  }
}
