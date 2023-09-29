const { Menu } = require("@grammyjs/menu");
const { getFormattedCharacters } = require("../utils");
const { playersID } = require("../constants/characters");

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
    if (notifications.has(ctx.from.id)) {
      notifications.delete(ctx.from.id);
    }
    ctx.editMessageText("Bem vindo ao bot de itens! O que posso carregar por você hoje?");
  });

const notifications = new Set();

function toggleNotifications(id) {
  if (!notifications.delete(id)) notifications.add(id);
}

const mainMenu = new Menu("main-menu")
  .text(
    (ctx) => (ctx.from && notifications.has(ctx.from.id) ? "Fechar lista de itens" : "Abrir lista de itens"),
    async (ctx) => {
      toggleNotifications(ctx.from.id);

      if (notifications.has(ctx.from.id)) {
        ctx.editMessageText(await getFormattedCharacters(ctx.update.callback_query.from.id));
      } else {
        ctx.editMessageText(`Bem vindo ao bot de itens! O que posso carregar por você hoje?`);
      }
    }
  )
  .row()
  .submenu("Adicionar item", "item-add-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu adicionar um item! Escolha onde");
  })
  .submenu("Remover item", "item-remove-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu remover um item! Escolha de onde");
  })
  .submenu("Modificar item", "item-modify-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu modificar um item! Escolha de onde");
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
    ctx.editMessageText("Bem vindo ao bot de itens! O que posso carregar por você hoje?");
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
    if (notifications.has(ctx.from.id)) {
      notifications.delete(ctx.from.id);
    }
    ctx.editMessageText("Bem vindo ao bot de itens! O que posso carregar por você hoje?");
  });

const DgMMenu = new Menu("Dungeon-Master-menu").submenu("Listar itens dos players", "list-itens-players", (ctx) => {
  ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
});

const P = [
  new Set(), // Abbadon'[0]
  new Set(), // Fergus  [1]
  new Set(), // Tibius  [2]
  new Set(), // Cubo    [3]
  new Set(), // Todos   [4]
];

function deleteP(excp) {
  P.forEach((conjunto, i) => {
    if (excp !== i) conjunto.clear();
  });
}

function toggleP(id, excp) {
  if (!P[excp].delete(id)) P[excp].add(id);
}

const listPlayersMenu = new Menu("list-itens-players")
  .text(
    (ctx) => (ctx.from && P[0].has(playersID.Abbadon) ? "🍺" : "Abbadon"),
    async (ctx) => {
      deleteP(0);
      toggleP(playersID.Abbadon, 0);

      if (P[0].has(playersID.Abbadon)) {
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Abbadon, "any")}ˆˆEstes são os itens de Abbadonˆˆ`);
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
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Fergus, "any")}ˆˆEstes são os itens de Fergusˆˆ`);
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
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Tibius, "any")}ˆ˜Estes são os itens de Tibiusˆˆ`);
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
        ctx.editMessageText(`${await getFormattedCharacters(playersID.Cubo, "any")}ˆ˜Estes são os itens no Cuboˆˆ`);
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
        ctx.editMessageText(`${await getFormattedCharacters("any", "all")}ˆˆEstes são os itens de todosˆˆ`);
      } else {
        ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
      }
    }
  );

module.exports = {
  notifications,
  toggleNotifications,
  P,
  deleteP,
  toggleP,
  itemRemoveMenu,
  itemAddMenu,
  mainMenu,
  listPlayersMenu,
  DgMMenu,
  itemModifyMenu,
};
