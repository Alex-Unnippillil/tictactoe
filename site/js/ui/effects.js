'use strict';

(function (global) {
  const reduceMotionQuery =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  const toneMap = {
    x: {
      color: 'rgba(37, 99, 235, 0.55)',
      accent: 'rgba(59, 130, 246, 0.35)',
      secondary: 'rgba(96, 165, 250, 0.32)',
    },
    o: {
      color: 'rgba(220, 38, 38, 0.52)',
      accent: 'rgba(248, 113, 113, 0.35)',
      secondary: 'rgba(239, 68, 68, 0.28)',
    },
    draw: {
      color: 'rgba(139, 92, 246, 0.45)',
      accent: 'rgba(167, 139, 250, 0.35)',
      secondary: 'rgba(129, 140, 248, 0.32)',
    },
  };

  const resolveTone = (tone) => {
    const key = typeof tone === 'string' ? tone.toLowerCase() : '';
    return toneMap[key] || toneMap.x;
  };

  const shouldReduceMotion = () => Boolean(reduceMotionQuery?.matches);

  const overlays = new Set();

  const removeOverlay = (overlay) => {
    if (!overlay) {
      return;
    }
    overlays.delete(overlay);
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };

  const createOverlay = (extraClassName, tone) => {
    if (typeof document === 'undefined') {
      return null;
    }
    const root = document.body || document.documentElement;
    if (!root) {
      return null;
    }

    const overlay = document.createElement('div');
    overlay.className = `effect-overlay${extraClassName ? ` ${extraClassName}` : ''}`;
    overlay.setAttribute('aria-hidden', 'true');

    if (tone) {
      overlay.dataset.tone = tone;
      const resolved = resolveTone(tone);
      overlay.style.setProperty('--effect-tone-color', resolved.color);
      overlay.style.setProperty('--effect-tone-accent', resolved.accent);
      overlay.style.setProperty('--effect-tone-secondary', resolved.secondary);
    }

    overlays.add(overlay);
    root.appendChild(overlay);
    return overlay;
  };

  const addBoardHighlight = (target, tone, className, duration) => {
    if (!target) {
      return;
    }
    const resolved = resolveTone(tone);
    target.classList.add(className);
    target.style.setProperty('--board-effect-color', resolved.color);
    target.style.setProperty('--board-effect-accent', resolved.accent);
    target.style.setProperty('--board-effect-secondary', resolved.secondary);
    window.setTimeout(() => {
      target.classList.remove(className);
      target.style.removeProperty('--board-effect-color');
      target.style.removeProperty('--board-effect-accent');
      target.style.removeProperty('--board-effect-secondary');
    }, duration);
  };

  const playConfetti = ({ duration = 3200, particleCount = 140, tone = 'x' } = {}) => {
    if (shouldReduceMotion()) {
      return Promise.resolve();
    }

    const overlay = createOverlay('effect-overlay--confetti', tone);
    if (!overlay) {
      return Promise.resolve();
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'effect-overlay__canvas';
    overlay.appendChild(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
      removeOverlay(overlay);
      return Promise.resolve();
    }

    let width = overlay.clientWidth;
    let height = overlay.clientHeight;

    const resize = () => {
      width = overlay.clientWidth;
      height = overlay.clientHeight;
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(scale, scale);
    };

    resize();

    const resolved = resolveTone(tone);
    const palette = [resolved.accent, resolved.secondary, resolved.color, 'rgba(255, 255, 255, 0.65)'];

    const randomBetween = (min, max) => Math.random() * (max - min) + min;

    const particles = Array.from({ length: particleCount }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(-height * 0.5, 0),
      w: randomBetween(6, 12),
      h: randomBetween(12, 24),
      vx: randomBetween(-0.6, 0.6),
      vy: randomBetween(1.2, 2.6),
      rotation: randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.2, 0.2),
      opacity: randomBetween(0.65, 1),
      color: palette[Math.floor(Math.random() * palette.length)],
    }));

    let animationFrame = null;
    let startTime = null;
    let lastTime = null;

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        lastTime = timestamp;
      }
      const elapsed = timestamp - startTime;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx * (delta / 16.6667);
        particle.y += particle.vy * (delta / 16.6667);
        particle.vy += 0.012 * (delta / 16.6667);
        particle.rotation += particle.rotationSpeed * (delta / 16.6667);

        if (particle.y > height + 50) {
          particle.y = randomBetween(-height * 0.3, -20);
          particle.x = randomBetween(0, width);
          particle.vy = randomBetween(1.1, 2.3);
        }

        context.save();
        context.globalAlpha = particle.opacity * (1 - elapsed / duration);
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
        context.restore();
      });

      if (elapsed < duration) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        animationFrame = null;
        overlay.classList.add('effect-overlay--fade-out');
      }
    };

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);

    animationFrame = window.requestAnimationFrame(step);

    return new Promise((resolve) => {
      const cleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
        removeOverlay(overlay);
        resolve();
      };

      window.setTimeout(cleanup, duration + 260);
    });
  };

  const playRadialGlow = (target, { tone = 'x', duration = 1200 } = {}) => {
    if (!target) {
      return Promise.resolve();
    }

    if (shouldReduceMotion()) {
      addBoardHighlight(target, tone, 'board--celebrate', duration);
      return Promise.resolve();
    }

    const overlay = createOverlay('effect-overlay--radial', tone);
    if (!overlay) {
      return Promise.resolve();
    }

    const glow = document.createElement('div');
    glow.className = 'effect-overlay__radial';
    overlay.appendChild(glow);

    const setPosition = () => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;
      const size = Math.max(rect.width, rect.height) * 1.6;
      glow.style.setProperty('--glow-center-x', `${centerX}px`);
      glow.style.setProperty('--glow-center-y', `${centerY}px`);
      glow.style.setProperty('--glow-size', `${size}px`);
      glow.style.setProperty('--glow-duration', `${duration}ms`);
    };

    setPosition();

    const handleResize = () => {
      setPosition();
    };

    window.addEventListener('resize', handleResize, { once: true });

    return new Promise((resolve) => {
      window.setTimeout(() => {
        removeOverlay(overlay);
        resolve();
      }, duration + 200);
    });
  };

  const playParticleOverlay = (
    target,
    { tone = 'draw', count = 26, duration = 1400 } = {}
  ) => {
    if (!target) {
      return Promise.resolve();
    }

    if (shouldReduceMotion()) {
      addBoardHighlight(target, tone, 'board--draw-flash', duration);
      return Promise.resolve();
    }

    const overlay = createOverlay('effect-overlay--particles', tone);
    if (!overlay) {
      return Promise.resolve();
    }

    const field = document.createElement('div');
    field.className = 'effect-overlay__particle-field';
    overlay.appendChild(field);

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;
    const radius = Math.max(rect.width, rect.height) * 0.65;

    field.style.setProperty('--particle-center-x', `${centerX}px`);
    field.style.setProperty('--particle-center-y', `${centerY}px`);
    field.style.setProperty('--particle-radius', `${radius}px`);

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'effect-overlay__particle';
      const angle = Math.random() * Math.PI * 2;
      const distance = radius * (0.4 + Math.random() * 0.6);
      const startDistance = distance * 0.35;
      const startX = centerX + Math.cos(angle) * startDistance;
      const startY = centerY + Math.sin(angle) * startDistance;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      const delay = Math.random() * 140;
      const life = duration + Math.random() * 360;
      const size = 6 + Math.random() * 9;
      particle.style.setProperty('--particle-delay', `${delay}ms`);
      particle.style.setProperty('--particle-duration', `${life}ms`);
      particle.style.setProperty('--particle-start-x', `${startX}px`);
      particle.style.setProperty('--particle-start-y', `${startY}px`);
      particle.style.setProperty('--particle-dx', `${endX - startX}px`);
      particle.style.setProperty('--particle-dy', `${endY - startY}px`);
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      field.appendChild(particle);
    }

    return new Promise((resolve) => {
      window.setTimeout(() => {
        removeOverlay(overlay);
        resolve();
      }, duration + 520);
    });
  };

  const api = {
    playConfetti,
    playRadialGlow,
    playParticleOverlay,
    prefersReducedMotion: shouldReduceMotion,
  };

  global.uiEffects = api;
})(window);
