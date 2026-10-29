/* ==========================================================================
   PARTICLE ATMOSPHERE ENGINE (Falling Petals & Golden Stardust)
   ========================================================================== */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mode = 'petals'; // 'petals', 'stardust', 'none'
    this.maxParticles = 36;
    this.animationFrameId = null;
    this.wind = 0;
    this.windTarget = 0.5;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
    this.spawnParticles();
    this.startAnimation();
  }

  initCanvasSize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setMode(mode) {
    this.mode = mode;
    this.particles = [];
    if (mode !== 'none') {
      this.spawnParticles();
      if (!this.animationFrameId) {
        this.startAnimation();
      }
    } else {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }
  }

  setDensity(count) {
    this.maxParticles = parseInt(count, 10) || 30;
    this.particles = [];
    if (this.mode !== 'none') {
      this.spawnParticles();
    }
  }

  createPetal() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * -this.height,
      size: Math.random() * 12 + 8,
      speedY: Math.random() * 1.2 + 0.8,
      speedX: Math.random() * 0.8 - 0.4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      flip: Math.random() * 360,
      flipSpeed: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? 'rgba(235, 175, 185, 0.75)' : 'rgba(248, 215, 222, 0.85)',
      edgeColor: 'rgba(215, 145, 160, 0.4)'
    };
  }

  createStar() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.6 + 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      opacityDelta: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.3 ? 'rgba(226, 184, 87, ' : 'rgba(255, 238, 175, '
    };
  }

  spawnParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.mode === 'petals') {
        const petal = this.createPetal();
        petal.y = Math.random() * this.height; // Spread initially
        this.particles.push(petal);
      } else if (this.mode === 'stardust') {
        this.particles.push(this.createStar());
      }
    }
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate((p.rotation * Math.PI) / 180);
    this.ctx.scale(Math.cos((p.flip * Math.PI) / 180), 1);

    // Realistic curved rose petal path
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, p.size / 3, 0, p.size);
    this.ctx.bezierCurveTo(-p.size, p.size / 3, -p.size / 2, -p.size / 2, 0, 0);

    const grad = this.ctx.createLinearGradient(0, -p.size/2, 0, p.size);
    grad.addColorStop(0, p.color);
    grad.addColorStop(1, p.edgeColor);

    this.ctx.fillStyle = grad;
    this.ctx.fill();
    this.ctx.restore();
  }

  drawStar(s) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = s.color + Math.max(0.1, s.opacity) + ')';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#e2b857';
    this.ctx.fill();
    this.ctx.restore();
  }

  triggerConfettiBurst(originX, originY) {
    const burstParticles = [];
    const colors = ['#d4af37', '#e2b857', '#e8899e', '#ffffff', '#c5a059'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      burstParticles.push({
        x: originX || this.width / 2,
        y: originY || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1
      });
    }

    const animateConfetti = () => {
      this.ctx.save();
      burstParticles.forEach((cp, index) => {
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.vy += 0.22; // gravity
        cp.vx *= 0.98;
        cp.rotation += cp.rotSpeed;
        cp.life -= 0.015;

        if (cp.life > 0) {
          this.ctx.save();
          this.ctx.translate(cp.x, cp.y);
          this.ctx.rotate((cp.rotation * Math.PI) / 180);
          this.ctx.fillStyle = cp.color;
          this.ctx.globalAlpha = Math.max(0, cp.life);
          this.ctx.fillRect(-cp.size / 2, -cp.size / 2, cp.size, cp.size * 0.6);
          this.ctx.restore();
        }
      });
      this.ctx.restore();

      if (burstParticles.some(p => p.life > 0)) {
        requestAnimationFrame(animateConfetti);
      }
    };

    animateConfetti();
  }

  update() {
    if (this.mode === 'none') return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Gently fluctuate wind
    this.wind += (this.windTarget - this.wind) * 0.01;
    if (Math.random() > 0.98) {
      this.windTarget = (Math.random() - 0.5) * 1.5;
    }

    if (this.mode === 'petals') {
      this.particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + this.wind;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        if (p.y > this.height + 20) {
          p.y = -20;
          p.x = Math.random() * this.width;
        }
        if (p.x > this.width + 20) p.x = -20;
        if (p.x < -20) p.x = this.width + 20;

        this.drawPetal(p);
      });
    } else if (this.mode === 'stardust') {
      this.particles.forEach((s) => {
        s.y += s.speedY;
        s.x += s.speedX;
        s.opacity += s.opacityDelta;

        if (s.opacity > 0.95 || s.opacity < 0.15) {
          s.opacityDelta *= -1;
        }

        if (s.y < -10) {
          s.y = this.height + 10;
          s.x = Math.random() * this.width;
        }

        this.drawStar(s);
      });
    }
  }

  startAnimation() {
    const loop = () => {
      this.update();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }
}

// Global instance initialized on DOMContentLoaded
window.weddingParticles = null;
