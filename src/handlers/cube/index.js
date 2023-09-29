const { addItem } = require('../../handlers/addItem');
const { removeItem } = require('../../handlers/removeItem');
const { modifyItem } = require("../../handlers/modifyItem");


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
  modifyCube
};
