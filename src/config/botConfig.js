const { Bot, session } = require("grammy");
const { hydrate } = require("@grammyjs/hydrate");

require("dotenv").config();

const botApiToken = process.env.BOT_API_TOKEN || "";
const bot = new Bot(botApiToken);
bot.use(session({ initial: () => ({}) }));

bot.use(hydrate());

// const botzao = new GrammyError();
// botzao.catch((err) =>{
//   const ctx = err.ctx;
//   console.log(ctx);
// });

module.exports = { bot };
