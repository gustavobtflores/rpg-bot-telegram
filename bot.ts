import { Menu } from "@grammyjs/menu";
import { Bot, Context, session } from "grammy";
import "dotenv/config";
import { type Conversation, type ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { getFormattedCharacters } from "./utilities";
import { CHARACTERS } from "./characters";
import { Api, InlineKeyboard } from "https://deno.land/x/grammy@v1.18.1/mod.ts";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const botApiToken = process.env.BOT_API_TOKEN || "";
const bot = new Bot<MyContext>(botApiToken);

/**
 * Add an item to the author's character
 * @param conversation - Current conversation
 * @param ctx - Context
 */
 
async function addItem(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("Qual o nome do item e o seu peso?\nExemplo: <nome do item>, <peso");
  const { message } = await conversation.wait();

  console.log(message);

  const itemModel = /^[a-zA-Z\s]+,\s*\d+,\s*\d+,\s*[a-zA-Z\s]+$/;
  
  const test = itemModel.test(message.text);
  
  if (!message || !message.text || message.text.trim().length === 0 || test === false) {
    
    ctx.reply("Ta errado alguma coisa que tu digitou ai meu colega\n/start");
    return;
  }
  
  const authorId = message.from.id;
  const authorCharacter = CHARACTERS.find((character) => character.id === String(authorId));
  const chatID = message.chat.id;
  
  switch (chatID) {
  case 587760655:
    // Código a ser executado quando a expressão é igual a valor1
    ctx.reply("isso é um chat privado");
    break;
  case -946652366:
    // Código a ser executado quando a expressão é igual a valor2
    ctx.reply("Isso é um grupo");
    break;
  // Mais casos podem ser adicionados conforme necessário
  default:
    return ctx.reply("Vocẽ ainda não está cadastrado.");
    // Código a ser executado quando nenhum caso coincide com a expressão
}


  if (!authorCharacter) {
    ctx.reply("Você ainda não possui um personagem.");
    return;
  }
  var listaItens = message.text.split(',');
  const item = {
    name: listaItens[0].trim(),
    weight: parseInt(listaItens[1], 10),
    quantity: listaItens[2],
    description: listaItens[3]
  };

  const confirmaAdicao = new InlineKeyboard("Confirma-adição")
    .text("Sim", (ctx) => {
      authorCharacter.items.push(item);
      ctx.reply(`Item ${item.name} adicionado ao personagem ${authorCharacter.name}.`);
    })
    .text("Não", (ctx) => {
      ctx.reply("Aqui eu tenho que fazer o bagulho voltar ao inicio.");
    });
  ctx.reply(`Este é o item que deseja adicionar: ${item}\n\n confirma?`,{reply_markup: confirmaAdicao});
  
  ctx.reply(`id desse chat ${message.chat.id}`);
  
}

async function movie(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply("How many favorite movies do you have?");
  const count = await conversation.form.number();
  const movies: string[] = [];
  for (let i = 0; i < count; i++) {
    await ctx.reply(`Tell me number ${i + 1}!`);
    const titleCtx = await conversation.waitFor(":text");
    movies.push(titleCtx.msg.text);
  }
  await ctx.reply("Here is a better ranking!");
  movies.sort();
  await ctx.reply(movies.map((m, i) => `${i + 1}. ${m}`).join("\n"));
}

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(addItem, "add-item"));
bot.use(createConversation(movie,"filme"));

const itemMenu = new Menu<MyContext>("item-menu")
  .text("Meu inventário", async (ctx) => {
    await ctx.conversation.enter("add-item");
  }).row()
  .text("Inventário do cubo", (ctx) => {
    ctx.reply("Ainda não tem cubo para editar");
  });


bot.use(itemMenu);

const mainMenu = new Menu<MyContext>("main-menu")
  .text("Ver lista de personagens", (ctx) => {
    ctx.reply(getFormattedCharacters());
  })
  .text("Adicionar item", async (ctx) => {
    await ctx.reply("Escolha que inventário quer adicionar um item:", {reply_markup: itemMenu});
  }).row()
  .text("Guardar filmes favoritos", async (ctx) => {
    await ctx.conversation.enter("filme");
  });


bot.use(mainMenu);


bot.command("start", async (ctx) => {
  await ctx.reply("Bem vindo ao bot de itens!", { reply_markup: mainMenu });
});

const fs = require('fs');
// Nome do arquivo que você deseja ler
const nomeArquivo = 'characters.js';
// Use o método fs.readFile para ler o arquivo
fs.readFile(nomeArquivo, 'utf8', (erro, dados) => {
  if (erro) {
    console.error('Erro ao ler o arquivo:', erro);
    return;
  }
  console.log('Conteúdo do arquivo:', dados);
});

var numero = '     838338     8 ';
numero = numero.trim();
const numeroNumero = parseInt(numero,10);

console.log('pinto\n',numero,'\n',numeroNumero);

bot.start();
