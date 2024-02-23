const { conversations, createConversation } = require("@grammyjs/conversations");
const { bot } = require("./config/botConfig");
const { addItem, removeItem, modifyItem, addCube, removeCube, modifyCube, equipItem, unequipItem, status, addPockets, removePockets, equipPockets, unequipPockets, modifyPockets, transferItem, progress, cubeToInventory } = require("./handlers/imports");
const { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, deleteP, P, listItemsMenu, equipPocketMenu, cubeMenu, inventoryMenu, changeStatus, playerss, statusValue, statusReset, fullRecoverAll, pocketsMenu, menuHelp, idStatus, progressMenu, xpMenu, statusMenu } = require("./menus");
const { getFormattedCharacters } = require("./utils");
const { catchItem, deleteItem } = require("./config/storage");
const { InlineKeyboard } = require("grammy");
const { bold, fmt, hydrateReply, italic, link } = require(
  "@grammyjs/parse-mode",
);


bot.use(hydrateReply)
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
bot.use(createConversation(addPockets, "add-pockets"));
bot.use(createConversation(removePockets, "remove-pockets"));
bot.use(createConversation(modifyPockets,"modify-pockets"));
bot.use(createConversation(equipPockets,"equip-pockets"));
bot.use(createConversation(unequipPockets,"unequip-pockets"));
bot.use(createConversation(transferItem,"transfer-item"));
bot.use(createConversation(progress,"progress"));
bot.use(createConversation(cubeToInventory, "cube-to-inventory"));


bot.use(DgMMenu);
DgMMenu.register(listPlayersMenu);
DgMMenu.register(playerss);
DgMMenu.register(progressMenu);
playerss.register(changeStatus);
playerss.register(fullRecoverAll);

bot.use(mainMenu);
mainMenu.register(itemAddMenu);
mainMenu.register(itemRemoveMenu);
mainMenu.register(itemModifyMenu);
mainMenu.register(listItemsMenu);
mainMenu.register(equipPocketMenu);
mainMenu.register(cubeMenu);
mainMenu.register(inventoryMenu);
mainMenu.register(pocketsMenu);
mainMenu.register(statusMenu);
mainMenu.register(xpMenu);


bot.use(menuHelp);




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
  await ctx.reply("Vocẽ escolheu equipar ou desequipar um compartimento!", { reply_markup: equipPocketMenu });
});

bot.command("transferir", async (ctx) => {
  deleteP(9);
  await ctx.conversation.enter("transfer-item");
});

bot.command("status", async (ctx) => {
  deleteP(9);
  await ctx.reply("Você escolheu ver o seu progresso! Escolha o que quer fazer.", { reply_markup: statusMenu});
});

bot.command("progresso", async (ctx) => {
  deleteP(9);
  await ctx.reply("Você escolheu ver o seu progresso! Escolha o que quer fazer.", { reply_markup: xpMenu});
});

bot.command("help", async (ctx) => {
  deleteP(9);
  
  if(ctx.update.message.chat.type === "private"){
    await ctx.deleteMessage()
  }
  await ctx.reply("*Boas vindas e não temas\\! Este breve guia vem para ajudar a sanar suas dúvidas de forma clara e rápida\\!*\n\n/start \\-\\> Menu principal, por onde pode acessar todas as funções em menus navegáveis\\.\n/adicionar \\-\\> Adiciona itens ou compartimentos, se o item que estiver tentando adicionar já for existente no seu inventário ele será somado\\.\n/remover \\-\\> Remove itens ou compartimentos, ao remover item será questionado _quantos quer remover_ se houver mais de um daquele item, ao remover compartimentos é possível _remover todos os itens_ que estão naquele compartimento, o que é bastante útil se você pensar em criar um compartimento chamado lixeira, transferir todos os itens para lá e então de tempos em tempos remover todos de uma vez só\\!\n/modificar \\-\\> Modifica itens ou compartimentos\\. Permite modificar todas as propriedades dos itens e dos compartimentos, lembrando que todas as aterações feitas no compartimento afetarão também os itens que estão contidos nele\\.\n/listar \\-\\> Lista todos os itens equipados ou desequipados, acessando o menu compartimentos, porém, você é capaz de ver os compartimentos que estão vazios, ou seja, sem itens\\.\n/equip \\-\\> Desequipa compartimentos, bastante útil na hora que precisar desequipar ou equipar vários itens de uma vez só, ou seja, quando desequipa um compartimento, por exemplo, _todos os itens que pertencem aquele compartimento também serão desequipados_, então numa situação onde você estã com uma mochila nas costas você pode se livrar daquele peso todo de uma vez\\!\n/status \\-\\> Lista os status atuais, além de poder alterar as notificações do mesmo\\. Mostra como está seu personagem indicando quais foram os últimos acontecimentos aconteceram com seu personagem\\.\n/transferir \\-\\> Transfere seus itens para qualquer compartimento\\. Com isso, você é capaz de desequipar ou equipar itens individualmente ou em grupos, transferindo para qualquer compartimento desejado\\.\n/progresso \\-\\> Lista ou modifica seu progresso, sendo de maior importância *listar as habilidades que você tem alguma XP ou hora de aprendizagem*, mas pode conter também outras Informações como pontos na carteira ou nomes de professores ou lugares\\.\n\nLembrando que itens *DESEQUIPADOS* significam que são itens que não estão com você\\! Logo, estes itens não constaram na lista de itens do mestre, então fique atento para isso\\.", {reply_markup: menuHelp, parse_mode: "MarkdownV2"});
});


const mensagem = `Olá Jogador\\! Mais uma vez venho com outra novidade\\!\n\nAgora posso registrar seu progresso no jogo e o nosso Mestre poderá acompanhar tais registros\\. Basta seguir para o menu principal /start ou através de /progresso e registrar seu progresso por lá\\!\n\nEis um exemplo do personagem Tibius:\n\n_Habilidades \\(XP/Horas\\)_\n\n_*BRIGA \\- \\(1/0\\);_\n_*ALQUIMIA \\- \\(0/10\\);_\n_*COMÉRCIO \\- \\(1/0\\);_\n_*ATUAÇÃO \\- \\(1/0\\);_\n_*HT \\- \\(1/0\\);_\n_*INTIMIDAR \\(2/0\\);_\n\nAssim será visto pelo Mestre e se ocorrer alguma incompatibilidade com as anotações dele ele poderá nos avisar\\.\n\nSó lembrando que este é um exemplo\\. Você pode adicionar os seus pontos na carteira ou escrever brevemente o que pretende fazer depois, *o que importa mesmo é estar listado as pericias/magias/atributos os quais você tem algum XP ou hora aprendida*\\.\n\nAté a próxima\\!`;



// `Olá Jogador\\!\n\nTão logo fui tão logo já voltei, sei que nem tiveram o gostinho da ultima atualização mas ja venho com mais uma novidade\\!\n\nAgora posso te notificar sempre que o saudoso Mestre fizer alguma alteração em seus personagens\\. De momento as notificações já estão *ATIVADAS* e podem ser desativadas no sino que se encontra no menu principal em /start\\.\n\nAté a próxima\\!`;

// `Olá Jogador\\!\n\nVenho aqui mais uma vez para anunciar a mais nova atualização\\!\n\nAgora não mais terá problemas com a bagunça que é os seus itens pois poderá organizá\\-los de forma prática e fácil\\!\n\nO que trago para você é um sistema de *COMPARTIMENTOS* que você poderá *equipar* ou *desequipar* a qualquer momento, levando todos os itens contidos nele juntos, portanto uma mochila equipada, quando desequipada irá desequipar também todos os itens nela\\. É possível também transferir itens individualmente para compartimentos disponíveis, então se vocẽ tem uma adaga equipada no seu compartimento "cinto" \\(que está na sua cintura, por isso equipado\\) você pode transferir para o compartimento "baú" \\(que povavelmente vai estar desequipado a não ser que esteja arrastando ou carregando o baú nas costas\\) assim deixando a adaga desequipada\\. Lembrando que itens desequipados não são vistos pelo mestres, significando que não estão com você\\. Você também é capaz de remover compartimentos, e com isso *escolher se quer remover todos os itens juntos ou não*\\.\\.\\. como decidir jogar uma mochila no fogo, assim queimando a mochila e todos os itens dentro ou apenas jogar todos os itens da mochila no chão e daí jogar a mochila no fogo\\.\n\nEntão testem todas as funções e commentem o que acharam e se também se houver sugestões, também existe um novo comando /help que contém Informações sobre todas as funções\\.\n\nAté a próxima\\!`;

// bot.command("broadcast", async (ctx) => {
//   await ctx.reply(`${mensagem}`, {chat_id: 965254444,parse_mode: "MarkdownV2"});
  // await ctx.reply(`${mensagem}`, {chat_id: 587760655,parse_mode: "MarkdownV2"});
//   await ctx.reply(`${mensagem}`, {chat_id: 960580168,parse_mode: "MarkdownV2"});
//   // await ctx.reply(`${mensagem}`,{parse_mode: "MarkdownV2"});
//   await ctx.reply(`       Olá Mestre!\n\nAgora já sou capaz de registrar o progesso dos personagens dos seus queridos Players! Com a nova aba "progresso" em /start você tem acesso ao progresso atual de cada um.\n\nAté a próxima!`, {chat_id: 744974273});
// });

bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "help", description: "Informações básica das funções" },
  { command: "transferir", description: "Transfere itens para compartimentos" },
  { command: "adicionar", description: "Adiciona itens ou compartimentos" },
  { command: "remover", description: "Remove itens ou compartimentos" },
  { command: "modificar", description: "Modifica itens ou compartimentos" },
  { command: "listar", description: "Lista os itens do inventário do seu personagem" },
  { command: "equip", description: "Equipar/desequipar compartimentos" },
  { command: "status", description: "Mostra seus status atual" },
  { command: "progresso", description: "Mostra ou modifica seu progresso" },
]);

bot.start({ 
  drop_pending_updates: true
});
