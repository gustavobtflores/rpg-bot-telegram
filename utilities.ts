import { CHARACTERS } from "./characters";

export function getFormattedCharacters(): string {
  return CHARACTERS.map((character) => {
    return `Nome: ${character.name}\n\nLevel: ${character.level}\nClasse: ${character.vocation}\nLista de items: \n${character.items
      .map((item) => `${item.name} - ${item.weight}kg`)
      .join("\n")}\nPeso total: ${character.items.reduce((acc, item) => acc + item.weight, 0)}kg
        \n---------------------\n
    `;
  })
    .join("\n")
    .replace(/^\t+/gm, "");
}
