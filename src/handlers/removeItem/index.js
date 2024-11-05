const { InlineKeyboard } = require("grammy");
const { formatDateToCustomFormat, handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, P, splitItemQuant, getCommonPockets, splitPocketQuant, listSort} = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");

async function removeItem(conversation, ctx, cube) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  let ID = "";
  let tempCube = cube;
  let equipped;
  let modifiedDesc;
  if (cube === true) {
    ID = "cube";
    tempCube = cube;
    equipped = true;
    modifiedDesc = "Removeu item do cubo";
  } else {
    ID = ctx.update.callback_query.from.id;
    tempCube = false;
    modifiedDesc = "Removeu item do inventário";
  }
  
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagRemove = false;
  const confirmRemove = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  if(!tempCube){
    
  await ctx.reply("Escolha de que tipo de compartimento quer remover", {reply_markup: confirmPocket});
  
  var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

  equipped = res.match === "equipped" ? true : false;
  
  await ctx.editMessageText(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer remover separando-os por , ou enter.`, { reply_markup: blank,  message_id: res.update.callback_query.message.message_id});
  
  }else{
  
  
  await ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer remover separando-os por , ou enter.`, { reply_markup: blank });
  }

  const { message } = await conversation.wait();

  const inventoryList = extractInventoryItemsFromMessage(message.text, flagRemove);
  var inventoryNow = authorCharacter.items.map((item) => item);


  for (let itemToRemove of inventoryList) {
    var item = inventoryNow.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToRemove}\n\nQuer tentar de novo?`, { reply_markup: confirmRemove });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await removeItem(conversation, ctx, tempCube);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  const listItemRemove = await removeItemDefine(inventoryList, inventoryNow, ctx, conversation, tempCube, equipped);

  await ctx.reply(
    `Confira os itens que quer remover:\n\n${listItemRemove
      .map((item) => `"${item.pocket}":\n - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
      .join("\n\n")}\n\nPeso total a ser removido: ${listItemRemove.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
    { reply_markup: confirmRemove }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      for (const itemToRemove of listItemRemove) {
        const index = authorCharacter.items.findIndex((item) => {
          return item.name === itemToRemove.name && item.pocket === itemToRemove.pocket;
          
        });
        if (index !== -1) {
          if (authorCharacter.items[index].quantity !== 1) {
            if (itemToRemove.quantity === authorCharacter.items[index].quantity) {
              authorCharacter.items.splice(index, 1);
            } else {
              authorCharacter.items[index].quantity -= itemToRemove.quantity;
            }
          } else {
            authorCharacter.items.splice(index, 1);
          }
        }
      }
      authorCharacter.lastModified = formatDateToCustomFormat(ctx.update.callback_query.message.date) + " }-> " + modifiedDesc;
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens removidos do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });

  } else {
    await ctx.editMessageText("Ok, então não vou te dar nada.\n\nQuer tentar de novo?", { reply_markup: confirmRemove, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await removeItem(conversation, ctx, tempCube);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar pegar alguma coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}

async function removeItemDefine(inventoryList, inventoryNow, ctx, conversation, tempCube, equipped) {
  var listItemRemove = [];
  let commomPocket = [];
  let pocketToRemove;
  let itemPocket;
  let pocketRemoved = [];
  var modList = [];
  let testList;
  
  await inventoryList.sort(listSort);
  let inventoryTemp = [ ...inventoryList];
  
  for (let itemToRemove of inventoryList) {
    var item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase()) };
    if(!tempCube){
      
        commomPocket = await getCommonPockets(inventoryNow, item.name, equipped, pocketRemoved);
        
        if(commomPocket.length > 1){
          const buttonRow = await splitPocketQuant(commomPocket);
          
          await ctx.reply(`O item -> ${item.name} <- pertence a mais de um compartimento, de qual você está falando?\n\nO ${item.name} que está em: \n\n${commomPocket.map((commonItemName) => {
            const output = inventoryNow.map((index) => {
            if(index.pocket === commonItemName && index.name === item.name){
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
            return item.name === index.name && pocketToRemove === index.pocket;
          })};
          
        }else if(commomPocket.length === 1 ){
          
          pocketToRemove = commomPocket[0];
          
          itemPocket = { ...inventoryNow.find(index => {
            return item.name === index.name && pocketToRemove === index.pocket;
          })};
          
        }else{
          pocketToRemove = item.pocket;
          itemPocket ={...item};
        }}else{
      itemPocket ={ ...item};
      pocketToRemove = item.pocket;
      commomPocket.push(item);
    }

  if(commomPocket.length !== 0 ) {
        
    if (itemPocket.quantity !== 1) {
      const quant = await splitItemQuant(itemPocket);
      await ctx.reply(`Quantas unidades de ${itemPocket.name} do compartimento ${itemPocket.pocket} deseja remover?`, { reply_markup: quant.InlineNumbers });

      var res = await conversation.waitForCallbackQuery(quant.itemString);

      itemPocket.quantity = parseInt(res.match);

      await ctx.api.deleteMessage(res.update.callback_query.message.chat.id, res.update.callback_query.message.message_id);
    }

    if(!tempCube){
        let sameItemIndex = -1;
        for (let j = 0; j < modList.length; j++) {
          if (modList[j].name === itemPocket.name) {
            sameItemIndex = j;
            break;
          }
        }
        if (sameItemIndex > -1){
          modList[sameItemIndex].quantity += itemPocket.quantity;
        }else{
          modList.push( { ...itemPocket});
        }
    itemPocket.pocket = pocketToRemove;
    
    pocketRemoved.push(pocketToRemove);
    
    await inventoryTemp.shift();
    listItemRemove.push(itemPocket);
    }else{
      itemPocket.pocket = pocketToRemove;
      pocketRemoved.push(pocketToRemove);
      listItemRemove.push(itemPocket);
    }
    
  }


}
  return listItemRemove;
}

module.exports = {
  removeItem,
};
