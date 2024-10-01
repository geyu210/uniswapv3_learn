import { log } from "console";

const Q96 = 2n ** 96n;

// 辅助函数
function getBaseLog(x: number, y: number): number {
    return Number((Math.log(y) / Math.log(x)).toFixed());
}

function priceTotick(p: number): number {
    return getBaseLog(1.0001, p);
}

function priceToSqrtP(p: number): bigint {
    return BigInt(Math.floor(Math.sqrt(p) * Number(Q96)));
}

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