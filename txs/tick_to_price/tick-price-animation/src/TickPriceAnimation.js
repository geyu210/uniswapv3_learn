import React, { useState, useEffect, useRef } from 'react';

const TickPriceAnimation = () => {
    const [price, setPrice] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(0.02);
    const animationRef = useRef(null);

    // 计算 tick 值
    const calculateTick = (p) => {
        if (p <= 0) return 0;
        return Math.log(p) / Math.log(1.0001);
    };

    // 生成曲线数据点
    const generateCurvePoints = () => {
        const points = [];
        for (let p = 0.1; p <= 10; p += 0.05) {
            points.push({
                price: p,
                tick: calculateTick(p)
            });
        }
        return points;
    };

    const curvePoints = generateCurvePoints();
    const currentTick = calculateTick(price);

    // 动画循环
    useEffect(() => {
        if (isPlaying) {
            const animate = () => {
                setPrice(prev => {
                    let next = prev + speed;
                    if (next > 10) return 0.1;
                    if (next < 0.1) return 0.1;
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
    const width = 800;
    const height = 500;
    const margin = { top: 60, right: 60, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 比例尺
    const xScale = (p) => (p / 10) * chartWidth;
    const yScale = (t) => chartHeight - ((t + 30000) / 60000) * chartHeight;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4">Tick 与 Price 的函数关系</h2>

            {/* 数学公式 */}
            <div className="bg-white p-4 rounded-lg mb-4 shadow">
                <h3 className="text-lg font-semibold mb-2">数学公式：</h3>
                <div className="flex flex-col space-y-2 text-lg">
                    <div className="flex items-center">
                        <span className="font-mono">tick = log₁.₀₀₀₁(price)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <span className="font-mono">= ln(price) / ln(1.0001)</span>
                        <span className="ml-2 text-sm">(换底公式)</span>
                    </div>
                </div>
            </div>

            {/* 当前值显示 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">当前价格 (Price)</div>
                    <div className="text-2xl font-mono font-bold text-blue-600">
                        {price.toFixed(3)}
                    </div>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">对应 Tick 值</div>
                    <div className="text-2xl font-mono font-bold text-green-600">
                        {Math.floor(currentTick).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* SVG 图表 */}
            <svg width={width} height={height} className="bg-white rounded-lg shadow">
                <g transform={`translate(${margin.left},${margin.top})`}>
                    {/* 网格线 */}
                    {[0, 2, 4, 6, 8, 10].map(p => (
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
                                y={chartHeight + 20}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {p}
                            </text>
                        </g>
                    ))}

                    {[-30000, -20000, -10000, 0, 10000, 20000, 30000].map(t => (
                        <g key={`grid-y-${t}`}>
                            <line
                                x1={0}
                                y1={yScale(t)}
                                x2={chartWidth}
                                y2={yScale(t)}
                                stroke="#e5e7eb"
                                strokeDasharray="2,2"
                            />
                            <text
                                x={-10}
                                y={yScale(t) + 5}
                                textAnchor="end"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {(t/1000).toFixed(0)}k
                            </text>
                        </g>
                    ))}

                    {/* 坐标轴 */}
                    <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#374151" strokeWidth="2"/>
                    <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth="2"/>

                    {/* 轴标签 */}
                    <text
                        x={chartWidth / 2}
                        y={chartHeight + 45}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                    >
                        Price
                    </text>
                    <text
                        x={-chartHeight / 2}
                        y={-50}
                        transform="rotate(-90)"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="bold"
                    >
                        Tick
                    </text>

                    {/* 曲线 */}
                    <path
                        d={`M ${curvePoints.map(p => `${xScale(p.price)},${yScale(p.tick)}`).join(' L ')}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                    />

                    {/* 当前点 */}
                    <circle
                        cx={xScale(price)}
                        cy={yScale(currentTick)}
                        r="8"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="3"
                    />

                    {/* 指示线 */}
                    <line
                        x1={xScale(price)}
                        y1={yScale(currentTick)}
                        x2={xScale(price)}
                        y2={chartHeight}
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        opacity="0.5"
                    />
                    <line
                        x1={0}
                        y1={yScale(currentTick)}
                        x2={xScale(price)}
                        y2={yScale(currentTick)}
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        opacity="0.5"
                    />

                    {/* 标注 */}
                    <g transform={`translate(${xScale(price) + 10}, ${yScale(currentTick) - 10})`}>
                        <rect
                            x="-5"
                            y="-15"
                            width="120"
                            height="30"
                            fill="white"
                            stroke="#ef4444"
                            strokeWidth="1"
                            rx="4"
                        />
                        <text
                            x="55"
                            y="0"
                            textAnchor="middle"
                            fontSize="12"
                            fill="#ef4444"
                            fontWeight="bold"
                        >
                            ({price.toFixed(2)}, {Math.floor(currentTick)})
                        </text>
                    </g>
                </g>
            </svg>

            {/* 控制面板 */}
            <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        {isPlaying ? '暂停' : '播放'}
                    </button>

                    <div className="flex items-center gap-2">
                        <label className="text-sm">速度：</label>
                        <input
                            type="range"
                            min="0.01"
                            max="0.1"
                            step="0.01"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-32"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm">价格：</label>
                        <input
                            type="range"
                            min="0.1"
                            max="10"
                            step="0.1"
                            value={price}
                            onChange={(e) => {
                                setIsPlaying(false);
                                setPrice(parseFloat(e.target.value));
                            }}
                            className="w-48"
                        />
                    </div>
                </div>

                {/* 说明 */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
                    <h4 className="font-semibold mb-2">说明：</h4>
                    <ul className="space-y-1">
                        <li>• Tick 是 Uniswap V3 中用于表示价格的离散单位</li>
                        <li>• 每个 tick 代表 0.01% (即 1.0001 倍) 的价格变化</li>
                        <li>• 当价格为 1 时，tick = 0；价格越高，tick 值越大</li>
                        <li>• 使用对数关系可以将连续的价格映射到离散的 tick 值</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TickPriceAnimation;