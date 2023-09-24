import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Bot, Context, session } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate"

/*import { hydrateReply, parseMode } from "../../@grammyjs/parse-mode";
import type { ParseModeFlavor } from "../../@grammyjs/parse-mode";
*/

import "dotenv/config";

type MyContext = HydrateFlavor<Context> & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const botApiToken = process.env.BOT_API_TOKEN || "";
const bot = new Bot<MyContext>(botApiToken);
bot.use(session({ initial: () => ({}) }));

bot.use(hydrate());


// const botzao = new GrammyError();
// botzao.catch((err) =>{
//   const ctx = err.ctx;
//   console.log(ctx);
// });

export { MyContext, MyConversation, bot};
