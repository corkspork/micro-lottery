const Web3 = require("web3");
const hre = require("hardhat");
const { networkConfig } = require("../hardhat.config");
const { linkToken, VRFCoordinatorMock } = require("./utils/mocks");
const {
  deployMicroLottery,
  updateFrontendSpec,
} = require("./utils/micro-lottery");

async function main() {
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log(`Deploying on network w/ chainID ${chainId}`);
  config = networkConfig[chainId];

  if (config["name"] == "localhost") {
    // Deploy a mock of the LinkToken
    linkContract = await linkToken();
    console.log("LinkToken deployed to:", linkContract.address);

    // Deploy a mock of the VRFCoordinator
    vrfCoordinatorMockContract = await VRFCoordinatorMock(linkContract.address);
    console.log(
      "VRFCoordinator deployed to:",
      vrfCoordinatorMockContract.address
    );

    config["linkToken"] = linkContract.address;
    config["vrfCoordinator"] = vrfCoordinatorMockContract.address;

    // Deploy the MicroLottery
    const microLotteryContract = await deployMicroLottery();
    await updateFrontendSpec(microLotteryContract);

    if (config["name"] == "localhost") {
      // Fund contract w/ Link from our mock
      await linkContract.transfer(
        microLotteryContract.address,
        Web3.utils.toWei("10", "ether")
      );
    }
  } else {
    throw "Start must be ran for localhost network only.";
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
