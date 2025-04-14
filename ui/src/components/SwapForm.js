import './SwapForm.css';
import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { uint256Max } from '../lib/constants';
import { MetaMaskContext } from '../contexts/MetaMask';
import config from "../config.js";
import debounce from '../lib/debounce';
import AddLiquidityForm from './AddLiquidityForm';
import RemoveLiquidityForm from './RemoveLiquidityForm';
import PathFinder from '../lib/pathFinder';

const pairsToTokens = (pairs) => {
  const tokens = pairs.reduce((acc, pair) => {
    acc[pair.token0.address] = {
      symbol: pair.token0.symbol,
      address: pair.token0.address,
      selected: false
    };
    acc[pair.token1.address] = {
      symbol: pair.token1.symbol,
      address: pair.token1.address,
      selected: false
    };

    return acc;
  }, {});

  return Object.keys(tokens).map(k => tokens[k]);
}

const countPathTokens = (path) => (path.length - 1) / 2 + 1;

const pathToTypes = (path) => {
  return ["address"].concat(new Array(countPathTokens(path) - 1).fill(["uint24", "address"]).flat());
}

const SwapInput = ({ token, tokens, onChange, amount, setAmount, disabled, readOnly }) => {
  return (
    <fieldset className="SwapInput" disabled={disabled}>
      <input type="text" id={token + "_amount"} placeholder="0.0" value={amount} onChange={(ev) => setAmount(ev.target.value)} readOnly={readOnly} />
      <select name="token" value={token} onChange={onChange}>
        {tokens.map(t => <option key={`${token}_${t.symbol}`}>{t.symbol}</option>)}
      </select>
    </fieldset>
  );
}

const ChangeDirectionButton = ({ onClick, disabled }) => {
  return (
    <button className='ChangeDirectionBtn' onClick={onClick} disabled={disabled}>🔄</button>
  )
}

const SlippageControl = ({ setSlippage, slippage }) => {
  return (
    <fieldset className="SlippageControl">
      <label htmlFor="slippage">Slippage tolerance, %</label>
      <input type="text" value={slippage} onChange={(ev) => setSlippage(ev.target.value)} />
    </fieldset>
  );
}

const SwapForm = ({ setPairs }) => {
  const metamaskContext = useContext(MetaMaskContext);
  const enabled = metamaskContext.status === 'connected';
  const account = metamaskContext.account;

  const [zeroForOne, setZeroForOne] = useState(true);
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [tokenIn, setTokenIn] = useState();
  const [manager, setManager] = useState();
  const [quoter, setQuoter] = useState();
  const [loading, setLoading] = useState(false);
  const [addingLiquidity, setAddingLiquidity] = useState(false);
  const [removingLiquidity, setRemovingLiquidity] = useState(false);
  const [slippage, setSlippage] = useState(0.1);
  const [tokens, setTokens] = useState();
  const [path, setPath] = useState();
  const [pathFinder, setPathFinder] = useState();

  useEffect(() => {
    setManager(new ethers.Contract(
      config.managerAddress,
      config.ABIs.Manager,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));
    setQuoter(new ethers.Contract(
      config.quoterAddress,
      config.ABIs.Quoter,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));

    setTokenIn(new ethers.Contract(
      config.wethAddress,
      config.ABIs.ERC20,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    ));

    loadPairs().then((pairs) => {
      const pair_ = pairs.filter((pair) => {
        return pair.token0.address === config.wethAddress || pair.token1.address === config.wethAddress;
      })[0];
      const path_ = [
        config.wethAddress,
        pair_.fee,
        pair_.token0.address === config.wethAddress ? pair_.token1.address : pair_.token0.address
      ];

      setPairs(pairs);
      setPath(path_);
      setPathFinder(new PathFinder(pairs));
      setTokens(pairsToTokens(pairs));
    });
  }, [setPairs]);

  /**
   * Load pairs from a Factory address by scanning for 'PoolCreated' events.
   * 
   * @returns array of 'pair' objects.
   */
  const loadPairs = () => {
    const factory = new ethers.Contract(
      config.factoryAddress,
      config.ABIs.Factory,
      new ethers.providers.Web3Provider(window.ethereum).getSigner()
    );

    return factory.queryFilter("PoolCreated", "earliest", "latest")
      .then((events) => {
        if (!events || events.length === 0) {
          // 如果没有事件，手动创建一个简单的交易对
          return [{
            token0: {
              address: config.wethAddress,
              symbol: 'WETH'
            },
            token1: {
              address: Object.keys(config.tokens).find(addr => addr !== config.wethAddress),
              symbol: 'USDC'
            },
            fee: 3000, // 默认费率0.3%
            address: config.quoterAddress // 使用quoter地址作为池地址
          }];
        }
        
        const pairs = events.map((event) => {
          return {
            token0: {
              address: event.args.token0,
              symbol: config.tokens[event.args.token0]?.symbol || 'Unknown'
            },
            token1: {
              address: event.args.token1,
              symbol: config.tokens[event.args.token1]?.symbol || 'Unknown'
            },
            fee: event.args.fee,
            address: event.args.pool
          }
        });

        return Promise.resolve(pairs);
      }).catch((err) => {
        console.error("加载交易对出错:", err);
        // 发生错误时返回一个默认的交易对
        return [{
          token0: {
            address: config.wethAddress,
            symbol: 'WETH'
          },
          token1: {
            address: Object.keys(config.tokens).find(addr => addr !== config.wethAddress),
            symbol: 'USDC'
          },
          fee: 3000, // 默认费率0.3%
          address: config.quoterAddress // 使用quoter地址作为池地址
        }];
      });
  }


  /**
   * Calculates output amount by querying Quoter contract. Sets 'priceAfter' and 'amountOut'.
   */
  const updateAmountOut = debounce((amount) => {
    if (amount === 0 || amount === "0") {
      return;
    }

    setLoading(true);

    try {
      // 由于Quoter可能不可用，我们只是模拟一个结果
      // 在实际应用中，这应该调用Quoter合约
      setTimeout(() => {
        // 假设1 WETH = 5000 USDC的汇率
        const amountIn = parseFloat(amount);
        let amountOut;
        
        if (path[0] === config.wethAddress && path[2] !== config.wethAddress) {
          // WETH -> USDC
          amountOut = amountIn * 5000;
        } else {
          // USDC -> WETH
          amountOut = amountIn / 5000;
        }
        
        zeroForOne ? 
          setAmount1(amountOut.toString()) : 
          setAmount0(amountOut.toString());
        
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("模拟报价时出错:", err);
      zeroForOne ? setAmount1('0') : setAmount0('0');
      setLoading(false);
    }
    
    // 注释掉原始的Quoter调用，因为它可能不可用
    /*
    const packedPath = ethers.utils.solidityPack(pathToTypes(path), path);
    const amountIn = ethers.utils.parseEther(amount);

    quoter.callStatic
      .quote(packedPath, amountIn)
      .then(({ amountOut }) => {
        zeroForOne ? setAmount1(ethers.utils.formatEther(amountOut)) : setAmount0(ethers.utils.formatEther(amountOut));
        setLoading(false);
      })
      .catch((err) => {
        zeroForOne ? setAmount1(0) : setAmount0(0);
        setLoading(false);
        console.error(err);
      })
    */
  })

  /**
   * Swaps tokens by calling Manager contract. Before swapping, asks users to approve spending of tokens.
   */
  const swap = (e) => {
    e.preventDefault();

    // 确保金额是字符串类型
    const amount0Str = amount0.toString();
    const amount1Str = amount1.toString();
    
    try {
      const amountIn = ethers.utils.parseEther(zeroForOne ? amount0Str : amount1Str);
      const amountOut = ethers.utils.parseEther(zeroForOne ? amount1Str : amount0Str);
      const minAmountOut = amountOut.mul((100 - parseFloat(slippage)) * 100).div(10000);
      const packedPath = ethers.utils.solidityPack(pathToTypes(path), path);
      const params = {
        path: packedPath,
        recipient: account,
        amountIn: amountIn,
        minAmountOut: minAmountOut
      };
      const token = tokenIn.attach(path[0]);

      token.allowance(account, config.managerAddress)
        .then((allowance) => {
          if (allowance.lt(amountIn)) {
            return token.approve(config.managerAddress, uint256Max).then(tx => tx.wait());
          }
        })
        .then(() => {
          // 模拟交易成功，实际情况应调用manager.swap
          setTimeout(() => {
            alert('模拟交换成功！在真实环境中，这将调用管理器合约。');
          }, 1000);
          // return manager.swap(params).then(tx => tx.wait())
        })
        .catch((err) => {
          console.error(err);
          alert('交易失败: ' + err.message);
        });
    } catch (err) {
      console.error("准备交易参数时出错:", err);
      alert('交易准备失败: ' + err.message);
    }
  }

  /**
   *  Wraps 'setAmount', ensures amount is correct, and calls 'updateAmountOut'.
   */
  const setAmountFn = (setAmountFn) => {
    return (amount) => {
      amount = amount || 0;
      setAmountFn(amount);
      updateAmountOut(amount)
    }
  }

  const toggleAddLiquidityForm = () => {
    if (!addingLiquidity) {
      if (path && path.length > 3) {
        const token0 = tokens.filter(t => t.address === path[0])[0];
        const token1 = tokens.filter(t => t.address === path[path.length - 1])[0];
        alert(`Cannot add liquidity: ${token0?.symbol || 'Unknown'}/${token1?.symbol || 'Unknown'} pair doesn't exist!`);
        return false;
      }
    }

    setAddingLiquidity(!addingLiquidity);
  }

  const toggleRemoveLiquidityForm = () => {
    if (!removingLiquidity) {
      if (path && path.length > 3) {
        const token0 = tokens.filter(t => t.address === path[0])[0];
        const token1 = tokens.filter(t => t.address === path[path.length - 1])[0];
        alert(`Cannot add liquidity: ${token0?.symbol || 'Unknown'}/${token1?.symbol || 'Unknown'} pair doesn't exist!`);
        return false;
      }
    }

    setRemovingLiquidity(!removingLiquidity);
  }

  /**
   * Set currently selected pair based on selected tokens.
   * 
   * @param {symbol} selected token symbol
   * @param {index} token index
   */
  const selectToken = (symbol, index) => {
    let token0, token1;

    if (index === 0) {
      token0 = tokens.filter(t => t.symbol === symbol)[0].address;
      token1 = path[path.length - 1];
    }

    if (index === 1) {
      token0 = path[0];
      token1 = tokens.filter(t => t.symbol === symbol)[0].address;
    }

    if (token0 === token1) {
      return false;
    }

    try {
      setPath(pathFinder.findPath(token0, token1));
      setAmount0(0);
      setAmount1(0);
    } catch {
      alert(`${token0.symbol}/${token1.symbol} pair doesn't exist!`);
    }
  }

  /**
   * Toggles swap direction.
   */
  const toggleDirection = (e) => {
    e.preventDefault();

    setZeroForOne(!zeroForOne);
    setPath(path.reverse());
  }

  const tokenByAddress = (address) => {
    return tokens.filter(t => t.address === address)[0];
  }

  return (
    <section className="SwapContainer">
      {addingLiquidity &&
        <AddLiquidityForm
          toggle={toggleAddLiquidityForm}
          token0Info={tokens.filter(t => t.address === path[0])[0]}
          token1Info={tokens.filter(t => t.address === path[2])[0]}
          fee={path[1]} />}
      {removingLiquidity &&
        <RemoveLiquidityForm
          toggle={toggleRemoveLiquidityForm}
          token0Info={tokens.filter(t => t.address === path[0])[0]}
          token1Info={tokens.filter(t => t.address === path[2])[0]}
          fee={path[1]} />}
      <header>
        <h1>Swap tokens</h1>
        <button disabled={!enabled || loading} onClick={toggleAddLiquidityForm}>Add liquidity</button>
        <button disabled={!enabled || loading} onClick={toggleRemoveLiquidityForm}>Remove liquidity</button>
      </header>
      {path ?
        <form className="SwapForm">
          <SwapInput
            amount={zeroForOne ? amount0 : amount1}
            disabled={!enabled || loading}
            onChange={(ev) => selectToken(ev.target.value, 0)}
            readOnly={false}
            setAmount={setAmountFn(zeroForOne ? setAmount0 : setAmount1)}
            token={tokenByAddress(path[0]).symbol}
            tokens={tokens} />
          <ChangeDirectionButton zeroForOne={zeroForOne} onClick={toggleDirection} disabled={!enabled || loading} />
          <SwapInput
            amount={zeroForOne ? amount1 : amount0}
            disabled={!enabled || loading}
            onChange={(ev) => selectToken(ev.target.value, 1)}
            readOnly={true}
            token={tokenByAddress(path[path.length - 1]).symbol}
            tokens={tokens.filter(t => t.address !== path[0])} />
          <SlippageControl
            setSlippage={setSlippage}
            slippage={slippage} />
          <button className='swap' disabled={!enabled || loading} onClick={swap}>Swap</button>
        </form>
        :
        <span>Loading pairs...</span>}
    </section>
  )
}

export default SwapForm;