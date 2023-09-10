import { getItem } from "../config/storage";
import { Character } from "../interfaces/character";
import { Item } from "../interfaces/item";

/**
 * Formats an individual character's item details.
 * @param item The item details to format.
 * @returns A formatted string representing the item.
 */
function formatItemDetails(item: Item): string {
  const totalWeight = item.weight * item.quantity;
  return `- ${item.name}: ${item.quantity}Un - ${item.weight}Kg => ${totalWeight}Kg\nDescrição: ${item.description}`;
}

/**
 * Computes the total weight of a character's items.
 * @param items A list of items to compute the total weight for.
 * @returns The total weight.
 */
function computeTotalWeight(items: { weight: number; quantity: number }[]): number {
  return items.reduce((acc, item) => acc + item.weight * item.quantity, 0);
}

export async function getFormattedCharacters(id: number): Promise<string> {
  const characters: Character[] = await getItem("characters");
  const authorId: string = String(id);

  return characters
    .filter((character) => authorId === character.id)
    .map((character) => {
      const formattedItems = character.items.map(formatItemDetails).join("\n\n");
      const totalWeight = computeTotalWeight(character.items);

      return (
        `Nome: ${character.name}\n` +
        `Level: ${character.level}\n` +
        `Classe: ${character.vocation}\n` +
        `Lista de items: \n\n${formattedItems}\n` +
        `Peso total: ${totalWeight}Kg\n` +
        `---------------------\n`
      );
    })
    .join("\n");
}
