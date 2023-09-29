const { conversations, createConversation, } = require("@grammyjs/conversations");
const { bot } = require("./config/botConfig");
const { addItem, removeItem, modifyItem, addCube, removeCube, modifyCube } = require("./handlers/imports");
const { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, toggleNotifications, notifications, deleteP, P } = require("./menus");
const { getFormattedCharacters } = require("./utils");

bot.use(conversations());
bot.use(createConversation(modifyItem, "modify-item"));
bot.use(createConversation(addItem, "add-item"));
bot.use(createConversation(removeItem, "remove-item"));
bot.use(createConversation(addCube, "add-cube"));
bot.use(createConversation(removeCube, "remove-cube"));
bot.use(createConversation(modifyCube, "modify-cube"))

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

bot.command("adicionar", async (ctx) => {
  await ctx.reply("Você escolheu adicionar um item! Escolha onde", { reply_markup: itemAddMenu });
});

bot.command("remover", async (ctx) => {
  await ctx.reply("Você escolheu remover um item! Escolha de onde", { reply_markup: itemRemoveMenu });
});

bot.command("listar", async (ctx) => {
  await ctx.reply("Você escolheu listar os itens!");
  await ctx.reply(await getFormattedCharacters(ctx.update.message.from.id));
});
bot.command("modificar", async (ctx) => {
  await ctx.reply("Você escolheu modificar um item! Escolha de onde", { reply_markup: itemModifyMenu});
});


bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "adicionar", description: "Adiciona um item ao inventário" },
  { command: "remover", description: "Remove um item do inventário" },
  { command: "modificar", description: "Modifica itens do inventário" },
  { command: "listar", description: "Lista os itens do inventário do seu personagem" },
  // { command: "teste", description: 'so pra testar' },
]);

bot.start();
