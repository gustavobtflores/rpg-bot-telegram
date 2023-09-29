const { catchItem, deleteItem } = require("../config/storage");
const { playersID, CHARACTERS } = require("../constants/characters");

const getFormattedCharacters = async (ID, equipped, fun) => {
  const CHARACTERS1 = await catchItem("characters");
  const authorId = String(ID);
  // CHARACTERS1.forEach(character => {
  //   character.items.forEach(item => {
  //     item.equipped = true;
      
  //   });
    
  // });
  
  // deleteItem("characters", CHARACTERS1);
  
  const formatCharacter = (character) => {
    if(fun !== "allItems"){
      var equippedItems = equipped === true ? character.items.filter(item => item.equipped) :  character.items.filter(item => !item.equipped);
    }else{
      var equippedItems = character.items;
    }
    
    const totalWeight = equippedItems.reduce((acc, item) => Number((acc + item.weight * item.quantity).toFixed(3)), 0);

    if (fun === "all" && character.id !== playersID.Mestre && character.id !== playersID.Rowan) {
      return `${character.name}\n\nPeso total: ${totalWeight}Kg\n---------------------\n`;
    } else if (authorId === character.id) {
      const itemList = equippedItems
        .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${Number((item.weight * item.quantity).toFixed(3))}Kg\nDescrição: ${item.desc}`)
        .join("\n\n");

      return `Lista de itens: \n\n${itemList}\n\nPeso total: ${totalWeight}Kg\n---------------------\n`;
    }
  };

  return CHARACTERS1.map(formatCharacter).filter(Boolean).join("\n").replace(/^\t+/gm, "");
};

module.exports = {
  getFormattedCharacters,
};
