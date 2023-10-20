const { InlineKeyboard } = require("grammy");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, P, splitPocketQuant } = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");

async function transferItem(conversation, ctx) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n"; 
  let ID;
  let chatID
  
  console.log(ctx.update.message,enter)
  try{
    ID = ctx.update.callback_query.from.id;
    chatID = ctx.update.callback_query.message.chat.id;
  }
  catch(err){
    ID = ctx.update.message.from.id;
    chatID = ctx.update.message.chat.id;
  }
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagModify = true;
  const flagChoose = false;
  const confirmModify = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  const authorId = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  
  
  await ctx.reply("Escolha que tipo de itens quer transferir", {reply_markup: confirmPocket});
  
  
  var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

  let equipped = res.match === "equipped" ? true : false;

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  ctx.editMessageText(`Estes são seus itens no momento:\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer transferir para outro compartimento separando-os por , ou enter.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id});

  const { message } = await conversation.wait();

  var inventoryList = extractInventoryItemsFromMessage(message.text, flagChoose);
  var inventoryNow = authorCharacter.items.map((item) => item);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  

  for (let itemToModify of inventoryList) {
    var item = inventoryNow.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToModify}\n\nQuer tentar de novo?`, { reply_markup: confirmModify });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await transferItem(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, qualquer coisa estou por aqui haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  let listItemModify = [];

  for (let itemToModify of inventoryList) {
    let item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase()) };
    listItemModify.push(item);
}
    await ctx.reply(`Você irá transferir os itens:\n\n${listItemModify.map(item => ` -> ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg`).join("\n\n")}
    \n\nPeso total: ${listItemModify.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0)}\n\nVocê quer transferir esses itens para que tipo de compartimento?`, {reply_markup: confirmPocket});

    var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

    if(res.match ==="equipped"){
      equipped = true;
    }else if(res.match === "unequipped"){
      equipped = false;
    }
    var pocket = [ ...pocketsNow.map((item) => item.equipped === equipped ? item.name : "") ];
    
    const quant = await splitPocketQuant(pocket);
    
    await ctx.editMessageText(`Escolha para qual compartimento quer transferir os itens: \n\n${await getFormattedCharacters(authorId, equipped, "pockets", true)}`, {  reply_markup: quant.InlineNumbers , message_id: res.update.callback_query.message.message_id });
    
    var res = await conversation.waitForCallbackQuery(quant.itemString);
    const pocketToStore = res.match;

  await ctx.editMessageText(
    `Confira os itens que quer transferir:\n\n${listItemModify.map((itemMod, i) => {
        const index = authorCharacter.items.findIndex((item) => item.name.toLowerCase() === itemMod.name.toLowerCase());
        return `- ${authorCharacter.items[index].name}: ${authorCharacter.items[index].weight}Kg -  ${authorCharacter.items[index].quantity}Un  => ${limitarCasasDecimais(authorCharacter.items[index].weight * authorCharacter.items[index].quantity, 3)}Kg\nDescrição: ${authorCharacter.items[index].desc}`}
        ).join("\n\n")
      }\n\nTodos os itens estarão ${equipped === true ? "equipados": "desequipados"} no compartimento ${pocketToStore} - Confirma?`,
    { reply_markup: confirmModify , message_id: res.update.callback_query.message.message_id}
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      var i = 0;
      for (let itemToModify of listItemModify) {
        const index = authorCharacter.items.findIndex((item) => item.name.toLowerCase() === inventoryList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.items[index].pocket = pocketToStore;
            authorCharacter.items[index].equipped = equipped;
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens de ${authorCharacter.name} transferidos para ${pocketToStore}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
  } else {
    await ctx.editMessageText("Ok, então não vou transferir nada.\n\nQuer tentar de novo?", { reply_markup: confirmModify, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await transferPocket(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar alterar alguma coisa haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


module.exports = {
  transferItem,
};
