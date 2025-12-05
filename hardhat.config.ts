import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
// import "@nomicfoundation/hardhat-ledger"; // Commented out - using Foundry instead
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002, // Arc Testnet Chain ID (official)
      // Use Ledger for deployment (remove accounts field)
      ledgerAccounts: [
        "0xee185ffc78C918c51f77c5aF613FC7633cE85497", // Your Ledger address
      ],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      arcTestnet: process.env.ARCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: 5042002,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
