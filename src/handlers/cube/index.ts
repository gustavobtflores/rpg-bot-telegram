import { addItem, removeItem } from "../../handlers";


export async function addCube(conversation: MyConversation, ctx: MyContext): Promise<void>{
  
  await addItem(conversation, ctx, true);
  
}

export async function removeCube(conversation: MyConversation, ctx: MyContext): Promise<void>{

  await removeItem(conversation, ctx, true);
  
}
