# Tick Price Animation

这个小项目用动画展示 Uniswap V3 中 `tick`、`price` 和 `sqrtPrice` 的关系。

![Tick price animation](../../../docs/assets/tick-price-animation.gif)

## 在线页面

[https://geyu210.github.io/tick-price-animation/](https://geyu210.github.io/tick-price-animation/)

`package.json` 里的 `homepage` 也指向这个 GitHub Pages 地址。

## 适合用来理解什么

- `price = 1.0001^tick`
- tick 线性移动时，price 为什么是指数变化
- sqrtPrice 为什么比 price 增长得更平滑
- 为什么 Uniswap V3 会围绕 tick、sqrtPrice 和流动性区间做设计

## 本地运行

```bash
npm ci
npm start
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

## 构建

```bash
npm run build
```

构建产物会生成在 `build/` 目录。

## 发布到 GitHub Pages

```bash
npm run deploy
```

这个命令会先构建项目，再把 `build/` 发布到 GitHub Pages。

## 重新录制 README 动画

当前 README 使用的 GIF 放在仓库根目录的 `docs/assets/tick-price-animation.gif`。

如果需要重新录制，可以：

1. 启动本地页面。
2. 用浏览器录制或截图生成一组连续画面。
3. 用 ffmpeg 合成 GIF。

示例命令：

```bash
ffmpeg -y -t 8 -framerate 12 -i frame_%03d.png \
  -vf "fps=8,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" \
  ../../../docs/assets/tick-price-animation.gif
```

如果截图工具保存的是 JPEG 内容但文件名是 `.png`，需要显式告诉 ffmpeg 输入格式：

```bash
ffmpeg -y -t 8 -framerate 12 -c:v mjpeg -i frame_%03d.png \
  -vf "fps=8,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" \
  ../../../docs/assets/tick-price-animation.gif
```
