import { Item } from "./item";

export interface Character {
  id: string;
  name: string;
  level: number;
  vocation: string;
  items: Item[];
}
