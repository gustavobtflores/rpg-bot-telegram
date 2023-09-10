import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../config/botConfig";
import { setItem } from "../config/storage";
import { CHARACTERS } from "../constants/characters";

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+,\s*\d+,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;


export function handleChatTypeResponse(chatID: number, ctx: MyContext): Promise<void> {
  var pass = false;
  switch (chatID) {
    case 587760655:
      ctx.reply("Vocẽ é Tácio, pode passar");
      pass = true;
      break;
    case 619387833:
      ctx.reply("Vocẽ é Gustavo, pode passar");
      pass = true;
      break;
    default:
      ctx.reply("Você ainda não está cadastrado.");
      pass = false;
      
  }
  return pass;
}

export function extractInventoryItemsFromMessage(text?: string): string[] {
  if (!text) {
    return [];
  }
  if (!text.includes(";")) {
    return text.split("\n").map((item) => item.trim());
  }
  return text.split(";").map((item) => item.trim());
}

function isValidItem(item: string): boolean {
  return ITEM_REGEX.test(item);
}

interface ParsedItem {
  name: string;
  weight: number;
  quantity: number;
  description: string;
}

function parseItemFromInventoryString(itemString: string): ParsedItem {
  const itemParts = itemString.split(",");
  return {
    name: itemParts[0].trim(),
    weight: parseInt(itemParts[1], 10),
    quantity: parseInt(itemParts[2], 10),
    description: itemParts[3].trim(),
  };
}
