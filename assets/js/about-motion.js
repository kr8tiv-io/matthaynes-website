(() => {
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const hasTHREE = typeof window.THREE !== 'undefined';

  function forceHeroContentVisible() {
    const nodes = document.querySelectorAll('.hero .kicker, .hero h1, .hero .hero-copy, .hero-meta span, .hero .btn');
    nodes.forEach((node) => {
      const computed = window.getComputedStyle(node);
      const opacity = Number.parseFloat(computed.opacity || '1');
      if (!Number.isFinite(opacity) || opacity < 0.2) {
        node.style.opacity = '1';
      }
      if (computed.visibility === 'hidden') {
        node.style.visibility = 'visible';
      }
      if (computed.transform && computed.transform !== 'none') {
        node.style.transform = 'none';
      }
    });
  }

  function canUseWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
          canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true }) ||
          canvas.getContext('experimental-webgl'))
      );
    } catch (_error) {
      return false;
    }
  }

  function initHeroOverlay() {
    if (!hasTHREE || !canUseWebGL()) return false;

    const canvas = document.getElementById('hero-canvas');
    const hero = document.getElementById('about-hero');
    if (!canvas || !hero) return false;

    const { THREE } = window;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0xffffff, 0); // Transparent background
    } catch (_error) {
      return false;
    }

    const scene = new THREE.Scene();

    // We'll use an OrthographicCamera to render a flat plane that fills the screen
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    // Awwwards-style organic fluid shader using noise
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      varying vec2 vUv;

      // Classic 2D noise from Inigo Quilez
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy;
        st.x *= u_resolution.x/u_resolution.y;

        // Mouse interaction shifts the noise field naturally
        vec2 mouseOffset = (u_mouse * 0.2);

        // Multi-layered noise for an organic fluid look
        float n = snoise(vec2(st.x * 1.5 + u_time * 0.15 - mouseOffset.x, st.y * 1.5 - u_time * 0.12 - mouseOffset.y));
        n += 0.5 * snoise(vec2(st.x * 3.0 - u_time * 0.2 + mouseOffset.x * 0.5, st.y * 3.0 + u_time * 0.15));

        // Map noise to tropical-white colors
        vec3 colTop = vec3(0.85, 0.98, 0.96); // Soft minty white
        vec3 colBot = vec3(1.0, 1.0, 1.0);    // Pure white
        vec3 colHighlight = vec3(0.55, 0.88, 0.83); // Tropical cyan/mint accent

        // Mix colors smoothly based on noise and y-coordinate
        float mixVal = smoothstep(-0.4, 0.6, n);
        vec3 color = mix(colBot, colTop, st.y);
        color = mix(color, colHighlight, smoothstep(0.4, 1.0, mixVal) * 0.4);

        // Alpha fades near edges so it blends flawlessly with the page
        float alpha = smoothstep(0.0, 1.0, mixVal * 1.2);

        gl_FragColor = vec4(color, alpha * 0.75); // 0.75 global opacity for a delicate background
      }
    `;

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2() },
      u_mouse: { value: new THREE.Vector2() }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Ambient Motes / Fireflies for Tropical Vibe
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVels = [];
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 4;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      particleVels.push({
        x: (Math.random() - 0.5) * 0.005,
        y: 0.002 + Math.random() * 0.006,
        z: (Math.random() - 0.5) * 0.005
      });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x22ffd6,
      size: 0.012,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = 1.0 - (event.clientY - rect.top) / rect.height; // WebGL uses bottom-left origin
    };

    hero.addEventListener('pointermove', onPointerMove, { passive: true });

    function resize() {
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // Cap pixel ratio for performance
      renderer.setSize(width, height, false);
      uniforms.u_resolution.value.set(width, height);
    }

    resize();
    window.addEventListener('resize', resize);

    const scrollState = { progress: 0 };
    let heroTrigger = null;
    if (hasGSAP) {
      heroTrigger = window.ScrollTrigger.create({
        trigger: '#about-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        }
      });
    }

    function animate() {
      const delta = clock.getDelta();

      // Smoothly animate mouse position
      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;

      // Update uniforms
      // Awwwards Trend #2: Pass lenis velocity directly into shaders for physics-based distortion
      const velocity = window.__lenis ? window.__lenis.velocity : 0;
      const distortion = Math.abs(velocity) * 0.003;
      uniforms.u_time.value += delta * (0.8 + scrollState.progress + distortion);
      uniforms.u_mouse.value.set(pointer.x, pointer.y);

      // Update particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Particles shift faster when scrolling!
        const yBoost = (velocity * 0.0002);

        positions[i * 3] += particleVels[i].x;
        positions[i * 3 + 1] += particleVels[i].y - yBoost;
        positions[i * 3 + 2] += particleVels[i].z;

        if (positions[i * 3 + 1] > 1.5) {
          positions[i * 3 + 1] = -1.5;
          positions[i * 3] = (Math.random() - 0.5) * 4;
        } else if (positions[i * 3 + 1] < -1.5) {
          positions[i * 3 + 1] = 1.5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = pointer.x * 0.2;
      particles.rotation.x = -pointer.y * 0.2;

      renderer.render(scene, camera);
    }

    if (hasGSAP) {
      window.gsap.ticker.add(animate);
    } else {
      let rafId = 0;
      function tick() {
        animate();
        rafId = requestAnimationFrame(tick);
      }
      tick();
    }

    window.addEventListener('beforeunload', () => {
      if (hasGSAP) {
        window.gsap.ticker.remove(animate);
      }
      heroTrigger?.kill();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    });

    return true;
  }

  function initWebGLConstellation() {
    if (!hasGSAP || !hasTHREE || !canUseWebGL()) return false;

    const shell = document.querySelector('.operator-system-shell');
    const canvas = document.getElementById('operator-canvas');
    if (!shell || !canvas) return false;

    const { THREE } = window;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
    } catch (_error) {
      return false;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, shell.clientWidth / shell.clientHeight, 0.1, 100);
    camera.position.z = 12;

    const group = new THREE.Group();
    scene.add(group);

    // Operator Nodes (Large glowing spheres)
    const nodeGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x0ea685, transparent: true, opacity: 0.9 });

    const nodesData = [
      { x: -3, y: 1.5, z: 1, c: 0x0ea685 },
      { x: -1, y: -2, z: 0, c: 0x0ab5c3 },
      { x: 1.5, y: 2, z: -1, c: 0x16be91 },
      { x: 3.5, y: -1, z: 2, c: 0x088c7f }
    ];

    const nodes = [];
    nodesData.forEach(pos => {
      const mat = new THREE.MeshBasicMaterial({ color: pos.c, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.set(pos.x, pos.y, pos.z);
      group.add(mesh);
      nodes.push({ mesh, baseX: pos.x, baseY: pos.y, phase: Math.random() * Math.PI * 2 });
    });

    // Connecting lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(nodes.map(n => n.mesh.position));
    const lineMesh = new THREE.Line(lineGeo, lineMat);
    group.add(lineMesh);

    // Ambient floating particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 15;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e) => {
      const rect = shell.getBoundingClientRect();
      // Normalized coordinates -1 to +1
      pointer.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    shell.addEventListener('mousemove', onPointerMove, { passive: true });

    function resize() {
      const width = shell.clientWidth;
      const height = shell.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    const scrollState = { progress: 0 };
    window.ScrollTrigger.create({
      trigger: '#operator-shell',
      start: 'top 80%',
      end: 'bottom 40%',
      scrub: 1.5,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      },
    });

    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();

      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;

      group.rotation.x = pointer.y * 0.2;
      group.rotation.y = pointer.x * 0.2;

      // Node ambient floating
      const currentPositions = [];
      nodes.forEach(n => {
        n.mesh.position.y = n.baseY + Math.sin(elapsed + n.phase) * 0.2;
        currentPositions.push(n.mesh.position.clone());
        n.mesh.scale.setScalar(1.0 + Math.sin(elapsed * 2 + n.phase) * 0.15);
      });
      lineGeo.setFromPoints(currentPositions);

      // Particles swirl
      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    }
    window.gsap.ticker.add(animate);
    return true;
  }

  function initStoryMotion() {
    if (!hasGSAP) {
      forceHeroContentVisible();
      return;
    }

    // Helper to split text into words for animation
    function splitText(element) {
      const text = element.innerText;
      let html = '';
      text.split(/(\s+)/).forEach(word => {
        if (word.trim() === '') {
          html += word; // Keep spaces
        } else {
          html += `<span style="display:inline-block; overflow:hidden; vertical-align:top;"><span class="split-word" style="display:inline-block; will-change:transform,opacity;">${word}</span></span>`;
        }
      });
      element.innerHTML = html;
      return element.querySelectorAll('.split-word');
    }

    try {
      const splitTargets = document.querySelectorAll('.split-target');
      splitTargets.forEach(target => {
        const words = splitText(target);

        // AWWWARDS TREND #5: 3D Character/Word Stagger Reveals
        window.gsap.from(words, {
          yPercent: 120,
          opacity: 0,
          rotateX: -90,
          transformOrigin: '50% 50% -30px', // gives real 3D flip depth
          duration: 0.9,
          stagger: 0.03,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
          }
        });
      });

      const heroTl = window.gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Let's manually split the big H1 for a more intense 3D effect
      const heroH1 = document.querySelector('.hero h1');
      if (heroH1) {
        const heroH1Words = splitText(heroH1);
        heroTl.from('.hero .kicker', { y: 26, opacity: 0, duration: 0.62 })
          .from(heroH1Words, {
            yPercent: 100,
            opacity: 0,
            rotateX: -90,
            transformOrigin: '50% 50% -30px',
            duration: 0.8,
            stagger: 0.04,
            ease: 'back.out(1.2)'
          }, '-=0.24')
          .from('.hero .hero-copy', { y: 24, opacity: 0, duration: 0.74 }, '-=0.4')
          .from('.hero-meta span', { y: 14, opacity: 0, duration: 0.42, stagger: 0.07 }, '-=0.42')
          .from('.hero .btn', { y: 10, opacity: 0, duration: 0.36, stagger: 0.08 }, '-=0.32');
      } else {
        heroTl
          .from('.hero .kicker', { y: 26, opacity: 0, duration: 0.62 })
          .from('.hero h1', { y: 42, opacity: 0, duration: 0.92 }, '-=0.24')
          .from('.hero .hero-copy', { y: 24, opacity: 0, duration: 0.74 }, '-=0.5')
          .from('.hero-meta span', { y: 14, opacity: 0, duration: 0.42, stagger: 0.07 }, '-=0.42')
          .from('.hero .btn', { y: 10, opacity: 0, duration: 0.36, stagger: 0.08 }, '-=0.32');
      }

      window.gsap.fromTo(
        '.global-video.base-video',
        { scale: 1.08, filter: 'saturate(1.02) contrast(1.04) brightness(1.02)' },
        {
          scale: 1,
          filter: 'saturate(1.08) contrast(1.08) brightness(1.04)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#about-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

    } catch (_error) {
      forceHeroContentVisible();
    }

    window.gsap.utils.toArray('.story-portrait, .maintainer-card, .notice-card, .card, .timeline-item').forEach((item, idx) => {
      window.gsap.from(item, {
        y: 24,
        opacity: 0,
        duration: 0.58,
        delay: Math.min(idx * 0.01, 0.12),
        scrollTrigger: {
          trigger: item,
          start: 'top 86%',
        },
      });
    });

    window.gsap.utils.toArray('.video-story-band').forEach((band) => {
      const video = band.querySelector('.story-video');
      const content = band.querySelector('.story-video-content');
      if (!video || !content) return;

      window.gsap.fromTo(
        video,
        { scale: 1.08 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: band,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      window.gsap.fromTo(
        content,
        { y: 34, opacity: 0.6 },
        {
          y: 0,
          opacity: 1,
          duration: 0.84,
          scrollTrigger: {
            trigger: band,
            start: 'top 76%',
          },
        }
      );
    });

    // Deep Parallax for Tropical Flora
    window.gsap.utils.toArray('.parallax-flora').forEach((flora, idx) => {
      // Different depth speeds based on index
      const depth = 0.3 + (idx % 3) * 0.25;

      window.gsap.to(flora, {
        z: 600 * depth, // True 3D Z-axis depth pull
        rotationX: 30 * depth,
        rotationY: -15 * depth,
        scale: 1 + (1.2 * depth), // Expansion
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      });

      // Active Floating mouse sway
      window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        window.gsap.to(flora, {
          x: dx * 60 * depth,
          y: dy * 60 * depth,
          duration: 3 + depth,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }

  function initManifestoMotion() {
    const lines = Array.from(document.querySelectorAll('.manifesto-line'));
    if (!lines.length) return;

    if (!hasGSAP) {
      lines[0].classList.add('is-active');
      return;
    }
    lines[0].classList.add('is-active');
    window.ScrollTrigger.create({
      trigger: '#manifesto',
      start: 'top 72%',
      end: 'bottom 24%',
      scrub: true,
      onUpdate: (self) => {
        const current = Math.min(lines.length - 1, Math.floor(self.progress * lines.length));
        lines.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === current));
      },
    });
  }

  function initBookingLink() {
    const link = document.getElementById('book-call-link');
    if (!link) return;

    const configured = typeof window.MATT_BOOKING_URL === 'string' ? window.MATT_BOOKING_URL.trim() : '';
    if (!configured) return;
    link.setAttribute('href', configured);
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.className = 'form-state';
      status.textContent = 'Sending...';

      const formData = new FormData(form);

      try {
        const response = await fetch('/contact.php', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || 'Submission failed.');
        }

        form.reset();
        status.className = 'form-state success';
        status.textContent = 'Message sent. Matt usually replies quickly (founder-hours apply).';
      } catch (error) {
        status.className = 'form-state error';
        status.textContent = `Could not send message: ${error.message}`;
      }
    });
  }

  function initCinematicScrollytelling() {
    if (!hasGSAP) return;

    gsap.registerPlugin(ScrollTrigger);

    // Ensure all elements exist
    const sections = document.querySelectorAll('.cinematic-panel');
    if (sections.length === 0) return;

    // Re-enable Deep Flora Parallax and Mouse Shift
    const floras = document.querySelectorAll('.parallax-flora');
    if (floras.length > 0) {
      floras.forEach((flora, i) => {
        // Intense scroll parallax (differs per item)
        gsap.to(flora, {
          y: () => -(window.innerHeight * (0.8 + (i * 0.4))),
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2
          }
        });

        // Mouse stalk
        document.addEventListener('mousemove', (e) => {
          const mouseX = e.clientX / window.innerWidth - 0.5;
          const mouseY = e.clientY / window.innerHeight - 0.5;

          gsap.to(flora, {
            x: mouseX * (50 + i * 20),
            y: "+=" + (mouseY * (50 + i * 20)),
            duration: 2,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      });
    }

    // Cinematic stakable panels (agency-grade overlap)
    window.gsap.utils.toArray('.story-section, .manifesto-section, .operator-system-section, #contact').forEach((panel, i) => {
      window.ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        pin: true,
        pinSpacing: false, // Ensures panels slide smoothly over each other
        end: '+=100%' // Allow time to overlay
      });
    });

    // Global ambient cursor interaction (jungle leaf sway)
    const handleMouseSway = (e) => {
      const rx = (e.clientX / window.innerWidth) - 0.5;
      const ry = (e.clientY / window.innerHeight) - 0.5;

      window.gsap.to('.parallax-flora', {
        x: () => rx * -40,
        y: () => ry * -40,
        duration: 2,
        ease: "power2.out"
      });
    };

    document.addEventListener("mousemove", handleMouseSway, { passive: true });
  }

  function initGlobalVideoMotion() {
    if (!hasGSAP) return;

    const topMidVideo = document.querySelector('.global-video.top-mid-video');
    const midVideo = document.querySelector('.global-video.mid-video');
    const bottomVideo = document.querySelector('.global-video.bottom-video');
    const operatorSection = document.querySelector('.operator-system-section');
    const storySection = document.querySelector('.story-section');
    const timelineSection = document.querySelector('.timeline-section');

    // Fade Grok abstract video in at Operator section, out at end of Operator section
    if (operatorSection && topMidVideo) {
      window.gsap.fromTo(topMidVideo,
        { opacity: 0 },
        {
          opacity: 0.85,
          ease: "none",
          scrollTrigger: {
            trigger: operatorSection,
            start: "top 60%",
            end: "top 20%",
            scrub: true
          }
        }
      );
      window.gsap.to(topMidVideo, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: operatorSection,
          start: "bottom 80%",
          end: "bottom 30%",
          scrub: true
        }
      });
    }

    // Fade mid video in, then back out as we pass the story section
    if (storySection && midVideo) {
      window.gsap.fromTo(midVideo,
        { opacity: 0 },
        {
          opacity: 0.85, // Heavy bleed over the base video
          ease: "none",
          scrollTrigger: {
            trigger: storySection,
            start: "top 50%",
            end: "top 10%",
            scrub: true
          }
        }
      );
      window.gsap.to(midVideo, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: storySection,
          start: "bottom 80%",
          end: "bottom 30%",
          scrub: true
        }
      });
    }

    // Fade bottom video in at the timeline
    if (timelineSection && bottomVideo) {
      window.gsap.fromTo(bottomVideo,
        { opacity: 0 },
        {
          opacity: 0.85,
          ease: "none",
          scrollTrigger: {
            trigger: timelineSection,
            start: "top 50%",
            end: "top 10%",
            scrub: true
          }
        }
      );
    }
  }

  function forcePlayGlobalVideos() {
    document.querySelectorAll('.global-video').forEach((video) => {
      // Browsers often block autoplay aggressively. Force it via promise.
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.log(`Video Autoplay prevented on ${video.src}. User interaction required.`, e);
        });
      }
    });
  }

  forceHeroContentVisible();
  initGlobalVideoMotion();
  forcePlayGlobalVideos();
  const heroWebgl = initHeroOverlay();
  const operatorWebgl = initWebGLConstellation();
  if (!heroWebgl) {
    document.documentElement.classList.add('hero-no-webgl');
  }
  if (!operatorWebgl) {
    document.getElementById('operator-shell')?.classList.add('no-webgl');
  }
  initManifestoMotion();
  initBookingLink();
  initStoryMotion();
  initContactForm();
  window.setTimeout(() => {
    forceHeroContentVisible();
  }, 1200);
})();
