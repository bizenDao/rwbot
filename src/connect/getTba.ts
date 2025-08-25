import { ethers } from "ethers";
import { CONST } from "../common/const.js";
import { ABIS } from "./abi.js";

export const getTba = async (
  contractAddress: string,
  implementation: string,
  chainId: string,
  tokenContract: string,
  tokenId: string,
  salt: string
) => {
  const abi = ABIS.tbaRegistry;
  const rpc_url = CONST.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc_url);
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    const result = await contract
      .account(implementation, chainId, tokenContract, tokenId, salt)
      .then((response) => {
        return response;
      });
    return result;
  } catch (error) {
    console.dir(error);
  }
};
