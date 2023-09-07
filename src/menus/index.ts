import { Menu } from "@grammyjs/menu";

import { MyContext } from "../config/botConfig";
import { getFormattedCharacters } from "../utils";

const itemMenu = new Menu<MyContext>("item-menu")
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
  .text("Ver lista de personagens", (ctx) => {
    ctx.reply(getFormattedCharacters());
  })
  .submenu("Adicionar item", "item-menu")
  .row();

export { itemMenu, mainMenu };
