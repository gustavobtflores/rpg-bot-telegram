import { MyContext, MyConversation } from "../config/botConfig";
import { CHARACTERS } from "../constants/characters";

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+,\s*\d+,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;

export async function addItem(conversation: MyConversation, ctx: MyContext): Promise<void> {
  await ctx.reply("Qual o nome do item e o seu peso?\nModelo: <nome do item>, <peso>, <quantidade>, <descrição>");

  const { message } = await conversation.wait();

  if (!message || !message.from || !message.chat) {
    return;
  }

  const authorId: string = String(message.from.id);
  const authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  const chatID: number = message.chat.id;

  handleChatTypeResponse(chatID, ctx);

  if (!authorCharacter) {
    ctx.reply("Você ainda não possui um personagem.");
    return;
  }

  const inventoryList: string[] = extractInventoryItemsFromMessage(message.text);

  inventoryList.forEach((itemInInventory) => {
    if (!isValidItem(itemInInventory)) {
      ctx.reply(`Ta errado alguma coisa que tu digitou ai meu colega\nO erro foi nesse item aqui: \n\n${itemInInventory}`);
      return;
    }

    const parsedItem = parseItemFromInventoryString(itemInInventory);
    authorCharacter.items.push(parsedItem);
    ctx.reply(`Item ${parsedItem.name} adicionado ao personagem ${authorCharacter.name}.`);
  });
}

function handleChatTypeResponse(chatID: number, ctx: MyContext): void {
  switch (chatID) {
    case 587760655:
      ctx.reply("isso é um chat privado");
      break;
    case -946652366:
      ctx.reply("Isso é um grupo");
      break;
    default:
      ctx.reply("Você ainda não está cadastrado.");
  }
}

function extractInventoryItemsFromMessage(text?: string): string[] {
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
