// test/UniswapV3Pool.t.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;
import "./ERC20Mintable.sol";
import "../src/UniswapV3Pool.sol";
import "../src/UniswapV3Manager.sol";
import "forge-std/Test.sol";

contract Ticks_Price_Tests is Test {
    ERC20Mintable token0 ;
    ERC20Mintable token1 ;
    UniswapV3Pool pool;
    UniswapV3Manager manager;
    bool transferInMintCallback = true;
    bool transferInSwapCallback = true;
    struct TestCaseParams {
        uint256 wethBalance;
        uint256 usdcBalance;
        int24 currentTick;
        int24 lowerTick;
        int24 upperTick;
        uint128 liquidity;
        uint160 currentSqrtP;
        bool transferInMintCallback;
        bool transferInSwapCallback;
        bool mintLiqudity;
    }


    function setUp() public {
//        console.log("setUp mes.sender=");
//        console.log(msg.sender);
        token0 = new ERC20Mintable("Ether", "ETH",18);
        token1 = new ERC20Mintable("USDC", "USDC",18);
        manager = new UniswapV3Manager();
    }
    function testTick() public {
        console.log("in testTick");
        int24 tick = 31337;
        int16 wordPos = int16(tick >> 8);
        uint8 bitPos  = uint8(uint24(tick % 256));
        console.logInt(tick);

        console.logInt(wordPos);
        console.log(bitPos);
    }

}