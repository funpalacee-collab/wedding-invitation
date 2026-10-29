/* ==========================================================================
   ROMANTIC AUDIO ENGINE (Web Audio API Synthesizer + Custom Audio Support)
   Provides an ambient romantic piano/harp melody that works offline seamlessly
   ========================================================================== */

class RomanticAudioPlayer {
  constructor() {
    this.isPlaying = false;
    this.audioCtx = null;
    this.gainNode = null;
    this.sequenceTimer = null;
    this.customAudio = null;
    this.mode = 'synth'; // 'synth' or 'custom'
    this.volume = 0.5;
    this.isMuted = false;

    // Harmonic chord progressions (D - F#m - G - A - Bm - G - A - D) in MIDI / Frequencies
    this.chords = [
      // D Major (D4, F#4, A4, D5)
      [293.66, 369.99, 440.00, 587.33],
      // F# minor (F#3, A3, C#4, F#4)
      [185.00, 220.00, 277.18, 369.99],
      // G Major (G3, B3, D4, G4)
      [196.00, 246.94, 293.66, 392.00],
      // A Major (A3, C#4, E4, A4)
      [220.00, 277.18, 329.63, 440.00],
      // B minor (B3, D4, F#4, B4)
      [246.94, 293.66, 369.99, 493.88],
      // G Major high
      [196.00, 293.66, 392.00, 587.33],
      // A suspended 4 -> A
      [220.00, 293.66, 329.63, 440.00],
      // D Major resolution
      [293.66, 369.99, 440.00, 587.33, 739.99]
    ];
    this.currentChordIndex = 0;
    this.noteStep = 0;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playPianoNote(freq, timeOffset = 0, duration = 2.4) {
    if (!this.audioCtx || this.isMuted) return;

    const now = this.audioCtx.currentTime + timeOffset;
    
    // Fundamental Oscillator
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Warm Harmonic
    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Note Gain Envelope (Gentle harp-like attack and warm decay)
    const noteGain = this.audioCtx.createGain();
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Lowpass filter for smooth acoustic warmth
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(filter);
    filter.connect(this.gainNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  startSynthSequence() {
    this.initContext();
    this.stopSynthSequence();

    const playArpeggioPattern = () => {
      const currentNotes = this.chords[this.currentChordIndex];
      // Arpeggiate through the chord tones gracefully
      currentNotes.forEach((freq, idx) => {
        this.playPianoNote(freq, idx * 0.42, 2.8);
      });

      // Occasional sweet high bell tone
      if (Math.random() > 0.4) {
        const highTone = currentNotes[currentNotes.length - 1] * (Math.random() > 0.5 ? 1.5 : 2);
        this.playPianoNote(highTone, 1.25, 2.0);
      }

      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
      this.sequenceTimer = setTimeout(playArpeggioPattern, 2400);
    };

    playArpeggioPattern();
  }

  stopSynthSequence() {
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  play() {
    if (this.mode === 'custom' && this.customAudio) {
      this.customAudio.play().catch(e => console.log('Audio autoplay prevented:', e));
    } else {
      this.initContext();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.startSynthSequence();
    }
    this.isPlaying = true;
    this.updateUI();
  }

  pause() {
    if (this.mode === 'custom' && this.customAudio) {
      this.customAudio.pause();
    } else {
      this.stopSynthSequence();
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      }
    }
    this.isPlaying = false;
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setCustomAudio(url) {
    if (!url) {
      this.mode = 'synth';
      if (this.customAudio) {
        this.customAudio.pause();
        this.customAudio = null;
      }
      return;
    }

    if (this.customAudio) {
      this.customAudio.pause();
    }

    this.mode = 'custom';
    this.customAudio = new Audio(url);
    this.customAudio.loop = true;
    this.customAudio.volume = this.volume;

    if (this.isPlaying) {
      this.stopSynthSequence();
      this.customAudio.play().catch(e => console.log('Custom audio play error:', e));
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isPlaying ? this.volume : 0, this.audioCtx ? this.audioCtx.currentTime : 0);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  updateUI() {
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    if (audioToggleBtn) {
      const action = this.isPlaying ? 'Mute' : 'Play';
      audioToggleBtn.setAttribute('aria-pressed', String(this.isPlaying));
      audioToggleBtn.setAttribute('aria-label', `${action} wedding music`);
      if (this.isPlaying) {
        audioToggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4 text-emerald-800">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
          </svg>`;
      } else {
        audioToggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-4 h-4 text-stone-400">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>`;
      }
    }
  }
}

// Global instance
window.weddingAudio = new RomanticAudioPlayer();
