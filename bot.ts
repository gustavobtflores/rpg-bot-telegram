import { Menu } from "@grammyjs/menu";
import { Bot, Context, session } from "grammy";
import "dotenv/config";
import { type Conversation, type ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { getFormattedCharacters } from "./utilities";
import { CHARACTERS } from "./characters";

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
  await ctx.reply("Qual o nome do item?");
  const { message } = await conversation.wait();

  if (!message || !message.text || message.text.trim().length === 0) {
    ctx.reply("Item inválido");
    return;
  }

  const authorId = message.from?.id;
  const authorCharacter = CHARACTERS.find((character) => character.id === String(authorId));

  if (!authorCharacter) {
    ctx.reply("Você ainda não possui um personagem.");
    return;
  }

  const item = {
    name: message.text.trim(),
    weight: 10,
  };
  authorCharacter.items.push(item);
  ctx.reply(`Item ${item.name} adicionado ao personagem ${authorCharacter.name}`);
}

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(addItem, "add-item"));

const mainMenu = new Menu<MyContext>("main-menu")
  .text("Ver lista de personagens", (ctx) => {
    ctx.reply(getFormattedCharacters());
  })
  .text("Adicionar item", async (ctx) => {
    await ctx.conversation.enter("add-item");
  });

bot.use(mainMenu);

bot.command("start", async (ctx) => {
  await ctx.reply("Bem vindo ao bot de itens!", { reply_markup: mainMenu });
});

bot.start();
