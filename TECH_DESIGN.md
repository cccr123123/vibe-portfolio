# 技术设计文档 - 个人作品集网站

## 一、技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 页面结构 | HTML5 | 单页结构，语义化标签 |
| 样式 | CSS3（原生） | CSS 变量 + Grid/Flex + `clamp()` 响应式字号，不引入 Tailwind 构建链 |
| 交互 | JavaScript（原生 ES6） | 无框架，零第三方依赖 |
| 动画 | CSS transition/animation + IntersectionObserver | 滚动渐入 |
| 字体 | 系统字体栈 | 不加载外部字体，保证秒开 |
| 部署 | 静态托管 | GitHub Pages / Vercel 均可直接托管 |

> 技术选型说明：课程文档推荐 React + TypeScript + Vite + Tailwind 作为现代前端方案。
> 本项目为单页展示型站点，交互逻辑简单，为规避本地构建链与依赖安装成本、保证部署稳定性，
> 采用「原生 HTML/CSS/JS + CSS 变量」实现同等视觉效果。若后续需要扩展为多页面应用，再迁移到 React。

## 二、项目结构

```
portfolio/
├── index.html          # 页面结构
├── styles.css          # 全部样式（变量、布局、组件、响应式、动画）
├── app.js              # 交互逻辑（导航、滚动动画、复制联系方式、菜单）
├── PRD.md              # 需求文档
├── TECH_DESIGN.md      # 本文档
├── AGENTS.md           # 开发规范
└── assets/
    └── (项目截图占位)
```

## 三、页面结构设计

```
<header>            固定顶部导航：Logo + 锚点链接 + 移动端汉堡按钮
<main>
  <section id="hero">       首屏：姓名 / 定位 / 简介 / 头像 / CTA
  <section id="about">      关于我：介绍 + 教育背景 + 方向关键词
  <section id="skills">     技能：4 个分组卡片
  <section id="projects">   项目：5 个项目卡片网格
  <section id="contact">    联系方式：GitHub / 邮箱 + 一键复制
<footer>            版权信息
```

## 四、样式架构

### 4.1 CSS 变量（设计令牌）
```
--bg: #0a0a0a;          主背景
--bg-soft: #111114;     次级背景（区块交替）
--card: rgba(255,255,255,.04);
--border: rgba(255,255,255,.08);
--text: #f5f5f7;
--muted: #9ca3af;
--accent-1: #6366f1;    渐变起点（靛蓝）
--accent-2: #22d3ee;    渐变终点（青）
--radius: 18px;
--maxw: 1120px;
```

### 4.2 布局策略
- 容器 `max-width: 1120px`，左右内边距 `clamp(20px, 5vw, 48px)`。
- 技能区：4 列网格 → 平板 2 列 → 手机 1 列。
- 项目区：3 列网格 → 平板 2 列 → 手机 1 列。
- 首屏使用 `min-height: 100svh` 垂直居中。

### 4.3 动效
- `.reveal` 类：默认 `opacity:0; transform: translateY(24px)`；
  进入视口后加 `.is-visible` → 归位，`transition: 600ms cubic-bezier(.22,1,.36,1)`。
- 用 `IntersectionObserver` 批量观察，`threshold: 0.15`，只触发一次。
- `@media (prefers-reduced-motion: reduce)` 下禁用位移与动画。

## 五、交互逻辑（app.js）

1. **平滑滚动**：点击导航锚点 → `scrollIntoView({behavior:'smooth'})`；滚动时高亮当前区块。
2. **滚动渐入**：观察 `.reveal` 元素，进入视口添加 `.is-visible`。
3. **移动端菜单**：汉堡按钮切换 `.nav-open`，点击链接后自动关闭。
4. **复制联系方式**：`navigator.clipboard.writeText()`，成功后按钮文案临时变为「已复制」。
5. **年份自动更新**：页脚版权年份取 `new Date().getFullYear()`。

## 六、数据管理

- 项目数据在 `index.html` 中静态书写（内容固定，无后台）。
- 联系方式等个人信息集中放在 HTML 注释标记的区块，便于后续替换真实信息。

## 七、部署方案

| 方式 | 操作 | 产出链接 |
|---|---|---|
| GitHub Pages | 代码推送到 GitHub 仓库 → Settings → Pages → 选 main 分支根目录 | `https://<用户名>.github.io/<仓库名>/` |
| Vercel | GitHub 登录 → Import 仓库 → Deploy | `https://<项目名>.vercel.app` |

两种方式均为静态托管，自动 HTTPS，全球 CDN 分发，无需服务器。

## 八、性能与兼容

- 零外部请求（无 CDN 字体/库），首屏渲染 < 100ms。
- 兼容 Chrome / Edge / Safari / 移动端浏览器最近两个大版本。
- 使用 `svh` 单位兜底 `vh`，避免移动端地址栏跳动。
