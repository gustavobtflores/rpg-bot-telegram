const { CHARACTERS, playersID } = require("../constants/characters");
const { statusValue, idStatus, P} = require("../menus");
const { InlineKeyboard } = require("grammy");

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


function parseItemFromInventoryString(itemString, pockets) {
  const itemSplit = itemString.split(",").map((item) => item.trim());
  const itemParts = [...itemSplit.slice(0, 3), itemSplit.slice(3).join(', ')];
  
  if(pockets !== true){
  return {
    name: itemParts[0].trim(),
    weight: limitarCasasDecimais(parseFloat(itemParts[1], 10), 3),
    quantity: parseFloat(itemParts[2], 10),
    desc: itemParts[3].trim(),
  };}else{
  let equippedPocket;
  if(itemParts[1].toLowerCase() === "equipado" || itemParts[1].toLowerCase() === "equipada"){
    equippedPocket = true;
  }else{
    equippedPocket = false;
  }
  return{
    name: itemParts[0].trim(),
    equipped: equippedPocket,
  };}
}


function splitPocketQuant(item) {
  var itemQuant = [];
  var itemString = [];
  for (let pocket of item) {
    if (pocket !==""){
    itemQuant.push([pocket, pocket]);
    itemString.push(pocket);
  }}

  var buttonRow = itemQuant.map(([label, data]) => InlineKeyboard.text(label, data));

  const tamanhoDoGrupo = calcularValorDeX(itemString.length);
  const arrayDividida = [];

  for (let i = 0; i < buttonRow.length; i += tamanhoDoGrupo) {
    const grupo = buttonRow.slice(i, i + tamanhoDoGrupo);
    arrayDividida.push(grupo);
  }
  const InlineNumbers = InlineKeyboard.from(arrayDividida);

  return { InlineNumbers, itemString };
}

function calcularValorDeX(tamanhoArray) {
  switch (true) {
    case tamanhoArray >= 4 && tamanhoArray <= 7:
      return tamanhoArray % 2 === 0 ? 4 : 3;
    case tamanhoArray >= 8 && tamanhoArray <= 14:
      return tamanhoArray % 2 === 0 ? 3 : 4;
    default:
      return 4;
  }
}

function extractItemsFromPockets(objectItems){
  
  const pinto =objectItems.reduce((pocketMap, item) => {
    let pocket = item.pocket;

      if (!pocketMap[pocket]) {
        pocketMap[pocket] = [];
      }
      pocketMap[pocket].push(item);
    return pocketMap;
  }, {});
   return pinto;
}


module.exports = {
  handleChatTypeResponse,
  extractInventoryItemsFromMessage,
  isValidItem,
  limitarCasasDecimais,
  parseItemFromInventoryString,
  statusValue,
  idStatus,
  playersID,
  P,
  splitPocketQuant,
  extractItemsFromPockets
};
