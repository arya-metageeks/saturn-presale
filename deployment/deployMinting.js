// deploy.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Specify the addresses for the payment token, fee recipient, and initial owner
  const initialOwnerAddress = "0x8FCAf20cC45CBD33F48389A0917011aCa4345393"; // Deployer address is the initial owner address
  const initialOwnerTestnet = "0x2Ba1Bf6aB49c0d86CDb12D69A777B6dF39AB79D9"
  const usdtTestnetAddress = "0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579"
  // Get the contract factory for the upgradeable contract
  const SaturnTokenPresale = await ethers.getContractFactory("SaturnTokenPresale");

  // Deploy the proxy for the upgradeable contract with initialization
  const SaturnTokenPresaleUpgradable = await upgrades.deployProxy(
    SaturnTokenPresale,
    [initialOwnerTestnet ,usdtTestnetAddress],
    { initializer: "initialize" }
  );

  console.log("SaturnTokenPresaleUpgradable deployed to:", SaturnTokenPresaleUpgradable.target);
  const owner = await SaturnTokenPresaleUpgradable.owner();
  console.log("Owner:", owner)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });