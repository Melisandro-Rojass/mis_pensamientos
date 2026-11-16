/**
 * ============================================================================
 * UNIVERSO PARA TI ♡ - MÓDULO 3D (THREE.JS) CON NAVEGACIÓN ESPACIAL MATEMÁTICA
 * - Iluminación y Estrellas Ultra-Estables: Sin parpadeo, sin destellos bruscos
 * - Textura Antialiased Suave en Estrellas: Cero shimmering subpixel
 * - WebGL con Buffer Opaco Sólido: Elimina parpadeo por composición de capas
 * - Corazón Central: 3D voluminoso, suave, acolchado y orientación vertical correcta
 * - Frases Románticas: Dedicadas a lo hermosa que es, con movimiento orbital pausado
 * ============================================================================
 */

class Universe3DEngine {
  constructor(containerId = 'webgl-universe-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Elementos 3D y 2D
    this.heartMesh = null;
    this.heartLight = null;
    this.goldLight = null;
    this.heartAccretion = null;
    this.floating2DHearts = [];
    this.starField = null;
    this.nebulaPlanes = [];

    // Referencias DOM
    this.photoAnchorEl = document.getElementById('floating-photo-anchor');
    this.zoomIndicatorEl = document.getElementById('zoom-level-indicator');

    // Coordenadas espaciales del núcleo central
    this.coreCenterY = -120;
    this.targetLookAt = new THREE.Vector3(0, this.coreCenterY + 50, 0);
    this.photoPosition3D = new THREE.Vector3(0, this.coreCenterY + 185, 0);
    this.orbitScale = 1.0;
    this.isPortrait = false;

    // Textura compartida para estrellas suaves sin aliasing
    this.starTexture = this.generateSoftStarTexture();

    // ========================================================================
    // NAVEGACIÓN ESPACIAL (Coordenadas Esféricas)
    // ========================================================================
    this.baseRadius = 540;
    this.minRadius = 260;
    this.maxRadius = 1100;

    this.radius = this.baseRadius;
    this.theta = 0;
    this.phi = Math.PI * 0.52;

    this.targetRadius = this.baseRadius;
    this.targetTheta = 0;
    this.targetPhi = Math.PI * 0.52;

    this.damping = 0.085;
    this.velTheta = 0;
    this.velPhi = 0;
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.touchPinchDist = 0;

    // ========================================================================
    // FRASES ROMÁNTICAS: DEDICADAS A SU BELLEZA Y CON VELOCIDAD PAUSADA
    // ========================================================================
    this.orbitingPhrases = [];
    this.phrasesData = [
      { text: "La mujer más hermosa del universo", radius: 250, tiltX: 0.35, tiltZ: 0.2, speed: 0.0018, angle: 0 },
      { text: "Tus hermosos ojos de miel", radius: 300, tiltX: -0.38, tiltZ: 0.42, speed: -0.0015, angle: 1.1 },
      { text: "La carita más preciosa", radius: 220, tiltX: 0.6, tiltZ: -0.28, speed: 0.0022, angle: 2.2 },
      { text: "Tu sonrisa ilumina mi mundo", radius: 350, tiltX: -0.22, tiltZ: -0.52, speed: -0.0014, angle: 3.3 },
      { text: "Eres arte en cada detalle", radius: 390, tiltX: 0.42, tiltZ: 0.32, speed: 0.0012, angle: 4.4 },
      { text: "Tu belleza no tiene comparación", radius: 270, tiltX: -0.5, tiltZ: -0.18, speed: -0.0019, angle: 5.2 },
      { text: "La chica de mis sueños", radius: 330, tiltX: 0.15, tiltZ: -0.42, speed: 0.0016, angle: 0.8 },
      { text: "Me encantas de pies a cabeza", radius: 230, tiltX: -0.28, tiltZ: 0.28, speed: -0.0021, angle: 2.7 },
      { text: "Tu cabello tan lindo y perfecto", radius: 370, tiltX: 0.38, tiltZ: -0.32, speed: 0.0013, angle: 3.8 },
      { text: "Eres pura magia y perfección", radius: 280, tiltX: -0.45, tiltZ: 0.28, speed: -0.0017, angle: 4.9 },
      { text: "La estrella que más brilla eres tú", radius: 320, tiltX: 0.25, tiltZ: 0.45, speed: 0.0015, angle: 1.7 },
      { text: "Mi lugar favorito es contemplarte", radius: 360, tiltX: -0.32, tiltZ: -0.22, speed: -0.0014, angle: 3.0 }
    ];

    this.clock = new THREE.Clock();
    this.isRunning = false;

    this.init();
  }

  generateSoftStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05030a, 0.00045);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 4500);
    this.updateCameraPositionDirect();

    // RENDERIZADOR SÓLIDO (alpha: false): Elimina parpadeo por composición del navegador
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x05030a, 1.0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.createRoundedCushionHeart3D();
    this.createHeartAccretionParticles();
    this.createDeepStarfield();
    this.createCosmicNebulae();
    this.createFloating2DHearts();
    this.createOrbitingBadges();

    this.setupInteractionListeners();
    this.setupUIButtons();

    this.animate = this.animate.bind(this);
  }

  setupLighting() {
    // Luces constantes sin fluctuaciones bruscas
    const ambientLight = new THREE.AmbientLight(0x35123d, 2.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5fa, 1.6);
    dirLight.position.set(150, 250, 350);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x9d4edd, 1.8);
    rimLight.position.set(-250, -180, -250);
    this.scene.add(rimLight);

    // Luz puntual con intensidad constante y estable (sin parpadeo)
    this.heartLight = new THREE.PointLight(0xff2a85, 3.2, 550, 1.3);
    this.heartLight.position.set(0, this.coreCenterY, 35);
    this.scene.add(this.heartLight);

    this.goldLight = new THREE.PointLight(0xffc837, 1.6, 400, 1.4);
    this.goldLight.position.set(70, this.coreCenterY + 40, 50);
    this.scene.add(this.goldLight);
  }

  createRoundedCushionHeart3D() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;

    heartShape.moveTo(x, y + 22);
    heartShape.bezierCurveTo(x, y + 32, x - 14, y + 50, x - 32, y + 50);
    heartShape.bezierCurveTo(x - 58, y + 50, x - 58, y + 18, x - 58, y + 18);
    heartShape.bezierCurveTo(x - 58, y - 6, x - 40, y - 32, x, y - 68);
    heartShape.bezierCurveTo(x + 40, y - 32, x + 58, y - 6, x + 58, y + 18);
    heartShape.bezierCurveTo(x + 58, y + 18, x + 58, y + 50, x + 32, y + 50);
    heartShape.bezierCurveTo(x + 14, y + 50, x, y + 32, x, y + 22);

    const extrudeSettings = {
      depth: 22,
      bevelEnabled: true,
      bevelSegments: 22,
      steps: 3,
      bevelSize: 18,
      bevelThickness: 18,
      curveSegments: 36
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();
    geometry.computeVertexNormals();

    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff1e83,
      emissive: 0xff005e,
      emissiveIntensity: 0.36,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
      transmission: 0.42,
      thickness: 2.2,
      sheen: 1.0,
      sheenColor: 0xff8da1,
      sheenRoughness: 0.15
    });

    this.heartMesh = new THREE.Mesh(geometry, heartMaterial);
    this.heartMesh.rotation.z = 0; // Orientación correcta
    this.heartMesh.scale.set(1.18, 1.18, 1.18);
    this.heartMesh.position.set(0, this.coreCenterY, 0);

    this.scene.add(this.heartMesh);
  }

  createHeartAccretionParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cPink = new THREE.Color(0xff2a85);
    const cGold = new THREE.Color(0xffd700);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 105 + Math.random() * 85;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 40;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const pick = Math.random();
      const col = pick > 0.5 ? (pick > 0.75 ? cPink : cGold) : cWhite;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Con textura antialiased para evitar shimmering
    const material = new THREE.PointsMaterial({
      size: 4.0,
      map: this.starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.heartAccretion = new THREE.Points(geometry, material);
    this.heartAccretion.position.set(0, this.coreCenterY, 0);
    this.scene.add(this.heartAccretion);
  }

  createFloating2DHearts() {
    const textures = [
      this.generate2DHeartTexture('#ff477e', 'rgba(255, 71, 126, 0.5)'),
      this.generate2DHeartTexture('#f8bbd0', 'rgba(248, 187, 208, 0.4)'),
      this.generate2DHeartTexture('#ffffff', 'rgba(255, 255, 255, 0.6)'),
      this.generate2DHeartTexture('#ff758c', 'rgba(255, 117, 140, 0.5)')
    ];

    const heartCount = 55;
    for (let i = 0; i < heartCount; i++) {
      const tex = textures[Math.floor(Math.random() * textures.length)];
      const material = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      const size = 18 + Math.random() * 32;
      sprite.scale.set(size, size, 1);

      const x = (Math.random() - 0.5) * 1100;
      const y = -450 + Math.random() * 900;
      const z = -350 + Math.random() * 700;

      sprite.position.set(x, y, z);

      sprite.userData = {
        speedY: 0.22 + Math.random() * 0.45,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.018,
        initialX: x,
        initialZ: z
      };

      this.scene.add(sprite);
      this.floating2DHearts.push(sprite);
    }
  }

  generate2DHeartTexture(fillColor, glowColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(64, 40);
    ctx.bezierCurveTo(64, 25, 46, 12, 28, 12);
    ctx.bezierCurveTo(8, 12, 8, 38, 8, 38);
    ctx.bezierCurveTo(8, 62, 30, 86, 64, 114);
    ctx.bezierCurveTo(98, 86, 120, 62, 120, 38);
    ctx.bezierCurveTo(120, 38, 120, 12, 100, 12);
    ctx.bezierCurveTo(82, 12, 64, 25, 64, 40);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * ESTRELLAS PROFUNDAS CON TEXTURA REDONDA SUAVE:
   * Elimina completamente el centelleo y parpadeo digital subpixel
   */
  createDeepStarfield() {
    const starCount = 3600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xffe082),
      new THREE.Color(0xf8bbd0),
      new THREE.Color(0xb3cde0)
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 240 + Math.random() * 1900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.8,
      map: this.starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starField = new THREE.Points(geometry, material);
    this.scene.add(this.starField);
  }

  createCosmicNebulae() {
    const nebulaColors = [0xff2a85, 0x8a2be2, 0x1e3c72, 0xd4af37];
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);

    for (let i = 0; i < 12; i++) {
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.12 + Math.random() * 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      const scale = 420 + Math.random() * 450;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 1400,
        (Math.random() - 0.5) * 1000,
        -400 - Math.random() * 800
      );

      this.scene.add(sprite);
      this.nebulaPlanes.push(sprite);
    }
  }

  createOrbitingBadges() {
    const orbitContainer = document.getElementById('orbit-3d-badges-container');
    if (!orbitContainer) return;

    orbitContainer.innerHTML = '';
    this.orbitingPhrases = [];

    this.phrasesData.forEach((data) => {
      const el = document.createElement('div');
      el.className = 'orbit-3d-badge';
      el.textContent = data.text;
      orbitContainer.appendChild(el);

      this.orbitingPhrases.push({
        element: el,
        data: data,
        position3D: new THREE.Vector3()
      });
    });
  }

  updateOrbitingPhrases() {
    const widthHalf = (this.container.clientWidth || window.innerWidth) / 2;
    const heightHalf = (this.container.clientHeight || window.innerHeight) / 2;

    this.orbitingPhrases.forEach((item) => {
      const d = item.data;
      d.angle += d.speed;

      const currentRadius = d.radius * (this.orbitScale || 1.0);
      const rawX = Math.cos(d.angle) * currentRadius;
      const rawZ = Math.sin(d.angle) * currentRadius;

      const x = rawX * Math.cos(d.tiltZ) - rawZ * Math.sin(d.tiltZ);
      const y = (rawX * Math.sin(d.tiltX) + rawZ * Math.cos(d.tiltX)) * 0.42;
      const z = rawX * Math.sin(d.tiltZ) + rawZ * Math.cos(d.tiltZ);

      item.position3D.set(x, y + this.coreCenterY, z);

      const screenPos = item.position3D.clone();
      screenPos.project(this.camera);

      if (screenPos.z < 1) {
        const sx = (screenPos.x * widthHalf) + widthHalf;
        const sy = -(screenPos.y * heightHalf) + heightHalf;

        const dist = this.camera.position.distanceTo(item.position3D);
        const depthFactor = THREE.MathUtils.clamp(540 / dist, 0.45, 1.4);
        const opacity = THREE.MathUtils.clamp((item.position3D.z + 400) / 800 + 0.35, 0.35, 1.0);
        const zIndex = Math.floor(100 + item.position3D.z);

        item.element.style.transform = `translate(-50%, -50%) translate3d(${sx}px, ${sy}px, 0px) scale(${depthFactor})`;
        item.element.style.opacity = opacity;
        item.element.style.zIndex = zIndex;
      }
    });
  }

  updatePhotoPosition() {
    if (!this.photoAnchorEl) return;

    const widthHalf = (this.container.clientWidth || window.innerWidth) / 2;
    const heightHalf = (this.container.clientHeight || window.innerHeight) / 2;

    const screenPos = this.photoPosition3D.clone();
    screenPos.project(this.camera);

    if (screenPos.z < 1) {
      const sx = (screenPos.x * widthHalf) + widthHalf;
      const sy = -(screenPos.y * heightHalf) + heightHalf;

      const currentDist = this.camera.position.distanceTo(this.photoPosition3D);
      const scale = THREE.MathUtils.clamp((this.baseRadius / currentDist), 0.55, 1.55);
      const zIndex = Math.floor(300 + (this.photoPosition3D.z - this.camera.position.z));

      this.photoAnchorEl.style.transform = `translate(-50%, -50%) translate3d(${sx}px, ${sy}px, 0px) scale(${scale})`;
      this.photoAnchorEl.style.zIndex = Math.max(150, zIndex);
    }
  }

  setupInteractionListeners() {
    const dom = this.container;

    dom.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.velTheta = 0;
      this.velPhi = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      const rotateSpeed = 0.0055;
      this.velTheta = -deltaX * rotateSpeed;
      this.velPhi = deltaY * rotateSpeed;

      this.targetTheta += this.velTheta;
      this.targetPhi += this.velPhi;
      this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, 0.28, Math.PI - 0.28);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSpeed = 0.55;
      this.targetRadius += e.deltaY * zoomSpeed;
      this.targetRadius = THREE.MathUtils.clamp(this.targetRadius, this.minRadius, this.maxRadius);
      this.updateZoomIndicator();
    }, { passive: false });

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;
        this.velTheta = 0;
        this.velPhi = 0;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchPinchDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.prevMouseX;
        const deltaY = e.touches[0].clientY - this.prevMouseY;
        this.prevMouseX = e.touches[0].clientX;
        this.prevMouseY = e.touches[0].clientY;

        const rotateSpeed = 0.006;
        this.velTheta = -deltaX * rotateSpeed;
        this.velPhi = deltaY * rotateSpeed;

        this.targetTheta += this.velTheta;
        this.targetPhi += this.velPhi;
        this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, 0.28, Math.PI - 0.28);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.hypot(dx, dy);
        const pinchDelta = (this.touchPinchDist - newDist) * 1.5;
        this.touchPinchDist = newDist;

        this.targetRadius += pinchDelta;
        this.targetRadius = THREE.MathUtils.clamp(this.targetRadius, this.minRadius, this.maxRadius);
        this.updateZoomIndicator();
      }
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupUIButtons() {
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnReset = document.getElementById('btn-reset-camera');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.targetRadius = THREE.MathUtils.clamp(this.targetRadius - 80, this.minRadius, this.maxRadius);
        this.updateZoomIndicator();
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.targetRadius = THREE.MathUtils.clamp(this.targetRadius + 80, this.minRadius, this.maxRadius);
        this.updateZoomIndicator();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        this.targetTheta = 0;
        this.targetPhi = Math.PI * 0.52;
        this.targetRadius = this.baseRadius;
        this.velTheta = 0;
        this.velPhi = 0;
        this.updateZoomIndicator();
      });
    }

    this.updateZoomIndicator();
  }

  updateZoomIndicator() {
    if (!this.zoomIndicatorEl) return;
    const zoomLevel = Math.round((this.baseRadius / this.targetRadius) * 100);
    this.zoomIndicatorEl.textContent = `${zoomLevel}%`;
  }

  updateCameraMath() {
    if (!this.isDragging) {
      this.targetTheta += this.velTheta;
      this.targetPhi += this.velPhi;
      this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, 0.28, Math.PI - 0.28);

      this.velTheta *= 0.92;
      this.velPhi *= 0.92;
    }

    this.theta += (this.targetTheta - this.theta) * this.damping;
    this.phi += (this.targetPhi - this.phi) * this.damping;
    this.radius += (this.targetRadius - this.radius) * this.damping;

    const sinPhiRadius = this.radius * Math.sin(this.phi);
    this.camera.position.x = this.targetLookAt.x + sinPhiRadius * Math.sin(this.theta);
    this.camera.position.y = this.targetLookAt.y + this.radius * Math.cos(this.phi);
    this.camera.position.z = this.targetLookAt.z + sinPhiRadius * Math.cos(this.theta);

    this.camera.lookAt(this.targetLookAt);
  }

  updateCameraPositionDirect() {
    const sinPhiRadius = this.radius * Math.sin(this.phi);
    this.camera.position.x = this.targetLookAt.x + sinPhiRadius * Math.sin(this.theta);
    this.camera.position.y = this.targetLookAt.y + this.radius * Math.cos(this.phi);
    this.camera.position.z = this.targetLookAt.z + sinPhiRadius * Math.cos(this.theta);
    this.camera.lookAt(this.targetLookAt);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;

    if (aspect < 1) {
      this.isPortrait = true;
      this.camera.fov = 45 + (1 - aspect) * 22;
      this.orbitScale = THREE.MathUtils.clamp(width / 600, 0.58, 0.95);
      this.photoPosition3D.set(0, this.coreCenterY + 165, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    } else {
      this.isPortrait = false;
      this.camera.fov = 45;
      this.orbitScale = 1.0;
      this.photoPosition3D.set(0, this.coreCenterY + 185, 0);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onWindowResize();
    requestAnimationFrame(this.animate);
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const time = this.clock.getElapsedTime();

    // 1. Navegación orbital
    this.updateCameraMath();

    // 2. Corazón 3D: Latido suave con luz completamente estable
    if (this.heartMesh) {
      const beatCycle = (time * 1.0) % 1;
      let pulse = 0;
      if (beatCycle < 0.16) {
        pulse = Math.sin((beatCycle / 0.16) * Math.PI) * 0.045;
      } else if (beatCycle < 0.36) {
        pulse = Math.sin(((beatCycle - 0.16) / 0.2) * Math.PI) * 0.02;
      }

      const currentScale = 1.18 + pulse;
      this.heartMesh.scale.set(currentScale, currentScale, currentScale);

      // Rotación tridimensional suave y sutil
      this.heartMesh.rotation.y = Math.sin(time * 0.35) * 0.15;
      this.heartMesh.rotation.x = Math.sin(time * 0.25) * 0.05;
    }

    // 3. Partículas orbitando el corazón
    if (this.heartAccretion) {
      this.heartAccretion.rotation.y += 0.0025;
      this.heartAccretion.rotation.x = Math.sin(time * 0.2) * 0.08;
    }

    // 4. Giro del campo estelar
    if (this.starField) {
      this.starField.rotation.y = time * 0.0006;
    }

    // 5. Corazones flotantes 2D con trayectoria armónica suave
    this.floating2DHearts.forEach((sprite) => {
      sprite.position.y += sprite.userData.speedY;
      sprite.userData.swayPhase += sprite.userData.swaySpeed;
      sprite.position.x = sprite.userData.initialX + Math.sin(sprite.userData.swayPhase) * 25;
      sprite.position.z = sprite.userData.initialZ + Math.cos(sprite.userData.swayPhase * 0.7) * 15;

      if (sprite.position.y > 450) {
        sprite.position.y = -450;
      }
    });

    // 6. Proyecciones tridimensionales
    this.updateOrbitingPhrases();
    this.updatePhotoPosition();

    this.renderer.render(this.scene, this.camera);
  }
}

window.Universe3DEngine = Universe3DEngine;
