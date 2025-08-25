import { CONST } from "../common/const.js";

const bot_key = CONST.DISCORD_BOT_KEY;

const createDM = async (userId: string) => {
  const url = "https://discord.com/api/v10/users/@me/channels";
  const body = {
    recipient_id: userId
  };
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${bot_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create DM channel: ${response.status}`);
  }
  
  const data = await response.json();
  return data.id; // DMチャンネルID
};

const sendDirectMessage = async (userId: string, message: string) => {
  try {
    // DMチャンネルを作成または取得
    const dmChannelId = await createDM(userId);
    
    // メッセージ送信
    const url = `https://discord.com/api/v10/channels/${dmChannelId}/messages`;
    const body = {
      content: message
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${bot_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send DM: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending direct message:", error);
    throw error;
  }
};

export { sendDirectMessage };