/**
 * CyberLibris Reactive Canvas Engine
 * Renders 8 visually distinct, high-performance interactive animated themes.
 * Reacts to cursor movement, click bursts, and window resizing.
 */
class ReactiveBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.particles = [];
    this.mouse = { x: this.width / 2, y: this.height / 2, isDown: false, radius: 160 };
    this.currentTheme = 'theme-cyberpunk';
    this.animationFrameId = null;
    this.time = 0;
    this.gridOffset = 0;

    this.init();
  }

  init() {
    this.resize();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 120);
    }, { passive: true });

    let mouseTicking = false;
    window.addEventListener('mousemove', (e) => {
      if (!mouseTicking) {
        window.requestAnimationFrame(() => {
          this.mouse.x = e.clientX;
          this.mouse.y = e.clientY;
          mouseTicking = false;
        });
        mouseTicking = true;
      }
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.triggerClickBurst(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    // Pause animation when browser tab is inactive to preserve battery & CPU/GPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      } else {
        if (!this.animationFrameId) {
          this.animate();
        }
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

  setTheme(themeId) {
    if (themeId === 'theme-space') themeId = 'theme-cosmic';
    if (themeId === 'theme-cozy') themeId = 'theme-amber';
    if (themeId === 'theme-aurora') themeId = 'theme-royal';

    this.currentTheme = themeId;
    this.setupTheme(themeId);

    // Sync body class for ambient lighting and full-page theme shift
    const allThemes = [
      'theme-cyberpunk', 'theme-cosmic', 'theme-space', 'theme-amber', 'theme-cozy',
      'theme-matrix', 'theme-royal', 'theme-aurora', 'theme-synthwave', 'theme-ocean', 'theme-zen'
    ];
    allThemes.forEach((t) => document.body.classList.remove(t));
    document.body.classList.add(themeId);
  }

  setupTheme(themeId) {
    this.particles = [];
    const count = Math.min(100, Math.floor((this.width * this.height) / 12000));

    if (themeId === 'theme-cyberpunk') {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.4 ? '#00f0ff' : '#ff007f',
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    } else if (themeId === 'theme-cosmic') {
      const starCount = count * 2;
      for (let i = 0; i < starCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          color: Math.random() > 0.5 ? '#9d4edd' : '#3a86ff',
          depth: Math.random() * 2 + 0.5,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    } else if (themeId === 'theme-amber') {
      for (let i = 0; i < count * 1.2; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 1.4 + 0.5),
          size: Math.random() * 3 + 1.5,
          color: Math.random() > 0.3 ? '#ffaa00' : '#ff5500',
          alpha: Math.random() * 0.8 + 0.2
        });
      }
    } else if (themeId === 'theme-matrix') {
      const cols = Math.floor(this.width / 24);
      for (let i = 0; i < cols; i++) {
        this.particles.push({
          x: i * 24,
          y: Math.random() * this.height,
          speed: Math.random() * 3 + 2,
          chars: '0101101010CYBERLIBRISGITDATABASE',
          charIdx: Math.floor(Math.random() * 20),
          alpha: Math.random() * 0.8 + 0.2
        });
      }
    } else if (themeId === 'theme-royal') {
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: (this.width / 40) * i,
          baseY: this.height * 0.5,
          phase: i * 0.2,
          color: i % 2 === 0 ? '#ffd700' : '#00e5ff'
        });
      }
    } else if (themeId === 'theme-synthwave') {
      // Synthwave digital dust
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * (this.height * 0.65),
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 1.2 + 0.3),
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.5 ? '#ff007f' : '#00f0ff',
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    } else if (themeId === 'theme-ocean') {
      // Deep sea luminous plankton & medusae spores
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          baseRadius: Math.random() * 4 + 2,
          pulseSpeed: Math.random() * 0.05 + 0.02,
          driftSpeed: Math.random() * 0.6 + 0.2,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.6 ? '#00f5d4' : Math.random() > 0.3 ? '#00bbf9' : '#7b2cbf',
          alpha: Math.random() * 0.6 + 0.2
        });
      }
    } else if (themeId === 'theme-zen') {
      // Golden parchment fluttering leaves
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vy: Math.random() * 0.8 + 0.4,
          swaySpeed: Math.random() * 0.03 + 0.01,
          swayAmount: Math.random() * 1.5 + 0.8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          size: Math.random() * 6 + 4,
          color: Math.random() > 0.4 ? '#d4af37' : '#c89666',
          alpha: Math.random() * 0.6 + 0.25
        });
      }
    }
  }

  triggerClickBurst(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: this.currentTheme === 'theme-amber' || this.currentTheme === 'theme-royal' ? '#ffd700' :
               this.currentTheme === 'theme-matrix' ? '#00ff88' :
               this.currentTheme === 'theme-synthwave' ? '#ff007f' :
               this.currentTheme === 'theme-ocean' ? '#00f5d4' : '#00f0ff',
        alpha: 1,
        isBurst: true,
        life: 1
      });
    }
  }

  animate() {
    this.time += 0.02;
    this.gridOffset = (this.gridOffset + 1.2) % 40;
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentTheme === 'theme-cyberpunk') {
      this.renderCyberpunk();
    } else if (this.currentTheme === 'theme-cosmic') {
      this.renderCosmic();
    } else if (this.currentTheme === 'theme-amber') {
      this.renderAmber();
    } else if (this.currentTheme === 'theme-matrix') {
      this.renderMatrix();
    } else if (this.currentTheme === 'theme-royal') {
      this.renderRoyal();
    } else if (this.currentTheme === 'theme-synthwave') {
      this.renderSynthwave();
    } else if (this.currentTheme === 'theme-ocean') {
      this.renderOcean();
    } else if (this.currentTheme === 'theme-zen') {
      this.renderZen();
    }

    // Render interactive click bursts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.isBurst) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  // --- THEME 1: NEON CYBERPUNK ---
  renderCyberpunk() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.isBurst) continue;

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouse.radius) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        p.x -= (dx / dist) * force * 3;
        p.y -= (dy / dist) * force * 3;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        if (p2.isBurst) continue;
        const lineDx = p.x - p2.x;
        const lineDy = p.y - p2.y;
        const distSq = lineDx * lineDx + lineDy * lineDy;
        if (distSq < 14400) {
          const lineDist = Math.sqrt(distSq);
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = p.color;
          this.ctx.globalAlpha = (1 - lineDist / 120) * 0.25;
          this.ctx.stroke();
        }
      }
    }
    this.ctx.globalAlpha = 1;
  }

  // --- THEME 2: COSMIC NEBULA ---
  renderCosmic() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.isBurst) continue;

      const parallaxX = (this.mouse.x - this.width / 2) * 0.02 * p.depth;
      const parallaxY = (this.mouse.y - this.height / 2) * 0.02 * p.depth;

      p.twinkle += 0.05;
      const alpha = 0.4 + Math.sin(p.twinkle) * 0.3;

      this.ctx.beginPath();
      this.ctx.arc(p.x + parallaxX, p.y + parallaxY, p.size * p.depth, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  // --- THEME 3: COZY AMBER & FIREPLACE ---
  renderAmber() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.isBurst) continue;

      p.y += p.vy;
      p.x += Math.sin(this.time + p.y * 0.01) * 0.8;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
    this.ctx.globalAlpha = 1;
  }

  // --- THEME 4: EMERALD MATRIX ---
  renderMatrix() {
    this.ctx.font = '14px monospace';
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.isBurst) continue;

      p.y += p.speed;
      if (p.y > this.height) {
        p.y = 0;
        p.charIdx = Math.floor(Math.random() * p.chars.length);
      }

      const char = p.chars[p.charIdx % p.chars.length];
      this.ctx.fillStyle = '#00ff88';
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillText(char, p.x, p.y);
    }
    this.ctx.globalAlpha = 1;
  }

  // --- THEME 5: POLAR AURORA ---
  renderRoyal() {
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let i = 0; i <= 20; i++) {
      const x = (this.width / 20) * i;
      const wave1 = Math.sin(this.time + i * 0.3) * 60;
      const wave2 = Math.cos(this.time * 0.8 + i * 0.2) * 40;
      const mouseInfluence = (this.mouse.y - this.height * 0.5) * 0.1;
      const y = this.height * 0.55 + wave1 + wave2 + mouseInfluence;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();

    const gradient = this.ctx.createLinearGradient(0, this.height * 0.3, this.width, this.height);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.14)');
    gradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.16)');
    gradient.addColorStop(1, 'rgba(157, 78, 221, 0.08)');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  // --- THEME 6: 80s SYNTHWAVE SUNSET ---
  renderSynthwave() {
    const horizon = this.height * 0.65;
    const centerX = this.width / 2;

    // 1. Draw glowing retro sun
    const sunRadius = Math.min(100, this.width * 0.12);
    const sunY = horizon - sunRadius * 0.5;
    const sunGrad = this.ctx.createLinearGradient(centerX, sunY - sunRadius, centerX, sunY + sunRadius);
    sunGrad.addColorStop(0, '#ffd700');
    sunGrad.addColorStop(0.5, '#ff007f');
    sunGrad.addColorStop(1, '#7b2cbf');

    this.ctx.beginPath();
    this.ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = sunGrad;
    this.ctx.shadowBlur = 35;
    this.ctx.shadowColor = '#ff007f';
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Horizontal slit lines across the sun
    this.ctx.fillStyle = 'rgba(7, 9, 14, 0.9)';
    for (let y = sunY - sunRadius * 0.2; y < sunY + sunRadius; y += 14) {
      const lineH = Math.min(6, (y - (sunY - sunRadius * 0.2)) * 0.15 + 2);
      this.ctx.fillRect(centerX - sunRadius, y, sunRadius * 2, lineH);
    }

    // 2. Perspective grid floor
    this.ctx.strokeStyle = 'rgba(255, 0, 127, 0.35)';
    this.ctx.lineWidth = 1;

    // Moving horizontal grid lines
    for (let y = horizon + (this.gridOffset % 30); y < this.height; y += 30) {
      const distFromHorizon = (y - horizon) / (this.height - horizon);
      this.ctx.globalAlpha = Math.min(1, distFromHorizon * 0.9);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Perspective vanishing lines
    const rays = 14;
    for (let i = 0; i <= rays; i++) {
      const bottomX = (this.width / rays) * i;
      this.ctx.globalAlpha = 0.35;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, horizon);
      this.ctx.lineTo(bottomX, this.height);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;

    // Floating digital dust
    for (let p of this.particles) {
      if (p.isBurst) continue;
      p.y += p.vy;
      p.x += p.vx;
      if (p.y < 0) {
        p.y = horizon - 10;
        p.x = Math.random() * this.width;
      }
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  // --- THEME 7: BIOLUMINESCENT OCEAN ---
  renderOcean() {
    for (let p of this.particles) {
      if (p.isBurst) continue;

      p.phase += p.pulseSpeed;
      p.y -= p.driftSpeed;
      p.x += Math.sin(p.phase) * 0.8;

      if (p.y < -20) {
        p.y = this.height + 20;
        p.x = Math.random() * this.width;
      }

      // Mouse water ripple effect
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (140 - dist) / 140;
        p.x -= (dx / dist) * force * 2;
        p.y -= (dy / dist) * force * 2;
      }

      const pulse = Math.sin(p.phase) * 0.3 + 1;
      const currentRadius = p.baseRadius * pulse;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha * (0.6 + Math.sin(p.phase) * 0.4);
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
    this.ctx.globalAlpha = 1;
  }

  // --- THEME 8: MINIMALIST ZEN LIBRARY ---
  renderZen() {
    for (let p of this.particles) {
      if (p.isBurst) continue;

      p.y += p.vy;
      p.x += Math.sin(this.time * p.swaySpeed + p.y * 0.01) * p.swayAmount;
      p.rotation += p.rotSpeed;

      if (p.y > this.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.width;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.beginPath();
      // Draw stylized leaf / petal
      this.ctx.ellipse(0, 0, p.size, p.size * 0.45, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
      this.ctx.restore();
    }
    this.ctx.globalAlpha = 1;
  }
}

window.reactiveBg = new ReactiveBackground();
