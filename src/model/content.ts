import { CONST } from "../common/const.js";
import { getCrud } from "./crud/contentcrud.js";
import utils from "../common/util.js";
import dynamoService from "../service/dynamo.js";
const TableName = CONST.DYNAMO_TABLE_PREFIX + "_content";
const PartitionName = "Contents";

const counterSort = (items) => {
  const sortedItems = items.sort((a, b) => {
    const accessCountA = parseInt(a.AccessCount, 10);
    const accessCountB = parseInt(b.AccessCount, 10);
    return accessCountB - accessCountA; // 降順ソート
  });
  return sortedItems;
};

const createdSort = (items) => {
  const sortedItems = items.sort((a, b) => {
    const accessCountA = Number(new Date(a.Created));
    const accessCountB = Number(new Date(b.Created));
    return accessCountB - accessCountA; // 降順ソート
  });
  return sortedItems;
};

const pathSort = (items) => {
  const sortedItems = items.sort((a, b) => {
    return a.Path.localeCompare(b.Path);
  });
  return sortedItems;
};

const createTable = async () => {
  let params = getCrud().create;
  params.TableName = TableName;
  const result = await dynamoService.createTable(params);
  return "TABLE CREATE : " + TableName;
};

const getAllItems = async () => {
  return await dynamoService.getAllItems(TableName);
};

const getItems = async (sortkey) => {
  let params = getCrud().query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  if (result == undefined) {
    return createTable();
  }
  if (sortkey == "count") {
    return counterSort(result.Items);
  } else if (sortkey == "created") {
    return createdSort(result.Items);
  } else {
    return pathSort(result.Items);
  }
};

const getItem = async (id) => {
  let params = getCrud().read;
  params.TableName = TableName;
  params.Key.Id.N = String(id);
  return await dynamoService.getItem(params);
};

const createItem = async (entity) => {
  let params = getCrud().write;
  params.TableName = TableName;
  params.Item.Id.N = String(await getNewId());
  params.Item.Path.S = String(entity.path);
  params.Item.Title.S = String(entity.title);
  params.Item.Imgurl.S = String(entity.imgurl);
  params.Item.AccessCount.N = "0";
  params.Item.DeleteFlag.BOOL = "false";
  await dynamoService.putItem(params);
};

const deleteItem = async (id) => {
  let params = getCrud().delete;
  params.TableName = TableName;
  params.Key.Id.N = String(id);
  await dynamoService.deleteItem(params);
};

const updateItem = async (entity) => {
  let params = getCrud().update;
  params.TableName = TableName;
  params.Key.Id.N = String(entity.Id);
  params.UpdateExpression =
    "SET Title = :Title, AccessCount = :AccessCount, Imgurl = :Imgurl, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":Title": { S: String(entity.Title) } as object,
    ":AccessCount": { S: String(entity.AccessCount) } as object,
    ":Imgurl": { S: String(entity.Imgurl) } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  } as object;
  await dynamoService.updateItem(params);
};

const softDeleteItem = async (id) => {
  let params = getCrud().update;
  params.TableName = TableName;
  params.Key.Id.N = String(id);
  params.UpdateExpression = "SET DeleteFlag = :DeleteFlag, Updated = :updated";
  params.ExpressionAttributeValues = {
    ":DeleteFlag": { BOOL: false } as object,
    ":updated": { S: new Date(new Date().getTime()) } as object,
  };
  await dynamoService.updateItem(params);
};

const query = async () => {
  let params = getCrud().query;
  params.TableName = TableName;
  const result = await dynamoService.query(params);
  return result;
};

const getNewId = async () => {
  const maxid = await dynamoService.getMaxId(TableName, "Id");
  return maxid + 1;
};

const checkContentByPath = async (path) => {
  let params = getCrud().query;
  params.TableName = TableName;
  params.KeyConditionExpression = "#PartitionName = :PartitionName";
  params.FilterExpression = "#Path = :Path";
  params.ExpressionAttributeNames = {
    "#PartitionName": "PartitionName",
    "#Path": "Path",
  } as object;
  params.ExpressionAttributeValues = {
    ":PartitionName": { S: PartitionName },
    ":Path": { S: path },
  } as object;
  return await dynamoService.query(params);
};

const getContentByPath = async (path, entity) => {
  const result = await checkContentByPath(path);
  if (result.Count == 1) {
    let item = result.Items[0];
    return item;
  } else if (result.Count == 0) {
    await createItem(entity);
    return { message: "Item not found" };
  } else {
    return { message: "many Item", Items: result.Items };
  }
};

const beginWithScan = async (scanKey, sortkey) => {
  const params = {
    TableName: TableName,
    ConsistentRead: true,
    FilterExpression: "begins_with(#Path, :scanKey)",
    KeyConditionExpression: "#PartitionName = :PartitionName",
    ExpressionAttributeNames: {
      "#PartitionName": "PartitionName",
      "#Path": "Path",
    },
    ExpressionAttributeValues: {
      ":PartitionName": { S: PartitionName },
      ":scanKey": { S: scanKey },
    },
  };
  const result = await dynamoService.query(params);
  if (sortkey == "count") {
    return counterSort(result.Items);
  } else if (sortkey == "created") {
    return createdSort(result.Items);
  } else {
    return pathSort(result.Items);
  }
};

const contentModel = {
  createTable,
  getAllItems,
  getItems,
  getItem,
  getNewId,
  createItem,
  updateItem,
  deleteItem,
  softDeleteItem,
  query,
  getContentByPath,
  beginWithScan,
  checkContentByPath,
};
export default contentModel;
