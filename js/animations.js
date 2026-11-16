/**
 * ============================================================================
 * UNIVERSO PARA TI ♡ - MÓDULO DE ANIMACIONES (ESCENA 1 & INTERACCIONES)
 * Pétalos de Cerezo, Polvo Pastel, Cursor y Destellos de Clic
 * ============================================================================
 */

class RomanticAnimationEngine {
  constructor() {
    this.letterCanvas = document.getElementById('letter-canvas');
    this.clickContainer = document.getElementById('click-particles-container');
    this.customCursor = document.getElementById('custom-cursor');
    this.cursorGlow = document.getElementById('cursor-glow');

    this.letterCtx = this.letterCanvas ? this.letterCanvas.getContext('2d') : null;
    this.activeScene = 'letter';

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.targetMouseX = this.mouseX;
    this.targetMouseY = this.mouseY;

    this.sakuraPetals = [];
    this.pastelDust = [];

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.initInteractions();
    this.createLetterParticles();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.letterCanvas) {
      this.letterCanvas.width = this.width;
      this.letterCanvas.height = this.height;
    }
  }

  initInteractions() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;

      if (this.customCursor) {
        this.customCursor.style.left = `${e.clientX}px`;
        this.customCursor.style.top = `${e.clientY}px`;
      }
      if (this.cursorGlow) {
        this.cursorGlow.style.left = `${e.clientX}px`;
        this.cursorGlow.style.top = `${e.clientY}px`;
      }
    });

    window.addEventListener('click', (e) => {
      this.spawnClickHeart(e.clientX, e.clientY);
    });
  }

  spawnClickHeart(x, y) {
    const symbols = ['♡', '✧', '✦', '🌸', '💖'];
    const count = 6;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'click-heart-particle';
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const distance = 25 + Math.random() * 45;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.color = Math.random() > 0.4 ? '#ff477e' : '#ffd700';

      if (this.clickContainer) {
        this.clickContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }
    }
  }

  createLetterParticles() {
    // Pétalos de cerezo (Sakura)
    const petalCount = 35;
    this.sakuraPetals = [];
    for (let i = 0; i < petalCount; i++) {
      this.sakuraPetals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 8 + Math.random() * 12,
        speedY: 0.8 + Math.random() * 1.4,
        speedX: -0.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.01 + Math.random() * 0.02,
        flipAngle: Math.random() * Math.PI,
        flipSpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.4 + Math.random() * 0.45
      });
    }

    // Polvo de luz y mini corazones flotantes
    const dustCount = 45;
    this.pastelDust = [];
    for (let i = 0; i < dustCount; i++) {
      this.pastelDust.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 1 + Math.random() * 2.5,
        speedY: -0.2 - Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: 0.2 + Math.random() * 0.6,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        isHeart: Math.random() > 0.65
      });
    }
  }

  drawLetterScene() {
    if (!this.letterCtx) return;
    this.letterCtx.clearRect(0, 0, this.width, this.height);

    for (const dust of this.pastelDust) {
      dust.y += dust.speedY;
      dust.x += dust.speedX;
      dust.alpha += Math.sin(Date.now() * 0.002 * dust.pulseSpeed) * 0.01;

      if (dust.y < -10) {
        dust.y = this.height + 10;
        dust.x = Math.random() * this.width;
      }

      this.letterCtx.save();
      this.letterCtx.globalAlpha = Math.max(0.1, Math.min(0.85, dust.alpha));

      if (dust.isHeart) {
        this.letterCtx.font = `${dust.radius * 3.5}px serif`;
        this.letterCtx.fillStyle = '#ff6f91';
        this.letterCtx.fillText('♡', dust.x, dust.y);
      } else {
        this.letterCtx.beginPath();
        this.letterCtx.arc(dust.x, dust.y, dust.radius, 0, Math.PI * 2);
        this.letterCtx.fillStyle = '#ffffff';
        this.letterCtx.shadowColor = '#ffb6c1';
        this.letterCtx.shadowBlur = 8;
        this.letterCtx.fill();
      }
      this.letterCtx.restore();
    }

    for (const petal of this.sakuraPetals) {
      petal.y += petal.speedY;
      petal.x += petal.speedX + Math.sin(petal.angle) * 0.6;
      petal.angle += petal.angularSpeed;
      petal.flipAngle += petal.flipSpeed;

      if (petal.y > this.height + 20) {
        petal.y = -20;
        petal.x = Math.random() * this.width;
      }
      if (petal.x > this.width + 20) petal.x = -20;
      if (petal.x < -20) petal.x = this.width + 20;

      this.letterCtx.save();
      this.letterCtx.translate(petal.x, petal.y);
      this.letterCtx.rotate(petal.angle);
      this.letterCtx.scale(Math.cos(petal.flipAngle), 1);
      this.letterCtx.globalAlpha = petal.opacity;

      this.letterCtx.beginPath();
      this.letterCtx.moveTo(0, 0);
      this.letterCtx.bezierCurveTo(-petal.size / 2, -petal.size / 2, -petal.size / 2, -petal.size, 0, -petal.size * 1.2);
      this.letterCtx.bezierCurveTo(petal.size / 2, -petal.size, petal.size / 2, -petal.size / 2, 0, 0);

      const grad = this.letterCtx.createLinearGradient(0, 0, 0, -petal.size * 1.2);
      grad.addColorStop(0, '#f8bbd0');
      grad.addColorStop(1, '#ff80ab');
      this.letterCtx.fillStyle = grad;
      this.letterCtx.fill();

      this.letterCtx.restore();
    }
  }

  animate() {
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    if (this.activeScene === 'letter') {
      this.drawLetterScene();
    }

    requestAnimationFrame(this.animate);
  }

  switchScene(newScene) {
    this.activeScene = newScene;
  }
}

window.romanticAnimations = new RomanticAnimationEngine();
