import math
q96 = 2**96
eth = 10**18
#pricerange : 4545 - 5500
#设置中i-max= 887272   对应的P 为 3.4025678683306347e+38
i = math.log(math.sqrt(5500),math.sqrt(1.0001))
print(i)
i = math.log(5500,1.0001)
print(i)
print(1.0001**86129)
i_max = 1.0001 ** 887272
print(i_max)
i_max = 1.0001 ** 207272
print(i_max)

def pricetotick(p):
    tick = int(math.log(p,1.0001))
    return tick
print(pricetotick(4545))
print(pricetotick(5000))
print(pricetotick(5500))

#Uniswap uses Q64.96 number to store \sqrt{P} This is a fixed point number that has 64 bits for the integer part and 96 bits for the fractional part
def price_to_sqrtp(p):
    return int(math.sqrt(p) * (2 ** 96))
print(price_to_sqrtp(5000))

def liquidity0(amount, pa, pb):
    if pa > pb:
        pa,pb = pb,pa
    return amount*(pb*pa/q96)/(pb-pa)
def liquidity1(amount,pa,pb):
    if pa> pb:
        pa,pb = pb,pa
    return amount * q96/(pb-pa)
pa = price_to_sqrtp(4545)
pc = price_to_sqrtp(5000)
pb = price_to_sqrtp(5500)
amount_eth = 1 * eth
amount_usdc = 5000 * eth
l0 = int(liquidity0(amount_eth,pb,pc))
l1 = int(liquidity1(amount_usdc,pa,pc))
print(l0)
print(l1)
def cacl_amountx(l,pb,pc):
    if pc> pb:
        pc,pb = pb,pc
    return l*(pb-pc)/((pc*pb)/q96)

def cacl_amounty(l,pa,pc):
    if pa>pc:
        pa,pc = pc,pa
    return l*(pc-pa)/q96
print(int(cacl_amountx(l1,pb,pc)))
print(int(cacl_amounty(l1,pa,pc)))