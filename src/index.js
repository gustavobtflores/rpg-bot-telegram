const { conversations, createConversation, } = require("@grammyjs/conversations");
const { bot } = require("./config/botConfig");
const { addItem, removeItem, modifyItem, addCube, removeCube, modifyCube, equipItem, unequipItem } = require("./handlers/imports");
const { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, deleteP, P, listItemsMenu, equipItemMenu, cubeMenu, inventoryMenu } = require("./menus");
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
mainMenu.register(cubeMenu);
mainMenu.register(inventoryMenu);

bot.command("start", async (ctx) => {
  deleteP(9);
  if (ctx.update.message.from.id === 744974273) {
    await ctx.reply("Seja bem vindo Dungeon Master!", { reply_markup: DgMMenu });
  } else {
    await ctx.reply("Bem vindo ao bot de itens! Que inventário quer usar?", { reply_markup: mainMenu });
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


// bot.command("broadcast", async (ctx) => {
//   await ctx.reply("       Olá jogador!\n\nAgora já posso modificar os seus itens e também guardar seus itens sem interferir no seu peso simplesmente equipando e desequipando do seu inventário principal. Vale notar que os itens desequipados não vão constar para o nosso saudoso mestre então lembre-se: se não está equipado não está com você! Portanto desequipe itens que você guardou ou soltou por ai ou se simplesmente não deseja excluir completamente dos seus registros.\n\nPeço que teste tudo o que puder e depois fala qualquer coisa la no OFF e por hoje é isso! Para a próxima vez pretendo poder guardar seus itens em lugares separados então até a próxima!", {chat_id: 965254444});
//   await ctx.reply("       Olá jogador!\n\nAgora já posso modificar os seus itens e também guardar seus itens sem interferir no seu peso simplesmente equipando e desequipando do seu inventário principal. Vale notar que os itens desequipados não vão constar para o nosso saudoso mestre então lembre-se: se não está equipado não está com você! Portanto desequipe itens que você guardou ou soltou por ai ou se simplesmente não deseja excluir completamente dos seus registros.\n\nPeço que teste tudo o que puder e depois fala qualquer coisa la no OFF e por hoje é isso! Para a próxima vez pretendo poder guardar seus itens em lugares separados então até a próxima!", {chat_id: 587760655});
//   await ctx.reply("       Olá jogador!\n\nAgora já posso modificar os seus itens e também guardar seus itens sem interferir no seu peso simplesmente equipando e desequipando do seu inventário principal. Vale notar que os itens desequipados não vão constar para o nosso saudoso mestre então lembre-se: se não está equipado não está com você! Portanto desequipe itens que você guardou ou soltou por ai ou se simplesmente não deseja excluir completamente dos seus registros.\n\nPeço que teste tudo o que puder e depois fala qualquer coisa la no OFF e por hoje é isso! Para a próxima vez pretendo poder guardar seus itens em lugares separados então até a próxima!", {chat_id: 960580168});
// })

bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "adicionar", description: "Adiciona um item ao inventário" },
  { command: "remover", description: "Remove um item do inventário" },
  { command: "modificar", description: "Modifica itens do inventário" },
  { command: "listar", description: "Lista os itens do inventário do seu personagem" },
  { command: "equip", description: 'Equipar/desequipar itens' },
  // { command: "broadcast", description: 'Equipar/desequipar itens' },
  
]);

bot.start();
