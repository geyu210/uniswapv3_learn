import { log } from "console";

const q96 =2**96
function getBaseLog(x:number, y:number) {
    return (Math.log(y) / Math.log(x)).toFixed();
    // return (Math.log(y) / Math.log(x));
}

let tick_low = getBaseLog(1.0001,4545)
console.log(tick_low)
//  tick_low = getBaseLog(1.0001,3500)
// console.log(tick_low)
//  tick_low = getBaseLog(1.0001,3546)
// console.log(tick_low)
// tick_low = getBaseLog(1.0001,3600)
// console.log(tick_low)
let tick_now = getBaseLog(1.0001,5000)
console.log(tick_now)
let tick_high = getBaseLog(1.0001,5500)
console.log(tick_high)
function pricetotick(p:number){
    return getBaseLog(1.0001,p)
}
console.log(pricetotick(4545))
console.log(pricetotick(5000))
console.log(pricetotick(5500))

function price_to_sqrtp(p:number){
    // 转换p为BigInt
    let bigP = BigInt(Math.round(p))
    let sqrtP = Math.sqrt(Number(bigP)); // 计算平方根
    // 计算平方根
    let result = BigInt(sqrtP * q96)

    return result;

}

console.log(price_to_sqrtp(5000))

function liquidity0(amount:bigint,pa:bigint,pb:bigint){
    if (pa > pb){
        [pa, pb] = [pb, pa]
    }
    return  BigInt((amount * (pa * pb) / BigInt(q96)) / (pb - pa))

}

function liquidity1(amount:bigint,pa:bigint,pb:bigint){
    if (pa > pb){
        [pa, pb] = [pb, pa]
    }
    return BigInt(amount * BigInt(q96) / (pb - pa))
}

let eth = BigInt(10**18)
let amount_eth = 1n * eth
let amount_usdc = 5000n * eth

let sqrtp_low = price_to_sqrtp(4545)
let sqrtp_cur = price_to_sqrtp(5000)
let sqrtp_upp = price_to_sqrtp(5500)
console.log(`Current sqrtp_low: ${sqrtp_low}`);
console.log(`Current sqrtp_cur: ${sqrtp_cur}`);
console.log(`Current sqrtp_upp: ${sqrtp_upp}`);

let liq0 = liquidity0(amount_eth, sqrtp_cur, sqrtp_upp)
let liq1 = liquidity1(amount_usdc, sqrtp_low, sqrtp_cur)
console.log(`Liquidity0: ${liq0}`);
console.log(`Liquidity1: ${liq1}`);
let liq = liq0 < liq1 ? liq0 : liq1
console.log(`Liquidity: ${liq}`);

let amount_in = 42n * eth
let price_diff = (amount_in * BigInt(q96))  / liq
let price_next = sqrtp_cur + price_diff
console.log(`New price: ${(price_next / BigInt(q96)) ** 2n}`)
console.log(`New sqrtP: ${price_next} `)
console.log(`New tick: ${pricetotick(Number(price_next / BigInt(q96)))}`)

//=== 以上是BigInt的计算，以下是number的计算，实验证明，BigInt的计算结果损失精度，所以应该先用number计算，再转换为BigInt        

function price_to_sqrtp_number(p:number){
    let sqrtP = Math.sqrt(Number(p)); // 计算平方根
    // 计算平方根
    let result = sqrtP * q96
    return result;
}
function liquidity0_num(amount:number,pa:number,pb:number){
    if (pa > pb){
        [pa, pb] = [pb, pa]
    }
    return  (amount * (pa * pb) / q96) / (pb - pa)

}

function liquidity1_num(amount:number,pa:number,pb:number){
    if (pa > pb){
        [pa, pb] = [pb, pa]
    }
    return amount * q96 / (pb - pa)
}

console.log(price_to_sqrtp(5000))
let eth_num = 10**18
let amount_eth_num = 1 * eth_num
let amount_usdc_num = 5000 * eth_num

let sqrtp_low_num = price_to_sqrtp_number(4545)
let sqrtp_cur_num = price_to_sqrtp_number(5000)
let sqrtp_upp_num = price_to_sqrtp_number(5500)

console.log(`Current sqrtp_low_num: ${BigInt(sqrtp_low_num)}`);
console.log(`Current sqrtp_cur_num: ${BigInt(sqrtp_cur_num)}`);
console.log(`Current sqrtp_upp_num: ${BigInt(sqrtp_upp_num)}`);
let liq0_num = liquidity0_num(amount_eth_num, sqrtp_cur_num, sqrtp_upp_num)
let liq1_num = liquidity1_num(amount_usdc_num, sqrtp_low_num, sqrtp_cur_num)
console.log(`Liquidity0_num: ${BigInt(liq0_num)}`);
console.log(`Liquidity1_num: ${BigInt(liq1_num)}`);
let liq_num = liq0_num < liq1_num ? liq0_num : liq1_num
console.log(`Liquidity_num: ${BigInt(liq_num)}`);
let amount_in_num = 42 * eth_num
let price_diff_num = (amount_in_num * q96)  / liq_num
console.log(`amount_in_num: ${BigInt(amount_in_num)}`)
console.log(`Price_diff_num: ${BigInt(price_diff_num)}`);
let price_next_num = sqrtp_cur_num + price_diff_num

console.log(`New price_num: ${(price_next_num / q96) ** 2}`)
console.log(`New sqrtP_num: ${BigInt(price_next_num)} `)
console.log(`New tick_num: ${pricetotick((price_next_num / q96) ** 2)}`)