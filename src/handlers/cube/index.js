const { removeItem } = require('../../handlers/removeItem');
const { modifyItem } = require("../../handlers/modifyItem");


async function addCube(conversation, ctx) {
  await addItem(conversation, ctx, true);
  
}

async function removeCube(conversation, ctx) {
  await removeItem(conversation, ctx, true);
}

async function modifyCube(conversation, ctx){
  await modifyItem(conversation,ctx, true);
}
const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem } = require("../../config/storage");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString} = require('../../handlers');

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;

async function addItem(conversation, ctx, cube) {
  let enter = "\n\n\n\n\n\n\n\n";

  let ID = "";
  let tempCube = cube;
  if (cube === true) {
    ID = "cube";
    tempCube = cube;
  } else {
    ID = ctx.update.callback_query.from.id;
    tempCube = false;
  }

  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }

  await ctx.reply(
    `Escreva o item que quer adiconar seguindo o modelo:\n\n <nome do item>, <peso>, <quantidade>, <descrição>\n\nPode adicionar mais de um item separando por ; ou enter.\n\nExemplo1:\n escudo, 2, 1, de metal; adaga, 1, 2, pequena\n\nExemplo2: \nescudo, 2, 1, de metal\nadaga, 1, 2, pequena`
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
        await addItem(conversation, ctx, tempCube);
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
      `Estes itens serão adicionados:\n\n${modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${modList.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
      { reply_markup: confirmAdd }
    );
  } else {
    ctx.reply(
      `Estes itens serão adicionados:\n\n${modList
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

  if (res.match === "yes") {await conversation.external(async () => {
      await modList.forEach((item) => {
        var test = authorCharacter.items.find((index) => index.name.toLowerCase() === item.name.toLowerCase());
            item.pocket = "cubo";
            item.equipped = true;
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

      await addItem(conversation, ctx, tempCube);
    } else {
      ctx.editMessageText("Ok, obrigado pelos itens!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  } else {
    await ctx.editMessageText("Ok, então não vou adicionar nada.\n\nQuer tentar de novo?", { reply_markup: confirmAdd, message_id: res.update.callback_query.message.message_id });
    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      await addItem(conversation, ctx, tempCube);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar se livrar de algumas coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}

module.exports = {
  addCube,
  removeCube,
  modifyCube
};
