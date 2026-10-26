# Vibe Coding 个人作品集与工具集

数字经济专业学生的 Vibe Coding 实践作品：一个个人作品集网站 + 5 个实用小工具，
全部通过「自然语言驱动编程」完成需求梳理、代码生成与公网部署。

## 🌐 在线访问

| 部署方式 | 访问链接 |
|---|---|
| **GitHub Pages**（静态托管，随仓库自动更新） | https://cccr123123.github.io/vibe-portfolio/ |
| **Vercel**（CDN 全球加速，自动 HTTPS） | https://vibe-portfolio-eight-mu.vercel.app |

> 同一个静态站点，两种不同部署方式，得到两个不同的公网访问地址。

## 📦 项目内容

| 项目 | 目录 | 说明 |
|---|---|---|
| 个人作品集网站 | `/` | 深色科技感单页数字名片：Hero / 关于我 / 技能 / 项目 / 联系方式 |
| 待办事项应用（进阶版） | `/todo/` | 分类、优先级、截止日期、搜索、多条件筛选、LocalStorage 持久化 |
| Markdown 笔记应用 | `/markdown/` | 左编辑右预览、代码块语法高亮、笔记列表与搜索、自动保存 |
| 番茄钟计时器 | `/pomodoro/` | 25/5 专注循环、自定义时长、桌面通知、提示音、完成统计 |
| 天气查询应用 | `/weather/` | Open-Meteo 实时天气、未来 5 天预报、定位、城市收藏 |

## 🛠 技术栈

- **HTML5 + CSS3 + 原生 JavaScript**：零第三方依赖，无构建步骤
- CSS 变量（设计令牌）+ Grid/Flex 响应式布局 + `clamp()` 自适应字号
- `IntersectionObserver` 滚动渐入动画
- Web Audio API 合成提示音 / Notification API 桌面通知 / Geolocation API 定位
- 数据持久化：`LocalStorage`
- 天气数据：Open-Meteo 免费 API（无需 API Key）

## 📋 开发流程

按课程指导的 Vibe Coding 五步法执行：

1. **需求研究** —— 明确每个工具的核心场景与验收标准
2. **写 PRD** —— 见 [`PRD.md`](PRD.md)
3. **写技术设计** —— 见 [`TECH_DESIGN.md`](TECH_DESIGN.md)
4. **写 AGENTS.md 开发规范** —— 见 [`AGENTS.md`](AGENTS.md)
5. **开发与部署** —— 逐组件实现、浏览器验证，最终双平台部署上线

## 🚀 部署方式对比

| 维度 | GitHub Pages | Vercel |
|---|---|---|
| 触发方式 | 推送 `main` 分支后自动构建 | 推送 `main` 分支后自动构建 |
| 域名 | `<用户名>.github.io/<仓库名>/` | `<项目名>.vercel.app` |
| CDN | 有（GitHub 全球节点） | 有（Vercel Edge Network） |
| HTTPS | 自动 | 自动 |
| 适用场景 | 纯静态站点、开源项目文档 | 静态站点 / 全栈框架（Next.js 等） |

## 📁 目录结构

```
.
├── index.html          # 作品集首页
├── styles.css          # 全局样式
├── app.js              # 交互逻辑
├── PRD.md              # 需求文档
├── TECH_DESIGN.md      # 技术设计文档
├── AGENTS.md           # AI 开发规范
├── todo/index.html     # 待办事项（进阶版）
├── markdown/index.html # Markdown 笔记
├── pomodoro/index.html # 番茄钟
└── weather/index.html  # 天气查询
```

## 📄 License

个人学习作品，仅用于课程实践展示。
