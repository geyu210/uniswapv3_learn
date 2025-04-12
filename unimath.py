import math

min_tick = -887272
max_tick = 887272

q96 = 2**96
eth = 10**18


def price_to_tick(p):
    return math.floor(math.log(p, 1.0001))


def price_to_sqrtp(p):
    return int(math.sqrt(p) * q96)


def tick_to_sqrtp(t):
    return int((1.0001 ** (t / 2)) * q96)


def liquidity0(amount, pa, pb):
    if pa > pb:
        pa, pb = pb, pa
    return (amount * (pa * pb) / q96) / (pb - pa) #q96只是单位，所以不能有次方


def liquidity1(amount, pa, pb):
    if pa > pb:
        pa, pb = pb, pa
    return amount * q96 / (pb - pa)


def calc_amount0(liq, pa, pb):
    if pa > pb:
        pa, pb = pb, pa
    return int(liq * q96 * (pb - pa) / pb / pa)


def calc_amount1(liq, pa, pb):
    if pa > pb:
        pa, pb = pb, pa
    return int(liq * (pb - pa) / q96)






# Liquidity provision
price_low = 4545
price_cur = 5000
price_upp = 5500

print(f"Price range: {price_low}-{price_upp}; current price: {price_cur}")

sqrtp_low = price_to_sqrtp(price_low)
sqrtp_cur = price_to_sqrtp(price_cur)
sqrtp_upp = price_to_sqrtp(price_upp)

amount_eth = 1 * eth
amount_usdc = 5000 * eth

liq0 = liquidity0(amount_eth, sqrtp_cur, sqrtp_upp)
liq1 = liquidity1(amount_usdc, sqrtp_cur, sqrtp_low)
liq = int(min(liq0, liq1))

print(f"Deposit: {amount_eth/eth} ETH, {amount_usdc/eth} USDC; liquidity: {liq}")

# Swap USDC for ETH
amount_in = 42 * eth

print(f"\nSelling {amount_in/eth} USDC")

price_diff = (amount_in * q96) // liq
price_next = sqrtp_cur + price_diff

print("New price:", (price_next / q96) ** 2)
print("New sqrtP:", price_next)
print("New tick:", price_to_tick((price_next / q96) ** 2))

amount_in = calc_amount1(liq, price_next, sqrtp_cur)
amount_out = calc_amount0(liq, price_next, sqrtp_cur)

print("USDC in:", amount_in / eth)
print("ETH out:", amount_out / eth)

# Swap ETH for USDC
amount_in = 0.01337 * eth

print(f"\nSelling {amount_in/eth} ETH")

price_next = int((liq * q96 * sqrtp_cur) // (liq * q96 + amount_in * sqrtp_cur))

print("New price:", (price_next / q96) ** 2)
print("New sqrtP:", price_next)
print("New tick:", price_to_tick((price_next / q96) ** 2))

amount_in = calc_amount0(liq, price_next, sqrtp_cur)
amount_out = calc_amount1(liq, price_next, sqrtp_cur)

print("ETH in:", amount_in / eth)
print("USDC out:", amount_out / eth)

# 从价格到tickBitmapIndex和位置的计算函数
def price_to_bitmap_position(price, fee_tier):
    # 第一步：从价格计算原始tick值
    tick = price_to_tick(price)
    
    # 第二步：确定tickSpacing
    tick_spacing_map = {
        0.05: 10,   # 0.05%费率池子
        0.3: 60,    # 0.3%费率池子
        1: 200      # 1%费率池子
    }
    tick_spacing = tick_spacing_map[fee_tier]
    
    # 第三步：计算压缩后的tick索引
    compressed_tick = tick // tick_spacing
    
    # 第四步：分解为tickBitmapIndex和位置i
    tick_bitmap_index = compressed_tick >> 8  # 右移8位，相当于除以256
    position_i = compressed_tick & 0xFF       # 取低8位，相当于对256取模
    
    return {
        "原始价格": price,
        "原始tick": tick,
        "tickSpacing": tick_spacing,
        "压缩后的tick": compressed_tick,
        "tickBitmapIndex": tick_bitmap_index,
        "位置i": position_i
    }

# 测试函数
if __name__ == "__main__":
    # 测试示例：价格29.5，费率0.3%
    price = (price_next / q96) ** 2
    fee_tier = 0.3
    result = price_to_bitmap_position(price, fee_tier)
    
    print("\n从价格到Bitmap位置的计算")
    print(f"价格: {result['原始价格']}")
    print(f"原始tick: {result['原始tick']}")
    print(f"tickSpacing: {result['tickSpacing']}")
    print(f"压缩后的tick: {result['压缩后的tick']}")
    print(f"tickBitmapIndex: {result['tickBitmapIndex']}")
    print(f"位置i: {result['位置i']}")