import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Bot, Context, session } from "grammy";

import "dotenv/config";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const botApiToken = process.env.BOT_API_TOKEN || "";
const bot = new Bot<MyContext>(botApiToken);
bot.use(session({ initial: () => ({}) }));

export { MyContext, MyConversation, bot };
