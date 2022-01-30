const fs = require("fs");
const hre = require("hardhat");

async function deployMicroLottery() {
  const microLotteryContractFactory = await hre.ethers.getContractFactory(
    "MicroLottery"
  );
  const microLotteryContract = await microLotteryContractFactory.deploy(
    config["vrfCoordinator"],
    config["linkToken"],
    config["keyHash"],
    config["fee"]
  );

  await microLotteryContract.deployed();

  return microLotteryContract;
}

async function updateFrontendSpec(microLotteryContract) {
  const frontendABIFilePath = "../frontend/src/abi/MicroLottery.json";
  fs.copyFile(
    "./artifacts/contracts/MicroLottery.sol/MicroLottery.json",
    frontendABIFilePath,
    (err) => {
      if (err) throw err;
      console.log("MicroLottery abi copied to " + frontendABIFilePath);
    }
  );

  const frontendDotEnvFilePath = "../frontend/.env";
  fs.writeFile(
    "../frontend/.env",
    "REACT_APP_ML_CONTRACT_ADDRESS=" + microLotteryContract.address,
    { flag: "w" },
    (err) => {
      if (err) throw err;
      console.log(
        "REACT_APP_ML_CONTRACT_ADDRESS=" +
          microLotteryContract.address +
          " wrote  to " +
          frontendDotEnvFilePath
      );
    }
  );
}

module.exports = { deployMicroLottery, updateFrontendSpec };
