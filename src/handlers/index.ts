import { InlineKeyboard } from "grammy";
import { MyContext, MyConversation, bot } from "../config/botConfig";
import { setItem } from "../config/storage";
import { CHARACTERS, playersID } from "../constants/characters";
import { addItem } from "./addItem";
import { removeItem } from "./removeItem";
import { modifyItem } from "./modifyItem";
import { addCube, removeCube } from "./cube";

// import { addCube } from "./cube/addCube";
// import { removeCube } from "./cube/removeCube";
export { addItem, removeItem, modifyItem, addCube, removeCube };

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+,\s*\d+,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;


export function handleChatTypeResponse(chatID: string, ctx: MyContext): Promise<void> {
  var pass = false;
  const IDs = Object.values(playersID);
  if(IDs.find((id) => id === chatID)){
    ctx.reply("Opa, você por aqui!");
    pass = true;
  }else{
    ctx.reply("Você ainda não está cadastrado.");
  }
  return pass;
}

export function extractInventoryItemsFromMessage(text?: string, addRemove): string[] {
  if (!text) {
    return [];
  }
  if(!text.includes("\n") && !addRemove){
    return text.split(",").map((item) => item.trim());
  }
  if (!text.includes(";")) {
    return text.split("\n").map((item) => item.trim());
  } 
  return text.split(";").map((item) => item.trim());
}

export function isValidItem(item: string, ITEM_REGEX): boolean {
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

export function limitarCasasDecimais(numero, casasDecimais) {
  // Arredonda o número para as casas decimais desejadas
  const numeroArredondado = numero.toFixed(casasDecimais);

  // Remove os zeros à direita, exceto se for 0
  const numeroFormatado = numeroArredondado.replace(/(\.[0-9]*[1-9])0*|\.0*/, "$1");

  // Converte a string formatada de volta para um número
  const numeroFinal = parseFloat(numeroFormatado);

  return numeroFinal;
}
