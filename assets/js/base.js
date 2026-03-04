(() => {
  const hasLenis = typeof window.Lenis === "function";
  const hasGSAP = typeof window.gsap !== "undefined";

  if (hasGSAP && window.ScrollTrigger) {
    document.documentElement.classList.add("js-motion");
  }

  let lenis = null;
  if (hasLenis) {
    lenis = new window.Lenis({
      lerp: 0.05,
      wheelMultiplier: 1,
    });

    // AWWWARDS 2025: GSAP Ticker Master Clock
    if (hasGSAP) {
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0); // Critical: prevents GSAP from compensating for lag
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    window.__lenis = lenis;
  }

  if (hasGSAP && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }

    window.gsap.utils.toArray(".reveal").forEach((el, index) => {
      window.gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.72,
        ease: "power2.out",
        delay: Math.min(0.04 * index, 0.18),
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
        },
      });
    });
  }

  function initPointerWake() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const page = document.querySelector(".page");
    if (!page) return;

    const wake = document.createElement("div");
    wake.className = "cursor-wake";
    page.appendChild(wake);
    page.classList.add("has-pointer-wake");

    let x = window.innerWidth * 0.5;
    let y = window.innerHeight * 0.4;
    let tx = x;
    let ty = y;

    window.addEventListener(
      "pointermove",
      (event) => {
        tx = event.clientX;
        ty = event.clientY;
      },
      { passive: true }
    );

    function tick() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      wake.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initInteractiveCards() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const cards = document.querySelectorAll(
      ".card, .maintainer-card, .notice-card, .booking-card, .timeline-item, .links-section"
    );
    if (!cards.length) return;

    cards.forEach((card) => {
      if (card.dataset.interactiveBound === "1") return;
      card.dataset.interactiveBound = "1";
      card.classList.add("interactive-card");

      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / Math.max(rect.width, 1);
        const py = (event.clientY - rect.top) / Math.max(rect.height, 1);
        const tiltX = (0.5 - py) * 5;
        const tiltY = (px - 0.5) * 6;

        card.style.setProperty("--tilt-x", `${tiltX.toFixed(3)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(3)}deg`);
        card.style.setProperty("--spot-x", `${(px * 100).toFixed(2)}%`);
        card.style.setProperty("--spot-y", `${(py * 100).toFixed(2)}%`);
        card.classList.add("is-hover");
      };

      const onLeave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.classList.remove("is-hover");
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
    });
  }

  initPointerWake();
  initInteractiveCards();
  window.addEventListener("links:rendered", initInteractiveCards);

  const topbarLinks = document.querySelectorAll("[data-track-nav]");
  topbarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      const topbarInner = document.querySelector(".topbar-inner");
      const offset = -((topbarInner?.clientHeight || 84) + 30);
      if (lenis) {
        lenis.scrollTo(target, { offset });
      }
    });
  });

  const topbar = document.querySelector(".topbar");
  if (topbar) {
    let lastY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastY;
        if (currentY > 190 && scrollingDown) {
          topbar.classList.add("is-hidden");
        } else {
          topbar.classList.remove("is-hidden");
        }
        lastY = currentY;
      },
      { passive: true }
    );
  }
})();
