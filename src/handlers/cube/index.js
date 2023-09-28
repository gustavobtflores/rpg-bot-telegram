const { addItem } = require('../../handlers/addItem');
const { removeItem } = require('../../handlers/removeItem');


async function addCube(conversation, ctx) {
  await addItem(conversation, ctx, true);
}

async function removeCube(conversation, ctx) {
  await removeItem(conversation, ctx, true);
}

module.exports = {
  addCube,
  removeCube,
};
