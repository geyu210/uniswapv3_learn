// test/UniswapV3Pool.t.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;
import "./ERC20Mintable.sol";
import "../src/UniswapV3Pool.sol";
import "../src/UniswapV3Manager.sol";
import "forge-std/Test.sol";

contract UniswapV3PoolTest is Test {
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
        console.log("setUp mes.sender=");
        console.log(msg.sender);
        token0 = new ERC20Mintable("Ether", "ETH",18);
        token1 = new ERC20Mintable("USDC", "USDC",18);
        manager = new UniswapV3Manager();
    }

    function testManagerSuccess() public {
                TestCaseParams memory params = TestCaseParams({
                    wethBalance: 1 ether,
                    usdcBalance: 5000 ether,
                    currentTick: 85176,
                    lowerTick: 84222,
                    upperTick: 86129,
                    liquidity: 1517882343751509868544,
                    currentSqrtP: 5602277097478614198912276234240,
                    transferInMintCallback: true,
                    transferInSwapCallback: true,
                    mintLiqudity: true
                        });
//                    setupTestCase(params);
                    token0.mint(address(this), params.wethBalance);
                    token0.approve(address(address(manager)),params.wethBalance);
                    token1.mint(address(this), params.usdcBalance);
                    token1.approve(address(address(manager)),params.usdcBalance);
                     pool = new UniswapV3Pool(
                                address(token0),
                                address(token1),
                                params.currentSqrtP,
                                params.currentTick
                            );

                    UniswapV3Pool.CallbackData memory extra = UniswapV3Pool.CallbackData({
                            token0: address(token0),
                            token1: address(token1),
                            payer: address(this)
                    });

                UniswapV3Manager(address(manager)).mint(address(pool),params.lowerTick,
                                params.upperTick,
                                params.liquidity,
                                abi.encode(extra));
            assertEq(
                    token0.balanceOf(address(pool)),
                    0.998976618347425280 ether,
                    "incorrect token0 deposited amount"
                );

    }

}