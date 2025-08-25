import { ethers } from "ethers";
import { CONST } from "../common/const.js";
import { ABIS } from "./abi.js";

const abi = ABIS.donate;
const rpc_url = CONST.RPC_URL;
const provider = new ethers.JsonRpcProvider(rpc_url);

async function isEOA(address) {
  try {
    const code = await provider.getCode(address);
    return code === "0x";
  } catch (error) {
    return false;
  }
}

async function getBalance(address) {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance); // バランスをEther単位にフォーマット
}

export const getDonate = async (mode: string, eoa: string) => {
  const contract = new ethers.Contract(CONST.DONATE_CA, abi, provider);
  try {
    if (mode == "balance") {
      const result = await contract.balanceOf(eoa).then((response) => {
        return response;
      });
      return ethers.formatEther(result);
    } else if (mode == "total") {
      const result = await contract.totalSupply().then((response) => {
        return response;
      });
      return ethers.formatEther(result);
    } else if (mode == "usedpoints") {
      const result = await contract._usedPoints(eoa).then((response) => {
        return response;
      });
      return ethers.formatEther(result);
    } else if (mode == "totaldonations") {
      const result = await contract._totalDonations(eoa).then((response) => {
        return response;
      });
      return ethers.formatEther(result);
    } else if (mode == "allTotalUsed") {
      const result = await contract._allUsedPoints().then((response) => {
        return response;
      });
      return ethers.formatEther(result);
    } else if (mode == "allTotalDonation") {
      const result = await contract._allTotalDonations().then((response) => {
        return response;
      });
      return ethers.formatEther(result);
    }
  } catch (error) {
    console.dir(error);
  }
};

const donateConnect = {
  getDonate,
  isEOA,
  getBalance,
};

export default donateConnect;
