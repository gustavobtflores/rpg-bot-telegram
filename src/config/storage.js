const storage = require("node-persist");

const storagePath = "../storage";

const saveItem = async (key, value) => {
  await storage.init({ dir: storagePath });
  await storage.updateItem(key, value);
};

const deleteItem = async (key, value) => {
  await storage.init({ dir: storagePath });
  await storage.setItem(key, value);
};

const catchItem = async (key) => {
  await storage.init({ dir: storagePath });
  const item = await storage.getItem(key);
  return item;
};

module.exports = {
  catchItem,
  deleteItem,
  saveItem,
};
