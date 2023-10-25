const { InlineKeyboard } = require("grammy");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, parseItemFromInventoryString, P } = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");

async function progress(conversation,ctx){
    
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagModify = true;
  const flagChoose = false;
  const confirmModify = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.chat.id;
  const authorId = String(ctx.from.id);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);
  
  
  await ctx.reply(`Copie a mensagem, edite como queira e logo após envie para registrar.\n\nPor enquanto essa é sua relação de xp no momento:`)
  await ctx.reply(`${authorCharacter.progress === "" ? "Ainda não tem nada registrado": authorCharacter.progress}`);
  
  
  const { message } = await conversation.wait();
  
  await ctx.reply(`Confirma as modificações?\n\n   Antes:\n\n${authorCharacter.progress}\n\n   Depois:\n\n${message.text}`,{reply_markup: confirmModify});
  
  
  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
   if (res.match === "yes") {
    await conversation.external(async () => {
      
      authorCharacter.progress = message.text;
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Progesso de ${authorCharacter.name} modificado com sucesso!`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
  } else {
    await ctx.editMessageText("Ok, então não vou modificar nada.\n\nQuer tentar de novo?", { reply_markup: confirmModify, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await progress(conversation, ctx);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar alterar alguma coisa haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }

}

module.exports = {
  progress
}