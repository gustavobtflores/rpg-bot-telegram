import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../../config/botConfig";
import { setItem } from "../../config/storage";
import { CHARACTERS } from "../../constants/characters";

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+,\s*\d+,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;

export async function removeItem(conversation: MyConversation, ctx: MyContext): Promise<void>{
  ctx.reply("eai meu chapa");
}
