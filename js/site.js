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
    "注記",
    "提出者",
    "今期",
    "科目",
    "技術",
    "未記入",
    "公開",
    "奥付",
    "裏表紙",
  ];

  const pages = Array.from(host.querySelectorAll("[data-book-page]"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const startPage = (function () {
    const n = Number(new URLSearchParams(window.location.search).get("page") || "0");
    if (!Number.isFinite(n) || n < 0) {
      return 0;
    }
    return Math.floor(n);
  })();

  const pf = new St.PageFlip(host, {
    width: 460,
    height: 560,
    size: "stretch",
    minWidth: 300,
    maxWidth: 560,
    minHeight: 400,
    maxHeight: 720,
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

  function paint() {
    const index = currentIndex();
    const count = pf.getPageCount();
    setCoverMode(index);
    label.textContent = titles[index] || "頁 " + (index + 1);
    prev.disabled = !ready || index <= 0;
    next.disabled = !ready || index >= count - 1;
    jumps.forEach(function (btn) {
      const target = Number(btn.getAttribute("data-jump"));
      btn.classList.toggle("is-active", target === index);
      btn.disabled = !ready;
    });
  }

  function go(dir) {
    if (!ready || flipping) {
      return;
    }
    if (dir === "next") {
      pf.flipNext("top");
    } else {
      pf.flipPrev("top");
    }
  }

  function jump(page) {
    if (!ready || flipping) {
      return;
    }
    const cur = currentIndex();
    if (cur === page) {
      return;
    }
    const dist = Math.abs(page - cur);
    if (reduce.matches || dist > 2) {
      pf.turnToPage(page);
      paint();
      return;
    }
    pf.flip(page, "top");
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
    hint.textContent = "角をつまむ。見出しとボタンでもめくれる。クリックだけではめくれない（リンクを残すため）。";
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
    btn.addEventListener("click", function () {
      jump(Number(btn.getAttribute("data-jump")));
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
