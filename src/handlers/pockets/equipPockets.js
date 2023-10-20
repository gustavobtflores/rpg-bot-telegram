const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem, deleteItem } = require("../../config/storage");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, P} = require('../../handlers');
const { getFormattedCharacters } = require("../../utils");

async function equipPockets(conversation, ctx) {

  const enter = "\n\n\n\n\n\n\n\n";

  let ID = ctx.update.callback_query.from.id;

  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }

  await ctx.reply(
    `Você escolheu equipar um compartimento!\n${await getFormattedCharacters(ID, false, "pockets")}\n\nDigite o nome do compartimento, podendo escolher mais de um separando por , ou enter. Lembrando que todos os itens pertencentes ao compartimento escolhido serão todos equipados juntos!`
  );

  const { message } = await conversation.wait();

  if (!message || !message.from || !message.chat) {
    return;
  }

  const chatID = message.chat.id;
  const flagPockets = false;
  const confirmPockets = new InlineKeyboard().text("Sim", "yes").text("Não", "no");

  const pocketsList = await extractInventoryItemsFromMessage(message.text, flagPockets);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  
  for (let pocketToEquip of pocketsList) {
    var item = pocketsNow.find((item) => item.name.toLowerCase() === pocketToEquip.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este compartimento nas suas coisas: \n\n${pocketToEquip}\n\nQuer tentar de novo?`, { reply_markup: confirmPockets });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await equipPockets(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  var listPocketsEquip = [];
  
  for (let pocketToEquip of pocketsList) {
    let item = { ...pocketsNow.find((item) => item.name.toLowerCase() === pocketToEquip.toLowerCase()) };
    listPocketsEquip.push(item);
  }
  
  await ctx.reply(
    `Confira os compartimentos que quer equipar:\n\n${listPocketsEquip
      .map((item) => `- ${item.name}`).join("\n\n")}\n\nConfirma?`,
    { reply_markup: confirmPockets }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  if (res.match === "yes") {
    await conversation.external(async () => {
        var i = 0;
      for (let pocketToEquip of listPocketsEquip) {
        
        for (const item of authorCharacter.items){
          if (item.pocket.toLowerCase() === pocketToEquip.name.toLowerCase()){
            item.equipped = true;
          }
        }
        
        const index = authorCharacter.pockets.findIndex((item) => item.name.toLowerCase() === pocketsList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.pockets[index].equipped = true;
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
      });

    await ctx.editMessageText(`Compartimentos removidos do inventário do ${authorCharacter.name}.`, {
      reply_markup: blank,
      message_id: res.update.callback_query.message.message_id });
  } else {
    await ctx.editMessageText("Ok, então não vou equipr nada.\n\nQuer tentar de novo?", { reply_markup: confirmPockets, message_id: res.update.callback_query.message.message_id });
    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      await equipPockets(conversation, ctx );
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar organizar algumas coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
  return;
}


async function unequipPockets(conversation, ctx){
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagPockets = false;
  const confirmPockets = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  let ID = ctx.update.callback_query.from.id;
  const authorId = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  ctx.reply(
    `Você escolheu desequipar um compartimento!\n${await getFormattedCharacters(authorId, true, "pockets")}\n\nDigite o nome do compartimento, podendo escolher mais de um separando por , ou enter. Lembrando que todos os itens pertencentes ao compartimento escolhido serão todos desequipados juntos!`
  );
  const { message } = await conversation.wait();

  const pocketsList = extractInventoryItemsFromMessage(message.text, flagPockets);
  var pocketsNow = authorCharacter.pockets.map((item) => item);

  for (let pocketToEquip of pocketsList) {
    var item = pocketsNow.find((item) => item.name.toLowerCase() === pocketToEquip.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${pocketToEquip}\n\nQuer tentar de novo?`, { reply_markup: confirmPockets });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await unequipPockets(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  var listPocketsUnequip = [];
  
  for (let pocketToUnequip of pocketsList) {
    let item = { ...pocketsNow.find((item) => item.name.toLowerCase() === pocketToUnequip.toLowerCase()) };
    listPocketsUnequip.push(item);
  }
  
  await ctx.reply(
    `Confira os compartimentos que quer desequipar:\n\n${listPocketsUnequip
      .map((item) => ` -> ${item.name}`).join("\n\n")}\n\nConfirma?`,
    { reply_markup: confirmPockets }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
        var i = 0;
      for (let pocketToEquip of listPocketsUnequip) {
        
        for (const item of authorCharacter.items){
          if (item.pocket === pocketToEquip.name){
            item.equipped = false;
          }
        }
        
        const index = authorCharacter.pockets.findIndex((item) => item.name.toLowerCase() === pocketsList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.pockets[index].equipped = false;
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
      });

    await ctx.editMessageText(`Itens agora estão desequipados do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
   }
   else {
    await ctx.editMessageText("Ok, então não desequipar nada.\n\nQuer tentar de novo?", { reply_markup: confirmPockets, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await unequipPockets(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar desequipar alguma coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


module.exports = {
  equipPockets,
  unequipPockets
};
