import { Menu } from "@grammyjs/menu";

import { MyContext } from "../config/botConfig";
import { getFormattedCharacters } from "../utils";

const itemAddMenu = new Menu<MyContext>("item-add-menu")
  .text("Você escolheu adicionar um item! Escolha onde:")
  .row()
  .text("Meu inventário", async (ctx) => {
    await ctx.conversation.enter("add-item");
  })
  .text("Inventário do cubo", (ctx) => {
    ctx.reply("Ainda não tem cubo para editar");
  })
  .row()
  .back("Voltar");

const mainMenu = new Menu<MyContext>("main-menu")
  .text("Ver lista de personagens", async (ctx) => {
    ctx.reply(await getFormattedCharacters());
  }).row()
  .submenu("Adicionar item", "item-add-menu")
  .submenu("Remover item","item-remove-menu");

const itemRemoveMenu = new Menu<MyContext>("item-remove-menu")
  .text("Você escolheu remover um item! Escolha de onde:")
  .row()
  .text("Meu inventário", async (ctx) => {
    await ctx.conversation.enter("remove-item");
  })
  .text("Inventário do cubo", (ctx) => {
    ctx.reply("Ainda não tem cubo para editar");
  })
  .row()
  .back("Voltar");

export { itemRemoveMenu, itemAddMenu, mainMenu };
