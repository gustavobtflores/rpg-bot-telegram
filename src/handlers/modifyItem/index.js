const { InlineKeyboard } = require("grammy");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString } = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");


const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;


async function modifyItem(conversation, ctx, cube) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
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
  const flagModify = true;
  const flagChoose = false;
  const confirmModify = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, true, "allItems")}\nEscolha quais itens quer modificar separando-os por , ou enter.`, { reply_markup: blank });

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
  
  let listItemModify = [];

  for (let itemToModify of inventoryList) {
    let item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToModify.toLowerCase()) };

    ctx.reply(`Você irá modificar o item:\n\n ${item.name}: ${item.quantity}Un - ${item.weight}Kg => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}
    \n\nEscreva as alterações que deseja fazer seguindo o modelo:\n\n <nome do item>, <peso>, <quantidade>, <descrição>\n\nExemplo1:\n escudo, 2, 1, de metal`);

    let { message: modified } = await conversation.wait();
    
    let modifiedList = await extractInventoryItemsFromMessage(modified.text, flagModify);
    
    for (let itemModified of modifiedList) {
      
      if (!isValidItem(itemModified, ITEM_REGEX)) {
        await ctx.reply(`Houve um problema ao identificar um dos itens, erro foi nesse item aqui: \n\n${itemModified}\n\nQuer tentar de novo?`, { reply_markup: confirmModify });
  
        var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
        if (res.match === "yes") {
          ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
          await modifyItem(conversation, ctx, tempCube);
        } else {
          return ctx.editMessageText("Ok, então não vou modificar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
        }
        return;
    }
    var parsedItem = await parseItemFromInventoryString(itemModified);
  }
    listItemModify.push(parsedItem);
  }
  

  await ctx.reply(
    `Confira os itens que quer modificar:\n
    
    Antes:\n\n${inventoryList.map((itemMod, i) => {
        const index = authorCharacter.items.findIndex((item) => item.name.toLowerCase() === itemMod.toLowerCase());
        return `- ${authorCharacter.items[index].name}: ${authorCharacter.items[index].weight}Kg -  ${authorCharacter.items[index].quantity}Un  => ${limitarCasasDecimais(authorCharacter.items[index].weight * authorCharacter.items[index].quantity, 3)}Kg\nDescrição: ${authorCharacter.items[index].desc}`}
        ).join("\n\n")
      }
    
    \nDepois:\n\n${listItemModify
      .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
      .join("\n\n")}\n\nConfirma?`,
    { reply_markup: confirmModify }
  );
  
  console.log(enter, inventoryList, enter, authorCharacter.items, enter);


  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      var i = 0;
      for (let itemToModify of listItemModify) {
        const index = authorCharacter.items.findIndex((item) => item.name.toLowerCase() === inventoryList[i].toLowerCase());
        if (index !== -1) {
            authorCharacter.items[index].name = itemToModify.name;
            authorCharacter.items[index].quantity = itemToModify.quantity;
            authorCharacter.items[index].weight = itemToModify.weight;
            authorCharacter.items[index].desc = itemToModify.desc;
         
        }
        i++;
      }
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens modificados do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });

    //   var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    // console.log(enter, "chegou aqui");

    //   if (res.match === "yes"){

    //     ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

    //     await modifyItem(conversation, ctx, tempCube);

    //   }else{

    //   await conversation.external(async () =>{
    //     for(const itemToModify of listItemModify){

    //     const index = authorCharacter.items.findIndex((item) => item.name === itemToModify.name);
    //     if(index !== -1){
    //       if(authorCharacter.items[index].quantity !==1 ){
    //         if(itemToModify.quantity === authorCharacter.items[index].quantity){
    //           authorCharacter.items.splice(index,1);
    //         }else{

    //         authorCharacter.items[index].quantity -= itemToModify.quantity;
    //         }
    //       }else{
    //       authorCharacter.items.splice(index,1);
    //       }}

    //     console.log(enter, authorCharacter.items[index]);
    //   }
    //   await deleteItem("characters", CHARACTERS);
    //   });

    //     ctx.editMessageText("Ok, obrigado e até a próxima haha!", {reply_markup: blank, message_id: res.update.callback_query.message.message_id});
    //   }
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

module.exports = {
  modifyItem,
};
