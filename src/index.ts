import { conversations, createConversation } from "@grammyjs/conversations";

import { bot } from "./config/botConfig";
import { addItem } from "./handlers";
import { itemMenu, mainMenu } from "./menus/";
import { getFormattedCharacters } from "./utils";

bot.use(conversations());
bot.use(createConversation(addItem, "add-item"));

bot.use(mainMenu);
mainMenu.register(itemMenu);

bot.command("start", async (ctx) => {
  await ctx.reply("Bem vindo ao bot de itens!", { reply_markup: mainMenu });
});

bot.command("add", async (ctx) => {
  await ctx.reply("Você escolheu adicionar um item!", { reply_markup: itemMenu });
});

bot.command("list", async (ctx) => {
  await ctx.reply("Você escolheu listar os itens!");
  await ctx.reply(await getFormattedCharacters());
});

bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "add", description: "Adiciona um item ao inventário" },
  { command: "list", description: "Lista os itens do inventário de todos os personagens" },
]);

bot.start();
