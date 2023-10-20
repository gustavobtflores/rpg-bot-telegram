const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem, deleteItem } = require("../../config/storage");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, P, extractItemsFromPockets} = require('../../handlers');
const { getFormattedCharacters } = require("../../utils");


const ITEM_REGEX = /^\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+\s*,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;

async function addPockets(conversation, ctx) {
  
  let enter = "\n\n\n\n\n\n\n\n";
  let ID = ctx.update.callback_query.from.id;
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }

  await ctx.reply(
    `Você escolheu adicionar um compartimento! \n\nDigite o nome desse compartimento e se vai estar equipado ou não. Modelo:\n\n <nome do compartimento>, <equipado>\n\nPode adicionar mais de um compartimento separando por ; ou enter.\n\nExemplo1:\n mochila, equipado; baú, desequipado\n\nExemplo2: \nguarda roupa, desequipado\nbolso da calça, equipado`
  );

  const { message } = await conversation.wait();

  if (!message || !message.from || !message.chat) {
    return;
  }

  const chatID = message.chat.id;
  const flagPockets = true;
  var modPocketsList = [];
  var nonAddPockets = [];
  const confirmPockets = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const pseudoConfirmPockets = new InlineKeyboard().text("Sim", "yah").text("Não", "nah");

  const pocketsList = await extractInventoryItemsFromMessage(message.text, flagPockets);
  
  for (let pocketInInventory of pocketsList) {
    if (!isValidItem(pocketInInventory, ITEM_REGEX)) {
      await ctx.reply(`Houve um problema ao identificar um dos compartimentos, erro foi nesse compartimento aqui: \n\n${pocketInInventory}\n\nQuer tentar de novo?`, { reply_markup: confirmPockets });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await addPockets(conversation, ctx );
      } else {
        return ctx.editMessageText("Ok, então não vou adicionar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
    const parsedItem = await parseItemFromInventoryString(pocketInInventory, flagPockets);

    var test = authorCharacter.pockets.find((index) => String(index.name).toLowerCase() === parsedItem.name.toLowerCase());
    if (!test) {
      modPocketsList.push(parsedItem);
    } else {
      nonAddPockets.push(parsedItem);
    }
  }

  if (modPocketsList.length === 0) {
    ctx.reply(`Estes compartimentos não serão adicionados à lista existente pois já existe algum com o mesmo nome:\n\n${nonAddPockets.map((item) => ` - ${item.name}`).join("\n\n")}\n\nQuer tentar de novo?`, {
      reply_markup: pseudoConfirmPockets,
    });
  } else if (nonAddPockets.length === 0) {
    ctx.reply(
      `Estes compartimentos serão adicionados:\n\n${modPocketsList
        .map((item) => `- ${item.name}: ${item.equipped === true ? "Equipado": "Desequipado"}`)
        .join("\n\n")}\n\n Confirma?`,
      { reply_markup: confirmPockets }
    );
  } else {
    ctx.reply(
      `Estes compartimentos serão adicionados:\n\n${modPocketsList
        .map((item) => `- ${item.name}: ${item.equipped === true ? "Equipado" : "Desequipado"}`)
        .join("\n\n")}\n\nEstes compartimentos não serão adicionados à lista existente pois já existe algum com o mesmo nome:\n\n${nonAddPockets
        .map((item) => ` - ${item.name}`)
        .join("\n\n")}\n\nConfirma?`,
      { reply_markup: confirmPockets }
    );
  }

  var res = await conversation.waitForCallbackQuery(["yes", "no","yah", "nah"]);
  if(res.match === "yah"){
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await addPockets(conversation, ctx );
  }else if(res.match === "nah"){
      return ctx.editMessageText("Ok, então não vou adicionar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
  }else if (res.match === "yes") {
    await conversation.external(async () => {
      await modPocketsList.forEach((item) => {
        var test = authorCharacter.pockets.find((index) => String(index.name).toLowerCase() === item.name.toLowerCase());
        if (!test) {
          authorCharacter.pockets.push(item);
        }
      });
      saveItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Compartimentos adicionados ao inventário do ${authorCharacter.name}.\n\nQuer adicionar mais compartimentos?`, {
      reply_markup: confirmPockets,
      message_id: res.update.callback_query.message.message_id,
    });

    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await addPockets(conversation, ctx );
    } else {
      ctx.editMessageText("Ok, obrigado pelos compartimentos!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  } else {
    await ctx.editMessageText("Ok, então não vou adicionar nada.\n\nQuer tentar de novo?", { reply_markup: confirmPockets, message_id: res.update.callback_query.message.message_id });
    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      await addPockets(conversation, ctx );
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar organizar algumas coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
  return;
}



async function removePockets(conversation, ctx) {

  let enter = "\n\n\n\n\n\n\n\n";

  let ID = ctx.update.callback_query.from.id;


  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  const removeItems = new InlineKeyboard().text("Remover itens do compartimento", "Delete").row().text("Não remover itens do compartimento", "Keep")
   
  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  await ctx.reply("Escolha que tipo de compartimentos quer remover", {reply_markup: confirmPocket});
  
  var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

  let equipped = res.match === "equipped" ? true : false;

  
  await ctx.editMessageText(`Você escolheu remover um compartimento! \n\nAntes de escolher qual compartimento remover, você deseja remover todos os itens que estão nele ou apenas o compartimento em si?`, { reply_markup: removeItems, message_id: res.update.callback_query.message.message_id} );
  
  var deleteItems = await conversation.waitForCallbackQuery(["Keep", "Delete"]);
  

  await ctx.editMessageText(
    `Você escolheu remover um compartimento! \n${await getFormattedCharacters(ID, equipped, deleteItems.match !== "Delete" ? "pockets" : "",deleteItems.match !== "Delete" ? false : true)}\n\nDigite os nomes dos compartimentos dentre a lista, podendo escolher mais de um separando por , ou enter.`,{reply_markup: blank, message_id: deleteItems.update.callback_query.message.message_id}
  );

  const { message } = await conversation.wait();

  if (!message || !message.from || !message.chat) {
    return;
  }

  const chatID = message.chat.id;
  const flagPockets = false;
  var modPocketsList = [];
  var nonAddPockets = [];
  const confirmPockets = new InlineKeyboard().text("Sim", "yes").text("Não", "no");

  const pocketsList = await extractInventoryItemsFromMessage(message.text, flagPockets);
  var pocketsNow = authorCharacter.pockets.map((item) => item);
  
  console.log(pocketsList);
  
  for (let pocketToRemove of pocketsList) {
    var item = pocketsNow.find((item) => item.name.toLowerCase() === pocketToRemove.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este compartimento nas suas coisas: \n\n${pocketToRemove}\n\nQuer tentar de novo?`, { reply_markup: confirmPockets });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await removePockets(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
    modPocketsList.push(item);
  }
  const itemsByPocket = extractItemsFromPockets(equipped === true ? authorCharacter.items.filter(item => item.equipped) :  authorCharacter.items.filter(item => !item.equipped));
  console.log(itemsByPocket);
  
  if(deleteItems.match === "Delete"){
  
    await ctx.reply(
      `Confira os compartimentos que quer remover:\n\n${modPocketsList
        .map((item) =>{
        const itemList = itemsByPocket[item.name]
            .map((item) => ` - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${Number((item.weight * item.quantity).toFixed(3))}Kg\nDescrição: ${item.desc}`)
            .join("\n\n");
        
        return `-> ${item.name} - ${item.equipped === true ? "Equipado": "Desquipado"}\n\n${itemList} `})
        .join("\n\n")}\n\nApós a remoção, os itens que pertencerem aos compartimentos removidos serão removidos totalmente.\n\nConfirma?`,
      { reply_markup: confirmPockets }
    );
    
  }else{
    await ctx.reply(`Confira os compartimentos que quer remover:\n\n${modPocketsList
        .map((item) => ` -> ${item.name} - ${item.equipped === true ? "Equipado": "Desquipado"} `)}\n\nApós a remoção, os itens que pertencerem aos compartimentos removidos serão colocados em ${equipped === true ? "Corpo": "Chão"}.\n\nConfirma?`,
      { reply_markup: confirmPockets }
    );
  }
  console.log(modPocketsList);
  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  
  if (res.match === "yes") {
    await conversation.external(async () => {
      await modPocketsList.forEach((pocket) => {
        const index = authorCharacter.pockets.findIndex((item) => item.name.toLowerCase() === pocket.name.toLowerCase());

          if(deleteItems.match === "Delete"){
            for(let i = authorCharacter.items.length - 1; i >= 0; i-- ){
            if (authorCharacter.items[i].pocket === pocket.name){
            authorCharacter.items.splice(i, 1);
          }}
          
        }else{
          authorCharacter.items.forEach((item) => {
            
            if (item.pocket.toLowerCase() === pocket.name.toLowerCase()){
            item.pocket = pocket.equipped === true ? "Corpo": "Chão";
          }});
        }
          
          if (index !== -1 && pocket.name !== "Chão" && pocket.name !== "Corpo") {
            
            authorCharacter.pockets.splice(index, 1);
            
          }
          
        });
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Compartimentos removidos do inventário do ${authorCharacter.name}.`, {
      reply_markup: blank,
      message_id: res.update.callback_query.message.message_id,
    });
  } else {
    await ctx.editMessageText("Ok, então não vou remover nada.\n\nQuer tentar de novo?", { reply_markup: confirmPockets, message_id: res.update.callback_query.message.message_id });
    res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      await ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      await removePockets(conversation, ctx );
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar organizar algumas coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
  return;
}

async function modifyPockets(conversation, ctx) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  let ID = ctx.update.callback_query.from.id;
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagModify = true;
  const flagChoose = false;
  const confirmPockets = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ID);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
   

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  await ctx.reply("Escolha que tipo de compartimentos quer modificar", {reply_markup: confirmPocket});
  
  var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

  let equipped = res.match === "equipped" ? true : false;

  
  await ctx.editMessageText(`Estes são seus compartimentos no momento:\n${await getFormattedCharacters(authorId, equipped, "pockets")}\n\nEscolha quais compartimentos quer modificar separando-os por , ou enter.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });

  const { message } = await conversation.wait();

  var pocketsList = extractInventoryItemsFromMessage(message.text, flagChoose);
  var pocketsNow = authorCharacter.pockets.map((item) => item);

  for (let pocketToModify of pocketsList) {
    var item = pocketsNow.find((item) => item.name.toLowerCase() === pocketToModify.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este compartimento nas suas coisas: \n\n${pocketToModify}\n\nQuer tentar de novo?`, { reply_markup: confirmPockets });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await modifyPockets(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, qualquer coisa estou por aqui haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  
  let pocketsItemModify = [];

  for (let pocketsToModify of pocketsList) {
    let item = { ...pocketsNow.find((item) => item.name.toLowerCase() === pocketsToModify.toLowerCase()) };

    ctx.reply(`Você irá modificar o compartimento:\n\n -> ${item.name} - ${item.equipped === true ? "Equipado": "Desequipado"}\n\nEscreva as alterações que deseja fazer seguindo o modelo:\n\n <nome do compartimento>, <equipado ou desequipado>\n\nExemplo1:\n mochila, equipado`);

    let { message: modified } = await conversation.wait();
    
    let modifiedList = await extractInventoryItemsFromMessage(modified.text, flagModify);
    
    for (let pocketsModified of modifiedList) {
      
      if (!isValidItem(pocketsModified, ITEM_REGEX)) {
      await ctx.reply(`Houve um problema ao identificar um dos compartimentos, erro foi nesse compartimento aqui: \n\n${pocketsModified}\n\nQuer tentar de novo?`, { reply_markup: confirmPockets });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await modifyPockets(conversation, ctx );
      } else {
        return ctx.editMessageText("Ok, então não vou adicionar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
    var parsedItem = await parseItemFromInventoryString(pocketsModified, flagModify);
  }
    pocketsItemModify.push(parsedItem);
  }
  

  await ctx.reply(
    `Confira os itens que quer modificar:\nAntes:\n\n${pocketsList.map((itemMod, i) => {
        const index = authorCharacter.pockets.findIndex((item) => item.name.toLowerCase() === itemMod.toLowerCase());
        return ` -> ${authorCharacter.pockets[index].name} - ${authorCharacter.pockets[index].equipped === true ? "Equipado" : "Desequipado"}`}
        ).join("\n\n")
      }
    
    \nDepois:\n\n${pocketsItemModify
      .map((item) => ` -> ${item.name} - ${item.equipped === true ? "Equipado" : "Desequipado"}`)
      .join("\n\n")}\n\nConfirma?`,
    { reply_markup: confirmPockets }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      var i = 0;
      for (let pocketsToModify of pocketsItemModify) {
        
          for (const item of authorCharacter.items){
            if (item.pocket.toLowerCase() === pocketsList[i].toLowerCase()){
              item.pocket = pocketsToModify.name;
              item.equipped = pocketsToModify.equipped;
            }
        }
        
        const index = authorCharacter.pockets.findIndex((item) => item.name.toLowerCase() === pocketsList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.pockets[index].name = pocketsToModify.name;
            authorCharacter.pockets[index].equipped = pocketsToModify.equipped;
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Compartimentos modificados do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });

  } else {
    await ctx.editMessageText("Ok, então não vou modificar nada.\n\nQuer tentar de novo?", { reply_markup: confirmPockets, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await modifyPockets(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar alterar alguma coisa haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}


module.exports = {
  addPockets,
  removePockets,
  modifyPockets
};
