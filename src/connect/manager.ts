import { ethers } from "ethers";
import { CONST } from "../common/const.js";
import { ABIS } from "./abi.js";

export const manager = async (method: string) => {
  const abi = ABIS.manager;
  const rpc_url = CONST.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc_url);
  const contract = new ethers.Contract(CONST.MANAGER_CA, abi, provider);

  try {
    if (method == "contracts") {
      const result = await contract.getAllContracts().then((response) => {
        return response;
      });
      return arrayPivot(result);
    } else if (method == "creators") {
      const result = await contract.getAllCreators().then((response) => {
        return response;
      });
      return arrayPivot(result);
    } else if (method == "admins") {
      const result = await contract.getAdmins().then((response) => {
        return response;
      });
      return [result[0], Number(result[1])];
    }
  } catch (error) {
    console.dir(error);
  }
};

const arrayPivot = (input) => {
  let result = [];
  for (const key in input[0]) {
    result.push([input[0][key], input[1][key], input[2][key], input[3][key]]);
  }
  return result;
};
