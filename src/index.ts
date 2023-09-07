import { conversations, createConversation } from "@grammyjs/conversations";

import { bot } from "./config/botConfig";
import { addItem } from "./handlers";
import { itemMenu, mainMenu } from "./menus/";

bot.use(conversations());
bot.use(createConversation(addItem, "add-item"));

bot.use(mainMenu);
mainMenu.register(itemMenu);

bot.command("start", async (ctx) => {
  await ctx.reply("Bem vindo ao bot de itens!", { reply_markup: mainMenu });
});

bot.start();
