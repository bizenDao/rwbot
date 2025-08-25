import { getToken } from "../connect/getToken.js";
import shopModel from "../model/shops.js";
import CryptoJS from "crypto-js";

export const getLocalTime = () => {
  return new Date().toLocaleTimeString();
};

export const sleep = (waitTime) => {
  if (waitTime < 1) {
    return;
  }
  const startTime = Date.now();
  while (Date.now() - startTime < waitTime);
};

export const fetchData = async (Url) => {
  // IPSFの場合URLを置換
  try {
    const response = await fetch(Url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// アドレスが同値かどうかを判定する関数
export const isAddressesEqual = (address1: string, address2: string) => {
  return address1.toLowerCase() === address2.toLowerCase();
};

const str2unixtime = (dateString) => {
  const date = new Date(dateString);
  const unixTime = Math.floor(date.getTime() / 1000);
  return unixTime;
};

const getShortHash = async (tokenCaId) => {
  const info = tokenCaId.split("/");
  const caInfo = await getToken(info[0], "getInfo", null);
  if (caInfo) {
    const creator = caInfo[0];
    const tokenInfo = await getToken(info[0], "tokenURI", info[1]);
    const owner = await getToken(info[0], "ownerOf", info[1]);
    const contractName = await getToken(info[0], "name", null);
    const gallary = await shopModel.getItemByEoa(owner);
    const bytes = CryptoJS.AES.decrypt(
      gallary.Seed,
      process.env.AES_SECRET_KEY
    );
    const Seed = bytes.toString(CryptoJS.enc.Utf8);
    const hash = CryptoJS.SHA256(Seed + tokenCaId);
    const shortHash = hash.toString(CryptoJS.enc.Hex).substring(0, 12);
    let image = tokenInfo.image;
    if (image.length > 256) {
      image = undefined;
    }

    return {
      shortHash: shortHash,
      channelId: gallary.ChannelId,
      owner: owner,
      creator: creator,
      name: tokenInfo.name,
      image: image,
      gallaryName: gallary.Name,
      gallarytype: gallary.Type,
      gallaryInfo: JSON.parse(gallary.Json),
      contractInfo: contractName,
      pathInfo: info[1],
    };
  } else {
    return {
      shortHash: undefined,
      eoa: undefined,
      name: undefined,
      image: undefined,
      gallaryName: undefined,
      gallarytype: undefined,
      gallaryInfo: undefined,
      contractInfo: undefined,
      pathInfo: undefined,
    };
  }
};

const dynamoDbToJson = (dynamoData) => {
  // dynamoDataが配列でない場合、配列に変換して処理
  const isArray = Array.isArray(dynamoData);
  const dataArray = Array.isArray(dynamoData) ? dynamoData : [dynamoData];

  const result = dataArray.map((item) => {
    let result = {};
    for (const key in item) {
      const valueObj = item[key];
      // S, N, BOOLのいずれかのキーに応じて値を取り出す
      if (valueObj.S !== undefined) {
        result[key] = valueObj.S; // String
      } else if (valueObj.N !== undefined) {
        result[key] = String(valueObj.N); // Number
      } else if (valueObj.BOOL !== undefined) {
        result[key] = valueObj.BOOL; // Boolean
      } else if (valueObj.M !== undefined) {
        result[key] = dynamoDbToJson([valueObj.M])[0]; // Map
      } else if (valueObj.SS !== undefined) {
        result[key] = valueObj.SS; // Map
      } else if (valueObj.NS !== undefined) {
        result[key] = valueObj.NS; // Map
      }
      // 必要に応じて他の型もここに追加可能
    }
    return result;
  });

  if (isArray) {
    return result;
  } else {
    return result[0];
  }
};

const safeJsonStringify = (obj: any) => {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

const utils = {
  sleep,
  fetchData,
  isAddressesEqual,
  generateRandomString,
  str2unixtime,
  getShortHash,
  dynamoDbToJson,
  safeJsonStringify,
};

export default utils;
