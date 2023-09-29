const { conversations, createConversation, } = require("@grammyjs/conversations");
const { bot } = require("./config/botConfig");
const { addItem, removeItem, modifyItem, addCube, removeCube, modifyCube, equipItem, unequipItem } = require("./handlers/imports");
const { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, deleteP, P, listItemsMenu, equipItemMenu } = require("./menus");
const { getFormattedCharacters } = require("./utils");

bot.use(conversations());
bot.use(createConversation(modifyItem, "modify-item"));
bot.use(createConversation(addItem, "add-item"));
bot.use(createConversation(removeItem, "remove-item"));
bot.use(createConversation(addCube, "add-cube"));
bot.use(createConversation(removeCube, "remove-cube"));
bot.use(createConversation(modifyCube, "modify-cube"));
bot.use(createConversation(equipItem, "equip-item"));
bot.use(createConversation(unequipItem,"unequip-item"));

bot.use(DgMMenu);
DgMMenu.register(listPlayersMenu);

bot.use(mainMenu);
mainMenu.register(itemAddMenu);
mainMenu.register(itemRemoveMenu);
mainMenu.register(itemModifyMenu);
mainMenu.register(listItemsMenu);
mainMenu.register(equipItemMenu);

bot.command("start", async (ctx) => {
  deleteP(9);
  if (ctx.update.message.from.id === 744974273) {
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
  await ctx.reply("Você escolheu listar seus itens! Escolha de onde", { reply_markup: listItemsMenu });
});
bot.command("modificar", async (ctx) => {
  await ctx.reply("Você escolheu modificar um item! Escolha de onde", { reply_markup: itemModifyMenu});
});
bot.command("equip", async (ctx) =>{
  await ctx.reply("Vocẽ escolheu equipar ou desequipar um item!", { reply_markup: equipItemMenu});
});


bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "adicionar", description: "Adiciona um item ao inventário" },
  { command: "remover", description: "Remove um item do inventário" },
  { command: "modificar", description: "Modifica itens do inventário" },
  { command: "listar", description: "Lista os itens do inventário do seu personagem" },
  { command: "equip", description: 'Equipar/desequipar itens' }
]);

bot.start();
