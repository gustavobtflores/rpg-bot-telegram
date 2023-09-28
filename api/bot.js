const { conversations, createConversation } = require("@grammyjs/conversations");
const { bot } = require("../src/config/botConfig");
const { addItem, removeItem, modifyItem, addCube, removeCube } = require("../src/handlers/imports");
const { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, toggleNotifications, notifications, deleteP, P } = require("../src/menus");
const { getFormattedCharacters } = require("../src/utils");
const { webhookCallback } = require("grammy");

bot.use(conversations());
bot.use(createConversation(modifyItem, "modify-item"));
bot.use(createConversation(addItem, "add-item"));
bot.use(createConversation(removeItem, "remove-item"));
bot.use(createConversation(addCube, "add-cube"));
bot.use(createConversation(removeCube, "remove-cube"));

bot.use(DgMMenu);
DgMMenu.register(listPlayersMenu);

bot.use(mainMenu);
mainMenu.register(itemAddMenu);
mainMenu.register(itemRemoveMenu);
mainMenu.register(itemModifyMenu);

bot.command("start", async (ctx) => {
  if (notifications.has(ctx.update.message.from.id)) {
    notifications.delete(ctx.update.message.from.id);
  }

  if (ctx.update.message.from.id === 744974273) {
    deleteP(9);
    await ctx.reply("Seja bem vindo Dungeon Master!", { reply_markup: DgMMenu });
  } else {
    await ctx.reply(`*Bem vindo ao bot de itens\\! O que posso carregar por você hoje\?*`, { reply_markup: mainMenu, parse_mode: "MarkdownV2" });
  }
});

bot.command("add", async (ctx) => {
  await ctx.reply("Você escolheu adicionar um item!", { reply_markup: itemAddMenu });
});

bot.command("remove", async (ctx) => {
  await ctx.reply("Vocẽ escolheu remover um item!", { reply_markup: itemRemoveMenu });
});

bot.command("list", async (ctx) => {
  await ctx.reply("Você escolheu listar os itens!");
  await ctx.reply(await getFormattedCharacters(ctx.update.message.from.id));
});

bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "add", description: "Adiciona um item ao inventário" },
  { command: "remove", description: "Remove um item do inventário" },
  { command: "list", description: "Lista os itens do inventário do seu personagem" },
  // { command: "teste", description: 'so pra testar' },
]);

module.exports = webhookCallback(bot, "http");
