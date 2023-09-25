import { catchItem } from "../config/storage"
import { limitarCasasDecimais } from "../handlers";
import { playersID, CHARACTERS } from "../constants/characters.ts";

export async function getFormattedCharacters(ID, fun): Promise<string> {
  // deleteItem("characters", CHARACTERS);
  const IDs = Object.values(playersID);
  const CHARACTERS1: Character[] = await catchItem("characters");
  const authorId: string = String(ID);
  if(fun === "all") {
    
  return CHARACTERS1.map((character) => {if(character.id !== playersID.Mestre && character.id !== playersID.Rowan){
    return `${character.name}\n\nPeso total: ${character.items.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity,3), 0)}Kg
        \n---------------------\n
    `;
  }})
    .join("\n")
    .replace(/^\t+/gm, "");
    
  }else{

  return CHARACTERS1.map((character) => {if(authorId === character.id){
    return `Lista de items: \n\n${character.items
      .map((item) => `- ${item.name}: ${item.quantity}Un - ${item.weight}Kg => ${limitarCasasDecimais(item.weight * item.quantity,3)}Kg\nDescrição: ${item.desc}`)
      .join("\n\n")}\n\nPeso total: ${character.items.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity,3), 0)}Kg
        \n---------------------\n`;
  }})
    .join("")
    .replace(/^\t+/gm, "");
}}
