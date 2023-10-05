const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem } = require("../../config/storage");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidStatusItem, limitarCasasDecimais, parseItemFromInventoryString, statusValue, P } = require('../../handlers');

async function status(conversation, ctx){
  
  const idStatus = Array.from(P[0]);
  
  await ctx.reply(`As seguintes alterações serão feitas:\n\n${idStatus.map((value, i) => {
  const pvTexto = statusValue[i][0] !== 0 ? `PV: ${statusValue[i][0] > 0 ? `+${statusValue[i][0]}`: `${statusValue[i][0]}`}` : '';
  const pfTexto = statusValue[i][1] !== 0 ? `PF: ${statusValue[i][1] > 0 ? `+${statusValue[i][1]}`: `${statusValue[i][1]}`}` : '';
  const pmTexto = statusValue[i][2] !== 0 ? `PM: ${statusValue[i][2] > 0 ? `+${statusValue[i][2]}`: `${statusValue[i][2]}`}` : '';
  
  const textoFinal = [pvTexto, pfTexto, pmTexto].filter(texto => texto !== '').join('\n');

  return `Personagem: ${value}\n\n${textoFinal}`;
}).join("\n\n")}\n\nConfirma?`);

}

module.exports = {
  status,
}