import controller from "./controller/controller.js";
import { Message } from "./types/message";

const message: Message = {
  function: "dynamo-update",
  params: {
    input1: "dynamoSync",
    input2: "値を投げる",
    input3: "テスト",
  },
};
await controller.sqsSend(message);
await controller.discordList();
await controller.dynamoList();
await controller.notionList();
