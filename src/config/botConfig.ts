import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Bot, Context, session } from "grammy";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";

import "dotenv/config";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const botApiToken = process.env.BOT_API_TOKEN || "";
const bot = new Bot<ParseModeFlavor<MyContext>>(botApiToken);
bot.use(session({ initial: () => ({}) }));
bot.use(hydrateReply);

export { MyContext, MyConversation, bot };
