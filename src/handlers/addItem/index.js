const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem } = require("../../config/storage");
const { getFormattedCharacters } = require("../../utils");
const { formatDateToCustomFormat, handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, splitPocketQuant} = require('../../handlers');

const ITEM_REGEX = /^\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+\s*,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+\s*$/;

async function addItem(conversation, ctx, cube) {
  let enter = "\n\n\n\n\n\n\n\n";

  let ID = "";
  let tempCube = cube;
  let equipped;
  let pocketToStore;
  let modifiedDesc;
  if (cube === true) {
    ID = "cube";
    tempCube = cube;
    equipped = true;
    modifiedDesc = "Adicionou item no cubo";
  } else {
    ID = ctx.update.callback_query.from.id;
    tempCube = false;
    modifiedDesc = "Adicionou item no inventário";
  }

  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  if(!tempCube){
  await ctx.reply(`Você quer adicionar os itens em que tipo de compartimento?`, {reply_markup: confirmPocket});
  
  var pocketType = await conversation.waitForCallbackQuery(["equipped","unequipped"]);
  equipped = pocketType.match === "equipped" ? true : false ;
  var pocket = [ ...pocketsNow.map((item) => item.equipped === equipped ? item.name : "") ];
    
  const quant = await splitPocketQuant(pocket);
    
  await ctx.editMessageText(`Escolha para qual compartimento quer adicionar os itens: \n\n${await getFormattedCharacters(authorId, equipped, "pockets", true)}`, {  reply_markup: quant.InlineNumbers , message_id: pocketType.update.callback_query.message.message_id });
    
  var res = await conversation.waitForCallbackQuery(quant.itemString);
  pocketToStore = res.match;

  await ctx.editMessageText(
    `Escreva o item que quer adicionar em ${pocketToStore} seguindo o modelo:\n\n <nome do item>, <peso>, <quantidade>, <descrição>\n\nPode adicionar mais de um item separando por ; ou enter.\n\nExemplo 1:\n escudo, 2, 1, de metal; adaga, 1, 2, pequena\n\nExemplo 2: \nescudo, 2, 1, de metal\nadaga, 1, 2, pequena`, {reply_markup: blank, message_id: pocketType.update.callback_query.message.message_id}
  );
    
  }else{
    pocketToStore = "cubo";
    await ctx.reply(`Escreva o item que quer adicionar no cubo seguindo o modelo:\n\n <nome do item>, <peso>, <quantidade>, <descrição>\n\nPode adicionar mais de um item separando por ; ou enter.\n\nExemplo 1:\n escudo, 2, 1, de metal; adaga, 1, 2, pequena\n\nExemplo 2: \nescudo, 2, 1, de metal\nadaga, 1, 2, pequena`)
  }

  const { message } = await conversation.wait();

  if (!message || !message.from || !message.chat) {
    return;
  }

  const chatID = message.chat.id;
  const flagAdd = true;
  const confirmAdd = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  let parsedList = [];
  let inventoryAdd = [];
  var inventoryNow = authorCharacter.items.map((item) => item);

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
    
    
    await parsedList.push(parsedItem);
  }
  inventoryAdd = await addItemDefine(parsedList, inventoryNow, pocketToStore, ctx, conversation);
  

  if (inventoryAdd.modList.length === 0) {
    await ctx.reply(`Estes itens serão somados aos itens já existentes em ${pocketToStore}:\n\n${inventoryAdd.nonAdd.map((item) => ` - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg`).join("\n\n")}\n\nPeso total a ser adicionado: ${limitarCasasDecimais(inventoryAdd.nonAdd.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0),3)}Kg - Confirma?`, {
      reply_markup: confirmAdd,
    });
  } else if (inventoryAdd.nonAdd.length === 0) {
    await ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${inventoryAdd.modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${limitarCasasDecimais(inventoryAdd.modList.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0),3)}Kg - Confirma?`,
      { reply_markup: confirmAdd }
    );
  } else {
    await ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${inventoryAdd.modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nEstes itens serão somados aos itens já existentes em ${pocketToStore}:\n\n${inventoryAdd.nonAdd
        .map((item) => ` - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg`)
        .join("\n\n")}\n\nPeso total a ser adicionado: ${limitarCasasDecimais(
        inventoryAdd.modList.reduce((acc, item) => acc + item.weight * item.quantity, 0) + inventoryAdd.nonAdd.reduce((acc, item) => acc + item.weight * item.quantity, 0),
        3
      )}Kg - Confirma?`,
      { reply_markup: confirmAdd }
    );
  }

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      await inventoryAdd.modList.forEach((item) => {
        var test = authorCharacter.items.find((index) => index.name.toLowerCase() === item.name.toLowerCase());
        const itemPocket = authorCharacter.pockets.find(pocket => pocket.name === pocketToStore);
        
        if (!test) {
            item.pocket = pocketToStore;
            item.equipped = itemPocket.equipped;
          }
          authorCharacter.items.push(item);
          
        }
      );

      if (inventoryAdd.nonAdd.length !== 0) {
        await inventoryAdd.nonAdd.forEach((item) => {
          const index = authorCharacter.items.findIndex((i) =>{ 
            return i.name.toLowerCase() === item.name.toLowerCase() && i.pocket === pocketToStore;
            
          });
          authorCharacter.items[index].quantity += item.quantity;
        });
      }
      authorCharacter.lastModified = formatDateToCustomFormat(ctx.update.callback_query.message.date) + " }-> " + modifiedDesc;
      await saveItem("characters", CHARACTERS);
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


async function addItemDefine(inventoryList, inventoryNow, pocketToStore, ctx, conversation, tempCube) {
  var modList = [];
  var nonAdd = [];
  var remove = [];
  let commomPocket = [];
  let pocketToRemove;
  let itemPocket;
  let pocketRemoved = [];
  
  for (let itemToAdd of inventoryList) {
    const test = inventoryNow.find((index) => {
      return index.name.toLowerCase() === itemToAdd.name.toLowerCase() && index.pocket === pocketToStore;
    });
    if(test){
      
        let sameItemIndex = -1;
        for (let j = 0; j < nonAdd.length; j++) {
          if (nonAdd[j].name === itemToAdd.name) {
            sameItemIndex = j;
            break;
          }
        }
        
        if (sameItemIndex > -1){
          nonAdd[sameItemIndex].quantity += itemToAdd.quantity;
        }else{
          itemToAdd.desc = test.desc;
          itemToAdd.weight = test.weight;
          nonAdd.push({ ...itemToAdd});
        }
      } else{
        let sameItemIndex = -1;
        for (let j = 0; j < modList.length; j++) {
          if (modList[j].name === itemToAdd.name) {
            sameItemIndex = j;
            break;
          }
        }
        if (sameItemIndex > -1){
          modList[sameItemIndex].quantity += itemToAdd.quantity;
        }else{
          modList.push( { ...itemToAdd});
        }
      }
  }
  return { modList, nonAdd};
}

module.exports = {
  addItem,
};
