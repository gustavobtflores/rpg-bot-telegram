import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../../config/botConfig";
import { setItem } from "../../config/storage";
import { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem } from "../../handlers";
import { getFormattedCharacters } from "../../utils";
import { itemRemoveMenu, itemAddMenu, mainMenu } from "../../menus/";
import { getItem } from "../../config/storage";

/*import { hydrateReply, parseMode } from "../../@grammyjs/parse-mode";
import type { ParseModeFlavor } from "../../@grammyjs/parse-mode";
*/
export async function removeItem(conversation: MyConversation, ctx: MyContext, msgID): Promise<void>{


  const CHARACTERS: Character[] = await getItem("characters");
  const blank = new InlineKeyboard();
  const exit = new InlineKeyboard().text("Sair", "exit");  
  const flagRemove = false;
  const authorId: string = String(ctx.update.callback_query.from.id);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  const confirmRemove = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID: number = message.chat.id;

  if (!handleChatTypeResponse(parseInt(authorId), ctx)) {
    return;
  }
  ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId)}\n\n\nEscolha quais itens quer remover separando-os por , ou enter.`, {reply_markup: blank});
  
  const { message } = await conversation.wait();
  
  const inventoryList: string[] = extractInventoryItemsFromMessage(message.text, flagRemove);
  const inventoryNow = authorCharacter.items.map((item) => item);
  
  for (let itemToRemove of inventoryList) {
    
    var item = inventoryNow.find((item)  => item.name.toLowerCase() === itemToRemove.toLowerCase());
    
    if (!item) {
      
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToRemove}\n\nQuer tentar de novo?`, { reply_markup: confirmRemove });
      
      var res = await conversation.waitForCallbackQuery(["yes", "no"]);
      var update = res.update.callback_query.message.message_id;

      if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, ctx.update.callback_query.message.message_id);
        await removeItem(conversation, ctx, update);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: update });
      }
      return;
    }
    
  }
  const listItemRemove = [];
  for (let itemToRemove of inventoryList) {
  
    var item = inventoryNow.find((item)  => item.name.toLowerCase() === itemToRemove.toLowerCase());
    if (item.quantity !== 1 ){
     
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
      var quantity = InlineKeyboard.from(arrayDividida);
      
      ctx.reply(`Quantas unidades de ${item.name} deseja remover?`, {reply_markup: quantity});
      
      var res = await conversation.waitForCallbackQuery(itemString);
      
      var tempItemRemove = {
        name: item.name,
        quantity: parseInt(res.match),
        weight: item.weight
        }
      }else if(item.quantity === 1){
      var tempItemRemove = {
        name: item.name,
        quantity: item.quantity,
        weight: item.weight
        }
      }
      listItemRemove.push(tempItemRemove);
  }
  
  await ctx.editMessageText(`Confira os itens que quer remover:\n\n${listItemRemove.map((item) => `${item.name} - ${item.weight}kg (${item.quantity}Un)`).join("\n")}\n\nPeso total a ser removido: ${listItemRemove.reduce((acc, item) => acc + item.weight * item.quantity, 0)}Kg - Confirma?`, { reply_markup: confirmRemove, message_id: res.update.callback_query.message.message_id });

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  
  if (res.match === "yes") {
    
    // await listItemRemove.forEach((item) => {
    //   authorCharacter.items.push(item);
    // });
    await ctx.editMessageText(`Itens removidos do personagem ${authorCharacter.name}.\n\nQuer remover mais itens?`, { reply_markup: confirmRemove, message_id: res.update.callback_query.message.message_id});
    res = await conversation.waitForCallbackQuery(["yes", "no"]);
    update = res.update.callback_query.message.message_id;
   
   if (res.match === "yes"){
     
      ctx.api.deleteMessage(chatID, ctx.update.callback_query.message.message_id);
        await removeItem(conversation, ctx, update);
        
    }else{
      
        ctx.editMessageText("Ok, obrigado pelos itens!", {reply_markup: blank, message_id: res.update.callback_query.message.message_id});
    }
    
  } else {
    await ctx.editMessageText("Ok, então não vou te dar nada.\n\nQuer tentar de novo?", { reply_markup: confirmRemove, message_id: res.update.callback_query.message.message_id});
    
    res = await conversation.waitForCallbackQuery(["yes", "no"]);
      var update = res.update.callback_query.message.message_id;
      
    if (res.match === "yes"){
      
      ctx.api.deleteMessage(chatID, ctx.update.callback_query.message.message_id);
      
      await removeItem(conversation, ctx, update);
  
    }else{
      
       ctx.editMessageText("Ok, estarei aqui se precisar pegar alguma coisas haha!", { reply_markup : blank, message_id: res.update.callback_query.message.message_id});
    }
  }
 
}