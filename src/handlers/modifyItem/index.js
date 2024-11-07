const { InlineKeyboard } = require("grammy");
const { formatDateToCustomFormat, handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, P, getCommonPockets, splitPocketQuant, getUniqueName } = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");


const ITEM_REGEX = /^\s*.+\s*,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*.+$/;

const confirmModify = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
const blank = new InlineKeyboard();

async function modifyItem(conversation, ctx, cube) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  let ID = "";
  let tempCube = cube;
  let equipped;
  let modifiedDesc;
  if (cube === true) {
    ID = "cube";
    tempCube = cube;
    equipped = true;
    modifiedDesc = "Modificou item no cubo";
  } else {
    ID = ctx.update.callback_query.from.id;
    tempCube = false;
    modifiedDesc = "Modificou item no inventário";
  }

  const CHARACTERS = await catchItem("characters");
  const flagModify = true;
  const flagChoose = false;
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  if(!tempCube){
    
  await ctx.reply("Escolha que tipo de itens quer modificar", {reply_markup: confirmPocket});
  
  var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

  equipped = res.match === "equipped" ? true : false;
  
  await ctx.editMessageText(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer modificar separando-os por , ou enter.`, { reply_markup: blank,  message_id: res.update.callback_query.message.message_id});
  
  }else{
  
  
  await ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer modificar separando-os por , ou enter.`, { reply_markup: blank });
  }

  const { message } = await conversation.wait();

  var inventoryList = extractInventoryItemsFromMessage(message.text, flagChoose);
  var inventoryNow = authorCharacter.items.map((item) => item);

  for (let itemToModify of inventoryList) {
    var item = inventoryNow.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToModify}\n\nQuer tentar de novo?`, { reply_markup: confirmModify });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await modifyItem(conversation, ctx, tempCube);
      } else {
        return ctx.editMessageText("Ok, qualquer coisa estou por aqui haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  let listItemModify = await modifyItemDefine(inventoryList, inventoryNow, ctx, conversation, tempCube, equipped);
  
try{
  await ctx.reply(
    `Confira os itens que quer modificar:\nAntes:\n\n${listItemModify.listItemModify.map((itemMod, i) => {
        const index = authorCharacter.items.findIndex((item) => {
          return item.name.toLowerCase() === itemMod.nameAntes.toLowerCase() && item.pocket === itemMod.pocket;
        });
        return `"${authorCharacter.items[index].pocket}":\n - ${authorCharacter.items[index].name}: ${authorCharacter.items[index].weight}Kg - ${authorCharacter.items[index].quantity}Un => ${limitarCasasDecimais(authorCharacter.items[index].weight * authorCharacter.items[index].quantity, 3)}Kg\nDescrição: ${authorCharacter.items[index].desc}`}
        ).join("\n\n")
      }
    
    \nDepois:${listItemModify.modList.length !== 0 ? `\n\n${listItemModify.modList.map((item) => `"${item.pocket}":\n - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`).join("\n\n")}`: ""}${listItemModify.nonAdd.length !== 0 ? `\n\n Estes itens serão somados ao item já existente:\n\n${listItemModify.nonAdd.map((item) => `"${item.pocket}":\n - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg`)
      .join("\n\n")}` : ""}\n\nConfirma?`,
    { reply_markup: confirmModify }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
}catch(err){}

  if (res.match === "yes") {
    await conversation.external(async () => {
      var i = 0;
      for (let itemToModify of listItemModify.modList) {
        const index = authorCharacter.items.findIndex((item) => {
          return item.name.toLowerCase() === itemToModify.nameAntes.toLowerCase() && item.pocket === itemToModify.pocket;
          
        });
        if (index !== -1) {
            authorCharacter.items[index].name = itemToModify.name;
            authorCharacter.items[index].quantity = itemToModify.quantity;
            authorCharacter.items[index].weight = itemToModify.weight;
            authorCharacter.items[index].desc = itemToModify.desc;
         
        }
        i++;
      }
      
      for (let itemToModify of listItemModify.nonAdd) {
        const index1 = authorCharacter.items.findIndex((item) => {
          return item.name.toLowerCase() === itemToModify.name.toLowerCase() && item.pocket === itemToModify.pocket;
          
        });
        if (index1 !== -1) {
            authorCharacter.items[index1].quantity += itemToModify.quantity;
         
        }
        const index2 = authorCharacter.items.findIndex(item =>{
          return item.name.toLowerCase() === itemToModify.nameAntes.toLowerCase() && item.pocket === itemToModify.pocket;
        })
        if (index2 !== -1){
            authorCharacter.items.splice(index2, 1);
        }
        i++;
      }
      
      authorCharacter.lastModified = formatDateToCustomFormat(ctx.update.callback_query.message.date) + " }-> " + modifiedDesc;
      
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens modificados do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
  } else {
    await ctx.editMessageText("Ok, então não vou modificar nada.\n\nQuer tentar de novo?", { reply_markup: confirmModify, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await modifyItem(conversation, ctx, tempCube);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar alterar alguma coisa haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


async function modifyItemDefine(inventoryList, inventoryNow, ctx, conversation, tempCube, equipped) {
  var listItemModify = [];
  var nonAdd = [];
  let modList = [];
  let commomPocket = [];
  let pocketToRemove;
  let itemPocket;
  let pocketRemoved = [];
  let parsedItem;
  const flagModify = true;
  const chatID = ctx.update.callback_query.message.chat.id;
  let nameCountMap = {};
  
  
  for (let itemToRemove of inventoryList) {
    var item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase()) };
    if(!tempCube){  
    commomPocket = await getCommonPockets(inventoryNow, item.name, equipped, pocketRemoved);
    
    if(commomPocket.length > 1){
      const buttonRow = await splitPocketQuant(commomPocket);
      
      await ctx.reply(`O item -> ${item.name} <- pertence a mais de um compartimento, de qual você está falando?\n\nO item ${item.name} que está em: \n\n${commomPocket.map((commonItemName) => {  
        const output = inventoryNow.map((index) => {
        if(index.pocket === commonItemName && index.name.toLowerCase() === item.name.toLowerCase()){
          return  `"${index.pocket}":\n\n - ${index.name}: ${index.weight}Kg - ${index.quantity}Un => ${Number((index.weight * index.quantity).toFixed(3))}Kg\nDescrição: ${index.desc}`;
        }
        return '';
        });
        
        return output;
      }).join("\n\n").replace(/,/g, '')}`,{ reply_markup: buttonRow.InlineNumbers});
      
      var res = await conversation.waitForCallbackQuery(buttonRow.itemString);
      
      await ctx.api.deleteMessage(res.update.callback_query.message.chat.id, res.update.callback_query.message.message_id);
    
      pocketToRemove = res.match;
      
      itemPocket = { ...inventoryNow.find(index => {
        return item.name.toLowerCase() === index.name.toLowerCase() && pocketToRemove === index.pocket;
      })};
      
    }else if(commomPocket.length === 1 ){
      
      pocketToRemove = commomPocket[0];
      
      itemPocket = { ...inventoryNow.find(index => {
        return item.name.toLowerCase() === index.name.toLowerCase() && pocketToRemove === index.pocket;
      })};
      
    }else{
      pocketToRemove = item.pocket;
      itemPocket ={ ...item};
    }
      
    }else{
      itemPocket ={ ...item};
      pocketToRemove = item.pocket;
      commomPocket.push(item);
    }
    if(commomPocket.length !== 0 ) {
  /////////////////////////////////////////////////////////////////////////////
  await ctx.reply(`Você irá modificar o item que está em ${pocketToRemove}:\n\n -> ${itemPocket.name}: ${itemPocket.weight}Kg - ${itemPocket.quantity}Un => ${limitarCasasDecimais(itemPocket.weight * itemPocket.quantity, 3)}Kg\nDescrição: ${itemPocket.desc}
  \n\nCopie a mensagem seguinte e escreva as alterações que deseja fazer seguindo o modelo:\n\n <nome do item>, <peso>, <quantidade>, <descrição>\n\nExemplo:\n escudo, 2, 1, de metal`);
  await ctx.reply(`${itemPocket.name}, ${itemPocket.weight}, ${itemPocket.quantity}, ${itemPocket.desc}`)

  let { message: modified } = await conversation.wait();
  
  let modifiedList = await extractInventoryItemsFromMessage(modified.text, flagModify);
  
  if (!isValidItem(modifiedList[0], ITEM_REGEX)) {
    await ctx.reply(`Houve um problema ao identificar o item: \n\n${modifiedList[0]}\n\nQuer tentar de novo?`, { reply_markup: confirmModify });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      await modifyItem(conversation, ctx, tempCube);
    } else {
      return ctx.editMessageText("Ok, então não vou modificar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
    return;
  }
  parsedItem = await parseItemFromInventoryString(modifiedList[0]);
  parsedItem.equipped = itemPocket.equipped;
  parsedItem.pocket = itemPocket.pocket;
  parsedItem.nameAntes = itemPocket.name;
  parsedItem.descAntes = itemPocket.desc;
  
    const baseName = parsedItem.name;
    
    // Inicializa o contador se o nome base ainda não estiver no mapa
    if (!nameCountMap[baseName]) {
      nameCountMap[baseName] = 2; // Começa a contagem a partir de 2
    }

    const test = inventoryNow.find((index) => {
      return index.name.toLowerCase() === baseName.toLowerCase() && index.pocket === pocketToRemove;
    });

    if (test && parsedItem.name.toLowerCase() !== parsedItem.nameAntes.toLowerCase()) {
      // Se o item já existe, gera um nome único
      parsedItem.name = getUniqueName(baseName, inventoryNow.filter(item => item.pocket === pocketToRemove), modList, nameCountMap);
    }

    modList.push({ ...parsedItem });

    pocketRemoved.push(pocketToRemove);
    listItemModify.push({ ...parsedItem});
    
  }
    
  }
  console.log(modList);
  return { modList, nonAdd, listItemModify} ;
}





module.exports = {
  modifyItem,
};
