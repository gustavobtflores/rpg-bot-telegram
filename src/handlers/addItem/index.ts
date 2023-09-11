import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../../config/botConfig";
import { setItem } from "../../config/storage";
import { CHARACTERS } from "../../constants/characters";
import { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem } from "../../handlers";

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+(\.\d+)?,\s*\d+(\.\d+)?,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;

export async function addItem(conversation: MyConversation, ctx: MyContext): Promise<void> {
  
  const blank = new InlineKeyboard();
  const authorId: string = String(ctx.update.callback_query.from.id);
  if (!handleChatTypeResponse(parseInt(authorId), ctx)) {
    return;
  }
  
  await ctx.reply("Qual o nome do item e o seu peso?\nModelo: <nome do item>, <peso>, <quantidade>, <descrição>");
  
  const { message } = await conversation.wait();
  
  if (!message || !message.from || !message.chat) {
    return;
  }
  
  const chatID: number = message.chat.id;
  
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  const modList = [];
  const flagAdd = true;

  const confirmAdd = new InlineKeyboard().text("Sim", "yes").text("Não", "no");

  const inventoryList: string[] = await extractInventoryItemsFromMessage(message.text, flagAdd);

  for (let itemInInventory of inventoryList) {
    if (!isValidItem(itemInInventory, ITEM_REGEX)) {
      await ctx.reply(`Ta errado alguma coisa que tu digitou ai meu colega\nO erro foi nesse item aqui: \n\n${itemInInventory}\n\nQuer tentar de novo?`, { reply_markup: confirmAdd });
      
      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await addItem(conversation, ctx);
      } else {
        return ctx.editMessageText("Ok, então não vou adicionar nada.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }

  const parsedItem = parseItemFromInventoryString(itemInInventory);
  modList.push(parsedItem);
  }
  
  ctx.reply(`Estes são os itens que quer adicionar?\n\n${modList.map((item) => `${item.name} - ${item.weight}kg (${item.quantity}Un)`).join("\n")}`, { reply_markup: confirmAdd });

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  if (res.match === "yes") {
    
    await modList.forEach((item) => {
      authorCharacter.items.push(item);
    });
    await ctx.editMessageText(`Itens adicionados ao personagem ${authorCharacter.name}.\n\nQuer adicionar mais itens?`, { reply_markup: confirmAdd, message_id: res.update.callback_query.message.message_id});
    res = await conversation.waitForCallbackQuery(["yes", "no"]);
   
   if (res.match === "yes"){
     
      ctx.api.deleteMessage(chatID, ctx.update.callback_query.message.message_id);
        await addItem(conversation, ctx);
    }else{
      
        ctx.editMessageText("Ok, obrigado pelos itens!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
    
  } else {
    await ctx.editMessageText("Ok, então não vou adicionar nada.\n\nQuer tentar de novo?", { reply_markup: confirmAdd, message_id: res.update.callback_query.message.message_id });
    res = await conversation.waitForCallbackQuery(["yes", "no"]);
    if (res.match === "yes"){
      ctx.api.deleteMessage(chatID, ctx.update.callback_query.message.message_id);
      await addItem(conversation, ctx);
  
    }else{
      
       ctx.editMessageText("Ok, estarei aqui se precisar se livrar de algumas coisas haha!",{ reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }

  await setItem("characters", CHARACTERS);
}

interface ParsedItem {
  name: string;
  weight: number;
  quantity: number;
  desc: string;
}

function parseItemFromInventoryString(itemString: string): ParsedItem {
  const itemParts = itemString.split(",");
  return {
    name: itemParts[0].trim(),
    weight: parseInt(itemParts[1], 10),
    quantity: parseInt(itemParts[2], 10),
    desc: itemParts[3].trim(),
  };
}
