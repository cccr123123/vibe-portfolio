# 交接文档 · 陈浩然个人作品集

> 最后更新：2025-10-26
> 接手前请先读完 **第 9 节「踩过的坑」** 和 **第 11 节「设计决策」**，能省掉大量返工。

---

## 0. 一句话说明

一个**纯静态、零依赖、无构建**的个人作品集单页：纯白背景 + 屏幕正中的真实相机照片，滚轮整屏切换 5 个场景，照片从相机镜头里以 3D 透视被「放」出来、飞向观众。

---

## 1. 线上地址与仓库

| 项 | 值 |
|---|---|
| GitHub 仓库 | <https://github.com/cccr123123/vibe-portfolio>（分支 `main`）|
| GitHub Pages | <https://cccr123123.github.io/vibe-portfolio/> |
| Vercel | <https://vibe-portfolio-eight-mu.vercel.app> |
| 部署方式 | 两个平台都**监听 `main` 分支，push 即自动构建**，无需手动操作 |

⚠️ 注意：`vibe-portfolio.vercel.app`（不带 `-eight-mu`）不是本项目，别用错地址。

---

## 2. 技术栈与约束

- **HTML5 + CSS3 + 原生 ES6+ JavaScript**，零第三方依赖（无 CDN、无框架、无外部字体）
- **没有构建步骤**，改完文件刷新即可
- 目标：现代浏览器（Chrome / Edge / Safari 最新两个版本）
- 代码规模：`index.html` ≈ 165 行、`styles.css` ≈ 839 行、`scenes.js` ≈ 514 行

---

## 3. 目录结构

```
cx_work/                        ← 仓库根
├── index.html                  ← 页面骨架：5 个场景 + 相机 + 照片层 + 详情弹窗
├── styles.css                  ← 全部样式（设计令牌 / 场景 / 相机 / 照片 / 弹窗）
├── scenes.js                   ← 全部交互（场景切换 / 照片粒子 / 弹窗 / 复制）
├── assets/
│   ├── camera.png              ← 相机照片（已抠成透明背景，394 KB，RGBA）
│   ├── shot-portfolio.jpg      ← 项目缩略图（560×315，5 张，共约 67 KB）
│   ├── shot-todo.jpg
│   ├── shot-markdown.jpg
│   ├── shot-pomodoro.jpg
│   └── shot-weather.jpg
├── todo/                       ← 子项目 1：待办事项应用（独立页面）
├── markdown/                   ← 子项目 2：Markdown 笔记
├── pomodoro/                   ← 子项目 3：番茄钟
├── weather/                    ← 子项目 4：天气查询
├── PRD.md                      ← ⚠️ 旧版（黑底）需求文档，尚未同步
├── TECH_DESIGN.md              ← ⚠️ 旧版技术方案，尚未同步
├── AGENTS.md                   ← ⚠️ 旧版开发规范（黑底），尚未同步
├── README.md                   ← 部署信息，描述仍偏旧
└── cam-test.html               ← 临时对比页（相机融入方案的 4 宫格），可删
```

第 5 个子项目就是**本作品集页面自己**（作品列表里的「05 这个页面」）。

---

## 4. 页面结构（5 屏）

`index.html` 里是 5 个 `<section class="scene" data-index="0..4">`，全部 `position: fixed; inset: 0`，靠 `is-active` 类切换。

| 屏 | 内容 | 备注 |
|---|---|---|
| 01 PROFILE | 陈浩然 / 武汉理工大学 · 数字经济 / 一句简介 | 首屏 |
| 02 ABOUT | 两段自述 + 学校/专业/方向 | 文字多 |
| 03 WORKS | 作品标题 + 5 个项目条（可点击跳转） | 照片生成最密 |
| 04 SKILLS | 两列清单：能做什么 / 用什么做 | 文字多 |
| 05 CONTACT | GitHub / Email（点击整行复制） | 可复制 |

**层叠顺序（z-index）**，改样式时务必保持：

```
.photo-modal   7000   详情弹窗
.photo-layer      4   照片粒子（必须高于 .stage，否则鼠标事件被拦）
.stage            3   场景容器
.scene__inner     2   场景内容（相对定位，压在相机之上）
.camera           1   相机
```

---

## 5. 核心机制

### 5.1 整屏场景切换（`scenes.js`）

- 触发方式：滚轮 / 方向键 / PageUp·Down / Home·End / 触屏滑动 / 点击底部进度点
- **滚轮阈值 110**（约等于连滚 2~3 格），停顿 260ms 后累积清零
- 切换锁 **920ms**（和逐行显影总时长对齐，防止连跳）
- 进场：`.scene.is-active`，离场：`.scene.is-leaving`（等内部动画播完才整体淡出，`transition-delay: 0.55s`）

**逐行显影**（0.9 秒）：
```
kicker   delay 0s    ┐
标题      delay 0.1s  ├ blur(12px) + translateY(24px) → 清晰归位
副标题    delay 0.2s  │
正文/列表 delay 0.3s  ┘
离场时反向：列表先散、标题最后散
```
> 行编号由 JS 自动完成：`scene.querySelectorAll(".scene__top > *, .scene__bottom > *")`，
> 写入 CSS 变量 `--i`（进场序）和 `--rev`（离场序）。**新增内容行不用改 JS。**

首屏有 `replayEntry()`：HTML 自带 `is-active` 会导致首屏不播动画，所以先移除、40ms 后加回。

### 5.2 相机（`.camera`）

位置锚定（**这是最容易错的地方**）：
```css
.camera {
  left: 50%; top: 50%;
  width: min(50vw, 52vh, 620px);
  transform: translate(-55.18%, -50.88%);   /* 镜头光学中心 = 图片的 55.18% / 50.88% */
}
```

- **55.18% / 50.88%** 是人工量镜头外圈大圆得到的（左右 140~800、上下 70~735 @ 裁剪图）。
- 用「暗像素质心」测会得到 50.05% / 48.94%（被机身拉偏 52px），**不要用那个**。
- 截图实测镜片中心 (716.3, 434.7) vs 视口中心 (720, 450)：水平误差 3.7px；垂直那 15px 是镜片反光偏上造成的测量误差。

视觉处理（既真实又不突兀）：
```css
.camera img {
  filter: drop-shadow(0 34px 42px rgba(0,0,0,.13))   /* 环境阴影 */
          drop-shadow(0 10px 18px rgba(0,0,0,.06))   /* 接触阴影 */
          contrast(0.84) brightness(1.08);            /* 黑机身压成灰调 */
}
```
- `assets/camera.png` 是**真透明背景**（四角 alpha=0，边缘羽化 2.6px），所以投影能贴合轮廓
- 切屏联动：`goTo()` 时加 `.camera.is-shifting`（下沉 26px + scale 0.972），280ms 后移除
- **相机不呼吸、不浮动**（主人明确要求去掉）

### 5.3 照片粒子（「紫金葫芦」）

数据在 `scenes.js` 的 `PHOTO_DATA`（5 个项目：图 / 编号 / 标题 / 描述 / 技术栈 / 链接）。

单张生命周期 **10 秒**：

| 阶段 | 时间 | 动作 |
|---|---|---|
| ① 点 | 0 ~ 0.25s | 照片在**镜头正中心**，`rotateY 88°` 侧着、scale 0.2，几乎看不见 |
| ② 展开 | 0.25 ~ 2.0s | 转正 + 横向拉开（`scaleX 0.04→1`），**位置锁死在中心不动** |
| ③ 3D 飞来 | 1.8 ~ 9.0s | `translate3d` 的 z 从 **−2600px → +600px**，配合父层 `perspective: 900px` 产生真透视放大（约 11 倍）|
| ④ 出屏 | 9 ~ 10s | 继续飞 + 淡出（透视连位移一起放大，自然冲出屏幕）|

**节奏参数**：
```js
LIFE = 10.0          // 单张总时长（秒）
OPEN_END = 2.0       // 展开结束
SPAWN_GAP = 3000     // 每 3 秒投一张（= 展开 2s + 等 1s）
MAX_SHOTS = 3        // 同时最多 3 张
HOLD_AFTER = 1000    // 鼠标移开后 1 秒才能再投
```
- 八个方向轮流（`DIR_COUNT = 8`）+ 少量随机扰动，保证散得开
- **悬停冻结**：鼠标压住某张 → 该张 `elapsed` 不再累加（完全静止）、同时暂停投片；移开后 1 秒恢复
- 可交互阈值：展开 40% 后加 `.is-near`（`pointer-events: auto`），并外扩 20px 透明感应区（`::after`）
- 悬停放大 4%

### 5.4 详情弹窗

- 照片展开后**点击** → `openPhotoModal(data)`，填充图 / 编号 / 标题 / 描述 / 标签 / 链接
- 关闭：点遮罩、点 ✕、按 ESC、滚轮切屏
- 结构在 `index.html` 末尾的 `.photo-modal`，样式在 `styles.css` 的「照片详情弹窗」段

---

## 6. 关键参数速查表

想快速调手感，改这些地方：

| 想改什么 | 改哪里 | 当前值 |
|---|---|---|
| 相机大小 | `styles.css` `.camera` width | `min(50vw, 52vh, 620px)` |
| 相机明暗 | `.camera img` filter | `contrast(.84) brightness(1.08)` |
| 背景渐变 | `body` background | 中心 `#fff` → 边缘 `#f2f2f2` |
| 文字大小 | `.display` / `.title` / `.lede` / `.about p` | `clamp()` 分段 |
| 文字颜色 | `:root` 的 `--ink-2/3/4` | `#383838 / #5e5e5e / #949494` |
| 场景切换灵敏度 | `scenes.js` 滚轮阈值 | `110` |
| 切换锁时长 | `scenes.js` `setTimeout` | `920ms` |
| 逐行显影节奏 | `styles.css` `.scene__reveal` delay | `calc(var(--i) * 0.1s)` |
| 照片张数/节奏 | `scenes.js` `MAX_SHOTS` / `SPAWN_GAP` | `3` / `3000ms` |
| 照片飞行速度 | `scenes.js` `z` 的起止值 | `-2600 → 600` |
| 透视强度 | `styles.css` `.photo-layer` perspective | `900px` |

---

## 7. 本地运行与调试

```bash
cd D:\dsh\cx_work
python -m http.server 8899
# 打开 http://127.0.0.1:8899/
```

> 必须用 HTTP 服务打开，`file://` 直接双击会因为字体 / fetch 限制出问题。

**调试用 URL 参数**（`scenes.js` 里实现）：

| 参数 | 作用 |
|---|---|
| `?scene=2` | 直接进入第 3 屏（0 起算），方便单独调某一屏 |
| `?demo` | 生成若干定格在不同展开阶段的照片（旧版遗留） |
| `?staticphoto` | 把照片摆成固定状态，排查层级/位置问题 |

**控制台钩子**：
```js
__scenes.goTo(3)      // 跳到第 4 屏
__scenes.index        // 当前屏序号
__scenes.particles    // 当前在飞的照片数量
__scenes.spawn()      // 手动投一张
__scenes.openModal()  // 手动打开第一个项目的详情
```

---

## 8. 部署流程

```bash
git add -A
git commit -m "描述"
git push origin main        # 两个平台会自动部署，约 1 分钟
```

验证是否上线（会返回 `scenes.js` / `camera.png` 就说明是新版）：
```bash
curl -s https://cccr123123.github.io/vibe-portfolio/ | grep -oE 'scenes\.js|camera\.png'
```

⚠️ 浏览器强刷用 `Ctrl + Shift + R`，否则会吃旧缓存。

---

## 9. 踩过的坑（务必先看）

### 9.1 `prefers-reduced-motion` 会把动画全部掐死 🔴 最坑
这台机器的 Windows「动画效果」是关闭的，浏览器**持续报告 `reduce`**。
早期 CSS 里写了 `@media (prefers-reduced-motion: reduce) { .photo { animation-duration: .001ms } }`，
导致照片动画瞬间"飞完"、永远停在消失帧，看起来就是「照片根本没出现」。

**现状**：该媒体查询已整段删除，`styles.css` 底部有用注释说明。
⚠️ **不要给核心动效加 reduced-motion 降级**，要加就改成"减少幅度"而不是"掐掉"。

### 9.2 照片层被场景层拦截鼠标
`.photo-layer` 一开始是 `z-index: 2`，而 `.stage` 是 `3` 且铺满全屏 `pointer-events: auto`，
结果照片收不到 hover/click。**现在 photo-layer 是 `z-index: 4`**，改层级时别破坏这个关系。

### 9.3 抠图白边（已修，但别再犯）
第一版抠图为了"防灰边"，把所有 alpha<250 的像素 RGB 刷成纯白 → 相机轮廓外一圈**白描边**。
正确做法：**RGB 保留原图像素**，透明区域的 RGB 用「最近相机颜色」外扩，再羽化 alpha。

### 9.4 镜头定位不能用暗像素质心
暗像素质心会被机身、反光带偏（测出来 50.05%，实际 55.18%）。
要用**镜头外圈的几何中心**，见 5.2。

### 9.5 headless 截图验证不了动画 ⚠️ 重要
`msedge --headless --screenshot` 里：
- `requestAnimationFrame` 基本不跑 → 粒子动画停在第一帧
- CSS `transition` 不推进 → 逐行显影的文字会停在 `opacity: 0`（截出来是空白）

**所以**：headless 只能验证静态布局/样式；**动画必须用真实 Edge 窗口 + 系统截图验证**。
（真实 Edge 里一切正常，别被白屏 headless 截图误导。）

### 9.6 Edge 窗口截图要按标题找
多窗口时 WScript.Shell 的 `AppActivate` 容易激活错窗口。用 `EnumWindows` + `GetWindowText` 按标题匹配更可靠。

### 9.7 首屏动画不会自动播放
HTML 里第一个 `.scene` 自带 `is-active`，浏览器加载时不会触发过渡。
`replayEntry()` 用「移除 → 40ms 后加回」解决，**注意必须是 `setTimeout` 不能用 `requestAnimationFrame`**（后者在某些环境不跑）。

---

## 10. 当前状态与待办

### 已完成
- [x] 白底 + 真实相机 + 5 屏场景式设计
- [x] 逐行显影的文字进出场
- [x] 照片从镜头中心以 3D 透视飞出（10s 生命周期）
- [x] 照片悬停冻结、点击查看详情
- [x] 滚轮/键盘/触屏/进度点四种切换方式
- [x] 相机抠图（真透明 + 贴轮廓投影 + 灰调融入）
- [x] 部署到 GitHub Pages 与 Vercel

### 待办 / 遗留
- [ ] **PRD.md / TECH_DESIGN.md / AGENTS.md / README.md 仍是旧版黑底方案**，与实际实现完全不符，需要重写
- [ ] `cam-test.html` 是临时对比页，确认后可删
- [ ] 相机垂直定位可能有 10~15px 偏差（受镜片反光影响，未能 100% 确认）
- [ ] 3D 冲脸的幅度/速度主人尚未最终确认
- [ ] 移动端只在 375px 宽度做过基础适配，未在真机充分测试
- [ ] 本地改动（camera.png / scenes.js / styles.css）**尚未提交到 git**

---

## 11. 设计决策记录（主人的偏好，别改回去）

以下是主人明确表态过、**不要擅自回退**的决定：

| 决策 | 说明 |
|---|---|
| **纯白底** | 拒绝过星空、樱花、二次元背景、彩色渐变 |
| **真实相机照片** | 拒绝过线框 SVG、渐变写实 SVG；必须是真机照片 |
| **文字在相机之上** | 相机是背景元素，文字是主体 |
| **相机不虚化、不浮动** | 试过 blur / opacity / 呼吸浮动，都被否了；现在只有切屏时下沉一下 |
| **相机要缩小且灰调** | 太大太黑会"突兀"，`contrast(.84)` 是妥协后的结果 |
| **照片从镜头中心出来** | 不能从相机边缘冒出来（已用 55.18%/50.88% 修正） |
| **要有 3D「从远到近」** | 参考「紫金葫芦放人」：先压成二次元平面，再展开、变大、扑向观众 |
| **一张一张来** | 不要一次飞出很多张 |
| **悬停冻结** | 鼠标压住照片时它要定住、不计时；移开 1 秒后才继续 |
| **文字加深加粗一点点** | 但也别破坏简约，`--ink-3` 从 `#8c8c8c` 调到 `#5e5e5e` |
| **干净简约** | 不要装饰性元素（爱心、星星、四角星、气泡、自定义光标等一律不要） |

---

## 12. 附：图片处理脚本

`D:\dsh\.cx\` 下有几个一次性 Python 脚本（不在仓库里），需要重新处理相机图时可以用：

| 脚本 | 作用 |
|---|---|
| `cutout_camera3.py` | 白底 → 透明（floodfill + 颜色外扩 + alpha 羽化），**当前 camera.png 就是它生成的** |
| `soften_camera.py` | 加强边缘羽化（MinFilter + GaussianBlur 2.6px） |
| `locate_lens.py` / `lens_check.py` | 定位镜头圆心，并在图上画十字线人工比对 |
| `verify_lens.py` | 截图里验证镜片中心是否落在视口中心 |

依赖：`Pillow`、`numpy`（无需 scipy / opencv）。

---

**交接人若只记一件事**：改动画后**一定用真实 Edge 窗口看**，headless 截图会骗人。
