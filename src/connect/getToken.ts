import { ethers } from "ethers";
import { CONST } from "../common/const.js";
import { ABIS } from "./abi.js";
import { fetchData } from "../common/util.js";

export const getToken = async (
  contractAddress: string,
  method: string,
  id: string | null
) => {
  const abi = ABIS.nft;
  const rpc_url = CONST.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc_url);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    if (method == "getInfo") {
      const result = await contract.getInfo().then((response) => {
        return response;
      });
      return result;
    } else if (method == "name") {
      const result = await contract.name().then((response) => {
        return response;
      });
      return result;
    } else if (method == "tokenAmount") {
      const result = await contract._lastTokenId().then((response) => {
        return response;
      });
      return result;
    } else if (method == "unlockPrice") {
      const result = await contract._unlockPrice().then((response) => {
        return parseInt(response) / 1000000000000000000;
      });
      return result;
    } else if (method == "ownerOf") {
      const result = await contract.ownerOf(id).then((response) => {
        return response;
      });
      return result;
    } else if (method == "tokenURI") {
      const result = await contract.tokenURI(id).then((response) => {
        return response;
      });
      return await fetchData(result);
    } else if (method == "balanceOf") {
      const result = await contract.balanceOf(id).then((response) => {
        return response;
      });
      return result;
    } else if (method == "sic") {
      const result = await contract.supportsInterface(id).then((response) => {
        return response;
      });
      return result;
    } else if (method == "_locked") {
      const result = await contract._locked(id).then((response) => {
        return response;
      });
      return result;
    }
  } catch (error) {
    console.dir(error);
  }
};
