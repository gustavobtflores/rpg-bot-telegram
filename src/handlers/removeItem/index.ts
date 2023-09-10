import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../../config/botConfig";
import { setItem } from "../../config/storage";
import { CHARACTERS } from "../../constants/characters";
import { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem } from "../../handlers";
import { getFormattedCharacters } from "../../utils";
/*import { hydrateReply, parseMode } from "../../@grammyjs/parse-mode";
import type { ParseModeFlavor } from "../../@grammyjs/parse-mode";
*/

export async function removeItem(conversation: MyConversation, ctx: MyContext): Promise<void>{
  
  const flagRemove = false;
  const authorId: string = String(ctx.update.callback_query.from.id);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  const confirmRemove = new InlineKeyboard().text("Sim", "yes").text("Não", "no");

  if (!handleChatTypeResponse(parseInt(authorId), ctx)) {
    return;
  }
  
  ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId)}\n\n\nEscolha quais itens quer remover separando-os por enter ou ,`);
  const { message } = await conversation.wait();
  
  const inventoryList: string[] = extractInventoryItemsFromMessage(message.text, flagRemove);
  const inventoryNow = authorCharacter.items.map((item) => item.name);
  
  for (let itemToRemove of inventoryList) {
    
    var item = inventoryNow.find((item)  => item.toLowerCase() === itemToRemove.toLowerCase());
    
    if (!item) {
      
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToRemove}\n\nQuer tentar de novo?`, { reply_markup: confirmRemove });
      
      const res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        await removeItem(conversation, ctx);
      } else {
        return ctx.reply("Ok, ansioso para livrar um pouco as costas haha.");
      }
      return;
    }
    
  }
  console.log("passou")

}