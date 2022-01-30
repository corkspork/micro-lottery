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

  it("recieve random from VRF", async () => {
    let txn = await microLotteryContract.participate();
    await txn.wait();
    let participations = await microLotteryContract.getAllParticipations();

    expect(participations.length).to.equal(1);

    await vrfCoordinatorMockContract.callBackWithRandomness(
      participations[0].vrfRequestId,
      "123123",
      microLotteryContract.address
    );

    let participation = await microLotteryContract.getParticipationById(0);

    expect(participation.vrfResult).to.equal(123123);
  });

  it("Should add participations to the list", async function () {
    let txn = await microLotteryContract.participate();
    await txn.wait();

    let participations = await microLotteryContract.getAllParticipations();
    expect(participations.length).to.equal(1);
  });

  it("Should recieve the payout on win", async function () {
    const [owner, _] = await hre.ethers.getSigners();

    await microLotteryContract.setWeiFee(1000);
    await microLotteryContract.setWinProbabilityPercentage(100); // Make sure its a win

    let txn = await microLotteryContract.participate({
      value: 1000,
    });
    await txn.wait();

    let participation = await microLotteryContract.getParticipationById(0);

    await vrfCoordinatorMockContract.callBackWithRandomness(
      participation.vrfRequestId,
      "123123",
      microLotteryContract.address
    );
    console.log("owner " + owner.address);

    let payments = await microLotteryContract.payments(owner.address);
    expect(payments).to.be.equal(1000);
  });
});
