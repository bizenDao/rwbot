import { CONST } from "../common/const.js";
// import sqsService from "../service/sqs.js"; // SQS不使用
import discordService from "../service/discord.js";
import { sendDirectMessage } from "../service/discord-dm.js";
import dynamoService from "../service/dynamo.js";
import notionService from "../service/notion.js";
import memberModel from "../model/members.js";
import shopModel from "../model/shops.js";
import itemModel from "../model/items.js";
import { Message } from "../types/message.js";

const discordList = async () => {
  const result = await discordService.getDisplayData();
  return result;
};

const discordMessage = async (message, channel_id) => {
  const result = await discordService.sendMessage(message, channel_id);
  return result;
};

const shopList = async () => {
  const result = await shopModel.getItems();
  return result;
};

const itemList = async () => {
  const result = await itemModel.getItems();
  return result;
};

const memberList = async () => {
  const result = await memberModel.getDisplayData();
  return result;
};

const eoaList = async () => {
  const result = await dynamoService.getEoaList(
    CONST.DYNAMO_TABLE_PREFIX + "_member"
  );
  return result;
};

const dynamoList = async () => {
  const result = await dynamoService.getDisplayData(
    CONST.DYNAMO_TABLE_PREFIX + "_member"
  );
  return result;
};

const notionList = async () => {
  const result = await notionService.getDisplayData();
  return result;
};

// メッセージ送信（SQSは使用しない）
const sendMessage = async (message: Message) => {
  // 直接Discord APIを呼び出す
  if (message.function === "discord-message") {
    const { channelId, message: content } = message.params as any;
    return await discordService.sendMessage(content, channelId);
  } else if (message.function === "discord-direct-message") {
    const { userId, message: content } = message.params as any;
    try {
      await sendDirectMessage(userId, content);
      return { message: "DM sent successfully" };
    } catch (error) {
      console.error("Failed to send DM:", error);
      return { error: "Failed to send DM" };
    }
  } else if (message.function === "notion-sync" || message.function === "dynamo-sync") {
    // 同期処理は直接実行
    if (message.function === "notion-sync") {
      await notionUpdate();
    } else {
      await dynamoUpdate();
    }
    return { message: "Sync executed" };
  }
  
  // その他のメッセージタイプ
  console.warn(`Unknown message function: ${message.function}`, message);
  return { message: "Message type not implemented" };
};
const notionUpdate = async () => {
  const discordList = await discordService.getMemberList();
  const notionList = await notionService.getMemberList();
  await notionService.memberListUpdate(discordList, notionList);
};

const dynamoUpdate = async () => {
  const discordList = await discordService.getMemberList();
  const dynamoList = await memberModel.getAllList();
  await memberModel.memberListUpdate(discordList, dynamoList);
};

const controller = {
  discordList,
  discordMessage,
  dynamoList,
  notionList,
  memberList,
  itemList,
  shopList,
  dynamoUpdate,
  notionUpdate,
  sendMessage,
  eoaList,
};

export default controller;
