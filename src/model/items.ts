import { CONST } from "../common/const.js";
import { getCrud } from "./crud/itemcrud.js";
import utils from "../common/util.js";
import dynamoService from "../service/dynamo.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_item";
const PartitionName = "Items";

const createTable = async () => {
  let params = getCrud().create;
  params.TableName = TableName;
  const result = await dynamoService.createTable(params);
  return "TABLE CREATE : " + TableName;
};

const getAllItems = async () => {
  return await dynamoService.getAllItems(TableName);
};

const getItems = async () => {
  let params = getCrud().query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  if (result == undefined) {
    return createTable();
  }
  return result.Items;
};

const getItem = async (id) => {
  let params = getCrud().read;
  params.TableName = TableName;
  params.Key.Id.N = id;
  return await dynamoService.getItem(params);
};

const createItem = async (entity) => {
  let params = getCrud().write;
  params.TableName = TableName;
  params.Item.Id.N = String(entity.id);
  params.Item.Name.S = String(entity.name);
  params.Item.Contract.S = String(entity.contract);
  params.Item.TokenId.S = String(entity.tokenid);
  params.Item.Price.N = String(entity.price);
  params.Item.Status.N = String(entity.status);
  params.Item.Json.S = String(entity.json);
  params.Item.Creator.S = String(entity.creator);
  params.Item.Link.S = String(entity.link);
  await dynamoService.putItem(params);
};

const deleteItem = async (id) => {
  let params = getCrud().delete;
  params.TableName = TableName;
  params.Key.Id.N = String(id);
  await dynamoService.deleteItem(params);
};

const updateItem = async (id: String, Column: String, Value: String) => {
  const item = await getItem(id);
  let params = getCrud().update;
  params.TableName = TableName;
  params.Key.Id.N = item.Id.N;
  params.UpdateExpression = "SET Info = :info, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":info": { S: Value } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  } as object;
  await dynamoService.updateItem(params);
};

const softDeleteItem = async (id) => {
  let params = getCrud().update;
  params.TableName = TableName;
  params.Key.Id.N = String(id);
  params.UpdateExpression = "SET DeleteFlag = :newVal, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":newVal": { BOOL: true } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  };
  await dynamoService.updateItem(params);
};

const getNewId = async () => {
  const maxid = await dynamoService.getMaxId(TableName, "Id");
  return maxid + 1;
};

const query = async () => {
  let params = getCrud().query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  return result;
};

const getItemByEoa = async (eoa) => {
  let params = getCrud().query;
  params.TableName = TableName;
  params.KeyConditionExpression = "#PartitionName = :PartitionName";
  params.FilterExpression = "#DeleteFlag = :DeleteFlag and #Creator = :Creator";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#DeleteFlag": "DeleteFlag",
    "#Creator": "Creator",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: PartitionName },
    ":DeleteFlag": { BOOL: false },
    ":Creator": { S: eoa },
  } as object;
  const result = await dynamoService.query(params);
  return result.Items;
};

const itemModel = {
  createTable,
  getAllItems,
  getItems,
  getItem,
  getNewId,
  createItem,
  updateItem,
  deleteItem,
  softDeleteItem,
  getItemByEoa,
  query,
};
export default itemModel;
