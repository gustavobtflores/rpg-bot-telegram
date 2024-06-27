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
  const parsedItem = extractInventoryItemsFromMessage(item);
  if(!isNaN(parsedItem[1]) && parsedItem[1].trim() !== ""){
    return ITEM_REGEX.test(item);
  }
  return false;
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


function getCommonPockets(inventory, item) {
  const pockets = [];
  
  for (const objeto of inventory) {
    if (objeto.name === item && !pockets.includes(objeto.pocket)) {
      pockets.push(objeto.pocket);
    }
  }
  
  return pockets;
}


function splitItemQuant(item) {
  var itemQuant = [];
  var itemString = [];
  for (let i = 1; i <= item.quantity; i++) {
    var numero = i.toString();
    itemQuant.push([numero, numero]);
    itemString.push(numero);
  }

  var buttonRow = itemQuant.map(([label, data]) => InlineKeyboard.text(label, data));

  const tamanhoDoGrupo = calcularX(itemString.length);
  const arrayDividida = [];

  for (let i = 0; i < buttonRow.length; i += tamanhoDoGrupo) {
    const grupo = buttonRow.slice(i, i + tamanhoDoGrupo);
    arrayDividida.push(grupo);
  }
  const InlineNumbers = InlineKeyboard.from(arrayDividida);

  return { InlineNumbers, itemString };
}

function calcularX(tamanhoArray) {
  switch (true) {
    case tamanhoArray <= 8:
      return 8;
    case tamanhoArray <= 10:
      return 5;
    case tamanhoArray <= 12:
      return 6;
    case tamanhoArray <= 14:
      return 7;
    case tamanhoArray <= 16:
      return 8;
    case tamanhoArray <= 18:
      return 6;
    case tamanhoArray <= 21:
      return 7;
    case tamanhoArray <= 24:
      return 8;
    case tamanhoArray <= 28:
      return 7;
    case tamanhoArray <= 32:
      return 8;
    case tamanhoArray <= 35:
      return 7;
    case tamanhoArray <= 40:
      return 8;
    default:
      // Se o tamanho for maior do que 40, você pode lidar com isso de acordo com sua lógica.
      // Aqui, está retornando 8, mas você pode ajustar conforme necessário.
      return 8;
  }
}

function formatDateToCustomFormat() {
  const now = new Date();

  // Extract date components
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = now.getFullYear();

  // Extract time components
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  // Combine date and time
  const formattedDate = `${hours}h${minutes}m - ${day}/${month}/${year}`;
  return formattedDate;
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
  extractItemsFromPockets,
  splitItemQuant,
  getCommonPockets,
  formatDateToCustomFormat
};
