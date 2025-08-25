import {
  DynamoDBClient,
  CreateTableCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { CONST } from "../common/const.js";

const client = new DynamoDBClient({ region: CONST.DYNAMO_REGION });

const getUnmarshallItems = (results) => {
  let response = {
    Count: results.Count,
    Items: [],
    ScannedCount: results.ScannedCount,
  };
  for (let key in results.Items) {
    response.Items.push(unmarshall(results.Items[key]));
  }
  return response;
};

const tableExists = async (tableName) => {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }
    throw error;
  }
};

const createTable = async (params) => {
  const command = new CreateTableCommand(params);
  try {
    await client.send(command);
  } catch (err) {
    console.log("createErr");
  }
};

const putItem = async (params) => {
  try {
    await client.send(new PutItemCommand(params));
  } catch (err) {
    console.log(err);
  }
};

const getItem = async (params) => {
  try {
    const result = await client.send(new GetItemCommand(params));
    return unmarshall(result.Item);
  } catch (err) {
    console.log(err);
  }
};

const updateItem = async (params) => {
  try {
    await client.send(new UpdateItemCommand(params));
  } catch (err) {
    console.log(err);
  }
};

const deleteItem = async (params) => {
  try {
    await client.send(new DeleteItemCommand(params));
  } catch (err) {
    console.log(err);
  }
};

const query = async (params) => {
  try {
    const result = await client.send(new QueryCommand(params));
    return getUnmarshallItems(result);
  } catch (err) {
    console.log(err);
  }
};

const scan = async (params) => {
  try {
    const result = await client.send(new ScanCommand(params));
    return result;
  } catch (err) {
    console.log(err);
  }
};

const getAllItems = async (tableName) => {
  let lastEvaluatedKey = undefined;
  let list = [];
  do {
    const params: any = {
      TableName: tableName,
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    try {
      const response = await client.send(new ScanCommand(params));
      for (let i = 0; i < response.Items.length; i++) {
        const member = response.Items[i];
        list.push(member);
      }
      lastEvaluatedKey = response.LastEvaluatedKey;
    } catch (error) {
      console.error("Unable to scan the table:", error);
      return;
    }
  } while (lastEvaluatedKey);

  return list;
};

const getEoaList = async (tableName) => {
  const list = await getAllItems(tableName);
  let result = "\n";
  for (let key in list) {
    const data = list[key];
    if (data.Eoa != undefined) {
      result =
        result +
        "EOA: <b>" +
        data.Eoa.S +
        "</b> " +
        " | name:<b>" +
        data.Name.S +
        "</b> discord:<a href='/dynamo/member/" +
        data.DiscordId.S +
        "'>" +
        data.DiscordId.S +
        "</a><br />";
    }
  }
  return result;
};

const getDisplayData = async (tableName) => {
  const list = await getAllItems(tableName);
  let result = "\n";
  for (let key in list) {
    const data = list[key];
    result =
      result +
      key +
      " | name:<b>" +
      data.Name.S +
      "</b> Discord:" +
      data.DiscordId.S +
      " roles:" +
      data.Roles.SS +
      " join:" +
      data.Join.S;
    ("<br />");
  }
  return result;
};

const getMaxId = async (tableName, idName) => {
  const params: any = {
    TableName: tableName,
    ProjectionExpression: idName, // IDフィールドのみ取得
  };

  let maxId = null;
  let items = [];
  let lastEvaluatedKey = null;

  do {
    const response = await client.send(new ScanCommand(params));
    items = items.concat(
      response.Items.map((item) => unmarshall(item)[idName])
    );
    lastEvaluatedKey = response.LastEvaluatedKey;
    params.ExclusiveStartKey = lastEvaluatedKey;
  } while (lastEvaluatedKey);

  if (items.length > 0) {
    maxId = Math.max(...items);
  }

  return maxId;
};

const dynamoService = {
  tableExists,
  createTable,
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scan,
  query,
  getAllItems,
  getDisplayData,
  getEoaList,
  getMaxId,
};

export default dynamoService;
