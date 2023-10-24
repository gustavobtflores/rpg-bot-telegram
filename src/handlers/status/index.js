const { conversations, createConversation, } = require("@grammyjs/conversations");
const { InlineKeyboard } = require("grammy");
const { deleteItem, catchItem } = require("../../config/storage");
const { handleChatTypeResponse, extractInventoryItemsFromMessage, isValidStatusItem, limitarCasasDecimais, parseItemFromInventoryString, statusValue, P } = require('../../handlers');

async function status(conversation, ctx){
  const CHARACTERS = await catchItem("characters");
  const idStatus = Array.from(P[0]);
  const confirmStatus = new InlineKeyboard().text("Sim", "yes").text("Não", "no");
  const blank = new InlineKeyboard();
  const flagStatus = true;
  
  let enter = "\n\n\n\n\n\n\n\n";
  
  await ctx.reply(`As seguintes alterações serão feitas:\n\n${idStatus.map((value, i) => {
  
  const char = CHARACTERS.find(id => id.name === value);
  
  const pvTexto = statusValue[i][0] !== 0 ? `PV(${char.status.pvMax}): ${char.status.pvAtual} ${statusValue[i][0] > 0 ? `+${statusValue[i][0]}`: `${statusValue[i][0]}`} => ${(char.status.pvAtual + statusValue[i][0]) >= char.status.pvMax ? `${char.status.pvMax}` : `${char.status.pvAtual + statusValue[i][0]}`}` : '';
  const pfTexto = statusValue[i][1] !== 0 ? `PF(${char.status.pfMax}): ${char.status.pfAtual} ${statusValue[i][1] > 0 ? `+${statusValue[i][1]}`: `${statusValue[i][1]}`} => ${(char.status.pfAtual + statusValue[i][1]) >= char.status.pfMax ? `${char.status.pfMax}` : `${char.status.pfAtual + statusValue[i][1]}`}` : '';
  const pmTexto = statusValue[i][2] !== 0 ? `PM(${char.status.pmMax}): ${char.status.pmAtual} ${statusValue[i][2] > 0 ? `+${statusValue[i][2]}`: `${statusValue[i][2]}`} => ${(char.status.pmAtual + statusValue[i][2]) >= char.status.pmMax ? `${char.status.pmMax}` : `${char.status.pmAtual + statusValue[i][2]}`}` : '';
  
  const textoFinal = [pvTexto, pfTexto, pmTexto].filter(texto => texto !== '').join('\n');

  return `${value}\n\n${textoFinal}`;
}).join("\n\n")}\n\nDescreva sobre as alterações. (Se houver mais de um personagem, separar as descrições por enter)`);
  
  const { message } = await conversation.wait();
  
  const logList = extractInventoryItemsFromMessage(message.text, flagStatus);
  let desc = [];
  await ctx.reply(`As seguintes alterações serão feitas:\n\n${idStatus.map((value, i) => {
  
  const char = CHARACTERS.find(id => id.name === value);
  
  const pvTexto = statusValue[i][0] !== 0 ? `PV(${char.status.pvMax}): ${char.status.pvAtual} ${statusValue[i][0] > 0 ? `+${statusValue[i][0]}`: `${statusValue[i][0]}`} => ${(char.status.pvAtual + statusValue[i][0]) >= char.status.pvMax ? `${char.status.pvMax}` : `${char.status.pvAtual + statusValue[i][0]}`}` : '';
  const pfTexto = statusValue[i][1] !== 0 ? `PF(${char.status.pfMax}): ${char.status.pfAtual} ${statusValue[i][1] > 0 ? `+${statusValue[i][1]}`: `${statusValue[i][1]}`} => ${(char.status.pfAtual + statusValue[i][1]) >= char.status.pfMax ? `${char.status.pfMax}` : `${char.status.pfAtual + statusValue[i][1]}`}` : '';
  const pmTexto = statusValue[i][2] !== 0 ? `PM(${char.status.pmMax}): ${char.status.pmAtual} ${statusValue[i][2] > 0 ? `+${statusValue[i][2]}`: `${statusValue[i][2]}`} => ${(char.status.pmAtual + statusValue[i][2]) >= char.status.pmMax ? `${char.status.pmMax}` : `${char.status.pmAtual + statusValue[i][2]}`}` : '';
  desc.push(`${logList[i] === undefined ? logList[0] : logList[i]} ${statusValue[i].map((item, u) => { 
  if(item !== 0){
  var atr = "";
    if(u === 0){
      atr = "PV";
      
    return `${item > 0 ? `+${item}`: `${item}`} ${atr}`;
    }else if( u === 1){
      atr = "PF";
      
    return `${item > 0 ? `+${item}`: `${item}`} ${atr}`;
    }else{
      atr = "PM";
      
    return `${item > 0 ? `+${item}`: `${item}`} ${atr}`;
    }
    
  }else{return "";}
  }).filter(text => text !== '').join(", ")
    
  }`)
  
  const textoFinal = [pvTexto, pfTexto, pmTexto,"DESCRIÇÃO: " + desc[i]].filter(texto => texto !== '').join('\n');
  
  return `${value}\n\n${textoFinal}`;
}).join("\n\n")}\n\nConfirma?`, { reply_markup: confirmStatus});

  var res = await conversation.waitForCallbackQuery(["yes", "no"]);
  
  const chatID = message.chat.id;
  
  if(res.match === "yes"){
    await conversation.external(async () => {
      await idStatus.forEach((value, i) => {
        
        const char = CHARACTERS.find(id => id.name === value);
        
        const newStatus = [
          (char.status.pvAtual + statusValue[i][0]) >= char.status.pvMax ? char.status.pvMax : char.status.pvAtual + statusValue[i][0], 
          (char.status.pfAtual + statusValue[i][1]) >= char.status.pfMax ? char.status.pfMax : char.status.pfAtual + statusValue[i][1],
          (char.status.pmAtual + statusValue[i][2]) >= char.status.pmMax ? char.status.pmMax : char.status.pmAtual + statusValue[i][2]
          ];
          
        if(char.status.notifications){
          const modPv = newStatus[0] !== char.status.pvAtual ? `\nPV (${char.status.pvMax}): ${char.status.pvAtual} => ${newStatus[0]}`:"";
          const modPf = newStatus[1] !== char.status.pfAtual ? `\nPF (${char.status.pfMax}): ${char.status.pfAtual} => ${newStatus[1]}`: "";
          const modPm = newStatus[2] !== char.status.pmAtual ? `\nPM (${char.status.pmMax}): ${char.status.pmAtual} => ${newStatus[2]}` : "";
          
          ctx.reply(`Os seus status mudaram! Veja o que aconteceu:\n\n -> ${desc[i]}\n${modPv}${modPf}${modPm}`, { chat_id: parseInt(char.id)});
        }
        
        
        char.status.pvAtual = newStatus[0];
        char.status.pfAtual = newStatus[1];
        char.status.pmAtual = newStatus[2];
        char.status.log.push(desc[i]);
        if(char.status.log.length > 5){
          char.status.log.shift();
        }
        
      
      });
      await deleteItem("characters", CHARACTERS);
    });
    
    ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
    await ctx.reply("Status do(s) personagem(ns) atualizados com sucesso!");
  }else{
    
    ctx.api.deleteMessage(chatID, res.update.callback_query.message.message_id);
    await ctx.reply("Ok! /start se quiser tentar novamente!");
  }
}


module.exports = {
  status,
}