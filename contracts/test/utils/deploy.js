const { networkConfig } = require("../../hardhat.config");

async function microLotteryNoFeeNoThrottle(
  VRFCoordinatorMockAddress,
  linkTokenAddress
) {
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  config = networkConfig[chainId];

  keyhash = config["keyHash"];
  fee = config["fee"];

  const microLotteryContractFactory = await hre.ethers.getContractFactory(
    "MicroLottery"
  );
  const microLotteryContract = await microLotteryContractFactory.deploy(
    VRFCoordinatorMockAddress,
    linkTokenAddress,
    keyhash,
    fee
  );

  await microLotteryContract.deployed();

  await microLotteryContract.setWeiFee(0);
  await microLotteryContract.setRateLimit(0);

  return microLotteryContract;
}

module.exports = { microLotteryNoFeeNoThrottle };
