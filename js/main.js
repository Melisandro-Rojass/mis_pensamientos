/**
 * ============================================================================
 * UNIVERSO PARA TI ♡ - CONTROLADOR PRINCIPAL (MAIN ORCHESTRATOR)
 * Gestión de estados, transiciones cinematográficas y universo 3D
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const heartCard = document.getElementById('heart-card');
  const letterSheet = document.getElementById('letter-sheet');
  const btnDiscoverUniverse = document.getElementById('btn-discover-universe');
  const btnReturnLetter = document.getElementById('btn-return-letter');
  const sceneLetter = document.getElementById('scene-letter');
  const sceneUniverse = document.getElementById('scene-universe');
  const body = document.body;

  let isLetterOpened = false;
  let universe3dInstance = null;

  /* ------------------------------------------------------------------------
     1. INTERACCIÓN DE APERTURA DE LA CARTA
     ------------------------------------------------------------------------ */
  const openHeartLetter = () => {
    if (isLetterOpened) return;
    isLetterOpened = true;

    // 1. Iniciar música de fondo
    if (window.romanticAudio) {
      window.romanticAudio.startOnInteraction();
    }

    // 2. Disparar efecto visual de destellos y corazones
    if (window.romanticAnimations && heartCard) {
      const rect = heartCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          window.romanticAnimations.spawnClickHeart(
            centerX + (Math.random() - 0.5) * 80,
            centerY + (Math.random() - 0.5) * 80
          );
        }, i * 150);
      }
    }

    // 3. Animación de apertura del corazón
    heartCard.style.transform = 'scale(1.15) rotate(3deg)';
    heartCard.style.opacity = '0';
    heartCard.style.pointerEvents = 'none';

    setTimeout(() => {
      heartCard.style.display = 'none';
      if (letterSheet) {
        letterSheet.classList.add('active');
        letterSheet.setAttribute('aria-hidden', 'false');
      }
    }, 450);
  };

  if (heartCard) {
    heartCard.addEventListener('click', openHeartLetter);
    heartCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openHeartLetter();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. TRANSICIÓN A LA ESCENA 2: "UN UNIVERSO ENTERO PARA TI (3D)"
     ------------------------------------------------------------------------ */
  if (btnDiscoverUniverse) {
    btnDiscoverUniverse.addEventListener('click', () => {
      // Disparar destellos estelares
      if (window.romanticAnimations) {
        const rect = btnDiscoverUniverse.getBoundingClientRect();
        window.romanticAnimations.spawnClickHeart(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      // Animación cinematográfica de salto hiperespacial
      sceneLetter.classList.add('cinematic-warp');

      setTimeout(() => {
        // Ocultar escena 1 y activar escena 2
        sceneLetter.classList.remove('scene-active', 'cinematic-warp');
        sceneLetter.classList.add('scene-hidden');

        sceneUniverse.classList.remove('scene-hidden');
        sceneUniverse.classList.add('scene-active', 'fade-in-universe');

        // Cambiar paleta y tema global
        body.classList.remove('theme-letter');
        body.classList.add('theme-universe');

        // Inicializar e iniciar el Universo 3D (Three.js)
        if (window.romanticAnimations) {
          window.romanticAnimations.switchScene('universe');
        }
        if (!universe3dInstance && window.Universe3DEngine) {
          universe3dInstance = new window.Universe3DEngine('webgl-universe-container');
        }
        if (universe3dInstance) {
          universe3dInstance.start();
        }

        // Scroll al tope suave
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Remover clase de animación de entrada tras finalizar
        setTimeout(() => {
          sceneUniverse.classList.remove('fade-in-universe');
        }, 1500);

      }, 950);
    });
  }

  /* ------------------------------------------------------------------------
     3. NAVEGACIÓN DE REGRESO A LA CARTA
     ------------------------------------------------------------------------ */
  if (btnReturnLetter) {
    btnReturnLetter.addEventListener('click', () => {
      sceneUniverse.classList.add('cinematic-warp');

      setTimeout(() => {
        sceneUniverse.classList.remove('scene-active', 'cinematic-warp');
        sceneUniverse.classList.add('scene-hidden');

        sceneLetter.classList.remove('scene-hidden');
        sceneLetter.classList.add('scene-active', 'fade-in-universe');

        body.classList.remove('theme-universe');
        body.classList.add('theme-letter');

        if (universe3dInstance) {
          universe3dInstance.stop();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          sceneLetter.classList.remove('fade-in-universe');
        }, 1500);
      }, 700);
    });
  }

  console.log('%c♡ Universo 3D Para Ti ♡\nThree.js + HTML5 + CSS3 + Vanilla JS.', 'color: #ff477e; font-size: 14px; font-weight: bold;');
});
