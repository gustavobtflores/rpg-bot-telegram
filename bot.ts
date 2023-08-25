import { Menu } from "@grammyjs/menu";
import { Bot } from "grammy";
import { CHARACTERS } from "./characters";
import "dotenv/config";

function getFormattedCharacters(): string {
  return CHARACTERS.map((character) => {
    return `Nome: ${character.name}\n\nLevel: ${character.level}\nClasse: ${character.vocation}\nLista de items: \n${character.items
      .map((item) => `${item.name} - ${item.weight}kg`)
      .join("\n")}\nPeso total: ${character.items.reduce((acc, item) => acc + item.weight, 0)}kg
        \n---------------------\n
    `;
  })
    .join("\n")
    .replace(/^\t+/gm, "");
}

const botApiToken = process.env.BOT_API_TOKEN || "";
const bot = new Bot(botApiToken);

const menu = new Menu("main-menu").text("Ver lista de personagens", (ctx) => {
  ctx.reply(getFormattedCharacters());
});

bot.use(menu);

bot.command("start", async (ctx) => {
  await ctx.reply("Bem vindo ao bot de itens!", { reply_markup: menu });
});

bot.on("message:text", (ctx) => {
  console.log(ctx.from);
});

bot.start();
