const { Menu, MenuRange } = require("@grammyjs/menu");
const { getFormattedCharacters } = require("../utils");
const { playersID } = require("../constants/characters");
const { deleteItem, catchItem } = require("../config/storage");
const { InlineKeyboard } = require("grammy");

const statusMenuRange = new MenuRange()
  .text(
    (ctx) => (ctx.from && P[4].has("status") ?"❌ Listar" : "⭕ Listar"),
    async (ctx) => {
      await deleteP(4);
      await toggleP("status", 4);

      if (P[4].has("status")) {
        await ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, true, "status")}ˆˆEstes são os seus status por enquantoˆˆ`);
      } else {
        if(P[4].has("main")){
          await ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
       }else{
          await ctx.editMessageText("Você escolheu os status! Escolha o que quer fazer.");
        }
      }
    })
  .text( 
      async (ctx) =>{
        const CHARStoNotificate = await catchItem("characters")
        const charToNotificate = CHARStoNotificate.find(value => String(ctx.from.id) === value.id);
        return (charToNotificate.status.notifications ? "🔔" : "🔕")
      },
      async (ctx) =>{
        const CHARStoNotificate = await catchItem("characters")
        const charToNotificate = CHARStoNotificate.find(value => String(ctx.from.id) === value.id);
  
        if (charToNotificate.status.notifications) {
          charToNotificate.status.notifications = false;
        } else {
          charToNotificate.status.notifications = true;
        }
        await deleteItem("characters", CHARStoNotificate);
        ctx.menu.update();
      });
  

const xpMenuRange = new MenuRange()
  .text(
    (ctx) => (ctx.from && P[3].has("xp") ?"❌ Listar" : "⭕ Listar"),
    async (ctx) => {
      await deleteP(3);
      await toggleP("xp", 3);

      if (P[3].has("xp")) {
        await ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, true, "xp")}\n\nˆˆEsta é a sua relação de xp por enquantoˆˆ`);
      } else { 
        if(P[3].has("main")){
          await ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
        }else{
          await ctx.editMessageText("Você escolheu ver o seu progresso! Escolha o que quer fazer.");
        }
      }
    })
  .text("Modificar", async (ctx) =>{  
    await ctx.conversation.enter("progress");
  });
  
const rodape = new MenuRange()
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  }).text("❎ Fechar", (ctx) => ctx.deleteMessage());

const menuHelp = new Menu("menu-help")
  .text("❎", (ctx) => ctx.deleteMessage());

async function recoverPvPf(idStatus, ctx){
  
  const CHARS = await catchItem("characters");
  
  const modifiedDate = ctx.update.callback_query.message.date;

  await idStatus.forEach((value, i) => {
    
      const char = CHARS.find(id => id.name === value);
      if(!P[4].has("mana") && (char.status.pvAtual !== char.status.pvMax || char.status.pfAtual !== char.status.pfMax)) {
        
        if(char.status.notifications){
          const modPv = char.status.pvMax !== char.status.pvAtual ? `\nPV (${char.status.pvMax}): ${char.status.pvAtual} => ${char.status.pvMax}`:"";
          const modPf = char.status.pfMax !== char.status.pfAtual ? `\nPF (${char.status.pfMax}): ${char.status.pfAtual} => ${char.status.pfMax}`: "";
          
          ctx.reply(`Os seus status mudaram! Veja o que aconteceu:\n\n -> Recuperação total PV e PF\n${modPv}${modPf}`, { chat_id: parseInt(char.id)});
        }
        char.status.pvAtual = char.status.pvMax;
        char.status.pfAtual = char.status.pfMax;
        char.status.log.push("Recuperação total PV e PF");
      }
      if(char.status.log.length > 5){
          char.status.log.shift();
      }
      
      char.status.lastModified = formatDateToCustomFormat(modifiedDate);

  });
  await deleteItem("characters", CHARS);
}

function formatDateToCustomFormat() {
  const now = new Date();

  // Extract date components
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = now.getFullYear();

  // Extract time components
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  // Combine date and time
  const formattedDate = `${hours}h${minutes}m - ${day}/${month}/${year}`;
  return formattedDate;
}

const P = [
  new Set(), // Abbadon/Equipados'   [0]
  new Set(), // Fergus/Desequipados  [1]
  new Set(), // Tibius/Cubo          [2]
  new Set(), // Cubo/                [3]
  new Set(), // Todos                [4]
];
var idStatus = [];
function deleteP(excp) {
  P.forEach((conjunto, i) => {
    if (excp !== i) conjunto.clear();
  });
}

function toggleP(id, excp) {
  if (!P[excp].delete(id)) P[excp].add(id);
}

const listItemsMenu = new Menu("list-items-menu")
  .text(
    (ctx) => (ctx.from && P[0].has("equipped") ?"❌ Equipados" : "⭕ Equipados"),
    async (ctx) => {
      deleteP(0);
      toggleP("equipped", 0);

      if (P[0].has("equipped")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, true)}ˆˆEstes são os itens equipadosˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu listar seus itens! Escolha de onde");
      }
    })
  .text(
    (ctx) => (ctx.from && P[1].has("unequipped") ? "❌ Desequipados" : "⭕ Desequipados"),
    async (ctx) => {
      deleteP(1);
      toggleP("unequipped", 1);

      if (P[1].has("unequipped")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, false)}ˆˆEstes são os itens desequipadosˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu listar seus itens! Escolha de onde");
      }
    })
    .text(
    (ctx) => (ctx.from && P[2].has("cube") ? "❌ Cubo" : "⭕ Cubo"),
    async (ctx) => {
      deleteP(2);
      toggleP("cube", 2);

      if (P[2].has("cube")) {
        ctx.editMessageText(`${await getFormattedCharacters("cube", true)}ˆˆEstes são os itens no cuboˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu listar seus itens! Escolha de onde");
      }
    }).dynamic(async () => rodape);

const itemAddMenu = new Menu("item-add-menu")
  .text("Itens", async (ctx) => {
    await ctx.conversation.enter("add-item");
  })
  .text("Compartimentos", async (ctx) => {
    await ctx.conversation.enter("add-pockets");
  })
  .text("Cubo", async (ctx) => {
    await ctx.conversation.enter("add-cube");
  })
  .dynamic(async () => rodape);
        

const mainMenu = new Menu("main-menu")
  .submenu("Itens", "inventory-menu", async (ctx) => {
    try{
      ctx.editMessageText("Você escolheu o inventário itens! Escolha o que quer fazer");
    }catch(err){
      
      ctx.reply("Você escolheu o inventário itens! Escolha o que quer fazer");
    }
  })
  .submenu("Compartimentos", "pockets-menu", async (ctx) =>{
    ctx.editMessageText("Você escolheu o inventário de compartimentos! Escolha o que quer fazer")
  })
  .submenu("Cubo", "cube-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu o inventário do cubo! Escolha o que quer fazer");
  }).row()
  .text("Status:")
  .dynamic(async () => {
    await P[4].add("main");
    return statusMenuRange;
    
  })
  .row()
  .text("XP:")
  .dynamic(async () => {
    await P[3].add("main");
    return xpMenuRange;
    
  });
  
  
const inventoryMenu = new Menu("inventory-menu")
  .text(
    (ctx) => (ctx.from && P[0].has("equipped") ?"❌ Listar equipados" : "⭕ Listar equipados"),
    async (ctx) => {
      deleteP(0);
      toggleP("equipped", 0);

      if (P[0].has("equipped")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, true)}ˆˆEstes são os itens equipadosˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu o inventário de itens! Escolha o que quer fazer");
      }
    })
  .text(
    (ctx) => (ctx.from && P[1].has("unequipped") ? "❌ Listar desequipados" : "⭕ Listar desequipados"),
    async (ctx) => {
      deleteP(1);
      toggleP("unequipped", 1);

      if (P[1].has("unequipped")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, false)}ˆˆEstes são os itens desequipadosˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu o inventário de itens! Escolha o que quer fazer");
      }
    })
  .row()
  .text("Adicionar", async (ctx) => {
    await ctx.conversation.enter("add-item");
  })
  .text("Remover", async (ctx) => {
    await ctx.conversation.enter("remove-item");
  })
  .text("Modificar", async (ctx) => {
    await ctx.conversation.enter("modify-item");
  }).row()
  .back("⏪", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Transferir", async (ctx) => {
    await ctx.conversation.enter("transfer-item");
  });
  
const pocketsMenu = new Menu("pockets-menu")
  .text(
    (ctx) => (ctx.from && P[0].has("equipped") ?"❌ Listar equipados" : "⭕ Listar equipados"),
    async (ctx) => {
      deleteP(0);
      toggleP("equipped", 0);

      if (P[0].has("equipped")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, true, "pockets", true)}ˆˆEstes são os compartimentos equipadosˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu o inventário de compartimentos! Escolha o que quer fazer");
      }
    })
  .text(
    (ctx) => (ctx.from && P[1].has("unequipped") ? "❌ Listar desequipados" : "⭕ Listar desequipados"),
    async (ctx) => {
      deleteP(1);
      toggleP("unequipped", 1);

      if (P[1].has("unequipped")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, false, "pockets",true)}ˆˆEstes são os compartimentos desequipadosˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu o inventário de compartimentos! Escolha o que quer fazer");
      }
    })
  .row()
  .text("Adicionar", async (ctx) => {
    await ctx.conversation.enter("add-pockets");
  })
  .text("Remover", async (ctx) => {
    await ctx.conversation.enter("remove-pockets");
  })
  .text("Modificar", async (ctx) => {
    await ctx.conversation.enter("modify-pockets");
  }).row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Equipar", async (ctx) => {
    await ctx.conversation.enter("equip-pockets");
  })
  .text("Desequipar", async (ctx) => {
    await ctx.conversation.enter("unequip-pockets");
  });

const transferMenu = new Menu("transfer-menu")
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("🎒 Inventário principal", async (ctx) => {
    await ctx.conversation.enter("transfer-item");
  })
  .row()
  .text("Cubo:")
  .text("Inv ➡️ Cubo", async (ctx) =>{
    await ctx.conversation.enter("invCube");
  })
  .text("Cubo ➡️ Inv", async (ctx) =>{
    await ctx.conversation.enter("cubeInv");
  });
  
const cubeMenu = new Menu("cube-menu")
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text(
    (ctx) => (ctx.from && P[2].has("cube") ? "❌ Listar itens" : "⭕ Listar itens"),
    async (ctx) => {
      deleteP(2);
      toggleP("cube", 2);

      if (P[2].has("cube")) {
        ctx.editMessageText(`${await getFormattedCharacters("cube", true)}ˆ˜Estes são os no cuboˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu o inventário do cubo! Escolha o que quer fazer");
      }
    })
  .row()
  .text("Adicionar itens", async (ctx) => {
    await ctx.conversation.enter("add-cube");
  })
  .text("Remover itens", async (ctx) => {
    await ctx.conversation.enter("remove-cube");
  })
  .text("Modificar itens", async (ctx) => {
    await ctx.conversation.enter("modify-cube");
  })
  .row()
  .text("Transferir:")
  .text("Inv ➡️ Cubo", async (ctx) =>{
    await ctx.conversation.enter("invCube");
  })
  .text("Cubo ➡️ Inv", async (ctx) =>{
    await ctx.conversation.enter("cubeInv");
  });

const itemModifyMenu = new Menu("item-modify-menu")
  .text("Itens", async (ctx) => {
    await ctx.conversation.enter("modify-item");
  })
  .text("Compartimentos", async (ctx) => {
    await ctx.conversation.enter("modify-pockets");
  })
  .text("Cubo", async (ctx) => {
    await ctx.conversation.enter("modify-cube");
  })
  .dynamic(async () => rodape);

const itemRemoveMenu = new Menu("item-remove-menu")
  .text("Itens", async (ctx) => {
    await ctx.conversation.enter("remove-item");
  })
  .text("Compartimentos", async (ctx) => {
    await ctx.conversation.enter("remove-pockets");
  })
  .text("Cubo", async (ctx) => {
    await ctx.conversation.enter("remove-cube");
  })
  .dynamic(async () => rodape);
  
const equipPocketMenu = new Menu("equip-pocket-menu")
  .text("Equipar compartimento", async (ctx) => {
    await ctx.conversation.enter("equip-pockets");
  })
  .text("Desequipar compartimento", async (ctx) => {
    await ctx.conversation.enter("unequip-pockets");
  })
  .dynamic(async () => rodape);
  
const statusMenu = new Menu("status-menu")
  .dynamic(async () => {
    await P[4].delete("main");
    return statusMenuRange;
  })
  .dynamic(async () => rodape);
  
const xpMenu = new Menu("xp-menu")
  .dynamic(async () => {
    await P[3].delete("main");
    return xpMenuRange;
  })
  .dynamic(async () => rodape);
  
  
const DgMMenu = new Menu("Dungeon-Master-menu")
  .submenu("Itens", "list-itens-players", (ctx) => {
    ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
  })
  .submenu("Status", "players", async (ctx) => {
    await ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, false, "status")}\n\nˆˆEstes são os status dos personagens atualmenteˆˆ\n\nSelecione qual personagem quer alterar cada status individualmente ou recupere tudo de uma vez.`);
  }).submenu("Progresso", "progress", async (ctx) =>{
    await ctx.editMessageText("Escolha de que personagem quer ver a relação de XP.");
  });
  
const progressMenu = new Menu("progress")
  .text(
    (ctx) => (ctx.from && P[0].has(playersID.Abbadon) ? "🍺" : "Abbadon"),
    async (ctx) => {
      deleteP(0);
      toggleP(playersID.Abbadon, 0);

      if (P[0].has(playersID.Abbadon)) {
        await ctx.editMessageText(`${await getFormattedCharacters(playersID.Abbadon, true, "xp")}\n\nˆˆEsta é a relação de XP de Abbadonˆˆ`);
      } else {
    await ctx.editMessageText("Escolha de que personagem quer ver a relação de XP.");
      }
    }
  )
  .text(
    (ctx) => (ctx.from && P[1].has(playersID.Fergus) ? "🦁" : "Fergus"),
    async (ctx) => {
      deleteP(1);
      toggleP(playersID.Fergus, 1);

      if (P[1].has(playersID.Fergus)) {
        await ctx.editMessageText(`${await getFormattedCharacters(playersID.Fergus, true, "xp")}\n\nˆˆEsta é a relação de XP de Fergusˆˆ`);
      } else {
    await ctx.editMessageText("Escolha de que personagem quer ver a relação de XP.");
      }
    }
  )
  .text(
    (ctx) => (ctx.from && P[2].has(playersID.Tibius) ? "🐐" : "Tibius"),
    async (ctx) => {
      deleteP(2);
      toggleP(playersID.Tibius, 2);

      if (P[2].has(playersID.Tibius)) {
        await ctx.editMessageText(`${await getFormattedCharacters(playersID.Tibius,true, "xp")}\n\nˆˆEsta é a relação de XP de Tibiusˆˆ`);
      } else {
    await ctx.editMessageText("Escolha de que personagem quer ver a relação de XP.");
      }
    }
  )
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Seja bem vindo Dungeon Master!");
  })
  .text(
    (ctx) => (ctx.from && P[4].has(ctx.from.id) ? "♾" : "Todos"),
    async (ctx) => {
      deleteP(4);
      toggleP(ctx.from.id, 4);

      if (P[4].has(ctx.from.id)) {
        await ctx.editMessageText(`${await getFormattedCharacters("any",false,"xp")}\n\nˆˆEsta é a relação de XP de todosˆˆ`);
      } else {
    await ctx.editMessageText("Escolha de que personagem quer ver a relação de XP.");
      }
    }
  );;
    

var n =0;

function statusReset(){
   for (let i = 0; i < statusValue.length; i++) {
   for (let j = 0; j < statusValue[i].length; j++) {
    statusValue[i][j] = 0;
  }
}
  idStatus = [];
  n =0;
}

const playerss = new Menu("players")
  .submenu((ctx) => (P[0].size !== 0 ? "Recuperar totalmente PV e PF dos selecionados" : ""), 'full-recover-all',(ctx) => {
    idStatus = Array.from(P[0]);
    ctx.editMessageText(`O PV e PF dos personagens ${idStatus.map(value => value).join(", ")} serão recuperados totalmente, confirma?`);
  })
  .row()
  .submenu("Recuperar totalmente PV e PF de todos", "full-recover-all", (ctx) => {
    idStatus = ["Tibius", "Abbadon", "Fergus"];
    ctx.editMessageText("O PV e PF de todos os personagens serão recuperados totalmente, confirma?");
  })
  .row()
  .text(
    (ctx) => (P[0].has("Abbadon") ? "✅ Abbadon" : "Abbadon"),
    async (ctx) => {
    toggleP("Abbadon", 0);
    ctx.menu.update();
    
  })
  .text(
    (ctx) => (P[0].has("Fergus") ? "✅ Fergus" : "Fergus"),
    async (ctx) => {
    toggleP("Fergus", 0);
    ctx.menu.update();
  })
  .text(
    (ctx) => (P[0].has("Tibius") ? "✅ Tibius" : "Tibius"),
    async (ctx) => {
    toggleP("Tibius", 0);
    ctx.menu.update();
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Seja bem vindo Dungeon Master!");
  }).submenu(
    (ctx) => (P[0].size !== 0 ? "Confirmar ✅" : ""), "dynamic", async ctx =>{
    idStatus = Array.from(P[0]);
    const CHARS2 = await catchItem("characters");
    const char2 = CHARS2.find(value => value.name === idStatus[0]);
    ctx.editMessageText(`Você está agora editando os status de ${idStatus[0]}\n\n${await getFormattedCharacters(char2.id,true,"status")}`)
  });
  
const fullRecoverAll = new Menu("full-recover-all")
  .text("Sim", async (ctx) => {
  await recoverPvPf(idStatus, ctx);
  idStatus = [];
  await ctx.editMessageText("Status recuperados com sucesso!", {reply_markup: new InlineKeyboard()});
  })
  .back("Não", async (ctx) =>{
    deleteP(9);
    ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, false, "status")}\n\nˆˆEstes são os status dos personagens atualmenteˆˆ\n\nSelecione qual personagem quer alterar cada status individualmente ou recupere tudo de uma vez.`);
    });

const listPlayersMenu = new Menu("list-itens-players")
  .text(
    (ctx) => (ctx.from && P[0].has(playersID.Abbadon) ? "🍺" : "Abbadon"),
    async (ctx) => {

      try{

      deleteP(0);
      toggleP(playersID.Abbadon, 0);

      if (P[0].has(playersID.Abbadon)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Abbadon, true)}ˆˆEstes são os itens de Abbadonˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }}catch(err){}
    }
  )

  .text(
    (ctx) => (ctx.from && P[1].has(playersID.Fergus) ? "🦁" : "Fergus"),
    async (ctx) => {

      try{
      deleteP(1);
      toggleP(playersID.Fergus, 1);

      if (P[1].has(playersID.Fergus)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Fergus, true)}ˆˆEstes são os itens de Fergusˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }}catch(err){}
    }
  )
  .text(
    (ctx) => (ctx.from && P[2].has(playersID.Tibius) ? "🐐" : "Tibius"),
    async (ctx) => {
      
      try{
      deleteP(2);
      toggleP(playersID.Tibius, 2);

      if (P[2].has(playersID.Tibius)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Tibius, true)}ˆˆEstes são os itens de Tibiusˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }}catch(err){}
    }
  )
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Seja bem vindo Dungeon Master!");
  })
  .text(
    (ctx) => (ctx.from && P[3].has(playersID.Cubo) ? "📦" : "Cubo"),
    async (ctx) => {
      try{
      deleteP(3);
      toggleP(playersID.Cubo, 3);

      if (P[3].has(playersID.Cubo)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Cubo)}ˆˆEstes são os itens no Cuboˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }}catch(err){}
    }
  )
  .text(
    (ctx) => (ctx.from && P[4].has(ctx.from.id) ? "♾" : "Todos"),
    async (ctx) => {
      try{
      deleteP(4);
      toggleP(ctx.from.id, 4);

      if (P[4].has(ctx.from.id)) {
        ctx.editMessageText(`${await getFormattedCharacters("any", true, "all")}ˆˆEstes são os itens de todosˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }}catch(err){}
    }
  );
var statusName = ["PV","PF","PM"];
var statusValue = [[0,0 ,0],[0,0 ,0],[0,0 ,0]];

const changeStatus = new Menu("dynamic")
  .dynamic(async () => {
    // Generate a part of the menu dynamically!
    const range = new MenuRange();  
    const CHARS1 = await catchItem("characters");
    const authorCharacter = CHARS1.find(char => char.name.toLowerCase() === idStatus[n].toLowerCase());
    for(let i = 0; i<statusName.length ;i++){
      range
        .text(`${statusName[i]}: ${statusValue[n][i] > 0 ? `+${statusValue[n][i]}`: `${statusValue[n][i]}`}`)
        .text("-3", (ctx) => {
         let tempValue = statusValue[n][i];
         if(i === 2){
           statusValue[n][i]-=3;
           let testeNegativo = statusValue[n][i] + authorCharacter.status.pmAtual;
             while (testeNegativo<0) {
               statusValue[n][i] += 1;
               testeNegativo = statusValue[n][i] + authorCharacter.status.pmAtual;
             }
         }else{
           statusValue[n][i]-=3;
         }
         let test = tempValue === statusValue[n][i];
         if(!test){
          ctx.menu.update();
         }
        })
        .text("-", (ctx) => {
         let tempValue = statusValue[n][i];
         if(i === 2){
           statusValue[n][i]-=1;
           let testeNegativo = statusValue[n][i] + authorCharacter.status.pmAtual;
             while (testeNegativo<0) {
               statusValue[n][i] += 1;
               testeNegativo = statusValue[n][i] + authorCharacter.status.pmAtual;
             }
         }else{
           statusValue[n][i]-=1;
         }
         let test = tempValue === statusValue[n][i];
         if(!test){
          ctx.menu.update();
         }
        })
        .text("+", (ctx) => {
          statusValue[n][i]+=1;
          ctx.menu.update();
        })
        .text("+3", (ctx) => {
          statusValue[n][i]+=3;
          ctx.menu.update();
        }).row()
    }
    return range;
  })
  .back("⏪ Voltar", async (ctx) => {
    await deleteP(9);
    await statusReset();
    ctx.editMessageText("Selecione qual personagem quer alterar cada status individualmente ou recupere tudo de uma vez.");
  })
  .text("❎", (ctx) => ctx.deleteMessage())
  .text(
    (ctx) => (statusValue[n].every(elemento => elemento === 0) !== true ? "✅" : "")
    ,  async (ctx) => {
      
    const CHARS1 = await catchItem("characters");
    if(P[0].size === 3){
      n+=1;
      const char1 = CHARS1.find(item => item.name === idStatus[n]);
      if(n > 2) {
        await ctx.deleteMessage();
        await ctx.conversation.enter("status");
      }else{
      ctx.editMessageText(`Você está agora editando os status de ${idStatus[n]}\n\n${await getFormattedCharacters(char1.id,true,"status")}`);
      }
    }else if(P[0].size === 2){
      n+=1;
      const char1 = CHARS1.find(item => item.name === idStatus[n]);
      if(n > 1) {
        await ctx.deleteMessage();
        await ctx.conversation.enter("status");
      }else{
      ctx.editMessageText(`Você está agora editando os status de ${idStatus[n]}\n\n${await getFormattedCharacters(char1.id,true,"status")}`);
      }
      }else if(P[0].size === 1){
        await ctx.deleteMessage();
        await ctx.conversation.enter("status");
    }
  });


module.exports = {
  P,
  deleteP,
  toggleP,
  itemRemoveMenu,
  itemAddMenu,
  mainMenu,
  listPlayersMenu,
  DgMMenu,
  itemModifyMenu,
  listItemsMenu,
  equipPocketMenu,
  cubeMenu,
  inventoryMenu,
  changeStatus,
  playerss,
  statusReset,
  statusValue,
  idStatus,
  fullRecoverAll,
  pocketsMenu,
  menuHelp,
  idStatus,
  progressMenu,
  statusMenu,
  xpMenu,
  transferMenu
};
