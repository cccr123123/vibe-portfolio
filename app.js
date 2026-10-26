/* ============================================================
   个人作品集 · app.js (v2)
   原生 JS · 零依赖
   模块：Loader / Cursor / Reveal / Parallax / Clock / Copy / Header
   ============================================================ */

(function () {
  "use strict";

  const isTouch = window.matchMedia("(hover: none)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1. 加载页
     ============================================================ */
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loaderBar");

  document.body.classList.add("is-loading");

  const finishLoad = () => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    if (loader) loader.classList.add("is-done");
  };

  if (loader && !reduceMotion) {
    // 进度线推进（视觉节奏，不是真实加载进度）
    requestAnimationFrame(() => {
      if (loaderBar) loaderBar.style.width = "100%";
    });

    // 最短展示 ~900ms，避免闪屏
    const minShow = 900;
    const start = performance.now();

    const done = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minShow - elapsed);
      setTimeout(finishLoad, wait);
    };

    if (document.readyState === "complete") {
      done();
    } else {
      window.addEventListener("load", done, { once: true });
      // 兜底：加载卡住时也不会一直挡住页面
      setTimeout(finishLoad, 3200);
    }
  } else {
    finishLoad();
  }

  /* ============================================================
     2. 自定义光标
     ============================================================ */
  const cursor = document.getElementById("cursor");
  const cursorDot = cursor ? cursor.querySelector(".cursor__dot") : null;
  const cursorRing = cursor ? cursor.querySelector(".cursor__ring") : null;

  if (cursor && cursorDot && cursorRing && !isTouch && !reduceMotion) {
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let visible = false;

    // 鼠标移动：小点即时跟随
    window.addEventListener(
      "mousemove",
      (e) => {
        pos.x = e.clientX;
        pos.y = e.clientY;

        if (!visible) {
          visible = true;
          cursor.classList.add("is-on");
          ring.x = pos.x;
          ring.y = pos.y;
        }

        cursorDot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      },
      { passive: true }
    );

    // 外圈延迟跟随
    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // 悬停可交互元素时放大
    const interactiveSel = "a, button, .project-row, .skill-row, .contact-line";

    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest(interactiveSel);
      if (!target) return;
      cursor.classList.add("is-hover");
      if (target.matches("a, button")) cursor.classList.add("is-link");
    });

    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest(interactiveSel);
      if (!target) return;
      cursor.classList.remove("is-hover", "is-link");
    });

    document.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-on");
      visible = false;
    });
  }

  /* ============================================================
     3. 滚动揭示（逐行/逐块上浮）
     ============================================================ */
  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          // 同一批进入的元素错开出现，形成节奏
          const delay = Math.min(i * 70, 280);
          setTimeout(() => entry.target.classList.add("is-in"), delay);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((el) => io.observe(el));
  }

  /* ============================================================
     4. 滚动视差（首屏大标题淡出上移 + 顶部导航状态）
     ============================================================ */
  const heroTitle = document.getElementById("heroTitle");
  const siteHeader = document.getElementById("siteHeader");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;

      // 顶部导航
      if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", y > 24);
      }

      // 首屏视差
      if (heroTitle && !reduceMotion && !isTouch) {
        const fade = Math.max(0, 1 - y / (window.innerHeight * 0.72));
        heroTitle.style.transform = `translateY(${y * 0.14}px)`;
        heroTitle.style.opacity = String(fade);
      }

      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     5. 顶部时钟
     ============================================================ */
  const clock = document.getElementById("clock");

  if (clock) {
    const pad = (n) => String(n).padStart(2, "0");

    const tick = () => {
      const d = new Date();
      clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    tick();
    setInterval(tick, 1000);
  }

  /* ============================================================
     6. 复制邮箱
     ============================================================ */
  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", async () => {
      const text = el.getAttribute("data-copy");
      const arrow = el.querySelector(".row-arrow");
      const original = arrow ? arrow.textContent : "";

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
        if (arrow) {
          arrow.textContent = "✓";
          setTimeout(() => (arrow.textContent = original), 1400);
        }
      } catch (err) {
        if (arrow) {
          arrow.textContent = "✗";
          setTimeout(() => (arrow.textContent = original), 1400);
        }
      }
    });
  });

  /* ============================================================
     7. 页脚年份
     ============================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
