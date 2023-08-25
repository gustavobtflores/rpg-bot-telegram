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
const characters = [
    {
        name: "Gustavo",
        level: 100,
        vocation: "Cavaleiro de Elite",
        items: [
            {
                name: "Espada",
                weight: 50,
            },
            {
                name: "Escudo",
                weight: 70,
            },
            {
                name: "Capacete",
                weight: 30,
            },
        ],
    },
    {
        name: "Tacio",
        level: 85,
        vocation: "Feiticeiro",
        items: [
            {
                name: "Varinha",
                weight: 25,
            },
            {
                name: "Túnica",
                weight: 15,
            },
            {
                name: "Amuleto",
                weight: 5,
            },
        ],
    },
    {
        name: "Lucia",
        level: 75,
        vocation: "Paladina",
        items: [
            {
                name: "Besta",
                weight: 40,
            },
            {
                name: "Armadura",
                weight: 60,
            },
            {
                name: "Botas",
                weight: 10,
            },
        ],
    },
];
function getFormattedCharacters() {
    return characters
        .map((character) => {
        return `Nome: ${character.name}\n\nLevel: ${character.level}\nClasse: ${character.vocation}\nLista de items: \n${character.items
            .map((item) => `${item.name} - ${item.weight}kg`)
            .join("\n")}\nPeso total: ${character.items.reduce((acc, item) => acc + item.weight, 0)}kg
        \n---------------------\n
    `;
    })
        .join("\n")
        .replace(/^\t+/gm, "");
}
const bot = new grammy_1.Bot("6478569656:AAGrrAnUtV0zhxWxs4ts34He1h025MXbD2U");
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
