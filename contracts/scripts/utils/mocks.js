var crypto = require("crypto");

async function linkToken() {
  const linkTokenContractFactory = await hre.ethers.getContractFactory(
    "LinkToken"
  );

  const linkTokenContract = await linkTokenContractFactory.deploy();
  await linkTokenContract.deployed();

  return linkTokenContract;
}

async function VRFCoordinatorMock(linkTokenAddress) {
  const VRFCoordinatorMockContractFactory = await hre.ethers.getContractFactory(
    "VRFCoordinatorMock"
  );

  const VRFCoordinatorMockContract =
    await VRFCoordinatorMockContractFactory.deploy(linkTokenAddress);
  await VRFCoordinatorMockContract.deployed();

  // Handler for RandomnessRequest
  // Generates random and does the callback
  VRFCoordinatorMockContract.on(
    "RandomnessRequest",
    async (sender, requestId, event) => {
      console.log(`️🗒️ RandomnessRequest:\n${sender}\n${requestId}`);
      const random = hre.ethers.BigNumber.from(crypto.randomBytes(32));
      try {
        await VRFCoordinatorMockContract.callBackWithRandomness(
          requestId,
          random,
          sender
        );
      } catch (e) {
        console.error("FulFillRandomness error", e);
      }
    }
  );

  return VRFCoordinatorMockContract;
}

module.exports = { linkToken, VRFCoordinatorMock };
