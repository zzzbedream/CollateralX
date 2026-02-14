require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ quiet: true });

// Only use private key if it's a valid hex string (with or without 0x prefix)
const rawKey = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY = rawKey.startsWith("0x") ? rawKey.slice(2) : rawKey;
const accounts = /^[0-9a-fA-F]{64}$/.test(PRIVATE_KEY) ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: "paris",
        },
    },
    networks: {
        hardhat: {},
        arbitrumSepolia: {
            url: process.env.ARB_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
            chainId: 421614,
            accounts,
            gasPrice: "auto",
        },
    },
    etherscan: {
        apiKey: {
            arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
        },
        customChains: [
            {
                network: "arbitrumSepolia",
                chainId: 421614,
                urls: {
                    apiURL: "https://api-sepolia.arbiscan.io/api",
                    browserURL: "https://sepolia.arbiscan.io",
                },
            },
        ],
    },
};
