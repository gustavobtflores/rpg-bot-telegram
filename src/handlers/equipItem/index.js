const { InlineKeyboard } = require("grammy");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais } = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");


async function unequipItem(conversation, ctx){
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagEquip = false;
  const confirmUnequip = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ctx.update.callback_query.from.id);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  ctx.reply(`Estes são seus itens equipados no momento:\n\n${await getFormattedCharacters(authorId, true)}\nEscolha quais itens quer desequipar separando-os por , ou enter.`, { reply_markup: blank });

  const { message } = await conversation.wait();

  const inventoryList = extractInventoryItemsFromMessage(message.text, flagEquip);
  var inventoryNow = authorCharacter.items.map((item) => item);

  for (let itemToEquip of inventoryList) {
    var item = inventoryNow.find((item) => item.name.toLowerCase() === itemToEquip.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToEquip}\n\nQuer tentar de novo?`, { reply_markup: confirmUnequip });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await unequipItem(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  var listItemUnequip = [];
  
  for (let itemToUnequip of inventoryList) {
    let item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToUnequip.toLowerCase()) };
    listItemUnequip.push(item);
  }
  
  await ctx.reply(
    `Confira os itens que quer desequipar:\n\n${listItemUnequip
      .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
      .join("\n\n")}\n\nPeso total a ser desequipado: ${listItemUnequip.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
    { reply_markup: confirmUnequip }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
        var i = 0;
      for (let itemToUnequip of listItemUnequip) {
        const index = authorCharacter.items.findIndex((item) => item.name.toLowerCase() === inventoryList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.items[index].equipped = false;
            authorCharacter.items[index].pocket = "Chão";
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens agora estão desequipados do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
   }
   else {
    await ctx.editMessageText("Ok, então não desequipar nada.\n\nQuer tentar de novo?", { reply_markup: confirmUnequip, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await unequipItem(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar desequipar alguma coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}




async function equipItem(conversation, ctx) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagEquip = false;
  const confirmEquip = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ctx.update.callback_query.from.id);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  ctx.reply(`Estes são seus itens desequipados no momento:\n\n${await getFormattedCharacters(authorId, false)}\nEscolha quais itens quer equipar separando-os por , ou enter.`, { reply_markup: blank });

  const { message } = await conversation.wait();

  const inventoryList = extractInventoryItemsFromMessage(message.text, flagEquip);
  var inventoryNow = authorCharacter.items.map((item) => item);

  for (let itemToEquip of inventoryList) {
    var item = inventoryNow.find((item) => item.name.toLowerCase() === itemToEquip.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToEquip}\n\nQuer tentar de novo?`, { reply_markup: confirmEquip });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await equipItem(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  var listItemEquip = [];
  
  for (let itemToEquip of inventoryList) {
    let item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToEquip.toLowerCase()) };
    listItemEquip.push(item);
  }
  
  await ctx.reply(
    `Confira os itens que quer equipar:\n\n${listItemEquip
      .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
      .join("\n\n")}\n\nPeso total a ser equipado: ${listItemEquip.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
    { reply_markup: confirmEquip }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
        var i = 0;
      for (let itemToEquip of listItemEquip) {
        const index = authorCharacter.items.findIndex((item) => item.name.toLowerCase() === inventoryList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.items[index].equipped = true;
            authorCharacter.items[index].pocket = "Corpo";
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens agora estão equipados no inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
   }
   else {
    await ctx.editMessageText("Ok, então não equipar nada.\n\nQuer tentar de novo?", { reply_markup: confirmEquip, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await equipItem(conversation, ctx, tempCube);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar equipar alguma coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


module.exports = {
  equipItem,
  unequipItem
};
