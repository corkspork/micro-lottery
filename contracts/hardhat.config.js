require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-solhint");

require("hardhat-gas-reporter");
require("solidity-coverage");

require("./tasks/accounts");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.4.24",
        settings: {
          // optimizer: { enabled: true },
        },
      },
      {
        version: "0.8.11",
        settings: {
          // optimizer: { enabled: true },
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    gasPrice: 56,
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.RINKEBY_PRIVATE_KEY !== undefined ? [process.env.RINKEBY_PRIVATE_KEY] : [],
    },
    polygon_mumbai: {
      url: process.env.POLYGON_MUMBAI_URL || "",
      accounts:
        process.env.POLYGON_MUMBAI_PRIVATE_KEY !== undefined ? [process.env.POLYGON_MUMBAI_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networkConfig: {
    31337: {
      name: "localhost",
      keyHash:
        "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
      fee: "100000000000000000",
    },
    4: {
      name: "rinkeby",
      linkToken: "0x01be23585060835e02b77ef475b0cc51aa1e0709",
      keyHash:
        "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
      vrfCoordinator: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
      fee: "100000000000000000",
    },
    4: {
      name: "polygon_mumbai",
      linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      keyHash:
        "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
      vrfCoordinator: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
      fee: "100000000000000",
    },
  },
};
