const { expect } = require("chai");
const { microLotteryNoFeeNoThrottle } = require("../utils/deploy");
const { linkToken, VRFCoordinatorMock } = require("../../scripts/utils/mocks");

var Web3 = require("web3");

describe("MicroLotteryThrottle", function () {
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

  it("Should be able to change rate limit", async function () {
    await microLotteryContract.setRateLimit(10);

    let currentThrottleBlockCount = await microLotteryContract.rateLimit();
    expect(currentThrottleBlockCount).to.equal(10);
  });

  it("Should rate limit requests for 2 blocks", async function () {
    await microLotteryContract.setRateLimit(2);

    let txn = await microLotteryContract.participate();
    await txn.wait();

    await expect(microLotteryContract.participate()).to.be.revertedWith(
      "Must wait"
    );
  });
});
