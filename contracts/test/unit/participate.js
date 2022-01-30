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

  it("Should start with no participations", async function () {
    let participationCount = await microLotteryContract.participationCount();

    expect(participationCount).to.equal(0);
  });

  it("it revert without LINK", async () => {
    // Remove all link from contract before starting
    await microLotteryContract.withdrawLink();

    await expect(microLotteryContract.participate()).to.be.revertedWith(
      "Not enough LINK - fill contract"
    );
  });

  it("participate succefully with link", async () => {
    let txn = await microLotteryContract.participate();
    await txn.wait();
    let participations = await microLotteryContract.getAllParticipations();

    expect(participations.length).to.equal(1);
  });

  it("Should count participations", async function () {
    let txn = await microLotteryContract.participate();
    await txn.wait();

    let participationCount = await microLotteryContract.participationCount();
    expect(participationCount).to.equal(1);
  });

  it("Should add participations to the list", async function () {
    let txn = await microLotteryContract.participate();
    await txn.wait();

    let participations = await microLotteryContract.getAllParticipations();
    expect(participations.length).to.equal(1);
  });
});
