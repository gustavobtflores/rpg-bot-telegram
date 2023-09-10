import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../../config/botConfig";
import { setItem } from "../../config/storage";
import { CHARACTERS } from "../../constants/characters";
import { handleChatTypeResponse, extractInventoryItemsFromMessage } from "../../handlers";
import { hydrateReply, parseMode } from "../../@grammyjs/parse-mode";
import type { ParseModeFlavor } from "../../@grammyjs/parse-mode";
const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+,\s*\d+,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;

export async function removeItem(conversation: MyConversation, ctx: MyContext): Promise<void>{
  
  const authorId: string = String(ctx.update.callback_query.from.id);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  if (!handleChatTypeResponse(parseInt(authorId), ctx)) {
    return;
  }
  ctx.replyWithMarkDownV2("*Estes* são seus itens no momento:\n\n");

}