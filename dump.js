const { expect } = require('chai');
const { ethers, network } = require('hardhat');

describe('SaturnTokenPresale', function () {
  let owner, user1, user2;
  let saturnTokenPresale;
  let mockUSDT;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDT token
    const MockERC20 = await ethers.getContractFactory('MockERC20');
    mockUSDT = await MockERC20.deploy('Mock USDT', 'MUSDT', 6);
    const mockUsdtAddress = await mockUSDT.getAddress();

    // Deploy SaturnTokenPresale contract
    const SaturnTokenPresale = await ethers.getContractFactory('SaturnTokenPresale');
    saturnTokenPresale = await SaturnTokenPresale.deploy();
    
    // Initialize with correct USDT address
    await network.provider.send("hardhat_setCode", [
      "0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579",
      await ethers.provider.getCode(mockUsdtAddress)
    ]);

    await saturnTokenPresale.initialize(owner.address);
  });

  describe('USDT Token Purchase', function () {
    beforeEach(async function () {
      // Mint USDT tokens to user1
      await mockUSDT.mint(user1.address, ethers.parseUnits('1000', 6));
      
      // Get the contract address
      const presaleAddress = await saturnTokenPresale.getAddress();
      
      // Approve the contract to spend USDT
      await mockUSDT.connect(user1).approve(presaleAddress, ethers.parseUnits('1000', 6));
    });

    it('should allow purchasing with USDT when not paused', async function () {
      const purchaseAmount = ethers.parseUnits('100', 6);
      
      // Debug: Check balances and allowance before purchase
      const user1Balance = await mockUSDT.balanceOf(user1.address);
      const allowance = await mockUSDT.allowance(user1.address, await saturnTokenPresale.getAddress());
      console.log("Initial User1 USDT Balance:", ethers.formatUnits(user1Balance, 6));
      console.log("Contract Allowance:", ethers.formatUnits(allowance, 6));
      
      // Make the purchase
      await expect(saturnTokenPresale.connect(user1).buyTokensUSDT(purchaseAmount))
        .to.emit(saturnTokenPresale, 'BoughtWithUSDT')
        .withArgs(user1.address, purchaseAmount);
      
      // Verify the purchase
      const ownerBalance = await mockUSDT.balanceOf(owner.address);
      expect(ownerBalance).to.equal(purchaseAmount);
      
      const userPurchase = await saturnTokenPresale.getUserPurchase(user1.address);
      expect(userPurchase).to.equal(purchaseAmount);
    });
  });
});