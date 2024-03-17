const q96 = 2**96
function getBaseLog(x:number, y:number) {
    // return (Math.log(y) / Math.log(x)).toFixed();
    return (Math.log(y) / Math.log(x));
}

let tick_low = getBaseLog(1.0001,4545)
console.log(tick_low)
 tick_low = getBaseLog(1.0001,3500)
console.log(tick_low)
 tick_low = getBaseLog(1.0001,3546)
console.log(tick_low)
tick_low = getBaseLog(1.0001,3600)
console.log(tick_low)
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
    return (Math.sqrt(p)*q96).toFixed()
}

console.log(price_to_sqrtp(5000))

