(function () {
  const host = document.getElementById("book");
  const mount = document.getElementById("mount");
  const stage = document.getElementById("stage");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const hint = document.getElementById("flip-hint");
  const label = document.getElementById("page-label");
  const skipBook = document.getElementById("skip-book");
  const jumps = Array.from(document.querySelectorAll("[data-jump]"));
  const tocButtons = Array.from(document.querySelectorAll(".toc [data-jump]"));

  function hintText() {
    if (window.matchMedia("(max-width: 720px)").matches) {
      return "スワイプまたは 次";
    }
    return "次へ、または上の見出し。角は使わなくてよい。";
  }

  if (!host || typeof St === "undefined" || !St.PageFlip) {
    if (hint) {
      hint.textContent = "めくりライブラリを読めませんでした。下のテキスト版を使ってください。";
    }
    return;
  }

  const titles = [
    "表紙",
    "60秒",
    "60秒",
    "仕事",
    "仕事",
    "土台",
    "土台",
    "検証",
    "検証",
    "声",
    "声",
    "証拠",
    "連絡",
    "裏表紙",
  ];

  const pages = Array.from(host.querySelectorAll("[data-book-page]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const startPage = (function () {
    const n = Number(new URLSearchParams(window.location.search).get("page") || "0");
    if (!Number.isFinite(n) || n < 0) {
      return 0;
    }
    return Math.floor(n);
  })();

  function isNarrow() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function chromeParts() {
    const mast = document.querySelector(".mast");
    const toc = document.querySelector(".toc-wrap");
    const hintEl = document.querySelector(".hint");
    const controls = document.querySelector(".controls");
    return {
      mast: mast ? mast.offsetHeight : 0,
      toc: toc ? toc.offsetHeight : 0,
      hint: hintEl ? hintEl.offsetHeight : 0,
      controls: controls ? controls.offsetHeight : 40,
    };
  }

  function setChromeVar() {
    const p = chromeParts();
    document.documentElement.style.setProperty("--chrome-h", 12 + p.mast + p.toc + p.hint + "px");
  }

  function bookSize() {
    const narrow = isNarrow();
    if (!narrow) {
      return {
        width: 460,
        height: 560,
        minWidth: 300,
        maxWidth: 560,
        minHeight: 400,
        maxHeight: 720,
      };
    }
    setChromeVar();
    const width = Math.max(300, window.innerWidth - 16);
    const p = chromeParts();
    const height = Math.max(420, window.innerHeight - p.mast - p.toc - p.hint - p.controls - 16);
    return {
      width: width,
      height: height,
      minWidth: 300,
      maxWidth: width,
      minHeight: Math.min(420, height),
      maxHeight: height,
    };
  }

  const size = bookSize();

  const pf = new St.PageFlip(host, {
    width: size.width,
    height: size.height,
    size: "stretch",
    minWidth: size.minWidth,
    maxWidth: size.maxWidth,
    minHeight: size.minHeight,
    maxHeight: size.maxHeight,
    showCover: true,
    drawShadow: !reduceMotion.matches,
    flippingTime: reduceMotion.matches ? 1 : 500,
    usePortrait: true,
    autoSize: true,
    maxShadowOpacity: 0.28,
    startPage: startPage,
    clickEventForward: true,
    mobileScrollSupport: true,
    useMouseEvents: true,
    disableFlipByClick: true,
  });

  pf.loadFromHTML(pages);

  let flipping = false;
  let ready = false;

  function currentIndex() {
    try {
      return pf.getCurrentPageIndex();
    } catch (err) {
      return 0;
    }
  }

  function setCoverMode(index) {
    const last = pf.getPageCount() - 1;
    mount.classList.toggle("is-showing-cover", index === 0);
    mount.classList.toggle("is-showing-spread", index !== 0);
    stage.classList.toggle("is-open-spread", index > 0 && index < last);
    stage.classList.toggle("is-closed-cover", index === 0);
  }

  // In landscape the library reports the left page; the right one is visible too.
  function tocLanding(index) {
    if (index <= 0) {
      return 0;
    }
    if (index <= 2) {
      return 1;
    }
    if (index <= 4) {
      return 3;
    }
    if (index <= 6) {
      return 5;
    }
    if (index <= 8) {
      return 7;
    }
    if (index <= 10) {
      return 9;
    }
    if (index === 11) {
      return 11;
    }
    return 12;
  }

  function visibleIndices(index) {
    const count = pf.getPageCount();
    let landscape = false;
    try {
      landscape = pf.getOrientation() === "landscape";
    } catch (err) {
      landscape = false;
    }
    if (landscape && index % 2 === 1 && index + 1 < count - 1) {
      return [index, index + 1];
    }
    return [index];
  }

  function hideOffscreenLeaves(visible) {
    const items = host.querySelectorAll(".stf__item");
    if (items.length) {
      items.forEach(function (item, i) {
        const hide = visible.indexOf(i) < 0;
        item.setAttribute("aria-hidden", hide ? "true" : "false");
        if (hide) {
          item.setAttribute("inert", "");
        } else {
          item.removeAttribute("inert");
        }
      });
    }
    document.querySelectorAll("[data-book-page]").forEach(function (leaf) {
      const item = leaf.closest(".stf__item");
      if (item) {
        return;
      }
      leaf.setAttribute("aria-hidden", "true");
      leaf.setAttribute("inert", "");
    });
  }

  function markClippedSheets() {
    document.querySelectorAll(".sheet").forEach(function (sheet) {
      const clipped = sheet.scrollHeight > sheet.clientHeight + 2;
      sheet.classList.toggle("is-clipped", clipped);
    });
  }

  function paint() {
    const index = currentIndex();
    const count = pf.getPageCount();
    const visible = visibleIndices(index);
    setCoverMode(index);
    hideOffscreenLeaves(visible);
    label.textContent = visible
      .map(function (i) {
        return titles[i] || "頁 " + (i + 1);
      })
      .join(" ｜ ");
    prev.disabled = !ready || index <= 0;
    next.disabled = !ready || index >= count - 1;
    jumps.forEach(function (btn) {
      const target = Number(btn.getAttribute("data-jump"));
      btn.classList.toggle("is-active", visible.indexOf(target) >= 0);
      if (btn.tagName === "BUTTON") {
        btn.disabled = !ready;
      }
    });
    const coverBtn = document.querySelector(".toc-cover");
    if (coverBtn) {
      if (isNarrow()) {
        coverBtn.setAttribute("hidden", "");
      } else {
        coverBtn.removeAttribute("hidden");
      }
    }
    tocButtons.forEach(function (btn) {
      const target = Number(btn.getAttribute("data-jump"));
      const on = tocLanding(index) === target;
      if (on) {
        btn.setAttribute("aria-current", "page");
        if (typeof btn.scrollIntoView === "function") {
          btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
        }
      } else {
        btn.removeAttribute("aria-current");
      }
    });
    markClippedSheets();
  }

  function focusPage01() {
    const live = document.querySelector('.stf__item[aria-hidden="false"] .page-01-start');
    const el = live || document.querySelector(".page-01-start");
    if (el && typeof el.focus === "function") {
      el.focus({ preventScroll: true });
    }
  }

  // page-flip's flipPrev() uses a hard-coded x=10. In portrait the book rect
  // starts at a negative left, so with disableFlipByClick the point is never
  // "on a corner" and the call is silently dropped. Aim at the real corner.
  function isPortrait() {
    try {
      return pf.getOrientation() === "portrait";
    } catch (err) {
      return false;
    }
  }

  function flipPrevPortraitSafe() {
    if (!isPortrait()) {
      pf.flipPrev("top");
      return;
    }
    try {
      const rect = pf.getBoundsRect();
      pf.getFlipController().flip({ x: rect.left + 10, y: rect.top + 1 });
    } catch (err) {
      pf.turnToPrevPage();
      paint();
    }
  }

  function go(dir) {
    if (!ready || flipping) {
      return;
    }
    if (reduceMotion.matches) {
      if (dir === "next") {
        pf.turnToNextPage();
      } else {
        pf.turnToPrevPage();
      }
      paint();
      return;
    }
    if (dir === "next") {
      pf.flipNext("top");
    } else {
      flipPrevPortraitSafe();
    }
  }

  function jump(page) {
    if (!ready) {
      return;
    }
    const cur = currentIndex();
    if (visibleIndices(cur).indexOf(page) >= 0) {
      return;
    }
    pf.turnToPage(page);
    paint();
  }

  pf.on("flip", function () {
    paint();
  });

  pf.on("changeState", function (e) {
    flipping = e.data === "flipping" || e.data === "user_fold";
    if (e.data === "flipping") {
      mount.classList.remove("is-showing-cover");
      mount.classList.add("is-showing-spread");
    }
  });

  pf.on("init", function () {
    ready = true;
    hint.textContent = hintText();
    if (startPage > 0) {
      try {
        pf.turnToPage(Math.min(startPage, pf.getPageCount() - 1));
      } catch (err) {
        /* ignore */
      }
    }
    paint();
  });

  prev.addEventListener("click", function () {
    go("prev");
  });
  next.addEventListener("click", function () {
    go("next");
  });
  jumps.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (ready) {
        e.preventDefault();
        jump(Number(btn.getAttribute("data-jump")));
      }
    });
  });

  if (skipBook) {
    skipBook.addEventListener("click", function (e) {
      if (!ready) {
        return;
      }
      e.preventDefault();
      jump(1);
      window.setTimeout(focusPage01, 0);
    });
  }

  window.addEventListener("keydown", function (e) {
    if (e.target && ["INPUT", "TEXTAREA", "SELECT"].indexOf(e.target.tagName) >= 0) {
      return;
    }
    if (e.key === "ArrowRight") {
      go("next");
    } else if (e.key === "ArrowLeft") {
      go("prev");
    }
  });

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(function () {
      setChromeVar();
      try {
        pf.update();
      } catch (err) {
        /* ignore */
      }
      paint();
    });
    ro.observe(mount);
  }

  window.addEventListener("resize", function () {
    if (hint) {
      hint.textContent = hintText();
    }
    setChromeVar();
  });

  setChromeVar();
  ready = true;
  paint();
})();
