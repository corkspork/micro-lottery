// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {
  deployMicroLottery,
  updateFrontendSpec,
} = require("./utils/micro-lottery");

async function main() {
  const microLotteryContract = await deployMicroLottery();
  await updateFrontendSpec(microLotteryContract);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
