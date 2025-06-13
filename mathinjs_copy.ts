import { log } from "console";

const Q96 = 2n ** 96n;

/**
 * 计算以x为底的y的对数
 * 数学公式：log_x(y) = ln(y) / ln(x)
 * @param x 对数的底数
 * @param y 真数
 * @returns 对数值（取整）
 */
function getBaseLog(x: number, y: number): number {
    return Number((Math.log(y) / Math.log(x)).toFixed());
}

/**
 * 将价格转换为tick值（Uniswap V3）
 * 数学公式：tick = ⌊log_{1.0001}(price)⌋
 * 其中 1.0001 是 Uniswap V3 中每个 tick 的价格变化率
 * @param p 价格
 * @returns tick值
 */
function priceTotick(p: number): number {
    return getBaseLog(1.0001, p);
}

/**
 * 将价格转换为 sqrt 价格的 Q96 格式（Uniswap V3）
 * 数学公式：sqrtPriceX96 = ⌊√price × 2^96⌋
 * 其中 2^96 是 Q96 固定点数格式的精度因子
 * @param p 价格
 * @returns sqrt价格的Q96格式
 */
function priceToSqrtP(p: number): bigint {
    return BigInt(Math.floor(Math.sqrt(p) * Number(Q96)));
}

/**
 * 计算流动性（Uniswap V3）
 * @param amount 代币数量
 * @param pa 价格范围下限的 sqrt 价格（Q96格式）
 * @param pb 价格范围上限的 sqrt 价格（Q96格式）
 * @param isToken0 是否为 token0
 * @returns 流动性值 L
 *
 * 数学公式：
 * 对于 token0：
 *   L = Δx / (1/√p_a - 1/√p_b)
 *   简化后：L = Δx × (√p_a × √p_b) / (√p_b - √p_a)
 *
 * 对于 token1：
 *   L = Δy / (√p_b - √p_a)
 *
 * 其中：
 * - Δx 是 token0 的数量
 * - Δy 是 token1 的数量
 * - √p_a 和 √p_b 是价格范围的 sqrt 价格（已经是 Q96 格式）
 */
function calculateLiquidity(amount: number, pa: number, pb: number, isToken0: boolean): bigint {
    const [min, max] = pa < pb ? [pa, pb] : [pb, pa];
    if (isToken0) {
        return BigInt(Math.floor((amount * (min * max) / Number(Q96)) / (max - min)));
    } else {
        return BigInt(Math.floor(amount * Number(Q96) / (max - min)));
    }
}

// 主要逻辑
function main() {
    const ETH = 10n ** 18n;
    const amountEth = 1n * ETH;
    const amountUsdc = 5000n * ETH;

    const priceLow = 4545;
    const priceCurrent = 5000;
    const priceHigh = 5500;

    const sqrtPLow = priceToSqrtP(priceLow);
    const sqrtPCurrent = priceToSqrtP(priceCurrent);
    const sqrtPHigh = priceToSqrtP(priceHigh);

    console.log(`当前 sqrtP 范围: ${sqrtPLow} - ${sqrtPCurrent} - ${sqrtPHigh}`);

    const liq0 = calculateLiquidity(Number(amountEth), Number(sqrtPCurrent), Number(sqrtPHigh), true);
    const liq1 = calculateLiquidity(Number(amountUsdc), Number(sqrtPLow), Number(sqrtPCurrent), false);

    console.log(`流动性0: ${liq0}`);
    console.log(`流动性1: ${liq1}`);

    const liquidity = liq0 < liq1 ? liq0 : liq1;
    console.log(`最终流动性: ${liquidity}`);

    const amountIn = 42n * ETH;
    const priceDiff = (amountIn * Q96) / liquidity;
    const priceNext = sqrtPCurrent + priceDiff;

    console.log(`新价格: ${(priceNext * priceNext) / (Q96 * Q96)}`);
    console.log(`新 sqrtP: ${priceNext}`);
    console.log(`新 tick: ${priceTotick(Number((priceNext * priceNext) / (Q96 * Q96)))}`);

    const number = 1.0001;
    const sqrtResult = Math.sqrt(number);
    console.log(sqrtResult);
    const base = 1.00005;
    const exponent = 85176;
    const result = Math.pow(base, exponent);
    console.log(result);
}

main();