import { conversations, createConversation } from "@grammyjs/conversations";
import { bot } from "./config/botConfig";
import { addItem, removeItem, modifyItem, addCube, removeCube } from "./handlers";
import { itemRemoveMenu, itemAddMenu, mainMenu, DgMMenu, listPlayersMenu, itemModifyMenu, toggleNotifications, notifications } from "./menus/";
import { getFormattedCharacters } from "./utils";
import { CHARACTERS } from ".'/constants/characters";

bot.use(conversations());
bot.use(createConversation(addItem, "add-item"));
bot.use(createConversation(removeItem, "remove-item"));
bot.use(createConversation(modifyItem,"modify-item"));
bot.use(createConversation(addCube,"add-cube"));
bot.use(createConversation(removeCube, "remove-cube"));

bot.use(DgMMenu);
DgMMenu.register(listPlayersMenu);

bot.use(mainMenu);
mainMenu.register(itemAddMenu);
mainMenu.register(itemRemoveMenu);
mainMenu.register(itemModifyMenu);

bot.command("start", async (ctx) => {
  
  console.log(ctx.update.message);
  if(ctx.update.message.from.id === 744974273){
  
    await ctx.reply("Seja bem vindo Dungeon Master!", { reply_markup: DgMMenu });
    
  }else{
    if(notifications.has(ctx.update.message.from.id)){
      notifications.delete(ctx.update.message.from.id);
    }
    await ctx.reply(`Bem vindo ao bot de itens! O que posso carregar por você hoje?`, { reply_markup: mainMenu });
  }
});


bot.command("add", async (ctx) => {
  
  console.log(ctx.update.message);
  await ctx.reply("Você escolheu adicionar um item!", { reply_markup: itemAddMenu });
});

bot.command("remove", async (ctx) => {
  await ctx.reply("Vocẽ escolheu remover um item!", { reply_markup: itemRemoveMenu });
});

bot.command("list", async (ctx) => {
  await ctx.reply("Você escolheu listar os itens!");
  await ctx.reply(await getFormattedCharacters(ctx.update.message.from.id));
});

/*bot.command("numerorifa", async (ctx) => {
  for(let i=0; i<2 ; i++){
    const min = Math.ceil(141);
    const max = Math.floor(155);
    var numero = Math.floor(Math.random() * ( max - min) +min);
    console.log(numero);
   ctx.reply(`Os numeros da rifa de gustavo é: ${numero}`);
  }
});*/


bot.api.setMyCommands([
  { command: "start", description: "Inicia o bot" },
  { command: "add", description: "Adiciona um item ao inventário" },
  { command: "remove", description: "Remove um item do inventário" },
  { command: "list", description: "Lista os itens do inventário de todos os personagens" },
  //{ command: "numerorifa", description: 'rifa'},
]);

bot.start();


