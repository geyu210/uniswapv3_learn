pragma solidity ^0.8.14;

import "../src/UniswapV3Pool.sol";
import "../src/interfaces/IERC20.sol";
import "forge-std/Test.sol";
    struct CallbackData {
        address token0;
        address token1;
        address payer;
    }
contract UniswapV3Manager {
    bool transferInMintCallback = true;
    bool transferInSwapCallback = true;
    function mint(
        address poolAddress_,
        int24 lowerTick,
        int24 upperTick,
        uint128 liquidity,
        bytes calldata data
    ) public {
        UniswapV3Pool(poolAddress_).mint(
            msg.sender,
            lowerTick,
            upperTick,
            liquidity,
            data
        );
    }

    function swap(address poolAddress_, bytes calldata data) public {
        UniswapV3Pool(poolAddress_).swap(msg.sender, data);
    }

    function uniswapV3MintCallback(
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
            ) public {
            if (transferInMintCallback) {
                UniswapV3Pool.CallbackData memory extra = abi.decode(
                    data,
                    (UniswapV3Pool.CallbackData)
                );
                console.log("extra.payer = ");
                console.log(extra.payer);
                console.log("uniswapV3MintCallback 's msg.sender = ");
                console.log(msg.sender);
//                IERC20(address(extra.token0)).approve(address(extra.payer),amount0);
//                IERC20(address(extra.token1)).approve(address(extra.payer),amount1);
                IERC20(extra.token0).transferFrom(extra.payer, msg.sender, amount0);
                IERC20(extra.token1).transferFrom(extra.payer, msg.sender, amount1);
            }
        }

    function uniswapV3SwapCallback(
            uint256 amount0,
            uint256 amount1,
            bytes calldata data
                ) public {
                    if (transferInMintCallback) {
                        UniswapV3Pool.CallbackData memory extra = abi.decode(
                            data,
                            (UniswapV3Pool.CallbackData)
                        );

                        IERC20(extra.token0).transferFrom(extra.payer, msg.sender, amount0);
                        IERC20(extra.token1).transferFrom(extra.payer, msg.sender, amount1);
                    }
                }  
}
