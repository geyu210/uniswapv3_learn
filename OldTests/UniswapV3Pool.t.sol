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
    }

    function testMintSuccess() public {
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
//

        (uint256 poolBalance0, uint256 poolBalance1) = setupTestCase(params);
        uint256 expectedAmount0 = 0.998976618347425280 ether;
        uint256 expectedAmount1 = 5000 ether;
        assertEq(
            poolBalance0,
            expectedAmount0,
            "incorrect token0 deposited amount"
        );
        assertEq(
            poolBalance1,
            expectedAmount1,
            "incorrect token1 deposited amount"
        );


    }
    function testSwapBuyEth() public {
    TestCaseParams memory params = TestCaseParams({
        wethBalance: 1 ether,
        usdcBalance: 5000 ether,
        currentTick: 85176,
        lowerTick: 84222,
        upperTick: 86129,
        liquidity: 1517882343751509868544,
        currentSqrtP: 5602277097478614198912276234240,
        transferInMintCallback: true,
        transferInSwapCallback: false,
        mintLiqudity: true
    });
    (uint256 poolBalance0, uint256 poolBalance1) = setupTestCase(params);
        token1.mint(address(this), 42 ether);
        console.log(token1.balanceOf(address(this)));
        int256 userBalance0Before = int256(token0.balanceOf(address(this)));
        int256 userBalance1Before = int256(token1.balanceOf(address(this)));
        UniswapV3Pool.CallbackData memory extra = UniswapV3Pool.CallbackData({
            token0: address(token0),
            token1: address(token1),
            payer: address(this)
        });
        (int256 amount0Delta, int256 amount1Delta) = pool.swap(address(this),abi.encode(extra));
        assertEq(amount0Delta, -0.008396714242162444 ether, "invalid ETH out");
        assertEq(amount1Delta, 42 ether, "invalid USDC in");

        assertEq(token0.balanceOf(address(this)),
                uint256(userBalance0Before - amount0Delta),
                "invalid user ETH balance");
        assertEq(token1.balanceOf(address(this)),
                uint256(userBalance1Before - amount1Delta),
                "invalid user usdt balance");

        assertEq(
            token0.balanceOf(address(pool)),
            uint256(int256(poolBalance0) + amount0Delta),
            "invalid pool ETH balance"
        );
        assertEq(
            token1.balanceOf(address(pool)),
            uint256(int256(poolBalance1) + amount1Delta),
            "invalid pool USDC balance"
        );
        (uint160 sqrtPriceX96, int24 tick) = pool.slot0();
        assertEq(
            sqrtPriceX96,
            5604469350942327889444743441197,
            "invalid current sqrtP"
        );
        assertEq(tick, 85184, "invalid current tick");
        assertEq(
            pool.liquidity(),
            1517882343751509868544,
            "invalid current liquidity"
        );
    }


    function setupTestCase(TestCaseParams memory params)
        internal
        returns (uint256 poolBalance0, uint256 poolBalance1)
    {
    token0.mint(address(this), params.wethBalance);

    token1.mint(address(this), params.usdcBalance);
//        poolBalance0 = params.wethBalance;
//        poolBalance1 = params.usdcBalance;
//
    pool = new UniswapV3Pool(
        address(token0),
        address(token1),
        params.currentSqrtP,
        params.currentTick
    );

    if (params.mintLiqudity) {
         UniswapV3Pool.CallbackData memory extra = UniswapV3Pool
                .CallbackData({
                    token0: address(token0),
                    token1: address(token1),
                    payer: address(this)
                });
        (poolBalance0, poolBalance1) = pool.mint(
            address(this),
            params.lowerTick,
            params.upperTick,
            params.liquidity,
            abi.encode(extra)
        );
    }

}



      ////////////////////////////////////////////////////////////////////////////
    //
    // CALLBACKS
    //
    ////////////////////////////////////////////////////////////////////////////


function uniswapV3MintCallback(uint256 amount0, uint256 amount1,bytes calldata data) public {
    if (transferInMintCallback) {
            UniswapV3Pool.CallbackData memory extra = abi.decode(
                data,
                (UniswapV3Pool.CallbackData)
            );

            IERC20(extra.token0).transfer(msg.sender, amount0);
            IERC20(extra.token1).transfer(msg.sender, amount1);
            console.log("uniswapV3MintCallback msg.sender = ");
            console.log(msg.sender);
        }
}
    function uniswapV3SwapCallback(int256 amount0, int256 amount1,bytes calldata data) public {

    if (amount0 > 0) {
        token0.transfer(msg.sender, uint256(amount0));
    }

    if (amount1 > 0) {
        token1.transfer(msg.sender, uint256(amount1));
    }
}

}