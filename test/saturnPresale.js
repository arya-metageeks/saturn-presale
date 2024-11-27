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
    const mockAdd = await mockUSDT.getAddress();
    console.log("Mock Address", mockAdd)

    // Deploy SaturnTokenPresale contract
    const SaturnTokenPresale = await ethers.getContractFactory('SaturnTokenPresale');
    saturnTokenPresale = await SaturnTokenPresale.deploy();

    await network.provider.send("hardhat_setCode", [
      "0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579",
      await ethers.provider.getCode(mockAdd)
    ]);

    await saturnTokenPresale.initialize(owner.address)

  });

  describe('Deployment', function () {
    it('should set the owner correctly', async function () {
      expect(await saturnTokenPresale.owner()).to.equal(owner.address);
    });
  });

  describe('Native Token Purchase', function () {
    it('should allow purchasing with native token when not paused', async function () {
      const purchaseAmount = ethers.parseEther('1');
      
      // Check initial balance
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      // Purchase tokens
      let txn = await saturnTokenPresale.connect(user1).buyTokensNative({value: purchaseAmount})
      await txn.wait();

      // Check owner's balance increased
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });

    it('should prevent purchasing when contract is paused', async function () {
      // Pause the contract
      const purchaseAmount = ethers.parseEther('1');

      await saturnTokenPresale.pause();

      // Attempt to purchase
      await expect(saturnTokenPresale.connect(user1).buyTokensNative({value: purchaseAmount})).to.be.revertedWithCustomError;
    });
  });

  // describe('USDT Token Purchase', function () {
  //   beforeEach(async function () {
  //     // Mint USDT tokens to user1
  //     await mockUSDT.mint(user1.address, ethers.parseUnits('1000', 6));
      
  //     // Get the contract address
  //     const presaleAddress = await saturnTokenPresale.getAddress();
      
  //     // Approve the contract to spend USDT
  //     await mockUSDT.connect(user1).approve(presaleAddress, ethers.parseUnits('1000', 6));
  //   });

  //   it('should allow purchasing with USDT when not paused', async function () {
  //     const purchaseAmount = ethers.parseUnits('100', 6);
      
  //     // Debug: Check balances and allowance before purchase
  //     const user1Balance = await mockUSDT.balanceOf(user1.address);
  //     const allowance = await mockUSDT.allowance(user1.address, await saturnTokenPresale.getAddress());
  //     console.log("Initial User1 USDT Balance:", ethers.formatUnits(user1Balance, 6));
  //     console.log("Contract Allowance:", ethers.formatUnits(allowance, 6));
  //     console.log("purchaseAmount:", ethers.formatUnits(purchaseAmount, 6));
      
  //     // Make the purchase
  //     await expect(saturnTokenPresale.connect(user1).buyTokensUSDT(purchaseAmount))
  //       .to.emit(saturnTokenPresale, 'BoughtWithUSDT')
  //       .withArgs(user1.address, purchaseAmount);
      
  //     // Verify the purchase
  //     const ownerBalance = await mockUSDT.balanceOf(owner.address);
  //     expect(ownerBalance).to.equal(purchaseAmount);
      
  //     const userPurchase = await saturnTokenPresale.getUserPurchase(user1.address);
  //     expect(userPurchase).to.equal(purchaseAmount);
  //   });
  // });

    // it('should prevent USDT purchase when contract is paused', async function () {
    //   // Pause the contract
    //   await saturnTokenPresale.pause();

    //   // Attempt to purchase
    //   await expect(
    //     saturnTokenPresale.connect(user1).buyTokensUSDT(ethers.parseUnits('100', 6))
    //   ).to.be.revertedWith('Pausable: paused');
    // });
  // });

//   describe('USDT Token Purchase', function () {
//     beforeEach(async function () {
//         // Mint USDT tokens to user1
//         await mockUSDT.mint(user1.address, ethers.parseUnits('1000', 6));
        
//         // Important: Approve the TESTNET USDT address since that's what the contract uses
//         await mockUSDT.connect(user1).approve(
//             "0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579", 
//             ethers.parseUnits('1000', 6)
//         );

//         // Debug logs
//         console.log("User1 Address:", user1.address);
//         console.log("USDT Contract Address:", await mockUSDT.getAddress());
//         console.log("Presale Contract Address:", await saturnTokenPresale.getAddress());
//         console.log("TestNet USDT Address: 0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579");
//     });

//     it('should allow purchasing with USDT when not paused', async function () {
//         const purchaseAmount = ethers.parseUnits('100', 6);
        
//         // Debug: Check balances and allowances
//         const user1Balance = await mockUSDT.balanceOf(user1.address);
//         const allowance = await mockUSDT.allowance(
//             user1.address, 
//             "0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579"
//         );
        
//         console.log("Initial User1 USDT Balance:", ethers.formatUnits(user1Balance, 6));
//         console.log("Contract Allowance:", ethers.formatUnits(allowance, 6));
//         console.log("Purchase Amount:", ethers.formatUnits(purchaseAmount, 6));
        
//         // Make the purchase
//         const tx = await saturnTokenPresale.connect(user1).buyTokensUSDT(purchaseAmount);
//         await tx.wait();
        
//         // Verify the purchase
//         const ownerBalance = await mockUSDT.balanceOf(owner.address);
//         expect(ownerBalance).to.equal(purchaseAmount);
        
//         const userPurchase = await saturnTokenPresale.getUserPurchase(user1.address);
//         expect(userPurchase).to.equal(purchaseAmount);
//     });
// });

  describe('Withdrawal Functions', function () {
    it('should allow owner to withdraw ERC20 tokens', async function () {
      // Mint tokens to the contract
      
      await mockUSDT.mint(saturnTokenPresale.target, ethers.parseUnits('500', 6));

      // Withdraw tokens
      await expect(saturnTokenPresale.withdrawERC20(mockUSDT.target, ethers.parseUnits('500', 6)))
        .to.emit(mockUSDT, 'Transfer');

      // Verify owner received tokens
      const ownerBalance = await mockUSDT.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseUnits('500', 6));
    });

    // it('should allow owner to withdraw native tokens', async function () {
    //   // Send some ETH to the contract
    //   const purchaseAmount = ethers.parseEther('1');

    //   await saturnTokenPresale.connect(user1).buyTokensNative({value: purchaseAmount})

    //   // Check initial balance
    //   const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

    //   // Withdraw native tokens
    //   await saturnTokenPresale.connect(owner).withdrawNative(ethers.parseEther('0.5'));

    //   // Check final balance
    //   const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    //   expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    // });

    it('should prevent non-owner from withdrawing', async function () {
      await expect(
        saturnTokenPresale.connect(user1).withdrawERC20(mockUSDT.target, ethers.parseUnits('500', 6))
      ).to.be.revertedWithCustomError;
      await expect(
        saturnTokenPresale.connect(user1).withdrawNative(ethers.parseEther('5'))
      ).to.be.revertedWithCustomError;
    });
  });

  describe('Pause Functionality', function () {
    it('should allow owner to pause and unpause', async function () {
      // Initially not paused
      expect(await saturnTokenPresale.paused()).to.be.false;

      // Pause
      await saturnTokenPresale.pause();
      expect(await saturnTokenPresale.paused()).to.be.true;

      // Unpause
      await saturnTokenPresale.unpause();
      expect(await saturnTokenPresale.paused()).to.be.false;
    });

    it('should prevent non-owner from pausing', async function () {
      await expect(saturnTokenPresale.connect(user1).pause())
        .to.be.revertedWithCustomError;

      await expect(saturnTokenPresale.connect(user1).unpause())
        .to.be.revertedWithCustomError;
    });
  });
});
