import { CHARACTERS } from "../constants/characters";

export function getFormattedCharacters(): string {
  return CHARACTERS.map((character) => {
    return `Nome: ${character.name}\n\nLevel: ${character.level}\nClasse: ${character.vocation}\nLista de items: \n${character.items
      .map((item) => `${item.name} - ${item.weight * item.quantity}(${item.weight})kg`)
      .join("\n")}\nPeso total: ${character.items.reduce((acc, item) => acc + item.weight * item.quantity, 0)}kg
        \n---------------------\n
    `;
  })
    .join("\n")
    .replace(/^\t+/gm, "");
}
