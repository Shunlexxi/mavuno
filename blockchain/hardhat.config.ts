import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  mocha: {
    timeout: 1000,
  },
  networks: {
    testnet: {
      url: "https://testnet.hashio.io/api", // Hedera Hashgraph testnet RPC
      chainId: 296,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
