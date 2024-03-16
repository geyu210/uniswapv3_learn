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
    """
    :param p: The price value to convert to a tick value.
    :return: The tick value corresponding to the given price.
    """
    tick = int(math.log(p,1.0001))
    return tick
print(pricetotick(4545))
print(pricetotick(5000))
print(pricetotick(5500))

#Uniswap uses Q64.96 number to store \sqrt{P} This is a fixed point number that has 64 bits for the integer part and 96 bits for the fractional part
def price_to_sqrtp(p):
    """
    Calculate the square root of a given price and convert it to an integer.

    :param p: The price value for which to calculate the square root.
    :return: The square root of the price value, rounded to the nearest integer.

    """
    return int(math.sqrt(p) * (2 ** 96))
print((f"price_to_sqrtp(5000) = {price_to_sqrtp(5000)}"))

def liquidity0(amount, pa, pb):
    """Calculate the liquidity for a given amount of tokens.

    :param amount: The amount of tokens.
    :param pa: The price of token A.
    :param pb: The price of token B.
    :return: The liquidity for the given amount of tokens.
    """
    if pa > pb:
        pa,pb = pb,pa
    return amount*(pb*pa/q96)/(pb-pa)
def liquidity1(amount,pa,pb):
    """

    :param amount: The amount of liquidity.
    :param pa: The price of asset A.
    :param pb: The price of asset B.
    :return: The liquidity value.

    """
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
liq = int(min(l0,l1))
print(f"l0 = {l0}")
print(f"l1 = {l1}")
def cacl_amountx(l,pb,pc):
    """
    :param l: The length of the object being"""
    if pc> pb:
        pc,pb = pb,pc
    return l*(pb-pc)/((pc*pb)/q96)

def cacl_amounty(l,pa,pc):
    """
    :param l: The length parameter.
    :param pa: The value of parameter 'pa'.
    :param pc: The value of parameter 'pc'.
    :return: The calculated amount.

    """
    if pa>pc:
        pa,pc = pc,pa
    return l*(pc-pa)/q96
print(int(cacl_amountx(l1,pb,pc)))
print(int(cacl_amounty(l1,pa,pc)))

amount_in = 42 * eth
price_diff = (amount_in * q96) // l1
print(price_diff)
sqrtp_cur = 5602277097478614198912276234240
price_next = sqrtp_cur + price_diff
print("New price:", (price_next / q96) ** 2)
print("New sqrtP:", price_next)
print("New tick:", pricetotick((price_next / q96) ** 2))

amount_in = 0.01337 * eth
print(f"\nSelling {amount_in/eth} ETH")
price_next = int((liq * q96 * sqrtp_cur) // (liq * q96 + amount_in *sqrtp_cur))
print("New price:" , (price_next / q96) ** 2)
print("New sqrtP:", price_next)
print("New tick:", pricetotick((price_next / q96) ** 2))

amount_in = cacl_amountx(liq,price_next,sqrtp_cur)
amount_out = cacl_amounty(liq,price_next,sqrtp_cur)

print("ETH in", amount_in/eth)
print("USDC out:" , amount_out/eth)

tick = 4 # 101
word_pos = tick >> 1
bit_pos = tick % 256
print(f"Word {word_pos}, bit {bit_pos}")
