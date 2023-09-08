import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../config/botConfig";
import { setItem } from "../config/storage";
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
  const modList = [];
  // await handleChatTypeResponse(chatID, ctx);

  if (!authorCharacter) {
    ctx.reply("Você ainda não possui um personagem.");
    return;
  }

  const confirmAdd = new InlineKeyboard().text("Sim", "yes").text("Não", "no");

  const inventoryList: string[] = extractInventoryItemsFromMessage(message.text);

  for (let itemInInventory of inventoryList) {
    if (!isValidItem(itemInInventory)) {
      await ctx.reply(`Ta errado alguma coisa que tu digitou ai meu colega\nO erro foi nesse item aqui: \n\n${itemInInventory}\n\nQuer tentar de novo?`, { reply_markup: confirmAdd });
      
      const res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        await addItem(conversation, ctx);
      } else {
        return ctx.reply("Ok, então não vou adicionar nada.");
      }
      return;
    }

  const parsedItem = parseItemFromInventoryString(itemInInventory);
  console.log(parsedItem);
  modList.push(parsedItem);
  }
  
  modList.foreach(function(item, i) {
    console.log(item);
    return;
  });
  
  await ctx.reply(`Estes são os itens que quer adiconar?\n\n${modList.map((item) => `${item.name} - ${item.weight}kg (${item.quantity}Un)`).join("\n")}.`, { reply_markup: confirmAdd });

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  if (res.match === "yes") {
    
    authorCharacter.items.push(modList[0]);
    await ctx.reply(`Itens adicionados ao personagem ${authorCharacter.name}.\n\nQuer adicionar mais itens?`, { reply_markup: confirmAdd});
    res = await conversation.waitForCallbackQuery(["yes", "no"]);
   
   if (res.match === "yes"){
        await addItem(conversation, ctx);
    }else{
      
        ctx.reply("Ok, obrigado pelos itens!");
    }
    
  } else {
    await ctx.reply("Ok, então não vou adicionar nada.\n\nQuer tentar de novo?", { reply_markup: confirmAdd});
    res = await conversation.waitForCallbackQuery(["yes", "no"]);
    if (res.match === "yes"){
      
      await addItem(conversation, ctx);
  
    }else{
      
       ctx.reply("Ok, estarei aqui se precisar se livrar de algumas coisas haha!");
    }
  }

  await setItem("characters", CHARACTERS);
}

async function handleChatTypeResponse(chatID: number, ctx: MyContext): Promise<void> {
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
