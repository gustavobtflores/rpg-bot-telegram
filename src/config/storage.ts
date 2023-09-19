import storage from "node-persist";

const storagePath = "../storage";

export const saveItem = async (key: string, value: any) => {
  await storage.init({ dir: storagePath });
  await storage.updateItem(key, value);
};

export const deleteItem = async (key: string, value: any) => {
  await storage.init({ dir: storagePath });
  await storage.setItem(key, value);
}

export const catchItem = async (key: string) => {
  await storage.init({ dir: storagePath });
  const item = await storage.getItem(key);
  return item;
};
