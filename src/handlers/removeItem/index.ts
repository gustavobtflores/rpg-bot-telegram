import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../../config/botConfig";
import { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais } from "../../handlers";
import { getFormattedCharacters } from "../../utils";
import { itemRemoveMenu, itemAddMenu, mainMenu } from "../../menus/";
import { deleteItem, catchItem } from "../../config/storage";

export async function removeItem(conversation: MyConversation, ctx: MyContext, cube): Promise<void>{



  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  let ID = "";
  let tempCube = cube;
  if (cube === true){
    ID = "cube";
    tempCube = cube;
  }else{
    ID = ctx.update.callback_query.from.id
    tempCube = false;
  }


  const CHARACTERS: Character[] = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagRemove = false;
  const confirmRemove = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID: number = ctx.update.callback_query.message.chat.id;
  const authorId: string = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId)}\nEscolha quais itens quer remover separando-os por , ou enter.`, {reply_markup: blank});
  
  const { message } = await conversation.wait();
  
  const inventoryList: string[] = extractInventoryItemsFromMessage(message.text, flagRemove);
  var inventoryNow = authorCharacter.items.map((item) => item);
  
  for (let itemToRemove of inventoryList) {
    
    var item = inventoryNow.find((item)  => item.name.toLowerCase() === itemToRemove.toLowerCase());
    
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
  const listItemRemove = await removeItemDefine(inventoryList, inventoryNow, ctx, conversation );
  
  
  
  await ctx.reply(`Confira os itens que quer remover:\n\n${listItemRemove.map((item) => `- ${item.name}: ${item.quantity}Un - ${item.weight}Kg => ${limitarCasasDecimais(item.weight * item.quantity,3)}Kg\nDescrição: ${item.desc}`).join("\n\n")}\n\nPeso total a ser removido: ${listItemRemove.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity,3), 0)}Kg - Confirma?`, { reply_markup: confirmRemove });

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  
  
  if (res.match === "yes") {
    
     await conversation.external(async () =>{
      for(const itemToRemove of listItemRemove){
        
      const index = authorCharacter.items.findIndex((item) => item.name === itemToRemove.name);
      if(index !== -1){
        if(authorCharacter.items[index].quantity !==1 ){
          if(itemToRemove.quantity === authorCharacter.items[index].quantity){
            authorCharacter.items.splice(index,1);
          }else{
          
          authorCharacter.items[index].quantity -= itemToRemove.quantity;
          }
        }else{
        authorCharacter.items.splice(index,1);
        }}
        
      console.log(enter, authorCharacter.items[index]);
    }
    await deleteItem("characters", CHARACTERS);
     });
   console.log(enter, "chegou aqui3");
    
     
      
     console.log(enter,authorCharacter,enter)
    
   console.log(enter, "chegou aqui1");
   
   await ctx.editMessageText(`Itens removidos do personagem ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id});
    
  //   var res = await conversation.waitForCallbackQuery(["yes", "no"]);
   
  // console.log(enter, "chegou aqui");
   
  //   if (res.match === "yes"){
      
      
      
  //     ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      
  //     await removeItem(conversation, ctx, tempCube);
  
  //   }else{
      
  //   await conversation.external(async () =>{
  //     for(const itemToRemove of listItemRemove){
        
  //     const index = authorCharacter.items.findIndex((item) => item.name === itemToRemove.name);
  //     if(index !== -1){
  //       if(authorCharacter.items[index].quantity !==1 ){
  //         if(itemToRemove.quantity === authorCharacter.items[index].quantity){
  //           authorCharacter.items.splice(index,1);
  //         }else{
          
  //         authorCharacter.items[index].quantity -= itemToRemove.quantity;
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
    await ctx.editMessageText("Ok, então não vou te dar nada.\n\nQuer tentar de novo?", { reply_markup: confirmRemove, message_id: res.update.callback_query.message.message_id});
    
    var res = await conversation.waitForCallbackQuery(["yes", "no"]);
      
    if (res.match === "yes"){
      
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
      
      await removeItem(conversation, ctx, tempCube);
  
    }else{
      
       ctx.editMessageText("Ok, estarei aqui se precisar pegar alguma coisas haha!", { reply_markup : blank, message_id: res.update.callback_query.message.message_id});
    }
  }
 
}


async function removeItemDefine(inventoryList, inventoryNow, ctx, conversation) {
  var listItemRemove = [];
  
  for (let itemToRemove of inventoryList) {
  
    var item = { ...inventoryNow.find((item)  => item.name.toLowerCase() === itemToRemove.toLowerCase())};
    
    if (item.quantity !== 1 ){
          
      
      const quant = await splitItemQuant(item);
      ctx.reply(`Quantas unidades de ${item.name} deseja remover?`, {reply_markup: quant.InlineNumbers});
      
      var res = await conversation.waitForCallbackQuery(quant.itemString);

      item.quantity = parseInt(res.match);

      ctx.api.deleteMessage(res.update.callback_query.message.chat.id, res.update.callback_query.message.message_id);
    }
      listItemRemove.push(item);
      
  }
  return listItemRemove;
}


function splitItemQuant(item) {
      var itemQuant = [];
      var itemString = [];
      for(let i = 1; i <= item.quantity; i++){
     
        var numero =  i.toString();
        itemQuant.push([numero,numero]);
        itemString.push(numero);
    
      }
      
      var buttonRow = itemQuant.map(([label, data]) =>
        InlineKeyboard.text(label,data));
      
      const tamanhoDoGrupo = 8;
      const arrayDividida = [];
      
      for (let i = 0; i < buttonRow.length; i += tamanhoDoGrupo) {
        const grupo = buttonRow.slice(i, i + tamanhoDoGrupo);
        arrayDividida.push(grupo);
      }
      const InlineNumbers = InlineKeyboard.from(arrayDividida);
  
  return {InlineNumbers, itemString};
}