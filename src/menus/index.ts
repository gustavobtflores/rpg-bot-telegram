import { Menu } from "@grammyjs/menu";
import { MyContext } from "../config/botConfig";
import { getFormattedCharacters } from "../utils";
import { playersID } from "../constants/characters.ts";



const itemAddMenu = new Menu<MyContext>("item-add-menu")
  .text("Meu inventário", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-item");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("add-cube");
  })
  .row()
  .back("⏪ Voltar", (ctx) => {
    ctx.editMessageText("Bem vindo ao bot de itens! O que posso carregar por você hoje?");
  });

const mainMenu = new Menu<MyContext>("main-menu")
  .text("Ver lista de itens", async (ctx) => {
    ctx.editMessageText(await getFormattedCharacters(ctx.update.callback_query.from.id));
  }).row()
  .submenu("Adicionar item", "item-add-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu adicionar um item!");
  })
  .submenu("Remover item","item-remove-menu", async (ctx) => {
    ctx.editMessageText("Você escolheu remover um item! Escolha de onde.");
  });
  // .submenu("Modificar inventário", "item-modify-menu", async (ctx) => {
  // //   ctx.editMessageText("Escolha que inventário vocẽ quer modificar:");
  // });
  
const itemModifyMenu = new Menu<MyContext>("item-modify-menu")
  .text("Meu inventário", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("modify-item");
  })
  .text("Inventário do cubo", (ctx) => {
    ctx.reply("Ainda não tem cubo para editar");
  })
  .row()
  .back("⏪ Voltar", (ctx) => {
    ctx.editMessageText("Bem vindo ao bot de itens! O que posso carregar por você hoje?")
  }) 

const itemRemoveMenu = new Menu<MyContext>("item-remove-menu")
  .text("Meu inventário", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-item");
  })
  .text("Inventário do cubo", async (ctx) => {
    ctx.api.deleteMessage(ctx.update.callback_query.message.chat.id, ctx.update.callback_query.message.message_id);
    await ctx.conversation.enter("remove-cube");
  })
  .row()
  .back("⏪ Voltar", (ctx) => {
    ctx.editMessageText("Bem vindo ao bot de itens! O que posso carregar por você hoje?");
  });
  
const DgMMenu = new Menu<MyContext>("Dungeon-Master-menu")
  .submenu("Listar itens dos players", "list-itens-players", (ctx) => {
    ctx.editMessageText("Escolha de que personagem deseja ver os itens.");
  });
  
const listPlayersMenu = new Menu<MyContext>("list-itens-players")
  .text("Abbadon", async (ctx) => {
    ctx.editMessageText(`${await getFormattedCharacters(playersID.Abbadon, "any")}ˆˆEstes são os itens de Abbadonˆˆ`);
  }).text("Fergus", async (ctx) => {
    ctx.editMessageText(`${await getFormattedCharacters(playersID.Fergus, "any")}ˆˆEstes são os itens de Fergusˆˆ`);
  })
  .text("Rowan", async (ctx) => {
    ctx.editMessageText(`${await getFormattedCharacters(playersID.Rowan, "any")}ˆˆEstes são os itens de Rowanˆˆ`);
  }).text("Tibius", async (ctx) => {
    ctx.editMessageText(`${await getFormattedCharacters(playersID.Tibius, "any")}ˆ˜Estes são os itens de Tibiusˆˆ`);
  }).row().back("⏪ Voltar", async (ctx) => {
    ctx.editMessageText("Seja bem vindo Dungeon Master!");
  }).text("Cubo")
  .text("Todos", async (ctx) => {
    ctx.editMessageText(`${await getFormattedCharacters("any", "all")}ˆˆEstes são os itens de todosˆˆ`);
  });

export { itemRemoveMenu, itemAddMenu, mainMenu, listPlayersMenu, DgMMenu, itemModifyMenu };
