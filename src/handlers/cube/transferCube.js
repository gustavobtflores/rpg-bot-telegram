const { InlineKeyboard } = require("grammy");
const { deleteItem, saveItem, catchItem } = require("../../config/storage");
const { formatDateToCustomFormat, handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, splitItemQuant, splitPocketQuant, getCommonPockets, listSort, listCompare } = require("..");
const { getFormattedCharacters } = require("../../utils");

async function transferCube(conversation, ctx, fun) {
  let modifiedDesc = fun === "invCube" ? "Transferiu item pro cubo" : "Pegou item do cubo";
  const modifiedDate = ctx.update.callback_query.message.date;
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagModify = true;
  const flagChoose = false;
  const confirmModify = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  const cubeID = "cube";
  const authorId = String(ctx.update.callback_query.from.id);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  let cubeCharacter = CHARACTERS.find((character) => character.id === cubeID);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  let equippedPocket;
  let pocketToStore;
  let equipped;

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  if(fun !== "invCube"){ // entra aqui quando for do CUBO para o INVENTARIO ;;;;;;; cubo => inventario
    await ctx.reply(`Você quer ENVIAR os itens do cubo para que tipo de compartimento do inventário?`, {reply_markup: confirmPocket});
    
    var pocketType = await conversation.waitForCallbackQuery(["equipped","unequipped"]);
    equippedPocket = pocketType.match === "equipped" ? true : false ;
    var pocket = [ ...pocketsNow.map((item) => item.equipped === equippedPocket ? item.name : "") ];
      
    const quant = await splitPocketQuant(pocket);
      
    await ctx.editMessageText(`Escolha para qual compartimento quer ENVIAR os itens: \n\n${await getFormattedCharacters(authorId, equippedPocket, "pockets", true)}`, {  reply_markup: quant.InlineNumbers , message_id: pocketType.update.callback_query.message.message_id });
      
    var res = await conversation.waitForCallbackQuery(quant.itemString);
    pocketToStore = res.match;
    pocketToRemove = "cubo";
    equipped = true;

  }else{ // entra aqui quando for do INVENTARIO para o CUBO  ;;;;;;;;;; inventario => cubo

    await ctx.reply(`Escolha que tipo de itens quer RETIRAR do inventário para o cubo.`, {reply_markup: confirmPocket});
    
    var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

    equipped = res.match === "equipped" ? true : false;
    pocketToStore = "cubo";
  }
  await ctx.editMessageText(`Estes são seus itens no momento:\n${await getFormattedCharacters(fun === "invCube" ? authorId : cubeID, equipped)}\nEscolha quais itens quer transferir para ${pocketToStore} separando-os por , ou enter.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id});

  const { message } = await conversation.wait();

  let chatID = message.chat.id;

  var inventoryList = extractInventoryItemsFromMessage(message.text, flagChoose);
  var inventoryNow = authorCharacter.items.map((item) => item);
  var inventoryCube = cubeCharacter.items.map((item) => item);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  

  for (let itemToModify of inventoryList) {
    var item = fun === "invCube" ? inventoryNow.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase()) : inventoryCube.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToModify}\n\nQuer tentar de novo?`, { reply_markup: confirmModify });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await transferCube(conversation, ctx, fun);
      } else {
        return ctx.editMessageText("Ok, qualquer coisa estou por aqui haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  const listItemRemove = await transferItemDefine(inventoryList, fun === "invCube" ? inventoryNow : inventoryCube, fun !== "invCube" ? inventoryNow : inventoryCube, pocketToStore,equipped,  ctx, conversation, fun);
  
  if (listItemRemove.modList.length === 0) {
    await ctx.reply(`Estes itens serão somados aos itens já existentes em ${pocketToStore}:\n\n${listItemRemove.nonAdd.map((item) => ` - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg`).join("\n\n")}\n\nPeso total a ser transferido: ${limitarCasasDecimais(listItemRemove.nonAdd.reduce((acc, item) => acc + item.weight * item.quantity, 0), 3)}Kg - Confirma?`, {
      reply_markup: confirmModify,
    });
  } else if (listItemRemove.nonAdd.length === 0) {
    await ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${listItemRemove.modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nPeso total a ser transferido: ${limitarCasasDecimais(listItemRemove.modList.reduce((acc, item) => acc + limitarCasasDecimais(item.weight * item.quantity, 3), 0),3)}Kg - Confirma?`,
      { reply_markup: confirmModify }
    );
  } else {
    await ctx.reply(
      `Estes itens serão adicionados em ${pocketToStore}:\n\n${listItemRemove.modList
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
        .join("\n\n")}\n\nEstes itens serão somados aos itens já existentes em ${pocketToStore}:\n\n${listItemRemove.nonAdd
        .map((item) => ` - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg`)
        .join("\n\n")}\n\nPeso total a ser transferido: ${limitarCasasDecimais(
        listItemRemove.modList.reduce((acc, item) => acc + item.weight * item.quantity, 0) + listItemRemove.nonAdd.reduce((acc, item) => acc + item.weight * item.quantity, 0),
        3
      )}Kg - Confirma?`,
      { reply_markup: confirmModify }
    );
  }

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {

      let inventoryRemove = fun === "invCube" ? authorCharacter : cubeCharacter;
      let inventoryAdd = fun !== "invCube" ? authorCharacter : cubeCharacter;

      for (const itemToRemove of listItemRemove.remove) {

        const index = inventoryRemove.items.findIndex((item) => {
          return item.name === itemToRemove.name && item.pocket === itemToRemove.pocket;
          });
          
        if (index !== -1) {
          if (inventoryRemove.items[index].quantity !== 1) {
            if (itemToRemove.quantity === inventoryRemove.items[index].quantity) {
              inventoryRemove.items.splice(index, 1);
            } else {
              inventoryRemove.items[index].quantity -= itemToRemove.quantity;
            }
          } else {
            inventoryRemove.items.splice(index, 1);
          }
        }
      }
      
      await deleteItem("characters", CHARACTERS);
      
      
      await listItemRemove.modList.forEach((item) => {
        const itemPocket = inventoryAdd.pockets.find(pocket => pocket.name === pocketToStore);
        
          item.pocket = pocketToStore;
          item.equipped = itemPocket.equipped;
          inventoryAdd.items.push(item);
          
        }
      );
      
      if (listItemRemove.nonAdd.length !== 0) {
        await listItemRemove.nonAdd.forEach((item) => {
          let index = -1;

          for (let j = 0; j < inventoryAdd.items.length; j++) {
            if (inventoryAdd.items[j].name === item.name && inventoryAdd.items[j].pocket === pocketToStore) {
              index = j;
              break;
            }
          }
          inventoryAdd.items[index].quantity += item.quantity;
        });
      }
      inventoryAdd.lastModified = formatDateToCustomFormat(modifiedDate) + " }-> " + modifiedDesc;
      
      await saveItem("characters", CHARACTERS);
      
    });

    await ctx.editMessageText(`Itens de ${authorCharacter.name} transferidos para ${pocketToStore}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
  } else {
    await ctx.editMessageText("Ok, então não vou transferir nada.\n\nQuer tentar de novo?", { reply_markup: confirmModify, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await transferCube(conversation, ctx, fun);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar alterar alguma coisa haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


async function transferItemDefine(inventoryList, inventoryNow, inventoryLater, pocketToStore,equipped,  ctx, conversation, fun) {
  var modList = [];
  var nonAdd = [];
  var remove = [];
  let commomPocket = [];
  let pocketToRemove;
  let itemPocket;
  let pocketRemoved = [];
  let testList;

  await inventoryList.sort(listSort);
  let inventoryTemp = [ ...inventoryList];
  
  for (let itemToRemove of inventoryList) {
    var item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase()) };

    commomPocket = await getCommonPockets(inventoryNow, item.name, equipped);
    const indexCommomPocket = commomPocket.indexOf(pocketToStore);
    if (indexCommomPocket > -1){
      commomPocket.splice(indexCommomPocket, 1);
    }
    for(let pocket of pocketRemoved){
      let indexPocketRemoved = commomPocket.indexOf(pocket);
      if (indexPocketRemoved > -1){
        commomPocket.splice(indexPocketRemoved, 1);
      }
    }
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
    }

    if(commomPocket.length !== 0 ) {
        
    if (itemPocket.quantity !== 1) {
      const quant = await splitItemQuant(itemPocket);
      await ctx.reply(`Quantas unidades de ${itemPocket.name} do compartimento ${itemPocket.pocket} deseja transferir?`, { reply_markup: quant.InlineNumbers });

      var res = await conversation.waitForCallbackQuery(quant.itemString);

      itemPocket.quantity = parseInt(res.match);

      await ctx.api.deleteMessage(res.update.callback_query.message.chat.id, res.update.callback_query.message.message_id);
    }
    const test = inventoryLater.find((index) => {
      return index.name === itemPocket.name && index.pocket === pocketToStore;
    });

    if(test){
      
        let sameItemIndex = -1;
        for (let j = 0; j < nonAdd.length; j++) {
          if (nonAdd[j].name === itemPocket.name) {
            sameItemIndex = j;
            break;
          }
        }
        
        if (sameItemIndex > -1){
          nonAdd[sameItemIndex].quantity += itemPocket.quantity;
        }else{
          itemPocket.weight = test.weight;
          itemPocket.desc = test.desc;
          nonAdd.push({ ...itemPocket});
        }
      } else{
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
      }
    itemPocket.pocket = pocketToRemove;
    testList = await listCompare(inventoryTemp);
    
    if(testList){
      pocketRemoved.push(testList);
    }
    await inventoryTemp.shift();
    remove.push(itemPocket);
    
  }}
  return { modList, nonAdd, remove};
}

module.exports = {
  transferCube
};