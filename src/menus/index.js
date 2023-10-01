const { Menu } = require("@grammyjs/menu");
const { getFormattedCharacters } = require("../utils");
const { playersID } = require("../constants/characters");

const P = [
  new Set(), // Abbadon/Equipados'   [0]
  new Set(), // Fergus/Desequipados  [1]
  new Set(), // Tibius/Cubo          [2]
  new Set(), // Cubo/                [3]
  new Set(), // Todos                [4]
];
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
        ctx.editMessageText(`${await getFormattedCharacters("cube", true, "allItems")}ˆ˜Estes são os no cuboˆˆ`);
      } else {
        ctx.editMessageText("Você escolheu listar seus itens! Escolha de onde");
      }
    }).row()
    .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
    });
  

const itemAddMenu = new Menu("item-add-menu")
  .text("Meu inventário", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-item");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-cube");
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  });

const mainMenu = new Menu("main-menu")
  .submenu("Principal", "inventory-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu o inventário principal! Escolha o que quer fazer");
  })
  .submenu("Cubo", "cube-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu o inventário do cubo! Escolha o que quer fazer");
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
        ctx.editMessageText("Você escolheu o inventário principal! Escolha o que quer fazer");
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
        ctx.editMessageText("Você escolheu o inventário principal! Escolha o que quer fazer");
      }
    })
  .row()
  .text("Adicionar itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-item");
  })
  .text("Remover itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-item");
  })
  .text("Modificar itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-item");
  }).row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  })
  .text("Equipar itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("equip-item");
  })
  .text("Desequipar itens", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("unequip-item");
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
        ctx.editMessageText(`${await getFormattedCharacters("cube", true, "allItems")}ˆ˜Estes são os no cuboˆˆ`);
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
  .text("Meu inventário", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-item");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-cube");
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  });

const itemRemoveMenu = new Menu("item-remove-menu")
  .text("Meu inventário", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-item");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-cube");
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  });
  
const equipItemMenu = new Menu("equip-item-menu")
  .text("Equipar item", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("equip-item");
  })
  .text("Desequipar item", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("unequip-item");
  })
  .row()
  .back("⏪ Voltar", async (ctx) => {
    deleteP(9);
    ctx.editMessageText("Bem vindo ao bot de itens! Que inventário quer usar?");
  });

const DgMMenu = new Menu("Dungeon-Master-menu")
  .submenu("Listar itens dos players", "list-itens-players", (ctx) => {
  ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
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
  equipItemMenu,
  cubeMenu,
  inventoryMenu
};
