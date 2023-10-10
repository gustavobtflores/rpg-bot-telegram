const { conversations, createConversation } = require("@grammyjs/conversations");
const { bot } = require("./config/botConfig");
const { addItem, removeItem, modifyItem, addCube, removeCube, modifyCube, equipItem, unequipItem, status } = require("./handlers/imports");
const { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, deleteP, P, listItemsMenu, equipItemMenu, cubeMenu, inventoryMenu, changeStatus, playerss, statusValue, statusReset, fullRecoverAll } = require("./menus");
const { getFormattedCharacters } = require("./utils");

const weblink = "http://t.me/oEscudeiro_bot/DGrules";

bot.use(conversations());
bot.use(createConversation(modifyItem, "modify-item"));
bot.use(createConversation(addItem, "add-item"));
bot.use(createConversation(removeItem, "remove-item"));
bot.use(createConversation(addCube, "add-cube"));
bot.use(createConversation(removeCube, "remove-cube"));
bot.use(createConversation(modifyCube, "modify-cube"));
bot.use(createConversation(equipItem, "equip-item"));
bot.use(createConversation(unequipItem, "unequip-item"));
bot.use(createConversation(status, "status"));

bot.use(DgMMenu);
DgMMenu.register(listPlayersMenu);
DgMMenu.register(playerss);
playerss.register(changeStatus);
playerss.register(fullRecoverAll);

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
    await statusReset();
    await ctx.reply("Seja bem vindo Dungeon Master!", { reply_markup: DgMMenu });
  } else {
    await ctx.reply("Bem vindo ao bot de itens! Que inventário quer usar?", { reply_markup: mainMenu });
  }
});

bot.command("adicionar", async (ctx) => {
  deleteP(9);
  await ctx.reply("Você escolheu adicionar um item! Escolha onde", { reply_markup: itemAddMenu });
});

bot.command("remover", async (ctx) => {
  deleteP(9);
  await ctx.reply("Você escolheu remover um item! Escolha de onde", { reply_markup: itemRemoveMenu });
});

bot.command("listar", async (ctx) => {
  deleteP(9);
  await ctx.reply("Você escolheu listar seus itens! Escolha de onde", { reply_markup: listItemsMenu });
});
bot.command("modificar", async (ctx) => {
  deleteP(9);
  await ctx.reply("Você escolheu modificar um item! Escolha de onde", { reply_markup: itemModifyMenu });
});
bot.command("equip", async (ctx) => {
  deleteP(9);
  await ctx.reply("Vocẽ escolheu equipar ou desequipar um item!", { reply_markup: equipItemMenu });
});

 bot.command("regras", async (ctx) => {
   deleteP(9);
  await ctx.reply("Regras!", { reply_markup: { inline_keyboard: [[{text: "📖", url: weblink }]] } });
  // ctx.api.deleteMessage(ctx.update.message.chat.id, ctx.update.message.message_id);
});

bot.command("status", async (ctx) => {
  await ctx.reply(await getFormattedCharacters(ctx.from.id, true, "status"));
});

// bot.command("broadcast", async (ctx) => {
//   await ctx.reply("       Olá jogador!\n\nAgora já sou capaz de analisar como está o seu estado de saúde além de ser capaz de te dizer suas capacidades mágicas!\n\nO que estou querendo dizer é que agora você tem acesso aos seus status (PV, PF e Mana Pool ou PM) que o nosso magnífico Mestre irá alterar sempre que necessário.\n\nPode verificar a partir do menu principal /start ou simplesmente pelo comando /status, depois fala qualquer coisa la no OFF e por hoje é isso! Para a próxima vez pretendo poder guardar seus itens em lugares separados então até a próxima!", {chat_id: 965254444});
//   await ctx.reply("       Olá jogador!\n\nAgora já sou capaz de analisar como está o seu estado de saúde além de ser capaz de te dizer suas capacidades mágicas!\n\nO que estou querendo dizer é que agora você tem acesso aos seus status (PV, PF e Mana Pool ou PM) que o nosso magnífico Mestre irá alterar sempre que necessário.\n\nPode verificar a partir do menu principal /start ou simplesmente pelo comando /status, depois fala qualquer coisa la no OFF e por hoje é isso! Para a próxima vez pretendo poder guardar seus itens em lugares separados então até a próxima!", {chat_id: 587760655});
//   await ctx.reply("       Olá jogador!\n\nAgora já sou capaz de analisar como está o seu estado de saúde além de ser capaz de te dizer suas capacidades mágicas!\n\nO que estou querendo dizer é que agora você tem acesso aos seus status (PV, PF e Mana Pool ou PM) que o nosso magnífico Mestre irá alterar sempre que necessário.\n\nPode verificar a partir do menu principal /start ou simplesmente pelo comando /status, depois fala qualquer coisa la no OFF e por hoje é isso! Para a próxima vez pretendo poder guardar seus itens em lugares separados então até a próxima!", {chat_id: 960580168});
//   await ctx.reply("       Olá Mestre!\n\nAgora já sou capaz de registrar os status dos personagens dos seus queridos Players! Agora você tem acesso para alterar os status (PV, PF e Mana Pool ou PM) sempre que necessário, escolhendo apenas um personagem ou quantos quiser, podendo recuperar os status todos de uma vez de todos os personagens ou apenas o que você assim desejar. \n\nPeço que teste tudo o que puder e depois fala qualquer coisa la no pvd ou no OFF mesmo e por hoje é isso!", {chat_id: 744974273});
// });

bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "adicionar", description: "Adiciona um item ao inventário" },
  { command: "remover", description: "Remove um item do inventário" },
  { command: "modificar", description: "Modifica itens do inventário" },
  { command: "listar", description: "Lista os itens do inventário do seu personagem" },
  { command: "equip", description: "Equipar/desequipar itens" },
  { command: "status", description: "Lista seus status atual" },
  // { command: "broadcast", description: 'Equipar/desequipar itens' },
  { command: "regras", description: "Regras" },
]);

bot.start();
