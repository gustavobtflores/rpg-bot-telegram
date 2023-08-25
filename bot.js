"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const menu_1 = require("@grammyjs/menu");
const grammy_1 = require("grammy");
const characters_1 = require("./characters");
require("dotenv/config");
function getFormattedCharacters() {
    return characters_1.CHARACTERS.map((character) => {
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
const bot = new grammy_1.Bot(botApiToken);
const menu = new menu_1.Menu("main-menu").text("Ver lista de personagens", (ctx) => {
    ctx.reply(getFormattedCharacters());
});
bot.use(menu);
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Bem vindo ao bot de itens!", { reply_markup: menu });
}));
bot.on("message:text", (ctx) => {
    console.log(ctx.from);
});
bot.start();
