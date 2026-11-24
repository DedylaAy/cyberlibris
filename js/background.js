/**
 * CyberLibris Reactive Canvas Engine 2.5 (High Performance Edition)
 * Optimized for low-end laptops, integrated GPUs, and battery efficiency.
 * Features:
 * - Zero CPU Gaussian blur convolution (removed expensive ctx.shadowBlur).
 * - Delta-time frame rate clamping (36 FPS active, 14 FPS idle, 0 FPS in reader/paused).
 * - Idle state auto-detection after 12s of inactivity.
 * - Spatial Manhattan rejection and line cap on constellation connections.
 * - Low-Power / Turbo mode support.
 */

const THEME_CONFIG = {
  'theme-steam': {
    defaultShape: 'embers',
    colors: ['#66c0f4', '#c7d5e0', '#a4d007', '#ffd700', '#417a9b'],
    speedMult: 0.85,
    connectLines: true,
    maxParticles: 36,
    bgAmbient: 'steam'
  },
  'theme-cyberpunk': {
    defaultShape: 'pixels',
    colors: ['#00f0ff', '#ff007f', '#7928ca', '#ffe600', '#00ffc8'],
    speedMult: 1.1,
    connectLines: true,
    maxParticles: 38,
    bgAmbient: 'cyberpunk'
  },
  'theme-cosmic': {
    defaultShape: 'stars',
    colors: ['#c77dff', '#7b2cbf', '#3a86ff', '#e0aaff', '#ffffff'],
    speedMult: 0.7,
    connectLines: true,
    maxParticles: 42,
    bgAmbient: 'cosmic'
  },
  'theme-amber': {
    defaultShape: 'embers',
    colors: ['#ffaa00', '#ff5500', '#ffd700', '#ff7700', '#ff3700'],
    speedMult: 1.0,
    connectLines: false,
    maxParticles: 35,
    bgAmbient: 'amber'
  },
  'theme-matrix': {
    defaultShape: 'pixels',
    colors: ['#00ff88', '#00ff44', '#00cc66', '#aaffaa', '#05ffa1'],
    speedMult: 1.25,
    connectLines: false,
    maxParticles: 36,
    bgAmbient: 'matrix'
  },
  'theme-royal': {
    defaultShape: 'stars',
    colors: ['#00f5d4', '#00bbf9', '#ffd700', '#9d4edd', '#ffffff'],
    speedMult: 0.8,
    connectLines: true,
    maxParticles: 38,
    bgAmbient: 'royal'
  },
  'theme-synthwave': {
    defaultShape: 'hearts',
    colors: ['#ff007f', '#ff70a6', '#ffd700', '#00f0ff', '#a032ff'],
    speedMult: 1.0,
    connectLines: false,
    maxParticles: 35,
    bgAmbient: 'synthwave'
  },
  'theme-ocean': {
    defaultShape: 'bubbles',
    colors: ['#00f5d4', '#00bbf9', '#4361ee', '#48cae4', '#7209b7'],
    speedMult: 0.75,
    connectLines: true,
    maxParticles: 36,
    bgAmbient: 'ocean'
  },
  'theme-zen': {
    defaultShape: 'petals',
    colors: ['#e2c044', '#d4af37', '#c89666', '#a37081', '#f4ecd8'],
    speedMult: 0.7,
    connectLines: false,
    maxParticles: 32,
    bgAmbient: 'zen'
  }
};

class ReactiveBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.particles = [];
    this.bursts = [];

    // Low power / Eco mode state
    this.isLowPower = localStorage.getItem('cyberlibris_eco_mode') === 'true';
    this.isPaused = false;
    this.lastFrameTime = 0;
    this.lastInteractionTime = performance.now();

    // Interactive mouse tracking with velocity & inertia
    this.mouse = {
      x: this.width / 2,
      y: this.height / 2,
      prevX: this.width / 2,
      prevY: this.height / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      isDown: false,
      isInWindow: false,
      radius: 160
    };

    // Load persisted preferences or fall back to defaults
    const savedTheme = localStorage.getItem('cyberlibris_theme');
    this.currentTheme = savedTheme && THEME_CONFIG[savedTheme] ? savedTheme : 'theme-cyberpunk';

    const savedShape = localStorage.getItem('cyberlibris_particle_shape');
    this.particleShape = savedShape || 'auto';

    this.animationFrameId = null;
    this.time = 0;
    this.gridOffset = 0;

    this.init();
  }

  init() {
    this.resize();

    // Responsive resize debounce
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 150);
    }, { passive: true });

    // Smooth mousemove tracking with velocity calculation and activity timestamp
    let mouseTicking = false;
    window.addEventListener('mousemove', (e) => {
      this.lastInteractionTime = performance.now();
      if (!mouseTicking) {
        window.requestAnimationFrame(() => {
          const dx = e.clientX - this.mouse.x;
          const dy = e.clientY - this.mouse.y;
          this.mouse.vx = dx;
          this.mouse.vy = dy;
          this.mouse.speed = Math.hypot(dx, dy);

          this.mouse.prevX = this.mouse.x;
          this.mouse.prevY = this.mouse.y;
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
          this.mouse.isInWindow = true;
          mouseTicking = false;
        });
        mouseTicking = true;
      }
    }, { passive: true });

    window.addEventListener('mouseenter', () => {
      this.mouse.isInWindow = true;
      this.lastInteractionTime = performance.now();
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.isInWindow = false;
      this.mouse.vx = 0;
      this.mouse.vy = 0;
      this.mouse.speed = 0;
    }, { passive: true });

    // Click burst reaction
    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.lastInteractionTime = performance.now();
      if (!this.isLowPower) {
        this.triggerClickBurst(e.clientX, e.clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    }, { passive: true });

    // User activity listener for idle throttling
    window.addEventListener('keydown', () => {
      this.lastInteractionTime = performance.now();
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.lastInteractionTime = performance.now();
    }, { passive: true });

    // Tab visibility handling to preserve battery & GPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });

    this.setupTheme(this.currentTheme);
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.setupTheme(this.currentTheme);
  }

  pause() {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.lastInteractionTime = performance.now();
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  setLowPowerMode(enabled) {
    this.isLowPower = !!enabled;
    this.setupTheme(this.currentTheme);
  }

  getActiveShape() {
    if (this.particleShape && this.particleShape !== 'auto') {
      return this.particleShape;
    }
    const cfg = THEME_CONFIG[this.currentTheme] || THEME_CONFIG['theme-cyberpunk'];
    return cfg.defaultShape || 'pixels';
  }

  setParticleShape(shape) {
    const validShapes = ['auto', 'stars', 'hearts', 'pixels', 'embers', 'petals', 'bubbles'];
    this.particleShape = validShapes.includes(shape) ? shape : 'auto';
    localStorage.setItem('cyberlibris_particle_shape', this.particleShape);
    this.resume();
    this.setupTheme(this.currentTheme);
    this.triggerShapeShower(this.particleShape);
  }

  triggerShapeShower(shape) {
    if (this.isLowPower) return;
    const activeShape = shape === 'auto' ? this.getActiveShape() : shape;
    const cfg = THEME_CONFIG[this.currentTheme] || THEME_CONFIG['theme-cyberpunk'];
    const burstCount = 28;

    for (let i = 0; i < burstCount; i++) {
      const angle = (Math.PI * 2 / burstCount) * i + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 5 + 2.5;
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const startX = this.width * 0.5 + (Math.random() - 0.5) * (this.width * 0.4);
      const startY = this.height * 0.4 + (Math.random() - 0.5) * (this.height * 0.3);

      this.bursts.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 6,
        color: color,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.025 + 0.015,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        shape: activeShape
      });
    }
  }

  setTheme(themeId) {
    if (themeId === 'theme-space') themeId = 'theme-cosmic';
    if (themeId === 'theme-cozy') themeId = 'theme-amber';
    if (themeId === 'theme-aurora') themeId = 'theme-royal';

    if (!THEME_CONFIG[themeId]) {
      themeId = 'theme-cyberpunk';
    }

    this.currentTheme = themeId;
    localStorage.setItem('cyberlibris_theme', themeId);
    this.resume();
    this.setupTheme(themeId);

    // Sync body class for ambient lighting and page style shift
    const allThemes = [
      'theme-steam', 'theme-cyberpunk', 'theme-cosmic', 'theme-space',
      'theme-amber', 'theme-cozy', 'theme-matrix', 'theme-royal',
      'theme-aurora', 'theme-synthwave', 'theme-ocean', 'theme-zen'
    ];
    allThemes.forEach((t) => document.body.classList.remove(t));
    document.body.classList.add(themeId);
  }

  setupTheme(themeId) {
    this.particles = [];
    this.bursts = [];

    const cfg = THEME_CONFIG[themeId] || THEME_CONFIG['theme-cyberpunk'];
    const activeShape = this.getActiveShape();

    // Vibrant, prominent particle counts and sizes
    const maxTarget = this.isLowPower ? 24 : 58;
    const count = Math.min(maxTarget, Math.max(22, Math.floor((this.width * this.height) / 28000)));

    const chars = ['0', '1', '✦', '✧', '◈', 'λ', '§', '⚡', '★', '♦'];

    for (let i = 0; i < count; i++) {
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      let size, vx, vy;

      if (activeShape === 'hearts') {
        size = Math.random() * 10 + 12;
        vx = (Math.random() - 0.5) * 0.8 * cfg.speedMult;
        vy = -(Math.random() * 1.0 + 0.3) * cfg.speedMult;
      } else if (activeShape === 'stars') {
        size = Math.random() * 8 + 9;
        vx = (Math.random() - 0.5) * 0.6 * cfg.speedMult;
        vy = (Math.random() - 0.5) * 0.6 * cfg.speedMult;
      } else if (activeShape === 'pixels') {
        size = Math.random() * 7 + 8;
        vx = (Math.random() - 0.5) * 1.1 * cfg.speedMult;
        vy = (Math.random() - 0.5) * 1.1 * cfg.speedMult;
      } else if (activeShape === 'embers') {
        size = Math.random() * 6 + 6;
        vx = (Math.random() - 0.5) * 0.9 * cfg.speedMult;
        vy = -(Math.random() * 1.4 + 0.5) * cfg.speedMult;
      } else if (activeShape === 'petals') {
        size = Math.random() * 9 + 10;
        vx = (Math.random() - 0.5) * 0.7 * cfg.speedMult;
        vy = (Math.random() * 0.8 + 0.3) * cfg.speedMult;
      } else {
        // bubbles
        size = Math.random() * 8 + 8;
        vx = (Math.random() - 0.5) * 0.6 * cfg.speedMult;
        vy = -(Math.random() * 0.8 + 0.2) * cfg.speedMult;
      }

      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: vx,
        vy: vy,
        baseVx: vx,
        baseVy: vy,
        size: size,
        color: color,
        alpha: Math.random() * 0.4 + 0.55,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02,
        swayAmount: Math.random() * 1.2 + 0.6,
        char: chars[Math.floor(Math.random() * chars.length)],
        shape: activeShape
      });
    }

    // Special Matrix rain columns setup (skip or reduce in low power)
    if (this.currentTheme === 'theme-matrix') {
      const colStep = this.isLowPower ? 64 : 36;
      const cols = Math.floor(this.width / colStep);
      this.matrixDrops = [];
      for (let i = 0; i < cols; i++) {
        this.matrixDrops.push({
          x: i * colStep + 6,
          y: Math.random() * this.height,
          speed: Math.random() * 2.5 + 1.5,
          charIdx: Math.floor(Math.random() * 20),
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    } else {
      this.matrixDrops = null;
    }
  }

  triggerClickBurst(x, y) {
    if (this.isLowPower) return;
    const activeShape = this.getActiveShape();
    const cfg = THEME_CONFIG[this.currentTheme] || THEME_CONFIG['theme-cyberpunk'];
    const burstCount = 14; // Lightened from 24 for instant responsiveness

    for (let i = 0; i < burstCount; i++) {
      const angle = (Math.PI * 2 / burstCount) * i + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4 + 2;
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];

      this.bursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: color,
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.035 + 0.03,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        shape: activeShape
      });
    }
  }

  // --- DRAWING HELPERS FOR DISTINCT SHAPES (ZERO SHADOWBLUR) ---

  drawHeart(ctx, x, y, size, color, alpha, rot = 0, scalePulse = 1) {
    if (size <= 0.1 || scalePulse <= 0.01 || alpha <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const s = Math.max(0.01, (size / 14) * scalePulse);
    ctx.scale(s, s);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5, -7, -12, -4, -12, 3);
    ctx.bezierCurveTo(-12, 9, -5, 14, 0, 18);
    ctx.bezierCurveTo(5, 14, 12, 9, 12, 3);
    ctx.bezierCurveTo(12, -4, 5, -7, 0, 0);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fill();
    ctx.restore();
  }

  drawStar(ctx, x, y, size, color, alpha, rot = 0, points = 4) {
    if (size <= 0.1 || alpha <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.beginPath();
    const outer = size;
    const inner = size * 0.32;
    const step = Math.PI / points;

    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = i * step;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fill();
    ctx.restore();
  }

  drawPixel(ctx, x, y, size, color, alpha, rot = 0, char = null) {
    if (size <= 0.1 || alpha <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);

    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // 3D Voxel specular bevel in corner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(-size / 2, -size / 2, size * 0.35, size * 0.35);

    if (char && size > 6) {
      ctx.font = `bold ${Math.max(9, Math.round(size * 0.9))}px monospace`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
    }
    ctx.restore();
  }

  drawEmber(ctx, x, y, size, color, alpha) {
    if (size <= 0.1 || alpha <= 0) return;
    ctx.save();

    // Outer soft halo
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.1, size * 1.3), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.25));
    ctx.fill();

    // Core body
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fill();

    // White-hot center spark
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.05, size * 0.45), 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.95));
    ctx.fill();

    ctx.restore();
  }

  drawPetal(ctx, x, y, size, color, alpha, rot = 0) {
    if (size <= 0.1 || alpha <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.3, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fill();

    // Subtle leaf center spine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 1.1, 0);
    ctx.lineTo(size * 1.1, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawBubble(ctx, x, y, size, color, alpha) {
    if (size <= 0.1 || alpha <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.4));
    ctx.fill();

    // Glassy specular rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Reflection highlight dot
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y - size * 0.35, Math.max(0.05, size * 0.25), 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.85));
    ctx.fill();
    ctx.restore();
  }

  renderParticleShape(ctx, p, scalePulse = 1) {
    const shape = p.shape || this.getActiveShape();
    const effectiveScale = Math.max(0.01, scalePulse);
    const effectiveSize = Math.max(0.1, p.size * effectiveScale);

    if (shape === 'hearts') {
      this.drawHeart(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rot, effectiveScale);
    } else if (shape === 'stars') {
      this.drawStar(ctx, p.x, p.y, effectiveSize, p.color, p.alpha, p.rot, 4);
    } else if (shape === 'pixels') {
      this.drawPixel(ctx, p.x, p.y, effectiveSize, p.color, p.alpha, p.rot, p.char);
    } else if (shape === 'embers') {
      this.drawEmber(ctx, p.x, p.y, effectiveSize, p.color, p.alpha);
    } else if (shape === 'petals') {
      this.drawPetal(ctx, p.x, p.y, effectiveSize, p.color, p.alpha, p.rot);
    } else {
      this.drawBubble(ctx, p.x, p.y, effectiveSize, p.color, p.alpha);
    }
  }

  // --- SPECIAL THEME BACKDROP EFFECTS ---

  renderSpecialThemeLayers() {
    // 1. Synthwave 80s Sunset & Perspective Grid
    if (this.currentTheme === 'theme-synthwave') {
      const horizon = this.height * 0.65;
      const centerX = this.width / 2;
      const sunRadius = Math.min(95, this.width * 0.11);
      const sunY = horizon - sunRadius * 0.45;

      const sunGrad = this.ctx.createLinearGradient(centerX, sunY - sunRadius, centerX, sunY + sunRadius);
      sunGrad.addColorStop(0, '#ffd700');
      sunGrad.addColorStop(0.5, '#ff007f');
      sunGrad.addColorStop(1, '#7b2cbf');

      this.ctx.beginPath();
      this.ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = sunGrad;
      this.ctx.fill();

      // Sun horizontal slits
      this.ctx.fillStyle = 'rgba(24, 4, 26, 0.92)';
      for (let y = sunY - sunRadius * 0.15; y < sunY + sunRadius; y += 13) {
        const lineH = Math.min(6, (y - (sunY - sunRadius * 0.15)) * 0.15 + 2);
        this.ctx.fillRect(centerX - sunRadius, y, sunRadius * 2, lineH);
      }

      // Moving perspective grid
      this.ctx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
      this.ctx.lineWidth = 1;

      for (let y = horizon + (this.gridOffset % 32); y < this.height; y += 32) {
        const distFromHorizon = (y - horizon) / (this.height - horizon);
        this.ctx.globalAlpha = Math.min(0.75, distFromHorizon * 0.75);
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
      }

      const rays = 12;
      for (let i = 0; i <= rays; i++) {
        const bottomX = (this.width / rays) * i;
        this.ctx.globalAlpha = 0.25;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, horizon);
        this.ctx.lineTo(bottomX, this.height);
        this.ctx.stroke();
      }
      this.ctx.globalAlpha = 1;
    }

    // 2. Polar Aurora Wave Layer
    if (this.currentTheme === 'theme-royal') {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height);
      for (let i = 0; i <= 16; i++) {
        const x = (this.width / 16) * i;
        const wave1 = Math.sin(this.time + i * 0.35) * 45;
        const wave2 = Math.cos(this.time * 0.6 + i * 0.25) * 25;
        const mouseShift = this.mouse.isInWindow ? (this.mouse.y - this.height * 0.5) * 0.05 : 0;
        const y = this.height * 0.54 + wave1 + wave2 + mouseShift;
        this.ctx.lineTo(x, y);
      }
      this.ctx.lineTo(this.width, this.height);
      this.ctx.closePath();

      const gradient = this.ctx.createLinearGradient(0, this.height * 0.35, this.width, this.height);
      gradient.addColorStop(0, 'rgba(0, 245, 212, 0.10)');
      gradient.addColorStop(0.5, 'rgba(0, 187, 249, 0.12)');
      gradient.addColorStop(1, 'rgba(157, 78, 221, 0.06)');

      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }

    // 3. Matrix Rain Background Columns
    if (this.currentTheme === 'theme-matrix' && this.matrixDrops) {
      this.ctx.font = '13px monospace';
      const matrixChars = '01CYBERLIBRISDATABASE429810';

      for (let d of this.matrixDrops) {
        d.y += d.speed;
        if (d.y > this.height) {
          d.y = 0;
          d.charIdx = Math.floor(Math.random() * matrixChars.length);
        }
        const ch = matrixChars[d.charIdx % matrixChars.length];
        this.ctx.fillStyle = '#00ff88';
        this.ctx.globalAlpha = d.alpha * 0.45;
        this.ctx.fillText(ch, d.x, d.y);
      }
      this.ctx.globalAlpha = 1;
    }
  }

  // --- MAIN ANIMATION & INTERACTIVE PHYSICS LOOP ---

  animate(timestamp) {
    if (this.isPaused) {
      this.animationFrameId = null;
      return;
    }

    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));

    if (!timestamp) timestamp = performance.now();
    const elapsed = timestamp - this.lastFrameTime;

    // Delta-time FPS clamping:
    // Low-Power mode: 18 FPS; Idle (>12s): 14 FPS; Active standard: 36 FPS
    const now = performance.now();
    const isIdle = (now - this.lastInteractionTime) > 12000;
    const targetFps = this.isLowPower ? 18 : (isIdle ? 14 : 36);
    const frameInterval = 1000 / targetFps;

    if (elapsed < frameInterval) {
      return;
    }

    this.lastFrameTime = timestamp - (elapsed % frameInterval);

    this.time += 0.02;
    this.gridOffset = (this.gridOffset + 1.2) % 32;

    // Smooth decay of mouse momentum
    this.mouse.vx *= 0.9;
    this.mouse.vy *= 0.9;
    this.mouse.speed *= 0.9;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw thematic backdrop layers first
    this.renderSpecialThemeLayers();

    const activeShape = this.getActiveShape();
    const cfg = THEME_CONFIG[this.currentTheme] || THEME_CONFIG['theme-cyberpunk'];
    const allowsConstellations = !this.isLowPower && (cfg.connectLines || activeShape === 'stars' || activeShape === 'pixels' || activeShape === 'bubbles');

    let linesDrawn = 0;
    const maxLinesPerFrame = 22; // Hard cap prevents O(N^2) stalls

    // 1. Process and render floating reactive particles
    const pLen = this.particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];

      // Oscillations
      p.pulse += p.pulseSpeed;
      p.rot += p.rotSpeed;

      // Natural harmonic drift
      let driftX = Math.sin(p.pulse) * p.swayAmount * 0.3;
      p.x += p.vx + driftX;
      p.y += p.vy;

      // Interactive mouse physics
      let scalePulse = 1 + Math.sin(p.pulse) * 0.15;

      if (this.mouse.isInWindow) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.mouse.radius && dist > 1) {
          const factor = (this.mouse.radius - dist) / this.mouse.radius;

          // A. Smooth Repulsion / Evasion Force
          const repel = 3.6 * factor;
          p.x -= (dx / dist) * repel;
          p.y -= (dy / dist) * repel;

          // B. Swirl / Vortex Force
          const swirl = 1.3 * factor;
          p.x += (-dy / dist) * swirl;
          p.y += (dx / dist) * swirl;

          // C. Mouse Motion Wake Impulse
          if (this.mouse.speed > 2.5) {
            p.vx += (this.mouse.vx * 0.04) * factor;
            p.vy += (this.mouse.vy * 0.04) * factor;
          }

          // D. Reactive laser/constellation link directly to mouse pointer
          if (dist < 110 && !this.isLowPower) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = p.color;
            this.ctx.globalAlpha = (1 - dist / 110) * 0.35;
            this.ctx.lineWidth = 1.1;
            this.ctx.stroke();
          }

          scalePulse += factor * 0.3;
        }
      }

      // Velocity damping back to base velocity
      p.vx = p.vx * 0.95 + p.baseVx * 0.05;
      p.vy = p.vy * 0.95 + p.baseVy * 0.05;

      // Screen edge wrapping with safe margin
      const margin = 25;
      if (p.x < -margin) p.x = this.width + margin;
      if (p.x > this.width + margin) p.x = -margin;
      if (p.y < -margin) p.y = this.height + margin;
      if (p.y > this.height + margin) p.y = -margin;

      // Draw the particle with active shape
      this.renderParticleShape(this.ctx, p, scalePulse);

      // Connect neighbouring particles with delicate constellation lines
      if (allowsConstellations && linesDrawn < maxLinesPerFrame) {
        for (let j = i + 1; j < pLen; j++) {
          const p2 = this.particles[j];
          const lineDx = p.x - p2.x;
          // Manhattan early exit
          if (Math.abs(lineDx) > 90) continue;
          const lineDy = p.y - p2.y;
          if (Math.abs(lineDy) > 90) continue;

          const distSq = lineDx * lineDx + lineDy * lineDy;
          if (distSq < 8100) { // 90px threshold
            const lineDist = Math.sqrt(distSq);
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = p.color;
            this.ctx.globalAlpha = (1 - lineDist / 90) * 0.2;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
            linesDrawn++;
            if (linesDrawn >= maxLinesPerFrame) break;
          }
        }
      }
    }

    // 2. Process and render interactive click-burst particles
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.rotSpeed;
      b.life -= b.decay;

      if (b.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }

      b.alpha = Math.max(0, Math.min(1, b.life));
      this.renderParticleShape(this.ctx, b, b.life);
    }

    this.ctx.globalAlpha = 1;
  }
}

// Global initialization
window.reactiveBg = new ReactiveBackground();
