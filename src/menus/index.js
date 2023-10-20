const { Menu, MenuRange } = require("@grammyjs/menu");
const { getFormattedCharacters } = require("../utils");
const { playersID } = require("../constants/characters");
const { deleteItem, catchItem } = require("../config/storage");


const menuHelp = new Menu("menu-help")
  .text("❎", (ctx) => ctx.deleteMessage());

async function recoverPvPf(idStats){
  
  const CHARS = await catchItem("characters");

  await idStats.forEach((value, i) => {
      const char = CHARS.find(id => id.name === value);
      if(!P[4].has("mana")){  
        char.status.pvAtual = char.status.pvMax;
        char.status.pfAtual = char.status.pfMax;
        char.status.log.push("Recuperação total PV e PF");
      }else{
        char.status.pmAtual = (char.status.pmAtual - 8) < 0 ? 0 : char.status.pmAtual - 8;
        char.status.log.push("Novo raiar do dia +8 PM");
      }
      if(char.status.log.length > 5){
          char.status.log.shift();
      }
  });
  await deleteItem("characters", CHARS);
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
    }).row()
    .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
    });
  

const itemAddMenu = new Menu("item-add-menu")
  .text("Itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-item");
  })
  .text("Compartimentos", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-pockets");
  }).row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-cube");
  });

const mainMenu = new Menu("main-menu")
  .submenu("Itens", "inventory-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu o inventário itens! Escolha o que quer fazer");
  })
  .submenu("Compartimentos", "pockets-menu", async (ctx) =>{
    ctx.editMessageText("Você escolheu o inventário de compartimentos! Escolha o que quer fazer")
  })
  .submenu("Cubo", "cube-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu o inventário do cubo! Escolha o que quer fazer");
  }).row()
  .text(
    (ctx) => (ctx.from && P[0].has("status") ?"❌ Status" : "⭕ Status"),
    async (ctx) => {
      deleteP(0);
      toggleP("status", 0);

      if (P[0].has("status")) {
        ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, true, "status")}ˆˆEstes são os seus status por enquantoˆˆ`);
      } else {
        ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
      }
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
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-item");
  })
  .text("Remover", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-item");
  })
  .text("Modificar", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-item");
  }).row()
  .back("⏪", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Transferir", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
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
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-pockets");
  })
  .text("Remover", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-pockets");
  })
  .text("Modificar", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-pockets");
  }).row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Equipar", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("equip-pockets");
  })
  .text("Desequipar", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("unequip-pockets");
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
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-cube");
  })
  .text("Remover itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-cube");
  })
  .text("Modificar itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-cube");
  });

const itemModifyMenu = new Menu("item-modify-menu")
  .text("Itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-item");
  })
  .text("Compartimentos", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-pockets");
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-cube");
  });

const itemRemoveMenu = new Menu("item-remove-menu")
  .text("Itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-item");
  })
  .text("Compartimentos", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-pockets");
  }).row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-cube");
  });
  
const equipPocketMenu = new Menu("equip-pocket-menu")
  .text("Equipar compartimento", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("equip-pockets");
  })
  .text("Desequipar compartimento", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("unequip-pockets");
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  });

const DgMMenu = new Menu("Dungeon-Master-menu")
  .submenu("Listar itens dos players", "list-itens-players", (ctx) => {
    ctx.editMessageText("Escolha de que personagem deseja ver os itens.");}
    )
  .submenu("Alterar status dos players", "players", async (ctx) => {
    await ctx.editMessageText(`${await getFormattedCharacters(ctx.from.id, false, "status")}\n\nˆˆEstes são os status dos personagens atualmenteˆˆ\n\nSelecione qual personagem quer alterar cada status individualmente ou recupere tudo de uma vez.`);
}); 

function statusReset(){
   for (let i = 0; i < statusValue.length; i++) {
   for (let j = 0; j < statusValue[i].length; j++) {
    statusValue[i][j] = 0;
  }
}
  idStatus = [];
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
  .submenu("Recuperar Mana Pool (8)", "full-recover-all", (ctx) => {
    idStatus = ["Tibius", "Abbadon", "Fergus"];
    toggleP("mana", 4);
    ctx.editMessageText("O Mana Pool (8) de todos os personagens serão recuperados, confirma?");
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
  await recoverPvPf(idStatus);
  idStatus = [];
  await ctx.deleteMessage();
  })
  .back("Não", async (ctx) =>{
    deleteP(9);
    ctx.editMessageText("Selecione qual personagem quer alterar cada status individualmente ou recupere tudo de uma vez.");
    });

const listPlayersMenu = new Menu("list-itens-players")
  .text(
    (ctx) => (ctx.from && P[0].has(playersID.Abbadon) ? "🍺" : "Abbadon"),
    async (ctx) => {
      deleteP(0);
      toggleP(playersID.Abbadon, 0);

      if (P[0].has(playersID.Abbadon)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Abbadon, true)}ˆˆEstes são os itens de Abbadonˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }
    }
  )

  .text(
    (ctx) => (ctx.from && P[1].has(playersID.Fergus) ? "🦁" : "Fergus"),
    async (ctx) => {
      deleteP(1);
      toggleP(playersID.Fergus, 1);

      if (P[1].has(playersID.Fergus)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Fergus, true)}ˆˆEstes são os itens de Fergusˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }
    }
  )
  .text(
    (ctx) => (ctx.from && P[2].has(playersID.Tibius) ? "🐐" : "Tibius"),
    async (ctx) => {
      deleteP(2);
      toggleP(playersID.Tibius, 2);

      if (P[2].has(playersID.Tibius)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Tibius, true)}ˆ˜Estes são os itens de Tibiusˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }
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
      deleteP(3);
      toggleP(playersID.Cubo, 3);

      if (P[3].has(playersID.Cubo)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Cubo)}ˆ˜Estes são os itens no Cuboˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }
    }
  )
  .text(
    (ctx) => (ctx.from && P[4].has(ctx.from.id) ? "♾" : "Todos"),
    async (ctx) => {
      deleteP(4);
      toggleP(ctx.from.id, 4);

      if (P[4].has(ctx.from.id)) {
        ctx.editMessageText(`${await getFormattedCharacters("any", true, "all")}ˆˆEstes são os itens de todosˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }
    }
  );
var statusName = ["PV","PF","PM"];
var statusValue = [[0,0 ,0],[0,0 ,0],[0,0 ,0]];
var n = 0;

const changeStatus = new Menu("dynamic")
  .dynamic(async () => {
    // Generate a part of the menu dynamically!
    const range = new MenuRange();
    
    for(let i = 0; i<statusName.length ;i++){
      range
        .text(`${statusName[i] === "PM" ? `${statusValue[n][2] < 0 ? `❗PM`: `PM` }` : statusName[i]}: ${statusValue[n][i] > 0 ? `+${statusValue[n][i]}`: `${statusValue[n][i]}`}`)
        .text("-3", (ctx) => {
        statusValue[n][i]-=3;
        ctx.menu.update();
        })
        .text("-", (ctx) => {
        statusValue[n][i]-=1;
        ctx.menu.update();
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
    (ctx) => (statusValue[n].every(elemento => elemento === 0) !== true && statusValue[n][2] >= 0 ? "✅" : "")
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
  menuHelp
};
