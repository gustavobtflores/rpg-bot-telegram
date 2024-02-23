const { InlineKeyboard } = require("grammy");
const { deleteItem, saveItem, catchItem } = require("../../config/storage");
const { formatDateToCustomFormat, handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, splitItemQuant, splitPocketQuant } = require("..");
const { getFormattedCharacters } = require("../../utils");

async function cubeToInventory(conversation, ctx) {
  const enter = "\n\n\n\n\n\n\n\n";
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const ID = ctx.from.id;
  const cubeID = "cube";
  const authorId = String(ID);
  const chatID = ctx.message.chat.id;
  const authorCube = CHARACTERS.find((character) => character.id === cubeID);
  var authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  const flagModify = true;
  const flagChoose = false;
  const confirmModify = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  var inventoryCube = authorCube.items.map((item) => item);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  
  await ctx.reply(`Você quer transferir os itens do cubo para que tipo de compartimento no seu inventário?`, {reply_markup: confirmPocket});
  
  var pocketType = await conversation.waitForCallbackQuery(["equipped","unequipped"]);
  const equipped = pocketType.match === "equipped" ? true : false ;
  var pocket = [ ...pocketsNow.map((item) => item.equipped === equipped ? item.name : "") ];
    
  const quant = await splitPocketQuant(pocket);
    
  await ctx.editMessageText(`Escolha para qual compartimento quer transferir os itens: \n\n${await getFormattedCharacters(authorId, equipped, "pockets", true)}`, {  reply_markup: quant.InlineNumbers , message_id: pocketType.update.callback_query.message.message_id });
    
  var res = await conversation.waitForCallbackQuery(quant.itemString);
  const pocketToStore = res.match;

  await ctx.editMessageText(`Estes são os itens no cubo no momento:\n${await getFormattedCharacters(cubeID, equipped)}\nEscolha quais itens quer transferir para *${pocketToStore}* separando-os por , ou enter.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });

  const { message } = await conversation.wait();
  
  var inventoryList = extractInventoryItemsFromMessage(message.text, flagChoose);
  

  if (!message || !message.from || !message.chat) {
    return;
  }
  
  for (let itemToModify of inventoryList) {
    var item = inventoryCube.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToModify}\n\nQuer tentar de novo?`, { reply_markup: confirmModify });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await cubeToInventory(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, qualquer coisa estou por aqui haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  const listItemRemove = await transferItemDefine(inventoryList, inventoryCube, authorCharacter, ctx, conversation);
  
  if (listItemRemove.modList.length === 0) {
    await ctx.reply(`Estes itens serão somados aos itens já existentes no seu inventário:\n\n${listItemRemove.nonAdd.map((item) => ` - ${item.name} => ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`).join("\n\n")}\n\nPeso total a ser adicionado: ${limitarCasasDecimais(listItemRemove.nonAdd.reduce((acc, item) => acc + item.weight * item.quantity, 0), 3)}Kg - Confirma?`, {
      reply_markup: confirmModify,
    });
  } else if (listItemRemove.nonAdd.length === 0) {
    await ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${listItemRemove.modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${listItemRemove.modList.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
      { reply_markup: confirmModify }
    );
  } else {
    await ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${listItemRemove.modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nEstes itens serão somados aos itens já existentes no seu inventário:\n\n${listItemRemove.nonAdd
        .map((item) => ` - ${item.name} => ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${limitarCasasDecimais(
        listItemRemove.modList.reduce((acc, item) => acc + item.weight * item.quantity, 0) + listItemRemove.nonAdd.reduce((acc, item) => acc + item.weight * item.quantity, 0),
        3
      )}Kg - Confirma?`,
      { reply_markup: confirmModify }
    );
  }
  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      
      for (const itemToRemove of listItemRemove.all) {
        const index = authorCube.items.findIndex((item) => item.name === itemToRemove.name);
        if (index !== -1) {
          if (authorCube.items[index].quantity !== 1) {
            if (itemToRemove.quantity === authorCube.items[index].quantity) {
              authorCube.items.splice(index, 1);
            } else {
              authorCube.items[index].quantity -= itemToRemove.quantity;
            }
          } else {
            authorCube.items.splice(index, 1);
          }
        }
      }
      
      await deleteItem("characters", CHARACTERS);
      
      var i = 0;
      
      await listItemRemove.modList.forEach((item) => {
        var test = authorCharacter.items.find((index) => index.name.toLowerCase() === item.name.toLowerCase());
        const itemPocket = authorCharacter.pockets.find(pocket => pocket.name === pocketToStore);
        
        if (!test) {
            item.pocket = pocketToStore;
            item.equipped = itemPocket.equipped;
          }
          authorCharacter.items.push(item);
          
        }
      );
      
      if (listItemRemove.nonAdd.length !== 0) {
        await listItemRemove.nonAdd.forEach((item) => {
          const index = authorCharacter.items.findIndex((i) => i.name.toLowerCase() === item.name.toLowerCase());
          authorCharacter.items[index].quantity += item.quantity;
        });
      }
      authorCharacter.lastModified = formatDateToCustomFormat(ctx.update.callback_query.message.date) + " }-> Transferiu do cubo";
      await saveItem("characters", CHARACTERS);
      
    });

    await ctx.editMessageText(`Itens de ${authorCharacter.name} transferidos para ${pocketToStore}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
  } else {
    await ctx.editMessageText("Ok, então não vou transferir nada.\n\nQuer tentar de novo?", { reply_markup: confirmModify, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await cubeToInventory(conversation, ctx);
    } else {
      await ctx.editMessageText("Ok, estarei aqui se precisar alterar alguma coisa haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}
function parseItemFromInventoryString(itemString) {
  const itemParts = itemString.split(",");
  return {
    name: itemParts[0].trim(),
    weight: limitarCasasDecimais(parseFloat(itemParts[1], 10), 3),
    quantity: parseFloat(itemParts[2], 10),
    desc: itemParts[3].trim(),
  };
}

async function transferItemDefine(inventoryList, inventoryCube, inventoryMain, ctx, conversation) {
  var modList = [];
  var nonAdd = [];
  var all = []
  
  for (let itemToRemove of inventoryList) {
    var item = { ...inventoryCube.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase()) };

    if (item.quantity !== 1) {
      const quant = await splitItemQuant(item);
      ctx.reply(`Quantas unidades de ${item.name} deseja transferir?`, { reply_markup: quant.InlineNumbers });

      var res = await conversation.waitForCallbackQuery(quant.itemString);

      item.quantity = parseInt(res.match);

      ctx.api.deleteMessage(res.update.callback_query.message.chat.id, res.update.callback_query.message.message_id);
    }
    all.push(item);
    
    var test = inventoryMain.items.find((index) => index.name.toLowerCase() === item.name.toLowerCase());
    if (!test) {
      modList.push(item);
    } else {
      nonAdd.push(item);
    }
  }
  return { modList, nonAdd, all};
}

module.exports = {
  cubeToInventory,
};