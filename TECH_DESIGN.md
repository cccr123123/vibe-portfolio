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

## 三、页面结构设计（v2）

```
<div class="loader">      加载页：大字 mark + 进度线
<div class="cursor">      自定义光标：小点 + 延迟外圈
<header>                  固定导航：斜体 Logo + 等宽菜单 + 实时时钟
<main>
  <section id="hero">     首屏：kicker + 右上简介 + 三行超大标题 + 底部信息条
  <section id="about">    关于我：kicker + 超大标题（右对齐）+ 正文 + 细线 facts 表
  <section id="skills">   技能：kicker + 标题 + 4 行排版列表（编号/名称/等宽标签）
  <section id="projects"> 作品：kicker + 标题 + 5 行项目列表（悬停反转）
  <section id="contact">  联系：kicker + 标题 + 2 行大号联系方式（可复制）
<footer>                  细线 + 双平台部署链接
```

## 四、样式架构

### 4.1 CSS 变量（设计令牌 · v2）
```
--bg: #000000;                     纯黑背景
--text: #ffffff;                   纯白文字
--dim: rgba(255,255,255,.55);      次级信息
--faint: rgba(255,255,255,.26);    弱化信息（编号 / 标签）
--line: rgba(255,255,255,.14);     1px 分隔线
--ease: cubic-bezier(.16,1,.3,1);  统一缓动
--pad: clamp(20px,4.5vw,64px);     页面左右留白
--gap-section: clamp(96px,14vw,200px); 区块垂直间距
```

### 4.2 布局策略（v2）
- 全宽排版，仅用 `--pad` 留白，不做居中窄容器。
- 区块标题超大（`clamp(2.4rem,8vw,6.4rem)`）右对齐，kicker 编号在左，形成对角张力。
- 技能 / 作品 / 联系全部采用**单列列表行**（grid：`64px | 1.3fr | 1.6fr | 28px`），
  行间 1px 细线，移动端降级为两行布局。
- 首屏 `min-height: 100svh` + `space-between`，大标题三行占满视觉重心。

### 4.3 动效（v2）
- **加载页**：`.loader` 覆盖全屏，进度线 `width 0→100%`（900ms），完成后加 `.is-done` 淡出。
- **首屏入场**：`body.is-loaded .hero__line` 触发 `lineUp`（translateY 48px → 0，950ms，stagger 110ms）。
- **滚动揭示**：`.reveal` 默认 `opacity:0; translateY(28px)`，IntersectionObserver 进入视口加 `.is-in`，
  同批元素按 70ms 递增延迟。
- **行悬停**：`.project-row:hover` → 背景白、文字黑、`padding-left` 增大、箭头淡入上移。
- **光标**：小点 `translate` 即时跟随；外圈用 rAF 按 0.16 系数插值缓动；hover 时放大 64→76px。
- **视差**：滚动时 `heroTitle` 施加 `translateY(scrollY*0.14)` 与递减 opacity。
- `prefers-reduced-motion` 下：隐藏加载页与光标、关闭视差、`.reveal` 直接可见。

## 五、交互逻辑（app.js）

1. **Loader**：`load` 事件 + 最短 900ms 展示，兜底 3.2s 强制放行。
2. **Cursor**：mousemove 记录坐标；rAF 插值外圈；`mouseover` 检测 `a, button, .project-row` 等放大。
3. **Reveal**：IntersectionObserver（threshold 0.16）批量观察 `.reveal`，触发后 unobserve。
4. **Parallax**：scroll 事件经 rAF 节流，更新首屏标题位移/透明度与 header 状态。
5. **Clock**：`setInterval` 每秒更新等宽时钟（HH:MM:SS）。
6. **Copy**：`navigator.clipboard` 写邮箱，非安全上下文用 `execCommand('copy')` 兜底，箭头临时变 ✓。
7. **Year**：页脚年份取 `new Date().getFullYear()`。

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
