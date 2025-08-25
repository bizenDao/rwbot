import { CONST } from "../common/const.js";
import sqsService from "../service/sqs.js";
import discordService from "../service/discord.js";
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

const sqsSend = async (message: Message) => {
  const result = await sqsService.sendMessage(JSON.stringify(message));
  return result;
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
  sqsSend,
  eoaList,
};

export default controller;
