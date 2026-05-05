import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initLenis() {
  if (reducedMotion) return;
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 0.9
  });
  (window as typeof window & { __lenis?: Lenis }).__lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initVideoDirector() {
  const layers = Array.from(document.querySelectorAll<HTMLVideoElement>('[data-video-layer]'));
  if (!layers.length) return;
  const preloader = document.querySelector<HTMLElement>('[data-video-preloader]');
  const preloaderCount = preloader?.querySelector<HTMLElement>('strong');
  let preloaderHidden = false;

  const hidePreloader = () => {
    if (preloaderHidden) return;
    preloaderHidden = true;
    document.documentElement.classList.add('is-video-ready');
    preloader?.classList.add('is-hidden');
    window.setTimeout(() => preloader?.remove(), 900);
  };

  if (preloader && preloaderCount) {
    gsap.to(preloaderCount, {
      textContent: 99,
      duration: reducedMotion ? 0.01 : 1.4,
      snap: { textContent: 1 },
      ease: 'power2.out',
      onUpdate: () => {
        preloaderCount.textContent = String(preloaderCount.textContent).padStart(2, '0');
      }
    });
  }

  const primeVideo = (video: HTMLVideoElement) => {
    if (!video.getAttribute('src') && video.dataset.src) {
      video.src = video.dataset.src;
      video.preload = 'auto';
      video.load();
    }
  };

  const playVideo = (video: HTMLVideoElement) => {
    primeVideo(video);
    const play = video.play();
    if (play && typeof play.catch === 'function') play.catch(() => undefined);
  };

  playVideo(layers[0]);
  const heroVideo = layers[0];
  if (heroVideo.readyState >= 2) hidePreloader();
  heroVideo.addEventListener('loadeddata', hidePreloader, { once: true });
  heroVideo.addEventListener('canplay', hidePreloader, { once: true });
  heroVideo.addEventListener('playing', hidePreloader, { once: true });
  window.setTimeout(hidePreloader, 2600);

  const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-video-scene]'));
  scenes.forEach((scene) => {
    const key = scene.dataset.videoScene;
    const layer = layers.find((item) => item.dataset.videoLayer === key);
    if (!layer) return;

    ScrollTrigger.create({
      trigger: scene,
      start: 'top 62%',
      end: 'bottom 38%',
      onEnter: () => setActive(layer),
      onEnterBack: () => setActive(layer)
    });

    ScrollTrigger.create({
      trigger: scene,
      start: 'top 92%',
      once: true,
      onEnter: () => primeVideo(layer)
    });
  });

  function setActive(activeLayer: HTMLVideoElement) {
    playVideo(activeLayer);

    layers.forEach((layer) => {
      const active = layer === activeLayer;
      gsap.to(layer, {
        opacity: active ? 1 : 0,
        filter: active ? 'saturate(1.04) contrast(1.05)' : 'saturate(0.72) contrast(0.9)',
        duration: reducedMotion ? 0.01 : 1.15,
        ease: 'power3.out',
        onComplete: () => {
          if (!active) layer.pause();
        }
      });
    });
  }
}

function initReveals() {
  const revealables = document.querySelectorAll<HTMLElement>('[data-split], .venture-row, [data-system-card], .contact-form label, .link-row');
  if (reducedMotion) {
    revealables.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  document.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
    const words = heading.textContent?.trim().split(/\s+/) ?? [];
    const escapeWord = (word: string) => word.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return entities[character] ?? character;
    });
    heading.innerHTML = words
      .map((word, index) => `<span class="word" style="--i:${index}">${escapeWord(word).replace(/\//g, '/<wbr>')}</span>`)
      .join(' ');
  });

  gsap.utils.toArray<HTMLElement>('[data-split] .word, .venture-row, [data-system-card], .contact-form label').forEach((element) => {
    gsap.fromTo(element,
      { y: 28, opacity: 0, filter: 'blur(8px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.72,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          once: true
        }
      }
    );
  });
}

function initRunwayNav() {
  const links = Array.from(document.querySelectorAll<HTMLElement>('[data-runway-link]'));
  const nav = document.querySelector<HTMLElement>('.runway-nav');
  links.forEach((link) => {
    const id = link.dataset.runwayLink;
    const section = id ? document.getElementById(id) : null;
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activate(id),
      onEnterBack: () => activate(id)
    });
  });
  activate('hero');

  function activate(id?: string) {
    nav?.classList.toggle('is-on-hero', id === 'hero');
    links.forEach((link) => link.classList.toggle('is-active', link.dataset.runwayLink === id));
  }
}

function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const note = document.querySelector<HTMLElement>('[data-form-note]');
  if (!form || !note) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    if (!name || !email || !message) {
      note.textContent = 'Name, email, and a useful brief are required.';
      return;
    }

    const subject = encodeURIComponent(`Project brief from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:lucidbloks@gmail.com?subject=${subject}&body=${body}`;
    note.textContent = 'Opening your email client with the brief composed.';
  });
}

initLenis();
initVideoDirector();
initReveals();
initRunwayNav();
initContactForm();
