(function () {
  const host = document.getElementById("book");
  const mount = document.getElementById("mount");
  const stage = document.getElementById("stage");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const hint = document.getElementById("flip-hint");
  const label = document.getElementById("page-label");
  const jumps = Array.from(document.querySelectorAll("[data-jump]"));

  if (!host || typeof St === "undefined" || !St.PageFlip) {
    if (hint) {
      hint.textContent = "めくりライブラリを読めませんでした。下のテキスト版を使ってください。";
    }
    return;
  }

  const titles = [
    "表紙",
    "60秒",
    "証拠",
    "ONBOARDING 問題",
    "ONBOARDING 結果",
    "workbench",
    "学びの例",
    "AI の検証",
    "見て止めた",
    "顧客の声",
    "任せられる範囲",
    "証拠",
    "連絡",
    "裏表紙",
  ];

  const pages = Array.from(host.querySelectorAll("[data-book-page]"));
  // Portrait phones get a taller leaf so a single page fills the stage.
  const narrow = window.matchMedia("(max-width: 720px)").matches;
  const startPage = (function () {
    const n = Number(new URLSearchParams(window.location.search).get("page") || "0");
    if (!Number.isFinite(n) || n < 0) {
      return 0;
    }
    return Math.floor(n);
  })();

  const pf = new St.PageFlip(host, {
    width: narrow ? 360 : 460,
    height: narrow ? 660 : 560,
    size: "stretch",
    minWidth: 300,
    maxWidth: 560,
    minHeight: narrow ? 480 : 400,
    maxHeight: narrow ? 860 : 720,
    showCover: true,
    drawShadow: true,
    flippingTime: 1250,
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

  function paint() {
    const index = currentIndex();
    const count = pf.getPageCount();
    const visible = visibleIndices(index);
    setCoverMode(index);
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
      btn.disabled = !ready;
    });
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
    hint.textContent = "60秒へ、見出し、前後ボタン、← → で進める。角をつまむ必要はない。クリックだけではめくれない（リンクを残すため）。";
    if (startPage > 0) {
      try {
        pf.turnToPage(Math.min(startPage, pf.getPageCount() - 1));
      } catch (err) {
        /* ignore */
      }
    } else if (window.location.hash === "#plain-overview") {
      try {
        pf.turnToPage(1);
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
        if (btn.getAttribute("data-jump") === "1") {
          const overview = document.getElementById("plain-overview");
          if (overview && btn.getAttribute("href") === "#plain-overview") {
            /* Stay on the book; text version remains a fallback. */
          }
        }
      }
    });
  });

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
      try {
        pf.update();
      } catch (err) {
        /* ignore */
      }
    });
    ro.observe(mount);
  }

  ready = true;
  paint();
})();
