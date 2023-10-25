const { catchItem, deleteItem } = require("../config/storage");
const { playersID, CHARACTERS } = require("../constants/characters");


const getFormattedCharacters = async (ID, equipped, fun, allPockets) => {
  const CHARACTERS1 = await catchItem("characters");
  const authorId = String(ID);
  let totalWeightAllPockets;
  
  // CHARACTERS1.map(value =>{
  //   if(value.id !== "cube"){
    
  //   value.progress = "";
  //   }
  // });
  // deleteItem("characters", CHARACTERS1);
  
  const formatCharacter = (character) => {
    if(fun === "xp"){
      let xpMod =[]
      let xp = [];
      if(!equipped && character.id !== playersID.Mestre && character.id !== playersID.Rowan && character.id !== playersID.Cubo) {
        xp.push(" - "+ character.name + "\n\n" + character.progress + "\n\n---------------------\n");
     }else if(character.id === authorId){
     
        xp.push(character.progress);
     }
     
    return `${xp.map(au => au)}`;
 
    }else if(fun === "status"){
      //  aqui equipped === true indica que é apenas para o personagem, se for false é pro mestre
      if(!equipped && character.id !== playersID.Mestre && character.id !== playersID.Rowan && character.id !== playersID.Cubo){
        var stats = ` - ${character.name}:\n\nPV (${character.status.pvMax}) = ${character.status.pvAtual}    |    PF (${character.status.pfMax}) = ${character.status.pfAtual}    |    PM (${character.status.pmMax}) = ${character.status.pmAtual}\nÚltimos acontecimentos:\n\n${character.status.log.map((log, i, array) => i < (array.length - 1) ? ` - ${log}` : `-> ${log}.`
        ).join(";\n")}`
        
      return `${stats}\n\n---------------------\n`;
      
      }else if(character.id === authorId){
        var stats = `PV (${character.status.pvMax}) = ${character.status.pvAtual}    |    PF (${character.status.pfMax}) = ${character.status.pfAtual}    |    PM (${character.status.pmMax}) = ${character.status.pmAtual}\n\nÚltimos acontecimentos:\n\n${character.status.log.map((log, i, array) => i < (array.length - 1) ? ` - ${log}` : ` -> ${log}.`
        ).join(";\n")}`
        
      return `${stats}\n\n`;
      }
    }else{
    if(ID === "cube"){
      var equippedItems = character.items;
    }else{
      var equippedItems = equipped === true ? character.items.filter(item => item.equipped) :  character.items.filter(item => !item.equipped);
    }
    var equippedPockets = equipped === true ? character.pockets.filter(item => item.equipped) : character.pockets.filter(item => !item.equipped);
      
    totalWeightAllPockets = equippedItems.reduce((acc, item) => Number((acc + item.weight * item.quantity).toFixed(3)), 0);
    totalWeightMainPockets = equippedItems.reduce((acc, item) => {
      if(item.pocket !== "Corpo" && item.pocket !== "Chão"){
      return acc + item.weight * item.quantity;
      }
      return acc;
    }, 0).toFixed(3);
      const itemsByPocket = equippedItems.reduce((pocketMap, item) => {
        let pocket = item.pocket;

          if (!pocketMap[pocket]) {
            pocketMap[pocket] = [];
          }
          pocketMap[pocket].push(item);
        return pocketMap;
      }, {});
      
    
    if (fun === "all" && character.id !== playersID.Mestre && character.id !== playersID.Rowan) {
      const pocketsInfo = Object.keys(itemsByPocket).map(pocket => {
        const totalWeight = itemsByPocket[pocket].reduce((acc, item) => Number((acc + item.weight * item.quantity).toFixed(3)), 0);
      return `Peso em ${pocket}: ${totalWeight}kg`;
      }).join("\n\n");
      
      return ` - ${character.name}${character.id !== "cube" ? `\n\n${pocketsInfo}` : ``}` + `\n\n-> Peso total: ${totalWeightAllPockets}Kg <-\n\n---------------------\n`;
    } else if (authorId === character.id) {
      let pocketsInfo;
      if (fun === "pockets"){
        pocketsInfo = equippedPockets.map(pocket => {
          
          let totalWeight;
          try{
            totalWeight = itemsByPocket[pocket.name].reduce((acc, item) => Number((acc + item.weight * item.quantity).toFixed(3)), 0);
          }catch (error){
            totalWeight = false;
          }
          
        if(allPockets === true){
        return ` -> ${pocket.name} - ${totalWeight !== false ? `${totalWeight}Kg`: "Vazio"}\n`;
      }else if(pocket.name !== "Chão" && pocket.name !== "Corpo"){
        return ` -> ${pocket.name} - ${totalWeight !== false ? `${totalWeight}Kg`: "Vazio"}\n`;
      }
      });
      pocketsInfo.push(`Estes compartimentos estão ${equipped === true ? "equipados":"desequipados"} e o peso de todos juntos é ${allPockets === true ? totalWeightAllPockets : totalWeightMainPockets}Kg.\n\n`);
      
      }else{
        pocketsInfo = Object.keys(itemsByPocket).map(pocket => {
        const totalWeight = itemsByPocket[pocket].reduce((acc, item) => Number((acc + item.weight * item.quantity).toFixed(3)), 0);
        const itemList = itemsByPocket[pocket]
          .map((item) => ` - ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${Number((item.weight * item.quantity).toFixed(3))}Kg\nDescrição: ${item.desc}`)
          .join("\n\n");

        return `Itens em "${pocket}" (${totalWeight}Kg):\n\n${itemList}\n\n---------------------\n`;
      });
      
      pocketsInfo.push(`Peso total: ${totalWeightAllPockets}Kg\n\n`);
        
      }
      
      return pocketsInfo.join("\n");
      
    }}
    
  };

  return CHARACTERS1.map(formatCharacter).filter(Boolean).join("\n").replace(/^\t+/gm, "");

};


module.exports = {
  getFormattedCharacters,
};
