const { InlineKeyboard } = require("grammy");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidItem, limitarCasasDecimais, P } = require("../../handlers");
const { getFormattedCharacters } = require("../../utils");
const { deleteItem, catchItem } = require("../../config/storage");

async function removeItem(conversation, ctx, cube) {
  const enter = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
  let ID = "";
  let tempCube = cube;
  let equipped;
  if (cube === true) {
    ID = "cube";
    tempCube = cube;
    equipped = true;
  } else {
    ID = ctx.update.callback_query.from.id;
    tempCube = false;
  }
  
  const CHARACTERS = await catchItem("characters");
  const blank = new InlineKeyboard();
  const flagRemove = false;
  const confirmRemove = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const chatID = ctx.update.callback_query.message.chat.id;
  const authorId = String(ID);
  let authorCharacter = CHARACTERS.find((character) => character.id === authorId);

  if (!handleChatTypeResponse(authorId, ctx)) {
    return;
  }
  
  const confirmPocket = new InlineKeyboard().text("Equipados", "equipped").text("Desequipados", "unequipped");
  
  if(!tempCube){
    
  await ctx.reply("Escolha que tipo de compartimentos quer remover", {reply_markup: confirmPocket});
  
  var res = await conversation.waitForCallbackQuery(["equipped", "unequipped"]);

  equipped = res.match === "equipped" ? true : false;
  
  await ctx.editMessageText(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer remover separando-os por , ou enter.`, { reply_markup: blank,  message_id: res.update.callback_query.message.message_id});
  
  }else{
  
  
  await ctx.reply(`Estes são seus itens no momento:\n\n${await getFormattedCharacters(authorId, equipped)}\nEscolha quais itens quer remover separando-os por , ou enter.`, { reply_markup: blank });
  }

  const { message } = await conversation.wait();

  const inventoryList = extractInventoryItemsFromMessage(message.text, flagRemove);
  var inventoryNow = authorCharacter.items.map((item) => item);

  for (let itemToRemove of inventoryList) {
    var item = inventoryNow.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase());

    if (!item) {
      await ctx.reply(`Desculpe mas não consegui encontrar este item nas suas coisas: \n\n${itemToRemove}\n\nQuer tentar de novo?`, { reply_markup: confirmRemove });

      var res = await conversation.waitForCallbackQuery(["yes", "no"]);

      if (res.match === "yes") {
        ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
        await removeItem(conversation, ctx, tempCube);
      } else {
        return ctx.editMessageText("Ok, ansioso para livrar um pouco as costas haha.", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
      }
      return;
    }
  }
  const listItemRemove = await removeItemDefine(inventoryList, inventoryNow, ctx, conversation);

  await ctx.reply(
    `Confira os itens que quer remover:\n\n${listItemRemove
      .map((item) => `- ${item.name}: ${item.weight}Kg - ${item.quantity}Un => ${limitarCasasDecimais(item.weight * item.quantity, 3)}Kg\nDescrição: ${item.desc}`)
      .join("\n\n")}\n\nPeso total a ser removido: ${listItemRemove.reduce((acc, item) => limitarCasasDecimais(acc + item.weight * item.quantity, 3), 0)}Kg - Confirma?`,
    { reply_markup: confirmRemove }
  );

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);

  if (res.match === "yes") {
    await conversation.external(async () => {
      for (const itemToRemove of listItemRemove) {
        const index = authorCharacter.items.findIndex((item) => item.name === itemToRemove.name);
        if (index !== -1) {
          if (authorCharacter.items[index].quantity !== 1) {
            if (itemToRemove.quantity === authorCharacter.items[index].quantity) {
              authorCharacter.items.splice(index, 1);
            } else {
              authorCharacter.items[index].quantity -= itemToRemove.quantity;
            }
          } else {
            authorCharacter.items.splice(index, 1);
          }
        }
      }
      await deleteItem("characters", CHARACTERS);
    });

    await ctx.editMessageText(`Itens removidos do inventário do ${authorCharacter.name}.`, { reply_markup: blank, message_id: res.update.callback_query.message.message_id });

  } else {
    await ctx.editMessageText("Ok, então não vou te dar nada.\n\nQuer tentar de novo?", { reply_markup: confirmRemove, message_id: res.update.callback_query.message.message_id });

    var res = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (res.match === "yes") {
      ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);

      await removeItem(conversation, ctx, tempCube);
    } else {
      ctx.editMessageText("Ok, estarei aqui se precisar pegar alguma coisas haha!", { reply_markup: blank, message_id: res.update.callback_query.message.message_id });
    }
  }
}

async function removeItemDefine(inventoryList, inventoryNow, ctx, conversation) {
  var listItemRemove = [];

  for (let itemToRemove of inventoryList) {
    var item = { ...inventoryNow.find((item) => item.name.toLowerCase() === itemToRemove.toLowerCase()) };

    if (item.quantity !== 1) {
      const quant = await splitItemQuant(item);
      ctx.reply(`Quantas unidades de ${item.name} deseja remover?`, { reply_markup: quant.InlineNumbers });

      var res = await conversation.waitForCallbackQuery(quant.itemString);

      item.quantity = parseInt(res.match);

      ctx.api.deleteMessage(res.update.callback_query.message.chat.id, res.update.callback_query.message.message_id);
    }
    listItemRemove.push(item);
  }
  return listItemRemove;
}

function splitItemQuant(item) {
  var itemQuant = [];
  var itemString = [];
  for (let i = 1; i <= item.quantity; i++) {
    var numero = i.toString();
    itemQuant.push([numero, numero]);
    itemString.push(numero);
  }

  var buttonRow = itemQuant.map(([label, data]) => InlineKeyboard.text(label, data));

  const tamanhoDoGrupo = calcularX(itemString.length);
  const arrayDividida = [];

  for (let i = 0; i < buttonRow.length; i += tamanhoDoGrupo) {
    const grupo = buttonRow.slice(i, i + tamanhoDoGrupo);
    arrayDividida.push(grupo);
  }
  const InlineNumbers = InlineKeyboard.from(arrayDividida);

  return { InlineNumbers, itemString };
}
function calcularX(tamanhoArray) {
  switch (true) {
    case tamanhoArray <= 8:
      return 8;
    case tamanhoArray <= 10:
      return 5;
    case tamanhoArray <= 12:
      return 6;
    case tamanhoArray <= 14:
      return 7;
    case tamanhoArray <= 16:
      return 8;
    case tamanhoArray <= 18:
      return 6;
    case tamanhoArray <= 21:
      return 7;
    case tamanhoArray <= 24:
      return 8;
    case tamanhoArray <= 28:
      return 7;
    case tamanhoArray <= 32:
      return 8;
    case tamanhoArray <= 35:
      return 7;
    case tamanhoArray <= 40:
      return 8;
    default:
      // Se o tamanho for maior do que 40, você pode lidar com isso de acordo com sua lógica.
      // Aqui, está retornando 8, mas você pode ajustar conforme necessário.
      return 8;
  }
}
module.exports = {
  removeItem,
};
