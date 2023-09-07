import storage from "node-persist";

const storagePath = "../storage";

export const setItem = async (key: string, value: any) => {
  await storage.init({ dir: storagePath });
  await storage.setItem(key, value);
};

export const getItem = async (key: string) => {
  await storage.init({ dir: storagePath });
  const item = await storage.getItem(key);
  return item;
};
