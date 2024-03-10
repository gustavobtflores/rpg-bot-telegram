const { removeItem } = require('../../handlers/removeItem');
const { modifyItem } = require("../../handlers/modifyItem");
const { addItem } = require("../../handlers/addItem");
const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { saveItem, catchItem } = require("../../config/storage");
const { formatDateToCustomFormat, handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString} = require('../../handlers');
const { transferCube } = require("../cube/transferCube")

const ITEM_REGEX = /^[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+,\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?\s*,\s*[a-zA-Z\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ.,-]+$/;


async function invCube(conversation, ctx) {
  await transferCube(conversation, ctx, "invCube");
}
async function cubeInv(conversation, ctx) {
  await transferCube(conversation, ctx, "cubeInv");
}

async function addCube(conversation, ctx) {
  await addItem(conversation, ctx, true);
}

async function removeCube(conversation, ctx) {
  await removeItem(conversation, ctx, true);
}

async function modifyCube(conversation, ctx){
  await modifyItem(conversation,ctx, true);
}

module.exports = {
  addCube,
  removeCube,
  modifyCube,
  invCube,
  cubeInv
};
