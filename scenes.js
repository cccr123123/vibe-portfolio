/* ============================================================
   scenes.js · 整屏场景切换 + 照片从镜头深处飞来（3D 透视）
   滚轮/方向键/触屏 → 切换场景（虚化淡出 → 浮现）
   照片：远（小）→ 近（大），近了可点击查看详情
   ============================================================ */

(function () {
  "use strict";

  const scenes = Array.from(document.querySelectorAll(".scene"));
  const camera = document.getElementById("camera");
  const photoLayer = document.getElementById("photoLayer");
  const pagerDots = Array.from(document.querySelectorAll(".pager__dot"));
  const hintScroll = document.querySelector(".hint-scroll");

  if (!scenes.length) return;

  let current = 0;
  let locked = false;

  /* ============================================================
     逐行显影：给每个场景的直接内容行编号
     --i = 进场顺序，--rev = 离场顺序（反向）
     ============================================================ */
  scenes.forEach((scene) => {
    const items = Array.from(
      scene.querySelectorAll(".scene__top > *, .scene__bottom > *")
    );
    items.forEach((el, i) => {
      el.classList.add("scene__reveal");
      el.style.setProperty("--i", String(i));
      el.style.setProperty("--rev", String(items.length - 1 - i));
    });
  });

  /* ============================================================
     场景切换
     ============================================================ */
  function applyCamera(scene) {
    // 摄像机不再随场景虚化/缩小，保持始终清晰
    if (!camera) return;
    void scene;
  }

  function updatePager(index) {
    pagerDots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    if (hintScroll) hintScroll.classList.toggle("is-hidden", index > 0);
  }

  function goTo(index) {
    if (locked) return;
    if (index === current || index < 0 || index >= scenes.length) return;

    locked = true;

    const from = scenes[current];
    const to = scenes[index];

    from.classList.remove("is-active");
    from.classList.add("is-leaving");
    to.classList.add("is-active");
    applyCamera(to);
    updatePager(index);

    current = index;

    // 照片只在「作品」屏出现：离开就淡出清场，进入则稍后开始投片
    if (SHOT_SCENES.has(index)) {
      nextSpawnAt = performance.now() + 200;
    } else {
      retireShots();
    }

    // 逐行动画总时长约 0.9s，锁定到播完为止
    window.setTimeout(() => {
      from.classList.remove("is-leaving");
      locked = false;
    }, 920);
  }

  /* ---------- 滚轮（连滚 2~3 格才切换） ---------- */
  let wheelAccum = 0;
  let wheelResetTimer = null;

  window.addEventListener(
    "wheel",
    (e) => {
      if (locked) return;
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      wheelAccum += e.deltaY;

      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAccum = 0;
      }, 260);

      if (Math.abs(wheelAccum) >= 110) {
        const dir = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0;
        goTo(current + dir);
      }
    },
    { passive: true }
  );

  /* ---------- 键盘 ---------- */
  window.addEventListener("keydown", (e) => {
    const downKeys = ["ArrowDown", "ArrowRight", "PageDown", " "];
    const upKeys = ["ArrowUp", "ArrowLeft", "PageUp"];

    if (downKeys.includes(e.key)) {
      e.preventDefault();
      goTo(current + 1);
    } else if (upKeys.includes(e.key)) {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(scenes.length - 1);
    }
  });

  /* ---------- 触屏滑动 ---------- */
  let touchStartY = 0;
  let touchStartX = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (e) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      const dx = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(dy) < 46 || Math.abs(dy) < Math.abs(dx)) return;
      goTo(current + (dy > 0 ? 1 : -1));
    },
    { passive: true }
  );

  /* ---------- 进度点 ---------- */
  pagerDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.go);
      if (Number.isFinite(index)) goTo(index);
    });
  });

  /* ============================================================
     照片数据（点击弹窗用）
     ============================================================ */
  const PHOTO_DATA = [
    {
      src: "assets/shot-portfolio.jpg",
      idx: "01",
      title: "个人作品集网站",
      desc: "你正在看的这个页面：白底极简排版 + 中央摄像机 + 照片从镜头深处飞来，带场景切换与详情弹窗。",
      tags: ["HTML", "CSS", "JavaScript"],
      href: "./",
    },
    {
      src: "assets/shot-todo.jpg",
      idx: "02",
      title: "待办事项应用（进阶版）",
      desc: "分类、优先级、截止日期录入，状态/分类/优先级多条件筛选 + 关键词搜索 + 完成率统计，LocalStorage 持久化。",
      tags: ["JavaScript", "LocalStorage"],
      href: "todo/index.html",
    },
    {
      src: "assets/shot-markdown.jpg",
      idx: "03",
      title: "Markdown 笔记应用",
      desc: "左编辑右预览实时渲染，自研轻量 Markdown 解析器，代码块语法高亮，笔记自动保存。",
      tags: ["Markdown", "实时预览"],
      href: "markdown/index.html",
    },
    {
      src: "assets/shot-pomodoro.jpg",
      idx: "04",
      title: "番茄钟计时器",
      desc: "SVG 圆环倒计时，专注/短休/长休三态循环，桌面通知 + Web Audio 合成提示音 + 完成数统计。",
      tags: ["Timer", "Notification"],
      href: "pomodoro/index.html",
    },
    {
      src: "assets/shot-weather.jpg",
      idx: "05",
      title: "天气查询应用",
      desc: "接入 Open-Meteo 免费 API，城市联想搜索、实时天气、未来 5 天预报、定位查询与城市收藏。",
      tags: ["Open-Meteo API", "Fetch"],
      href: "weather/index.html",
    },
  ];

  const images = PHOTO_DATA.map((d) => {
    const img = new Image();
    img.src = d.src;
    return img;
  });

  /* ============================================================
     照片粒子：紫金葫芦式「从镜头中心被放出来」
     时间线（秒）：
       0.00 ~ 0.25  镜头中心一个「点」（侧着，几乎看不见）
       0.25 ~ 2.00  从点展开成平面（rotateY 88° → 0°，横向拉开）
       1.80 ~ 9.00  3D 透视里从远处飞近（translate3d 的 z 从 -2600 → 600）
       9.00 ~ 10.0  飘出屏幕边缘并淡出
     前 1.8 秒位置**锁死在镜头中心**，绝不提前偏移
     ============================================================ */
  const LIFE = 10.0;           // 单张总时长（秒）
  const OPEN_END = 2.0;        // 展开结束（秒）
  const SPAWN_GAP = 3000;      // 投下一张的间隔（毫秒）= 展开 2s + 1s
  const HOLD_AFTER = 1000;     // 鼠标移开后多久才能再投（毫秒）

  const particles = [];
  const MAX_SHOTS = 3;
  const BASE_W = 202;          // 展开完成后的基准宽度（scale = 1）
  const BASE_CSS_W = 100;      // .shot 的 CSS 宽度

  const DIR_COUNT = 8;
  let dirCursor = 0;

  let nextSpawnAt = 0;
  let holdUntil = 0;

  /* 照片只在「03 WORKS」这一屏出现：
     别的屏文案没有"作品照"的语义，照片飞过去只会盖住标题和正文 */
  const SHOT_SCENES = new Set([2]);

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeOutCubic = (v) => 1 - Math.pow(1 - v, 3);

  /* 离开作品屏：在飞的照片快速淡出，不许跟到别的屏上 */
  function retireShots() {
    particles.forEach((p) => {
      p.el.style.transition = "opacity 0.25s ease";
      p.el.style.opacity = "0";
      window.setTimeout(() => p.el.remove(), 300);
    });
    particles.length = 0;
  }

  function spawnShot() {
    if (!photoLayer) return;
    if (particles.length >= MAX_SHOTS) return;

    const data = PHOTO_DATA[Math.floor(Math.random() * PHOTO_DATA.length)];

    const el = document.createElement("div");
    el.className = "shot";

    const img = document.createElement("img");
    img.src = data.src;
    img.alt = "";
    img.draggable = false;
    el.appendChild(img);

    const hint = document.createElement("div");
    hint.className = "shot__hint";
    hint.textContent = "点击查看详情";
    el.appendChild(hint);

    photoLayer.appendChild(el);

    // 八个方向轮流 + 少量扰动，保证散得开
    const baseAngle =
      (dirCursor % DIR_COUNT) * ((Math.PI * 2) / DIR_COUNT) - Math.PI / 2;
    dirCursor++;
    const angle = baseAngle + (Math.random() - 0.5) * 0.42;

    const p = {
      el,
      data,
      angle,
      dist:
        (Math.hypot(window.innerWidth, window.innerHeight) / 2) *
        (0.92 + Math.random() * 0.3),
      // 纸片在空中被气流带得微微自转（±2.4°）
      rot: (Math.random() - 0.5) * 0.048,
      phase: Math.random() * Math.PI * 2, // 漂浮相位，每张纸错开，不同步
      hoverT: 0, // hover 抬起的过渡进度 0 → 1
      elapsed: 0,
      hovered: false,
      interactive: false,
      near: false,
    };

    el.addEventListener("mouseenter", () => {
      if (!p.interactive) return;
      p.hovered = true;
      el.classList.add("is-hovered");
    });

    el.addEventListener("mouseleave", () => {
      if (!p.hovered) return;
      p.hovered = false;
      el.classList.remove("is-hovered");
    });

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (p.near) openPhotoModal(p.data);
    });

    particles.push(p);
    return p;
  }

  let lastFrameT = 0;

  function updateShots(t) {
    const dt = lastFrameT ? Math.min((t - lastFrameT) / 1000, 0.05) : 0.016;
    lastFrameT = t;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    /* ---------- 投片节奏（只在作品屏；悬停时暂停，移开后 1 秒恢复） ---------- */
    const anyHovered = particles.some((p) => p.hovered);
    const shotsAllowed = SHOT_SCENES.has(current);

    if (anyHovered) {
      holdUntil = t + HOLD_AFTER;
      if (nextSpawnAt < holdUntil) nextSpawnAt = holdUntil;
    } else if (
      shotsAllowed &&
      t >= nextSpawnAt &&
      particles.length < MAX_SHOTS
    ) {
      spawnShot();
      nextSpawnAt = t + SPAWN_GAP;
    }

    /* ---------- 更新每张照片 ---------- */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (!p.hovered) p.elapsed += dt;
      const e = p.elapsed;

      if (e >= LIFE) {
        p.el.remove();
        particles.splice(i, 1);
        continue;
      }

      /* --- 1) 展开：0.20 ~ 2.0 秒，从一条侧边展开成平面 --- */
      const openT = easeOutCubic(clamp01((e - 0.2) / (OPEN_END - 0.2)));
      const ry = (1 - openT) * 74;          // 侧面 74° → 正对 0°
      const sx = 0.04 + 0.96 * openT;       // 横向展开
      const sy = 1;
      const scale = 0.4 + 0.6 * openT;      // 整体也从小变大
      const rx = (1 - openT) * 7;           // 展开时还斜着一点点

      /* --- 2) 飞行（GitHub 版轨迹）：从镜头口侧滑 54px → 飘向八方向 → 一直往外 → 出屏 --- */
      const tt = e / LIFE;
      const moveT = easeOutCubic(clamp01(tt / 0.86));
      const dirX = Math.cos(p.angle);
      const dirY = Math.sin(p.angle) * 0.72;
      const eject = easeOutCubic(clamp01(e / 0.25)) * 54;
      const floatAmp = e > 2 ? 18 : 0;
      const floatX = Math.sin(e * 0.72 + p.phase) * floatAmp * 0.55;
      const floatY = Math.cos(e * 0.95 + p.phase) * floatAmp;

      const px = cx + dirX * (eject + p.dist * moveT) + floatX;
      const py = cy + dirY * (eject + p.dist * moveT) + floatY;

      /* --- 3) 透明度：开头淡入 / 最后 1 秒淡出 --- */
      let opacity = 1;
      if (e < 0.15) opacity = e / 0.15;
      if (e > 9) opacity = (LIFE - e) / 1;
      opacity = clamp01(opacity);

      // 悬停：0.12 秒平滑地"抬起来" + 轻微放大（不能瞬间跳变）
      p.hoverT = clamp01(p.hoverT + (p.hovered ? 1 : -1) * dt * 9);
      const hoverBoost = 1 + 0.04 * easeOutCubic(p.hoverT);

      const rotDeg = (p.rot * 180) / Math.PI;

      p.el.style.transform =
        `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) ` +
        `translate(-50%, -50%) ` +
        `rotateX(${rx.toFixed(1)}deg) ` +
        `rotateY(${(p.hovered ? 0 : ry).toFixed(1)}deg) ` +
        `rotate(${rotDeg.toFixed(2)}deg) ` +
        `scale(${(sx * scale * hoverBoost).toFixed(4)}, ${(sy * scale * hoverBoost).toFixed(4)})`;
      p.el.style.opacity = opacity.toFixed(3);
      p.el.style.zIndex = p.hovered ? "2200" : "";

      /* 动态投影：纸离镜头越近，影子越大越虚
         鼠标压住时 → 纸「抬起来」，影子明显加大加深（触碰反馈） */
      const depth = openT;                   // 展开越多 = 越"近"
      const shY = 4 + depth * 26;
      const shBlur = 8 + depth * 40;
      const shSpread = 10 + depth * 14;
      const shAlpha = 0.06 + depth * 0.22;
      const hv = easeOutCubic(p.hoverT);
      p.el.style.boxShadow =
        `0 ${(shY + 18 * hv).toFixed(0)}px ${(shBlur + 26 * hv).toFixed(0)}px -${(shSpread + 4 * hv).toFixed(0)}px rgba(40, 30, 18, ${(shAlpha + 0.16 * hv).toFixed(2)}), ` +
        `0 ${(shY * 0.26).toFixed(0)}px ${(shBlur * 0.3).toFixed(0)}px -${(shSpread * 0.5).toFixed(0)}px rgba(40, 30, 18, ${(shAlpha * 1.45 + 0.1 * hv).toFixed(2)})`;

      /* --- 展开到 40% 就能交互 --- */
      const ready = openT > 0.4;
      if (ready !== p.interactive) {
        p.interactive = ready;
        p.el.classList.toggle("is-near", ready);
      }
      p.near = ready;
    }

    requestAnimationFrame(updateShots);
  }

  /* ============================================================
     详情弹窗
     ============================================================ */
  const modal = document.getElementById("photoModal");

  function openPhotoModal(data) {
    if (!modal) return;

    const img = document.getElementById("pmImg");
    if (img) img.src = data.src;
    document.getElementById("pmIdx").textContent = "PROJECT " + data.idx;
    document.getElementById("pmTitle").textContent = data.title;
    document.getElementById("pmDesc").textContent = data.desc;

    const tags = document.getElementById("pmTags");
    tags.innerHTML = "";
    data.tags.forEach((t) => {
      const li = document.createElement("li");
      li.className = "photo-modal__tag";
      li.textContent = t;
      tags.appendChild(li);
    });

    const link = document.getElementById("pmLink");
    if (link) link.href = data.href;

    modal.hidden = false;
    window.setTimeout(() => modal.classList.add("is-open"), 20);
    document.body.classList.add("modal-open");
  }

  function closePhotoModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    window.setTimeout(() => {
      modal.hidden = true;
    }, 280);
  }

  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", closePhotoModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePhotoModal();
  });

  // 滚动 / 切屏时关闭弹窗
  window.addEventListener("wheel", () => closePhotoModal(), { passive: true });

  /* ============================================================
     其他交互
     ============================================================ */
  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", async () => {
      const text = el.getAttribute("data-copy");
      const target = el.querySelector("b");
      const original = target ? target.textContent : "";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        if (target) {
          target.textContent = "已复制 ✓";
          window.setTimeout(() => (target.textContent = original), 1500);
        }
      } catch (err) {
        if (target) {
          target.textContent = "复制失败";
          window.setTimeout(() => (target.textContent = original), 1600);
        }
      }
    });
  });

  document.querySelectorAll("#projectStrip li").forEach((li) => {
    li.addEventListener("click", () => {
      const href = li.dataset.href;
      if (href && href !== "#") window.location.href = href;
    });
  });

  /* ============================================================
     初始化
     ============================================================ */
  const params = new URLSearchParams(window.location.search);

  const startIndex = Math.min(
    Math.max(parseInt(params.get("scene") || "0", 10) || 0, 0),
    scenes.length - 1
  );
  if (startIndex > 0) {
    scenes.forEach((s, i) => s.classList.toggle("is-active", i === startIndex));
    current = startIndex;
  }

  applyCamera(scenes[current]);
  updatePager(current);

  // 让首屏也播放一次「逐行显影」（HTML 里已带 is-active，需重置后重新加）
  (function replayEntry() {
    const first = scenes[current];
    first.classList.remove("is-active");
    window.setTimeout(() => {
      if (!locked) first.classList.add("is-active");
    }, 40);
  })();

  // 调试钩子
  window.__scenes = {
    goTo,
    get index() {
      return current;
    },
    get particles() {
      return particles.length;
    },
    spawn: spawnShot,
    openModal: () => openPhotoModal(PHOTO_DATA[0]),
  };

  // ?modal：定时自动打开第一个项目的详情（用于截图/演示）
  if (params.has("modal")) {
    window.setTimeout(() => openPhotoModal(PHOTO_DATA[0]), 900);
  }

  // 启动粒子循环（只跑一次：之前这里跑了两遍，elapsed 双倍速，照片寿命腰斩）
  requestAnimationFrame(updateShots);

  // 从 ?scene=2 直接进作品屏时，补第一张照片
  window.setTimeout(() => {
    if (SHOT_SCENES.has(current)) {
      spawnShot();
      nextSpawnAt = performance.now() + SPAWN_GAP;
    }
  }, 700);
})();
