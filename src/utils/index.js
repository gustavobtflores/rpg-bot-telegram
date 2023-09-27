const { catchItem } = require("../config/storage");
const { playersID, CHARACTERS } = require("../constants/characters");

const getFormattedCharacters = async (ID, fun) => {
  const CHARACTERS1 = await catchItem("characters");
  const authorId = String(ID);

  const formatCharacter = (character) => {
    const totalWeight = character.items.reduce((acc, item) => Number((acc + item.weight * item.quantity).toFixed(3)), 0);

    if (fun === "all" && character.id !== playersID.Mestre && character.id !== playersID.Rowan) {
      return `${character.name}\n\nPeso total: ${totalWeight}Kg\n---------------------\n`;
    } else if (authorId === character.id) {
      const itemList = character.items
        .map((item) => `- ${item.name}: ${item.quantity}Un - ${item.weight}Kg => ${Number((item.weight * item.quantity).toFixed(3))}Kg\nDescrição: ${item.desc}`)
        .join("\n\n");

      return `Lista de items: \n\n${itemList}\n\nPeso total: ${totalWeight}Kg\n---------------------\n`;
    }
  };

  return CHARACTERS1.map(formatCharacter).filter(Boolean).join("\n").replace(/^\t+/gm, "");
};

module.exports = {
  getFormattedCharacters,
};
