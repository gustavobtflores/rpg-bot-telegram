const { CHARACTERS, playersID } = require("../constants/characters");

function handleChatTypeResponse(chatID, ctx) {
  var pass = false;
  const IDs = Object.values(playersID);
  if (IDs.find((id) => id === chatID)) {
    pass = true;
  } else {
    ctx.reply("Você ainda não está cadastrado.");
  }
  return pass;
}

function extractInventoryItemsFromMessage(text, addRemove) {
  if (!text) {
    return [];
  }
  if (!text.includes("\n") && !addRemove) {
    return text.split(",").map((item) => item.trim());
  }
  if (!text.includes(";")) {
    return text.split("\n").map((item) => item.trim());
  }
  return text.split(";").map((item) => item.trim());
}

function isValidItem(item, ITEM_REGEX) {
  return ITEM_REGEX.test(item);
}

function limitarCasasDecimais(numero, casasDecimais) {
  // Arredonda o número para as casas decimais desejadas
  const numeroArredondado = numero.toFixed(casasDecimais);

  // Remove os zeros à direita, exceto se for 0
  const numeroFormatado = numeroArredondado.replace(/(\.[0-9]*[1-9])0*|\.0*/, "$1");

  // Converte a string formatada de volta para um número
  const numeroFinal = parseFloat(numeroFormatado);

  return numeroFinal;
}


function parseItemFromInventoryString(itemString) {
  const itemSplit = itemString.split(",");
  const itemParts = [...itemSplit.slice(0, 3), itemSplit.slice(3).join(',')];

  return {
    name: itemParts[0].trim(),
    weight: limitarCasasDecimais(parseFloat(itemParts[1], 10), 3),
    quantity: parseFloat(itemParts[2], 10),
    desc: itemParts[3].trim(),
  };
}

module.exports = {
  handleChatTypeResponse,
  extractInventoryItemsFromMessage,
  isValidItem,
  limitarCasasDecimais,
  parseItemFromInventoryString
};
