const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem } = require("../../config/storage");
const { getFormattedCharacters } = require("../../utils");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, splitPocketQuant} = require('../../handlers');

const ITEM_REGEX = /^\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+\s*,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+\s*$/;

async function addItem(conversation, ctx) {
  let enter = "\n\n\n\n\n\n\n\n";

  let ID = ctx.update.callback_query.from.id;

  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  await ctx.reply(`Você quer adicionar os itens em que tipo de compartimento?`, {reply_markup: confirmPocket});
  
  var pocketType = await conversation.waitForCallbackQuery(["equipped","unequipped"]);
  const equipped = pocketType.match === "equipped" ? true : false ;
  var pocket = [ ...pocketsNow.map((item) => item.equipped === equipped ? item.name : "") ];
    
  const quant = await splitPocketQuant(pocket);
    
  await ctx.editMessageText(`Escolha para qual compartimento quer transferir os itens: \n\n${await getFormattedCharacters(authorId, equipped, "pockets", true)}`, {  reply_markup: quant.InlineNumbers , message_id: pocketType.update.callback_query.message.message_id });
    
  var res = await conversation.waitForCallbackQuery(quant.itemString);
  const pocketToStore = res.match;
  console.log(pocketToStore);


  await ctx.editMessageText(
    `Escreva o item que quer adicionar em ${pocketToStore} seguindo o modelo:\n\n <nome do item>, <peso>, <quantidade>, <descrição>\n\nPode adicionar mais de um item separando por ; ou enter.\n\nExemplo 1:\n escudo, 2, 1, de metal; adaga, 1, 2, pequena\n\nExemplo 2: \nescudo, 2, 1, de metal\nadaga, 1, 2, pequena`, {reply_markup: blank, message_id: pocketType.update.callback_query.message.message_id}
  );

  const { message } = await conversation.wait();

  if (!message || !message.from || !message.chat) {
    return;
  }

  const chatID = message.chat.id;
  var modList = [];
  const flagAdd = true;
  var nonAdd = [];
  const confirmAdd = new InlineKeyboard().text("Sim", "yes").text("Não", "no");

  const inventoryList = await extractInventoryItemsFromMessage(message.text, flagAdd);
  for (let itemInInventory of inventoryList) {
    if (!isValidItem(itemInInventory, ITEM_REGEX)) {
      await ctx.reply(`Houve um problema ao identificar um dos itens, erro foi nesse item aqui: \n\n${itemInInventory}\n\nQuer tentar de novo?`, { reply_markup: confirmAdd });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await addItem(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, então não vou adicionar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
    const parsedItem = await parseItemFromInventoryString(itemInInventory);

    var test = authorCharacter.items.find((index) => index.name.toLowerCase() === parsedItem.name.toLowerCase());
    if (!test) {
      modList.push(parsedItem);
    } else {
      nonAdd.push(parsedItem);
    }
  }

  if (modList.length === 0) {
    ctx.reply(`Estes itens serão somados aos itens já existentes no seu inventário:\n\n${nonAdd.map((item) => ` - ${item.name} => ${item.quantity}Un`).join("\n\n")}\n\nConfirma?`, {
      reply_markup: confirmAdd,
    });
  } else if (nonAdd.length === 0) {
    ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${modList.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
      { reply_markup: confirmAdd }
    );
  } else {
    ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nEstes itens serão somados aos itens já existentes no seu inventário:\n\n${nonAdd
        .map((item) => ` - ${item.name} => ${item.quantity}Un`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${limitarCasasDecimais(
        modList.reduce((acc, item) => acc + item.weight * item.quantity, 0) + nonAdd.reduce((acc, item) => acc + item.weight * item.quantity, 0),
        3
      )}Kg - Confirma?`,
      { reply_markup: confirmAdd }
    );
  }

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      await modList.forEach((item) => {
        var test = authorCharacter.items.find((index) => index.name.toLowerCase() === item.name.toLowerCase());
        const itemPocket = authorCharacter.pockets.find(pocket => pocket.name === pocketToStore);
        
        if (!test) {
            item.pocket = pocketToStore;
            item.equipped = itemPocket.equipped;
          }
          authorCharacter.items.push(item);
          
        }
      );

      if (nonAdd.length !== 0) {
        await nonAdd.forEach((item) => {
          const index = authorCharacter.items.findIndex((i) => i.name.toLowerCase() === item.name.toLowerCase());
          authorCharacter.items[index].quantity += item.quantity;
        });
      }
      saveItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens adicionados ao inventário do ${authorCharacter.name}.\n\nQuer adicionar mais itens?`, {
      reply_markup: confirmAdd,
      message_id: res.update.callback_query.message.message_id,
    });

    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await addItem(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, obrigado pelos itens!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  } else {
    await ctx.editMessageText("Ok, então não vou adicionar nada.\n\nQuer tentar de novo?", { reply_markup: confirmAdd, message_id: res.update.callback_query.message.message_id });
    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      await addItem(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar se livrar de algumas coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


module.exports = {
  addItem,
};
