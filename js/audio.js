/**
 * ============================================================================
 * UNIVERSO PARA TI ♡ - MÓDULO DE AUDIO
 * Manejo de música de fondo, Web Audio API y reproductor interactivo
 * ============================================================================
 */

class RomanticAudioManager {
  constructor() {
    this.audioElement = document.getElementById('bg-audio');
    this.toggleBtn = document.getElementById('btn-audio-toggle');
    this.equalizer = document.getElementById('audio-equalizer');
    this.volumeSlider = document.getElementById('volume-slider');
    this.audioLabel = document.getElementById('audio-label');
    
    this.isPlaying = false;
    this.hasUserInteracted = false;
    this.isUsingSynthFallback = false;
    this.synthInterval = null;
    this.audioCtx = null;

    this.init();
  }

  init() {
    // Configuración inicial de volumen
    if (this.audioElement) {
      this.audioElement.volume = parseFloat(this.volumeSlider ? this.volumeSlider.value : 0.35);
      
      // Manejar errores si cancion.mp3 no existe aún
      this.audioElement.addEventListener('error', (e) => {
        console.info('Aviso: cancion.mp3 aún no está presente en assets/music/. Activando sintetizador de melodía romántica generativa.');
        this.isUsingSynthFallback = true;
      });
    }

    // Event listeners de controles
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlay();
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        if (this.audioElement) this.audioElement.volume = vol;
        if (this.synthMasterGain) this.synthMasterGain.gain.setValueAtTime(vol * 0.15, this.audioCtx ? this.audioCtx.currentTime : 0);
      });
    }
  }

  /**
   * Inicia la reproducción tras la primera interacción consciente del usuario
   */
  startOnInteraction() {
    if (this.hasUserInteracted) return;
    this.hasUserInteracted = true;
    this.play();
  }

  play() {
    this.isPlaying = true;
    this.updateUI(true);

    if (this.audioElement && !this.isUsingSynthFallback) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Reproducción de archivo bloqueada o no disponible. Iniciando melodía ambiental procedural.', err);
          this.startRomanticSynth();
        });
      }
    } else {
      this.startRomanticSynth();
    }
  }

  pause() {
    this.isPlaying = false;
    this.updateUI(false);

    if (this.audioElement && !this.isUsingSynthFallback) {
      this.audioElement.pause();
    }
    this.stopRomanticSynth();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateUI(playing) {
    if (this.equalizer) {
      if (playing) {
        this.equalizer.classList.add('playing');
      } else {
        this.equalizer.classList.remove('playing');
      }
    }

    if (this.audioLabel) {
      this.audioLabel.textContent = 'Para ti ♡';
    }
  }

  /**
   * SINTETIZADOR ROMÁNTICO PROCEDURAL (Web Audio API)
   * Crea una progresión etérea tipo caja de música de estudio Ghibli / Erik Satie
   * en caso de que aún no se haya copiado el archivo de audio local.
   */
  startRomanticSynth() {
    if (this.synthInterval) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.synthMasterGain = this.audioCtx.createGain();
      const currentVol = this.volumeSlider ? parseFloat(this.volumeSlider.value) : 0.35;
      this.synthMasterGain.gain.setValueAtTime(currentVol * 0.15, this.audioCtx.currentTime);
      this.synthMasterGain.connect(this.audioCtx.destination);

      // Progresión de acordes romántica (Cmaj9, Am9, Fmaj7, G6)
      const chordNotes = [
        [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
        [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
        [174.61, 261.63, 329.63, 349.23, 440.00], // Fmaj7
        [196.00, 246.94, 293.66, 392.00, 440.00]  // G6
      ];

      let chordIndex = 0;
      let noteIndex = 0;

      const playNextBellNote = () => {
        if (!this.isPlaying || !this.audioCtx) return;

        const currentChord = chordNotes[chordIndex];
        const freq = currentChord[noteIndex];

        this.triggerMusicBoxNote(freq);

        noteIndex++;
        if (noteIndex >= currentChord.length) {
          noteIndex = 0;
          chordIndex = (chordIndex + 1) % chordNotes.length;
        }
      };

      playNextBellNote();
      this.synthInterval = setInterval(playNextBellNote, 600);
      this.isUsingSynthFallback = true;
    } catch (e) {
      console.warn('Web Audio API no soportado.', e);
    }
  }

  triggerMusicBoxNote(freq) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Tono dulce: mezcla suave seno/triángulo
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Envolvente tipo campana / caja de música
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(this.synthMasterGain);

    osc.start(now);
    osc.stop(now + 1.85);
  }

  stopRomanticSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }
}

// Instancia global
window.romanticAudio = new RomanticAudioManager();
