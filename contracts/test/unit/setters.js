const { expect } = require("chai");
const { microLotteryNoFeeNoThrottle } = require("../utils/deploy");
const { linkToken, VRFCoordinatorMock } = require("../../scripts/utils/mocks");

var Web3 = require("web3");

describe("MicroLotteryParticipate", function () {
  let linkContract;
  let vrfCoordinatorMockContract;
  let microLotteryContract;

  beforeEach(async () => {
    /**
     * Deploy LinkToken
     */
    linkContract = await linkToken();
    /**
     * Deploy VRFCoordinatorMock
     */
    vrfCoordinatorMockContract = await VRFCoordinatorMock(linkContract.address);
    /**
     * Deploy MicroLotteryContract
     */
    microLotteryContract = await microLotteryNoFeeNoThrottle(
      vrfCoordinatorMockContract.address,
      linkContract.address
    );
    /**
     * Fund contract w/ link
     */
    await linkContract.transfer(
      microLotteryContract.address,
      Web3.utils.toWei("1", "ether")
    );
  });

  it("Should be able to change winProbabilityPercentage", async function () {
    await microLotteryContract.setWinProbabilityPercentage(100);

    let currentWinProbabilityPercentage =
      await microLotteryContract.winProbabilityPercentage();
    expect(currentWinProbabilityPercentage).to.equal(100);
  });
});
