/**
 * CyberLibris Reactive Canvas Engine
 * Renders 5 progressive reactive themes that react to cursor movement and clicks.
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

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.triggerClickBurst(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
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
    this.currentTheme = themeId;
    this.setupTheme(themeId);
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
      // Golden auroral wave nodes
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: (this.width / 40) * i,
          baseY: this.height * 0.5,
          phase: i * 0.2,
          color: i % 2 === 0 ? '#ffd700' : '#00e5ff'
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
        color: this.currentTheme === 'theme-amber' ? '#ffd700' : '#00f0ff',
        alpha: 1,
        isBurst: true,
        life: 1
      });
    }
  }

  animate() {
    this.time += 0.02;
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
    }

    // Render burst particles
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

  renderCyberpunk() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.isBurst) continue;

      // Mouse gravity/reaction
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

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();

      // Draw connecting lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        if (p2.isBurst) continue;
        const lineDx = p.x - p2.x;
        const lineDy = p.y - p2.y;
        const lineDist = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
        if (lineDist < 120) {
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
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.12)');
    gradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(157, 78, 221, 0.08)');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }
}

window.reactiveBg = new ReactiveBackground();
