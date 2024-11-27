// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SaturnTokenPresale is Initializable, OwnableUpgradeable, PausableUpgradeable {
    using SafeERC20 for IERC20;

    IERC20 public s_usdt;

    bool public isMainnet;
    
    // USDT addresses (corrected checksum)
    // address constant ARBITRUM_MAINNET_USDT =
    //     0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;
    address constant ARBITRUM_TESTNET_USDT =
        0x4a9cE28B5bB1168aB50675e1c9b4DD98D1F79579;

    // New storage for future upgrades
    // uint256 public s_tokenPrice;
    mapping(address => uint256) public userPurchases;

    function initialize(
        address _owner,
        // uint256 _initialTokenPrice
        address _arbiOneUSDT
    ) public initializer {
        // Initialize parent contracts
        __Ownable_init(_owner);
        __Pausable_init();
        // Set USDT token address
        // Configure network and USDT address based on chain ID
        if (block.chainid == 42161) {
            // Arbitrum One
            isMainnet = true;
            s_usdt = IERC20(_arbiOneUSDT);
        } else if (block.chainid == 421614) {
            // Arbitrum Sepolia
            isMainnet = false;
            s_usdt = IERC20(ARBITRUM_TESTNET_USDT);
        } else if (block.chainid == 31337) {
            // Arbitrum Sepolia
            // 421614
            isMainnet = false;
            s_usdt = IERC20(ARBITRUM_TESTNET_USDT);
        } else {
            revert("Unsupported network");
        }        
        // Set initial token price
        // s_tokenPrice = _initialTokenPrice;
    }

    event BoughtWithNativeToken(address indexed user, uint256 amount, uint256 time);
    event BoughtWithUSDT(address indexed user, uint256 amount, uint256 time);
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);

    function buyTokensNative() external payable whenNotPaused {
        (bool sent, ) = payable(owner()).call{value: msg.value}("");
        require(sent, "Funds transfer unsuccessful");
        
        // Track user purchases (optional)
        userPurchases[msg.sender] += msg.value;
        
        emit BoughtWithNativeToken(msg.sender, msg.value, block.timestamp);
    }

    function buyTokensUSDT(uint256 amount) external whenNotPaused {
        s_usdt.safeTransferFrom(msg.sender, owner(), amount);
        
        // Track user purchases (optional)
        userPurchases[msg.sender] += amount;
        
        emit BoughtWithUSDT(msg.sender, amount, block.timestamp);
    }

    function withdrawERC20(
        address _tokenAddress,
        uint256 _amount
    ) external onlyOwner {
        IERC20 currentToken = IERC20(_tokenAddress);
        currentToken.approve(address(this), _amount);
        currentToken.safeTransferFrom(address(this), owner(), _amount);
    }

    function withdrawNative(uint256 _amount) external onlyOwner {
        (bool hs, ) = payable(owner()).call{value: _amount}("");
        require(hs, "Failed to withdraw native coins");
    }

    // function updateTokenPrice(uint256 _newPrice) external onlyOwner {
    //     uint256 oldPrice = s_tokenPrice;
    //     s_tokenPrice = _newPrice;
    //     emit TokenPriceUpdated(oldPrice, _newPrice);
    // }

    function pause() external whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() external whenPaused onlyOwner {
        _unpause();
    }

    function getUserPurchase(address  _userAddress) public view returns(uint256){
        return userPurchases[_userAddress];
    }

    receive() external payable {
        revert("Invalid Method");
    }

    fallback() external payable {
        revert("Invalid Method");

    }

}