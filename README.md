# Universo Para Ti ♡ — Universo 3D Inmersivo & Dedicatoria Romántica

Una experiencia web poética, cinematográfica e interactiva con **HTML5, CSS3, JavaScript vanilla y Three.js**. Diseñada con una estética inspirada en el romanticismo japonés, un universo espacial tridimensional con profundidad real, un corazón 3D cristalino y la fotografía de la persona especial suspendida en el cosmos.

---

## 🌟 Estructura del Proyecto

```text
Mi universo/
│
├── index.html                      # Maquetación de ambas escenas (Carta y Universo 3D)
│
├── css/
│   └── styles.css                  # Estilos, paleta japonesa/cósmica, marco de cristal y responsive
│
├── js/
│   ├── main.js                     # Orquestador de eventos, transiciones y arranque 3D
│   ├── animations.js               # Partículas de la carta (pétalos de cerezo, polvo pastel, cursor)
│   ├── universe3d.js               # Motor 3D (Three.js): Universo, corazón volumétrico, órbitas y estrellas
│   └── audio.js                    # Reproductor de audio con sintetizador procedural de respaldo
│
├── assets/
│   ├── images/
│   │   └── persona-especial.jpg    # Fotografía real de la persona especial (fácilmente sustituible)
│   │
│   ├── music/
│   │   ├── LEEME.txt               # Instrucciones del archivo de audio
│   │   └── cancion.mp3             # Tu canción favorita (reproducción automática interactiva)
│   │
│   └── fonts/
│
└── README.md                       # Documentación y guía de uso
```

---

## 🚀 Cómo Ejecutar el Proyecto

1. **Directamente en tu navegador:**  
   Haz doble clic sobre el archivo [index.html](file:///c:/Users/fairy/Documents/Mi%20universo/index.html).
2. **Con un servidor local ligero (Recomendado):**  
   - Con Node: `npx serve .`
   - Con Python: `python -m http.server 8000`  
   - Con VS Code: Clic derecho en `index.html` -> *Open with Live Server*.

---

## 🖼️ Personalizar la Fotografía

1. La fotografía seleccionada se encuentra ubicada en:
   ```text
   assets/images/persona-especial.jpg
   ```
2. Para cambiarla en cualquier momento, simplemente reemplaza ese archivo con otra imagen con el mismo nombre `persona-especial.jpg` (o actualiza la ruta en `index.html`).
3. **Presentación de la fotografía:**
   - La foto se muestra completa con sus colores y nitidez originales, sin filtros que alteren el rostro.
   - Flota suspendida sobre el eje vertical del corazón 3D dentro de un marco de cristal con bisel rosa neón y destellos dorados.

---

## 🌌 Navegación Espacial 3D (Matemáticas & Controles)

La segunda escena cuenta con un **sistema matemático interactivo de navegación tridimensional** mediante coordenadas esféricas:

$$x = r \cdot \sin(\phi) \cdot \sin(\theta)$$
$$y = r \cdot \cos(\phi)$$
$$z = r \cdot \sin(\phi) \cdot \cos(\theta)$$

### Controles en Computadora:
- **Clic izquierdo + Arrastrar:** Rotar la cámara libremente alrededor del núcleo central (horizontal y verticalmente con límites de inclinación para evitar volteos).
- **Rueda del ratón:** Acercar (+) o alejar (−) la cámara con interpolación suave (`r += (target - r) * damping`).
- **Botones flotantes (+ / −):** Control táctil/clic de zoom con indicador porcentual en tiempo real.
- **Botón Restablecer (↺):** Retorna la cámara suavemente a la perspectiva de observación original.

### Controles en Dispositivos Móviles:
- **Deslizar un dedo:** Rotar el universo 3D en cualquier dirección.
- **Pellizcar con dos dedos:** Acercar o alejar la perspectiva galáctica con detección de distancia táctil.
- **Botones en pantalla:** Zoom directo accesible con una sola mano.

---

## 🌟 Características de la Escena 2 (Universo 3D Real)

- **Corazón Central 3D Redondeado (El único modelo 3D):** Con silueta romántica acolchada, voluminosa y suave (`ExtrudeGeometry` con biselado ultra-curvo continuo), material de cristal rosa profundo y brillante (`MeshPhysicalMaterial`), reflejos blancos/rosados, latido lento y rotación tridimensional muy sutil.
- **Fotografía en Posición Elevada:** Ubicada en la parte superior con una separación visual limpia y generosa sobre el corazón, marco delicado con iluminación rosa, sombra de profundidad y flotación suave independiente.
- **Corazones Flotantes Exclusivamente 2D:** Siluetas clásicas de corazones planos generadas en Canvas/Sprites que recorren el universo en tonos rosa pastel, rosa brillante y blanco, flotando tanto por delante como por detrás del núcleo central.
- **Frases Románticas Dedicadas a su Belleza:** Con movimiento orbital suave y pausado, celebrando lo hermosa que es («La mujer más hermosa del universo», «La carita más preciosa», «Tu belleza no tiene comparación», «Tus hermosos ojos de miel»).
- **Iluminación Serena sin Parpadeo:** Luz cósmica continua con mapeo tonal lineal y transparencia sin conflictos de profundidad.
- **Espacio con Profundidad:** Más de 3,800 estrellas en tres capas de profundidad, nebulosas volumétricas en tonos magenta, violeta y azul, meteoros fugaces y sensación cinematográfica de flotar en el espacio.
- **Módulo Responsive Universal:** Adaptabilidad inteligente en computadoras, monitores ultrawide y 4K, laptops, tabletas y teléfonos inteligentes (iOS y Android en vertical y horizontal), con unidades relativas (`clamp()`, `dvh`), compensación dinámica de campo de visión (FOV) y safe-area insets.
- **Cámara Cinematográfica con Parallax:** Al mover el ratón, la cámara reacciona con suavidad, permitiendo apreciar el volumen del corazón y la sensación de flotar en el espacio.
