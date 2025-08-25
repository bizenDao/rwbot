import { CONST } from "../../common/const.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_member";
const PartitionName = "Shops";

export const getCrud = () => {
  return {
    create: {
      TableName: TableName,
      AttributeDefinitions: [
        { AttributeName: "PartitionName", AttributeType: "S" },
        { AttributeName: "Id", AttributeType: "N" },
      ],
      KeySchema: [
        { AttributeName: "PartitionName", KeyType: "HASH" },
        { AttributeName: "Id", KeyType: "RANGE" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
    write: {
      TableName: TableName,
      Item: {
        PartitionName: { S: PartitionName },
        Id: { N: "0" },
        Eoa: { S: "GallaryName" },
        Name: { S: "Hino Kawashima" },
        Imgurl: { S: "https://example.com/test.png" },
        Type: { S: "gallary" },
        Seed: { S: "Passwordseed" },
        ChannelId: { S: "ChannelID" },
        Status: { N: "0" },
        Json: {
          S: '{"en":{"name":"Hino Kawashima","profile":"BizenDAO founder","workplace":"Department of Food and Nutrition professor, Toita Womens Junior College","location":"2-21-17 Shiba, Minato-ku, Tokyo","station":"Toei Subway Mita Line/Asakusa Line Mita Station"},"ja":{"name":"川嶋 比野","profile":"BizenDAO ファウンダー 食器の色と絵柄と美味しさの関係の研究・学会へ研究発表を続け、2019年にそれらの研究結果をまとめ、実践女子大学大学院にて博士(食物栄養学)の学位を取得。","workplace":"戸板女子短期大学 食物栄養学博士 教授","location":"東京都港区芝2-21-17","station":"都営地下鉄三田線・浅草線 三田駅"}}',
        },
        DeleteFlag: { BOOL: "false" },
        Created: { S: new Date() },
        Updated: { S: new Date() },
      },
    },
    read: {
      TableName: TableName,
      Key: {
        PartitionName: { S: PartitionName },
        Id: { N: "0" },
      },
    },
    update: {
      TableName: TableName,
      Key: {
        PartitionName: { S: PartitionName },
        Id: { N: "0" },
      },
      UpdateExpression: "SET Info = :newVal",
      ExpressionAttributeValues: {},
    },
    delete: {
      TableName: TableName,
      Key: {
        PartitionName: { S: PartitionName },
        Id: { N: "0" },
      },
    },
    query: {
      TableName: TableName,
      KeyConditionExpression: "#PartitionName = :PartitionName",
      FilterExpression: "#DeleteFlag = :DeleteFlag",
      ExpressionAttributeNames: {
        "#PartitionName": "PartitionName",
        "#DeleteFlag": "DeleteFlag",
      } as object,
      ExpressionAttributeValues: {
        ":PartitionName": { S: PartitionName },
        ":DeleteFlag": { BOOL: false },
      } as object,
    },
    scan: { TableName: TableName, Limit: 1000 },
  };
};
