# Tick Price Animation - Uniswap V3

这是一个展示 Uniswap V3 中 Tick 与 Price 关系的交互式动画。

## 功能特性

- 实时动画展示 tick 与 price 的对数关系
- 交互式控制（播放/暂停、速度调整、手动设置价格）
- 数学公式展示
- 详细的坐标和数值标注

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
技术栈

React 19
Tailwind CSS
SVG 动画

核心公式
tick = log₁.₀₀₀₁(price) = ln(price) / ln(1.0001)
项目结构
├── src/
│   ├── TickPriceAnimation.js  # 主要组件
│   ├── App.js                 # 应用入口
│   └── index.css              # Tailwind CSS
├── package.json
├── tailwind.config.js
└── postcss.config.js
