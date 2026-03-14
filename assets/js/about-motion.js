(() => {
  const config = window.MATT_SITE_CONFIG || {};
  const runtime = window.MATT_RUNTIME || {};
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  function syncThemeSections() {
    const sections = [...document.querySelectorAll('main [data-theme]')];
    if (!sections.length || !hasGSAP) return;

    sections.forEach((section) => {
      window.ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => {
          document.body.dataset.activeTheme = section.dataset.theme || 'light';
        },
        onEnterBack: () => {
          document.body.dataset.activeTheme = section.dataset.theme || 'light';
        },
      });
    });
  }

  function initMediaParallax() {
    if (!hasGSAP || runtime.motionTier === 'tier-c') return;
    window.gsap.utils.toArray('.media-frame, .hero-media').forEach((node) => {
      window.gsap.to(node, {
        yPercent: node.classList.contains('hero-media') ? 8 : -6,
        ease: 'none',
        scrollTrigger: {
          trigger: node.closest('.section') || node,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }

  function initRowTiming() {
    if (!hasGSAP) return;
    window.gsap.utils.toArray('.card-row').forEach((row) => {
      const children = Array.from(row.children);
      if (!children.length) return;
      window.gsap.fromTo(
        children,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: row,
            start: 'top 84%',
            once: true,
          },
        }
      );
    });
  }

  function initBookingLink() {
    const link = document.getElementById('book-call-link');
    if (!link || !config.bookingUrl) return;
    link.href = config.bookingUrl;
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.className = 'form-state';
      status.textContent = 'Sending...';

      try {
        const response = await fetch('/contact.php', {
          method: 'POST',
          body: new FormData(form),
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.message || 'Submission failed.');
        }

        form.reset();
        status.className = 'form-state success';
        status.textContent = 'Message sent. Matt usually replies quickly.';
      } catch (error) {
        status.className = 'form-state error';
        status.textContent = `Could not send message: ${error.message}`;
      }
    });
  }

  function initHeroVideo() {
    const video = document.querySelector('.hero-video');
    if (!video) return;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        video.controls = false;
      });
    }
  }

  document.addEventListener('matt:runtime-ready', () => {
    syncThemeSections();
    initMediaParallax();
    initRowTiming();
    initBookingLink();
    initContactForm();
    initHeroVideo();
  }, { once: true });
})();
