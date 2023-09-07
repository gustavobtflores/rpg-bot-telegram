import { Item } from "./item";

export interface Character {
  name: string;
  level: number;
  vocation: string;
  items: Item[];
}
