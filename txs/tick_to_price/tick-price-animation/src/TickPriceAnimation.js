import React, { useState, useEffect, useRef } from 'react';

const TickPriceAnimation = () => {
    // 改为使用 tick 作为主要状态
    const [tick, setTick] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(50); // 调整速度范围，单位：tick/帧
    const [showPrice, setShowPrice] = useState(true);
    const [showTick, setShowTick] = useState(true);
    const [showSqrt, setShowSqrt] = useState(true);
    const [logScale, setLogScale] = useState(true);
    const animationRef = useRef(null);

    // Tick 范围
    const maxTick = 100000;
    const minTick = -23025; // 对应 price = 0.1

    // 从 tick 计算 price
    const calculatePrice = (t) => {
        return Math.pow(1.0001, t);
    };

    // 计算 tick 值（从 price）
    const calculateTick = (p) => {
        if (p <= 0) return 0;
        return Math.log(p) / Math.log(1.0001);
    };

    // 计算平方根价格
    const calculateSqrtPrice = (p) => {
        return Math.sqrt(p);
    };

    // 从当前 tick 计算衍生值
    const price = calculatePrice(tick);
    const sqrtPrice = calculateSqrtPrice(price);

    // 计算边界价格
    const maxPrice = calculatePrice(maxTick);
    const minPrice = calculatePrice(minTick);

    // 生成曲线数据点
    const generateCurvePoints = () => {
        const points = [];

        if (logScale) {
            // 对数分布的点
            for (let i = 0; i <= 200; i++) {
                const logMin = Math.log10(minPrice);
                const logMax = Math.log10(maxPrice);
                const logValue = logMin + (logMax - logMin) * (i / 200);
                const p = Math.pow(10, logValue);
                points.push({
                    price: p,
                    tick: calculateTick(p),
                    sqrtPrice: calculateSqrtPrice(p)
                });
            }
        } else {
            // 线性分布的点
            for (let i = 0; i <= 200; i++) {
                const p = minPrice + (maxPrice - minPrice) * (i / 200);
                points.push({
                    price: p,
                    tick: calculateTick(p),
                    sqrtPrice: calculateSqrtPrice(p)
                });
            }
        }

        return points;
    };

    const curvePoints = generateCurvePoints();

    // 动画循环 - 基于 tick 推进
    useEffect(() => {
        if (isPlaying) {
            const animate = () => {
                setTick(prev => {
                    // 线性增加 tick 值
                    let next = prev + speed;
                    if (next > maxTick) return minTick;
                    if (next < minTick) return minTick;
                    return next;
                });
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, speed]);

    // SVG 参数
    const width = 900;
    const height = 600;
    const margin = { top: 60, right: 120, bottom: 80, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // X轴比例尺（价格）
    const xScale = (p) => {
        if (logScale) {
            const logMin = Math.log10(minPrice);
            const logMax = Math.log10(maxPrice);
            const logValue = Math.log10(p);
            return ((logValue - logMin) / (logMax - logMin)) * chartWidth;
        } else {
            return ((p - minPrice) / (maxPrice - minPrice)) * chartWidth;
        }
    };

    // 归一化函数 - 将所有值映射到 0-1 范围
    const normalize = (value, min, max) => {
        return (value - min) / (max - min);
    };

    // Y轴比例尺 - 使用归一化处理
    const yScale = (value, type) => {
        let normalized;
        switch (type) {
            case 'tick':
                normalized = normalize(value, minTick, maxTick);
                break;
            case 'price':
                normalized = normalize(value, 0, maxPrice);
                break;
            case 'sqrt':
                normalized = normalize(value, 0, Math.sqrt(maxPrice));
                break;
            default:
                normalized = 0;
        }
        return chartHeight - (normalized * chartHeight);
    };

    // 生成 X 轴刻度
    const generateXTicks = () => {
        if (logScale) {
            return [0.1, 1, 10, 100, 1000, 10000, maxPrice];
        } else {
            const ticks = [];
            for (let i = 0; i <= 5; i++) {
                ticks.push(minPrice + (maxPrice - minPrice) * (i / 5));
            }
            return ticks;
        }
    };

    const xTicks = generateXTicks();

    return (
        <div className="w-full max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4">
                Price、Tick 与 √Price 的关系曲线
            </h2>

            {/* 数学公式 */}
            <div className="bg-white p-4 rounded-lg mb-4 shadow">
                <h3 className="text-lg font-semibold mb-2">核心公式：</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-mono bg-green-50 p-2 rounded">
                            tick ∈ [-23k, 100k]
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Tick 范围</div>
                    </div>
                    <div className="text-center">
                        <div className="font-mono bg-blue-50 p-2 rounded">
                            price = 1.0001^tick
                        </div>
                        <div className="text-xs text-gray-600 mt-1">价格计算公式</div>
                    </div>
                    <div className="text-center">
                        <div className="font-mono bg-purple-50 p-2 rounded">
                            sqrtPrice = √(1.0001^tick)
                        </div>
                        <div className="text-xs text-gray-600 mt-1">平方根价格</div>
                    </div>
                </div>
            </div>

            {/* 当前值显示 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`p-4 rounded-lg transition-all ${showPrice ? 'bg-blue-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className="text-sm text-gray-600">当前价格 (Price)</div>
                    <div className="text-2xl font-mono font-bold text-blue-600">
                        {price < 100 ? price.toFixed(4) : price.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        归一化: {(normalize(price, 0, maxPrice) * 100).toFixed(1)}%
                    </div>
                </div>
                <div className={`p-4 rounded-lg transition-all ${showTick ? 'bg-green-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className="text-sm text-gray-600">当前 Tick 值</div>
                    <div className="text-2xl font-mono font-bold text-green-600">
                        {Math.floor(tick).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        归一化: {(normalize(tick, minTick, maxTick) * 100).toFixed(1)}%
                    </div>
                </div>
                <div className={`p-4 rounded-lg transition-all ${showSqrt ? 'bg-purple-100' : 'bg-gray-100 opacity-50'}`}>
                    <div className="text-sm text-gray-600">平方根价格 (√Price)</div>
                    <div className="text-2xl font-mono font-bold text-purple-600">
                        {sqrtPrice.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        归一化: {(normalize(sqrtPrice, 0, Math.sqrt(maxPrice)) * 100).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* SVG 图表 */}
            <svg width={width} height={height} className="bg-white rounded-lg shadow">
                <defs>
                    {/* 渐变定义 */}
                    <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="tickGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#16a34a" stopOpacity="0.8"/>
                    </linearGradient>
                    <linearGradient id="sqrtGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8"/>
                    </linearGradient>
                </defs>

                <g transform={`translate(${margin.left},${margin.top})`}>
                    {/* 背景网格 */}
                    <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="#fafafa" />

                    {/* X轴网格线 */}
                    {xTicks.map(p => (
                        <g key={`grid-x-${p}`}>
                            <line
                                x1={xScale(p)}
                                y1={0}
                                x2={xScale(p)}
                                y2={chartHeight}
                                stroke="#e5e7eb"
                                strokeDasharray="2,2"
                            />
                            <text
                                x={xScale(p)}
                                y={chartHeight + 25}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#6b7280"
                            >
                                {p < 1 ? p.toFixed(1) : p >= 1000 ? `${(p/1000).toFixed(0)}k` : p.toFixed(0)}
                            </text>
                        </g>
                    ))}

                    {/* Y轴网格线 (归一化的百分比) */}
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
                        <g key={`grid-y-${v}`}>
                            <line
                                x1={0}
                                y1={chartHeight - v * chartHeight}
                                x2={chartWidth}
                                y2={chartHeight - v * chartHeight}
                                stroke="#e5e7eb"
                                strokeDasharray="2,2"
                            />
                            <text
                                x={-10}
                                y={chartHeight - v * chartHeight + 5}
                                textAnchor="end"
                                fontSize="11"
                                fill="#6b7280"
                            >
                                {(v * 100).toFixed(0)}%
                            </text>
                        </g>
                    ))}

                    {/* 坐标轴 */}
                    <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#374151" strokeWidth="2"/>
                    <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth="2"/>

                    {/* 轴标签 */}
                    <text
                        x={chartWidth / 2}
                        y={chartHeight + 55}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#374151"
                    >
                        Price {logScale ? '(对数刻度)' : '(线性刻度)'}
                    </text>
                    <text
                        x={-chartHeight / 2}
                        y={-70}
                        transform="rotate(-90)"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#374151"
                    >
                        归一化值 (%)
                    </text>

                    {/* 曲线 */}
                    {showPrice && (
                        <path
                            d={`M ${curvePoints.map(p => `${xScale(p.price)},${yScale(p.price, 'price')}`).join(' L ')}`}
                            fill="none"
                            stroke="url(#priceGradient)"
                            strokeWidth="3"
                            opacity="0.8"
                        />
                    )}

                    {showTick && (
                        <path
                            d={`M ${curvePoints.map(p => `${xScale(p.price)},${yScale(p.tick, 'tick')}`).join(' L ')}`}
                            fill="none"
                            stroke="url(#tickGradient)"
                            strokeWidth="3"
                            opacity="0.8"
                        />
                    )}

                    {showSqrt && (
                        <path
                            d={`M ${curvePoints.map(p => `${xScale(p.price)},${yScale(p.sqrtPrice, 'sqrt')}`).join(' L ')}`}
                            fill="none"
                            stroke="url(#sqrtGradient)"
                            strokeWidth="3"
                            opacity="0.8"
                        />
                    )}

                    {/* 当前位置指示线 */}
                    <line
                        x1={xScale(price)}
                        y1={0}
                        x2={xScale(price)}
                        y2={chartHeight}
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        opacity="0.5"
                    />

                    {/* 当前点 */}
                    {showPrice && (
                        <>
                            <circle
                                cx={xScale(price)}
                                cy={yScale(price, 'price')}
                                r="6"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="2"
                            />
                            <g transform={`translate(${xScale(price) + 10}, ${yScale(price, 'price')})`}>
                                <rect x="0" y="-10" width="60" height="20" fill="white" opacity="0.9" rx="2"/>
                                <text x="30" y="3" textAnchor="middle" fontSize="10" fill="#3b82f6">
                                    {price < 100 ? price.toFixed(2) : price.toFixed(0)}
                                </text>
                            </g>
                        </>
                    )}

                    {showTick && (
                        <>
                            <circle
                                cx={xScale(price)}
                                cy={yScale(tick, 'tick')}
                                r="6"
                                fill="#22c55e"
                                stroke="#ffffff"
                                strokeWidth="2"
                            />
                            <g transform={`translate(${xScale(price) + 10}, ${yScale(tick, 'tick')})`}>
                                <rect x="0" y="-10" width="60" height="20" fill="white" opacity="0.9" rx="2"/>
                                <text x="30" y="3" textAnchor="middle" fontSize="10" fill="#22c55e">
                                    {Math.floor(tick).toLocaleString()}
                                </text>
                            </g>
                        </>
                    )}

                    {showSqrt && (
                        <>
                            <circle
                                cx={xScale(price)}
                                cy={yScale(sqrtPrice, 'sqrt')}
                                r="6"
                                fill="#8b5cf6"
                                stroke="#ffffff"
                                strokeWidth="2"
                            />
                            <g transform={`translate(${xScale(price) + 10}, ${yScale(sqrtPrice, 'sqrt')})`}>
                                <rect x="0" y="-10" width="60" height="20" fill="white" opacity="0.9" rx="2"/>
                                <text x="30" y="3" textAnchor="middle" fontSize="10" fill="#8b5cf6">
                                    {sqrtPrice.toFixed(2)}
                                </text>
                            </g>
                        </>
                    )}

                    {/* 右侧Y轴标签 */}
                    <g transform={`translate(${chartWidth + 10}, 0)`}>
                        {/* Price 标签 */}
                        <text x="0" y="20" fontSize="12" fill="#3b82f6" fontWeight="bold">Price</text>
                        <text x="0" y="35" fontSize="10" fill="#6b7280">0 - {maxPrice.toLocaleString()}</text>

                        {/* Tick 标签 */}
                        <text x="0" y="60" fontSize="12" fill="#22c55e" fontWeight="bold">Tick</text>
                        <text x="0" y="75" fontSize="10" fill="#6b7280">{minTick.toLocaleString()} - 100k</text>

                        {/* Sqrt 标签 */}
                        <text x="0" y="100" fontSize="12" fill="#8b5cf6" fontWeight="bold">√Price</text>
                        <text x="0" y="115" fontSize="10" fill="#6b7280">0 - {Math.sqrt(maxPrice).toFixed(0)}</text>
                    </g>
                </g>
            </svg>

            {/* 控制面板 */}
            <div className="mt-6 space-y-4">
                {/* 播放控制 */}
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        {isPlaying ? '暂停' : '播放'}
                    </button>

                    <button
                        onClick={() => setTick(0)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                        重置
                    </button>

                    <div className="flex items-center gap-2">
                        <label className="text-sm">速度：</label>
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-xs text-gray-600">{speed} tick/帧</span>
                    </div>
                </div>

                {/* Tick 控制 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold">Tick 值：</label>
                    <input
                        type="range"
                        min={minTick}
                        max={maxTick}
                        step="100"
                        value={tick}
                        onChange={(e) => {
                            setIsPlaying(false);
                            setTick(parseFloat(e.target.value));
                        }}
                        className="flex-1"
                    />
                    <input
                        type="number"
                        value={Math.floor(tick)}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= minTick && val <= maxTick) {
                                setIsPlaying(false);
                                setTick(val);
                            }
                        }}
                        className="w-28 px-2 py-1 border rounded"
                    />
                </div>

                {/* 快速跳转按钮 */}
                <div className="flex items-center gap-2">
                    <label className="text-sm">快速跳转：</label>
                    <button
                        onClick={() => { setIsPlaying(false); setTick(-10000); }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        -10k
                    </button>
                    <button
                        onClick={() => { setIsPlaying(false); setTick(0); }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        0
                    </button>
                    <button
                        onClick={() => { setIsPlaying(false); setTick(10000); }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        10k
                    </button>
                    <button
                        onClick={() => { setIsPlaying(false); setTick(50000); }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        50k
                    </button>
                    <button
                        onClick={() => { setIsPlaying(false); setTick(100000); }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        100k
                    </button>
                </div>

                {/* 显示控制 */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold">显示曲线：</label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showPrice}
                            onChange={(e) => setShowPrice(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-blue-600">Price</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showTick}
                            onChange={(e) => setShowTick(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-green-600">Tick</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showSqrt}
                            onChange={(e) => setShowSqrt(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-purple-600">√Price</span>
                    </label>
                    <div className="ml-4 flex items-center gap-2">
                        <label className="text-sm">刻度：</label>
                        <button
                            onClick={() => setLogScale(!logScale)}
                            className={`px-3 py-1 rounded text-sm ${
                                logScale ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {logScale ? '对数' : '线性'}
                        </button>
                    </div>
                </div>

                {/* 说明 */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
                    <h4 className="font-semibold mb-2">使用 Tick 推进的优势：</h4>
                    <ul className="space-y-1">
                        <li>• <span className="text-green-600 font-semibold">Tick 线性增长</span>：动画速度恒定，更容易控制</li>
                        <li>• <span className="text-blue-600 font-semibold">Price 指数增长</span>：由 tick 计算得出，price = 1.0001^tick</li>
                        <li>• <span className="text-purple-600 font-semibold">√Price 随之变化</span>：展示了三者的数学关系</li>
                        <li>• Tick 范围：{minTick.toLocaleString()} 到 {maxTick.toLocaleString()}</li>
                        <li>• 对应价格范围：{minPrice.toFixed(2)} 到 {maxPrice.toLocaleString()}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TickPriceAnimation;