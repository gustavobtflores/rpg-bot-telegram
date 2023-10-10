const { catchItem, deleteItem } = require("../config/storage");
const { playersID, CHARACTERS } = require("../constants/characters");

const getFormattedCharacters = async (ID, equipped, fun) => {
  const CHARACTERS1 = await catchItem("characters");
  const authorId = String(ID);
  
  
  // const statusObjet = {
  //   pvMax: 0,
  //   pfMax: 0,
  //   pmMax: 0,
  //   pvAtual: 0,
  //   pfAtual: 0,
  //   pmAtual: 0,
  //   log: []
  // }
  // CHARACTERS1.forEach(character => {
  //     character.status = { ...statusObjet};
  // });
  // console.log(CHARACTERS1);
  
  // CHARACTERS1[1].status.pvMax = 9;
  // CHARACTERS1[1].status.pfMax = 9;
  // CHARACTERS1[1].status.pmMax = 35;
  
  // CHARACTERS1[2].status.pvMax = 17;
  // CHARACTERS1[2].status.pfMax = 14;
  // CHARACTERS1[2].status.pmMax = 0;
  
  // CHARACTERS1[3].status.pvMax = 18;
  // CHARACTERS1[3].status.pfMax = 10;
  // CHARACTERS1[3].status.pmMax = 25;
  // console.log(CHARACTERS1);
  
  // deleteItem("characters", CHARACTERS1);
  
  const formatCharacter = (character) => {
    if(fun === "status"){
      //  aqui equipped === true indica que é apenas para o personagem, se for false é pro mestre
      if(!equipped && character.id !== playersID.Mestre && character.id !== playersID.Rowan && character.id !== playersID.Cubo){
        var stats = `${character.name}:\n\nPV (${character.status.pvMax}) = ${character.status.pvAtual} | PF (${character.status.pfMax}) = ${character.status.pfAtual} | PM (${character.status.pmMax}) = ${character.status.pmAtual}\nUltimos acontecimentos:\n\n${character.status.log.map(log => `-> ${log};`
        ).join("\n")}`
        
      return `${stats}\n\n`;
      
      }else if(character.id === authorId){
        var stats = `PV (${character.status.pvMax}) = ${character.status.pvAtual} | PF (${character.status.pfMax}) = ${character.status.pfAtual} | PM (${character.status.pmMax}) = ${character.status.pmAtual}\n\nUltimos acontecimentos:\n\n${character.status.log.map(log => `-> ${log};`
        ).join("\n")}`
        
      return `${stats}\n\n`;
      }
    }else{
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
    }}
  };

  return CHARACTERS1.map(formatCharacter).filter(Boolean).join("\n").replace(/^\t+/gm, "");
};

module.exports = {
  getFormattedCharacters,
};
