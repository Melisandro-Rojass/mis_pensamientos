/**
 * ============================================================================
 * UNIVERSO PARA TI ♡ - MÓDULO 3D (REDISEÑO VISUAL SERENO Y ELEGANTE)
 * - Iluminación Suave y Continua: Tonos rosas, rojizos y violetas sin destellos blancos
 * - Estrellas y Nebulosas Estables: Cero parpadeos, distribución limpia y despejada
 * - Corazón 3D: Redondeado, voluminoso, acabado cristal suave con halo difuminado
 * - Fotografía: Enmarcada con resplandor rosa tenue, elevada y nítida
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
    this.heartHaloSprite = null;
    this.heartLight = null;
    this.heartAccretion = null;
    this.floating2DHearts = [];
    this.starField = null;
    this.nebulaPlanes = [];

    // Referencias DOM
    this.photoAnchorEl = document.getElementById('floating-photo-anchor');
    this.zoomIndicatorEl = document.getElementById('zoom-level-indicator');

    // Coordenadas del núcleo
    this.coreCenterY = -120;
    this.targetLookAt = new THREE.Vector3(0, this.coreCenterY + 45, 0);
    this.photoPosition3D = new THREE.Vector3(0, this.coreCenterY + 185, 0);
    this.orbitScale = 1.0;
    this.isPortrait = false;

    // Textura suave para estrellas
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

    // Frases románticas dedicadas a su belleza
    this.orbitingPhrases = [];
    this.phrasesData = [
      { text: "La mujer más hermosa del universo", radius: 250, tiltX: 0.35, tiltZ: 0.2, speed: 0.0016, angle: 0 },
      { text: "Tus hermosos ojos de miel", radius: 300, tiltX: -0.38, tiltZ: 0.42, speed: -0.0013, angle: 1.1 },
      { text: "La carita más preciosa", radius: 220, tiltX: 0.6, tiltZ: -0.28, speed: 0.0019, angle: 2.2 },
      { text: "Tu sonrisa ilumina mi mundo", radius: 350, tiltX: -0.22, tiltZ: -0.52, speed: -0.0012, angle: 3.3 },
      { text: "Eres arte en cada detalle", radius: 390, tiltX: 0.42, tiltZ: 0.32, speed: 0.0011, angle: 4.4 },
      { text: "Tu belleza no tiene comparación", radius: 270, tiltX: -0.5, tiltZ: -0.18, speed: -0.0017, angle: 5.2 },
      { text: "La chica de mis sueños", radius: 330, tiltX: 0.15, tiltZ: -0.42, speed: 0.0014, angle: 0.8 },
      { text: "Me encantas de pies a cabeza", radius: 230, tiltX: -0.28, tiltZ: 0.28, speed: -0.0018, angle: 2.7 },
      { text: "Tu cabello tan lindo y perfecto", radius: 370, tiltX: 0.38, tiltZ: -0.32, speed: 0.0012, angle: 3.8 },
      { text: "Eres pura magia y perfección", radius: 280, tiltX: -0.45, tiltZ: 0.28, speed: -0.0015, angle: 4.9 },
      { text: "La estrella que más brilla eres tú", radius: 320, tiltX: 0.25, tiltZ: 0.45, speed: 0.0013, angle: 1.7 },
      { text: "Mi lugar favorito es contemplarte", radius: 360, tiltX: -0.32, tiltZ: -0.22, speed: -0.0012, angle: 3.0 }
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
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.3, 'rgba(255, 220, 235, 0.6)');
    grad.addColorStop(0.7, 'rgba(255, 180, 210, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Escena con niebla suave y profunda en azul oscuro / violeta
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060412, 0.00045);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 4500);
    this.updateCameraPositionDirect();

    // Renderizador sólido (sin alpha ni saltos de tonalidad)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x060412, 1.0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // Iluminación suave rosa/rojiza sin destellos blancos
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
    // 1. Luz ambiental cálida y difusa en tonos violeta y rosa profundo
    const ambientLight = new THREE.AmbientLight(0x281036, 2.6);
    this.scene.add(ambientLight);

    // 2. Luz direccional suave en tono rosa pastel (reemplaza a los destellos blancos duros)
    const dirLight = new THREE.DirectionalLight(0xffd6e3, 1.1);
    dirLight.position.set(120, 200, 300);
    this.scene.add(dirLight);

    // 3. Contraluz sutil en violeta oscuro para siluetear el volumen
    const rimLight = new THREE.DirectionalLight(0x5a189a, 1.2);
    rimLight.position.set(-200, -150, -200);
    this.scene.add(rimLight);

    // 4. Luz puntual rosa rojiza constante e inmóvil en el centro del corazón
    this.heartLight = new THREE.PointLight(0xff2a75, 2.4, 500, 1.4);
    this.heartLight.position.set(0, this.coreCenterY, 30);
    this.scene.add(this.heartLight);
  }

  /**
   * CORAZÓN 3D CENTRAL: Suave, redondeado y acolchado, con brillo satinado de cristal rosa
   */
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

    // Material de gema / cristal rosa suave satinado (sin brillos cegadores)
    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff1b6b,
      emissive: 0x990033,
      emissiveIntensity: 0.28,
      roughness: 0.18,          // Suavizado satinado
      metalness: 0.04,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      reflectivity: 0.85,
      transmission: 0.38,
      thickness: 2.0,
      sheen: 0.8,
      sheenColor: 0xff99bb
    });

    this.heartMesh = new THREE.Mesh(geometry, heartMaterial);
    this.heartMesh.rotation.z = 0;
    this.heartMesh.scale.set(1.18, 1.18, 1.18);
    this.heartMesh.position.set(0, this.coreCenterY, 0);

    this.scene.add(this.heartMesh);

    // Halo rosado difuminado detrás del corazón para darle profundidad celestial
    this.createHeartDiffusedHalo();
  }

  createHeartDiffusedHalo() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 42, 117, 0.45)');
    grad.addColorStop(0.4, 'rgba(214, 40, 100, 0.2)');
    grad.addColorStop(0.8, 'rgba(120, 20, 70, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.heartHaloSprite = new THREE.Sprite(material);
    this.heartHaloSprite.scale.set(240, 240, 1);
    this.heartHaloSprite.position.set(0, this.coreCenterY, -10);
    this.scene.add(this.heartHaloSprite);
  }

  createHeartAccretionParticles() {
    // Cantidad equilibrada y suave (180 partículas)
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cPink = new THREE.Color(0xff4d88);
    const cRose = new THREE.Color(0xff80aa);
    const cSoftGold = new THREE.Color(0xffe6a8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 105 + Math.random() * 80;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 35;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const pick = Math.random();
      const col = pick > 0.6 ? cPink : (pick > 0.3 ? cRose : cSoftGold);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.2,
      map: this.starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.heartAccretion = new THREE.Points(geometry, material);
    this.heartAccretion.position.set(0, this.coreCenterY, 0);
    this.scene.add(this.heartAccretion);
  }

  createFloating2DHearts() {
    const textures = [
      this.generate2DHeartTexture('#ff4d88', 'rgba(255, 77, 136, 0.4)'),
      this.generate2DHeartTexture('#f8bbd0', 'rgba(248, 187, 208, 0.3)'),
      this.generate2DHeartTexture('#ff80aa', 'rgba(255, 128, 170, 0.35)')
    ];

    // Cantidad equilibrada (30 corazones suaves)
    const heartCount = 30;
    for (let i = 0; i < heartCount; i++) {
      const tex = textures[Math.floor(Math.random() * textures.length)];
      const material = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      const size = 16 + Math.random() * 26;
      sprite.scale.set(size, size, 1);

      const x = (Math.random() - 0.5) * 1000;
      const y = -400 + Math.random() * 800;
      const z = -300 + Math.random() * 600;

      sprite.position.set(x, y, z);

      sprite.userData = {
        speedY: 0.18 + Math.random() * 0.35,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.015,
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
    ctx.shadowBlur = 12;

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
   * ESTRELLAS DE FONDO CONSTANTES Y SERENAS:
   * Cantidad balanceada (1600 estrellas) con brillo natural y estable
   */
  createDeepStarfield() {
    const starCount = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xf0e6ff), // Blanco suave / lavanda
      new THREE.Color(0xffd6e8), // Rosa tenue
      new THREE.Color(0xfff0d4), // Cálido suave
      new THREE.Color(0xcce0ff)  // Azul celeste tenue
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 260 + Math.random() * 1800;
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
      size: 3.2,
      map: this.starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starField = new THREE.Points(geometry, material);
    this.scene.add(this.starField);
  }

  /**
   * NEBULOSAS SUAVES EN DEGRADADO:
   * Tonos azul oscuro, violeta y rosa tenue sin saturar la pantalla
   */
  createCosmicNebulae() {
    const nebulaColors = [0x5c1349, 0x1f144d, 0x122452, 0x3d0c35];
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);

    for (let i = 0; i < 8; i++) {
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.16 + Math.random() * 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const sprite = new THREE.Sprite(material);
      const scale = 500 + Math.random() * 450;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 1200,
        (Math.random() - 0.5) * 900,
        -400 - Math.random() * 700
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

    // 2. Corazón 3D: Respiración orgánica suave y pausada (sin saltos bruscos)
    if (this.heartMesh) {
      // Latido sutil continuo tipo respiración armónica
      const smoothPulse = Math.sin(time * 1.1) * 0.035;
      const currentScale = 1.18 + smoothPulse;
      this.heartMesh.scale.set(currentScale, currentScale, currentScale);

      // Rotación tridimensional muy sutil y relajada
      this.heartMesh.rotation.y = Math.sin(time * 0.28) * 0.12;
      this.heartMesh.rotation.x = Math.sin(time * 0.18) * 0.04;

      // Halo difuso suave sincronizado
      if (this.heartHaloSprite) {
        const haloScale = 240 + smoothPulse * 20;
        this.heartHaloSprite.scale.set(haloScale, haloScale, 1);
      }
    }

    // 3. Partículas orbitando el corazón
    if (this.heartAccretion) {
      this.heartAccretion.rotation.y += 0.002;
      this.heartAccretion.rotation.x = Math.sin(time * 0.15) * 0.06;
    }

    // 4. Giro sereno del campo estelar
    if (this.starField) {
      this.starField.rotation.y = time * 0.0004;
    }

    // 5. Corazones flotantes 2D con trayectoria armónica suave
    this.floating2DHearts.forEach((sprite) => {
      sprite.position.y += sprite.userData.speedY;
      sprite.userData.swayPhase += sprite.userData.swaySpeed;
      sprite.position.x = sprite.userData.initialX + Math.sin(sprite.userData.swayPhase) * 20;
      sprite.position.z = sprite.userData.initialZ + Math.cos(sprite.userData.swayPhase * 0.6) * 12;

      if (sprite.position.y > 420) {
        sprite.position.y = -420;
      }
    });

    // 6. Proyecciones tridimensionales
    this.updateOrbitingPhrases();
    this.updatePhotoPosition();

    this.renderer.render(this.scene, this.camera);
  }
}

window.Universe3DEngine = Universe3DEngine;
