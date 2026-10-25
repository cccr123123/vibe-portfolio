/* ============================================================
   个人作品集网站 · app.js
   原生 JS，零依赖
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. 顶部导航滚动态 ---------- */
  const header = document.querySelector(".site-header");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 移动端菜单 ---------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
  };

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });

  // 点击导航链接后收起菜单
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // 点击页面其他区域收起菜单
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
      closeNav();
    }
  });

  /* ---------- 3. 滚动渐入动画 ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target); // 只触发一次
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((el) => io.observe(el));
  } else {
    // 兜底：不支持 IO 的浏览器直接显示
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 4. 导航高亮当前区块 ---------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  const highlightNav = () => {
    const offset = window.scrollY + 140;
    let currentId = sections[0] ? sections[0].id : "";

    sections.forEach((sec) => {
      if (sec.offsetTop <= offset) currentId = sec.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
    });
  };

  window.addEventListener("scroll", highlightNav, { passive: true });
  highlightNav();

  /* ---------- 5. 复制联系方式 ---------- */
  document.querySelectorAll("[data-copy]").forEach((card) => {
    const hint = card.querySelector(".contact-card__hint");
    const original = hint ? hint.textContent : "";

    card.addEventListener("click", async () => {
      const text = card.getAttribute("data-copy");
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // 兜底：非安全上下文（如本地 file:// 打开）
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        if (hint) {
          hint.textContent = "✓ 已复制";
          setTimeout(() => {
            hint.textContent = original;
          }, 1600);
        }
      } catch (err) {
        if (hint) hint.textContent = "复制失败，请手动选择";
      }
    });
  });

  /* ---------- 6. 页脚年份 ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
