import { getItem } from "../config/storage";
import { Character } from "../interfaces/character";

export async function getFormattedCharacters(ID): Promise<string> {
  const CHARACTERS: Character[] = await getItem("characters");
  const authorId: string = String(ID);

  return CHARACTERS.map((character) => {if(authorId === character.id){
    return `Nome: ${character.name}\n\nLevel: ${character.level}\nClasse: ${character.vocation}\nLista de items: \n${character.items
      .map((item) => `*-\* ${item.name}:* ${item.quantity}Un - ${item.weight}Kg => ${item.weight * item.quantity}Kg\nDescrição: ${item.desc}`, { parse_mode: "MarkdownV2" })
      .join("\n\n")}\n\nPeso total: ${character.items.reduce((acc, item) => acc + item.weight * item.quantity, 0)}Kg
        \n---------------------\n
    `;
  }})
    .join("\n")
    .replace(/^\t+/gm, "");
}
