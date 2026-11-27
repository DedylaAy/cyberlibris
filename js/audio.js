/**
 * CyberLibris Procedural Audio Engine
 * Uses Web Audio API to synthesize SFX and ambient soundscapes without external files.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('cyberlibris_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('cyberlibris_volume') || '0.7');
    this.ambientNodes = null;
    this.currentAmbient = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('cyberlibris_muted', muted);
    if (muted && this.ambientNodes) {
      this.stopAmbient();
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('cyberlibris_volume', this.volume);
    if (this.ambientNodes && this.ambientNodes.gain && this.ctx) {
      const baseGain = (this.currentAmbient === 'rain' ? 0.08 : this.currentAmbient === 'fire' ? 0.08 : this.currentAmbient === 'cyber' ? 0.06 : 0.05);
      this.ambientNodes.gain.gain.setValueAtTime(baseGain * this.volume, this.ctx.currentTime);
    }
    return this.volume;
  }

  toggleMute() {
    return this.setMuted(!this.isMuted);
  }

  // --- SOUND EFFECTS ---

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.03 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  playCardFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playPageFlip() {
    return this.playCardFlip();
  }

  playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    });
  }

  playWrong() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.2);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playError() {
    return this.playWrong();
  }

  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Dual-tone celebratory coin chime (B5 -> E6)
    const tones = [987.77, 1318.51];
    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  playGameWin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Pleasant gentle victory chord (C major - G4, C5, E5) - distinct from level up fanfare
    const chord = [392.00, 523.25, 659.25];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.14 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chord = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major fanfare
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    });
  }

  // --- PROCEDURAL ACOUSTIC AMBIENT ENGINE (HIGH FIDELITY) ---
  playAmbient(type) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.currentAmbient === type && this.ambientNodes) {
      this.stopAmbient();
      return false; // toggled off
    }

    this.stopAmbient();
    this.currentAmbient = type;

    const now = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;

    if (type === 'rain') {
      // 1. STEREO NEON RAIN: Decorrelated pink noise with slow wind sweeps and glass droplet patter
      const bufferSize = sampleRate * 3;
      const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      let b0L = 0, b1L = 0, b2L = 0;
      let b0R = 0, b1R = 0, b2R = 0;

      for (let i = 0; i < bufferSize; i++) {
        // Pink noise filter (Paul Kellet's algorithm)
        const whiteL = Math.random() * 2 - 1;
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        chL[i] = (b0L + b1L + b2L + whiteL * 0.5362) * 0.12;

        const whiteR = Math.random() * 2 - 1;
        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        chR[i] = (b0R + b1R + b2R + whiteR * 0.5362) * 0.12;

        // Occasional soft glass droplet tap
        if (Math.random() < 0.00035) {
          const drop = (Math.random() - 0.5) * 0.45;
          chL[i] += drop;
          chR[i] += drop * 0.8;
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Lowpass + Highpass for cozy window soundscape
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(680, now);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(140, now);

      // Subtle LFO modulation for rain surge
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, now); // Slow 8-second wave
      lfoGain.gain.setValueAtTime(120, now);
      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08 * this.volume, now + 0.5);

      noise.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start(now);
      noise.start(now);

      this.ambientNodes = { noise, lfo, gain };
      return true;

    } else if (type === 'fire') {
      // 2. LIBRARY FIREPLACE: Warm low-end ember bed + natural crackling wood pops
      const bufferSize = sampleRate * 3;
      const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      let lastL = 0;
      let lastR = 0;

      for (let i = 0; i < bufferSize; i++) {
        // Warm brown noise for steady hearth flame
        const whiteL = Math.random() * 2 - 1;
        lastL = (lastL + 0.02 * whiteL) / 1.02;
        chL[i] = lastL * 2.2;

        const whiteR = Math.random() * 2 - 1;
        lastR = (lastR + 0.02 * whiteR) / 1.02;
        chR[i] = lastR * 2.2;

        // Natural birch wood crackles & ember snaps
        if (Math.random() < 0.00045) {
          const pop = (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.45);
          chL[i] += pop;
          chR[i] += pop * (0.6 + Math.random() * 0.6);
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.085 * this.volume, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      this.ambientNodes = { noise, gain };
      return true;

    } else if (type === 'cyber') {
      // 3. COSMIC MEDITATION PAD: Lush, rich multi-oscillator chord (A1, E2, A2) with soft chorus
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06 * this.volume, now + 0.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, now);

      // Deep root 55Hz (A1)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55.0, now);

      // Warm 5th 82.4Hz (E2)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(82.4, now);

      // Shimmering octave 110Hz (A2) with gentle detune
      const osc3 = this.ctx.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(110.3, now);

      // Ambient 0.08Hz chorus sweep
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, now);
      lfoGain.gain.setValueAtTime(70, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      this.ambientNodes = { osc: osc1, osc2, osc3, lfo, gain };
      return true;

    } else if (type === 'library') {
      // 4. ACADEMY HALL: Soft room air breath + delicate whisper of parchment pages
      const bufferSize = sampleRate * 3;
      const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      let prevL = 0;
      let prevR = 0;

      for (let i = 0; i < bufferSize; i++) {
        const wL = Math.random() * 2 - 1;
        prevL = (prevL + 0.015 * wL) / 1.015;
        chL[i] = prevL * 1.5;

        const wR = Math.random() * 2 - 1;
        prevR = (prevR + 0.015 * wR) / 1.015;
        chR[i] = prevR * 1.5;

        // Occasional delicate whisper of antique page rustle
        if (Math.random() < 0.00015) {
          const rustle = (Math.random() - 0.5) * 0.28;
          chL[i] += rustle;
          chR[i] += rustle * 0.7;
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(450, now);
      bandpass.Q.setValueAtTime(0.7, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.065 * this.volume, now + 0.4);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      this.ambientNodes = { noise, gain };
      return true;

    } else if (type === 'binaural') {
      // 5. BINAURAL 432 HZ FLOW: Left 432 Hz, Right 438 Hz (6Hz Theta Flow) + 108Hz Sub Pad
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055 * this.volume, now + 0.5);

      // Stereo Panner for true binaural separation
      let panL, panR;
      try {
        panL = this.ctx.createStereoPanner();
        panL.pan.setValueAtTime(-1, now);
        panR = this.ctx.createStereoPanner();
        panR.pan.setValueAtTime(1, now);
      } catch (e) {
        panL = null;
        panR = null;
      }

      // Left ear 432 Hz
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(432.0, now);

      // Right ear 438 Hz (creates soothing 6Hz Theta beat)
      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(438.0, now);

      // Sub-bass 108 Hz warm floor
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(108.0, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.35, now);
      sub.connect(subGain);
      subGain.connect(gain);

      if (panL && panR) {
        oscL.connect(panL);
        panL.connect(gain);
        oscR.connect(panR);
        panR.connect(gain);
      } else {
        oscL.connect(gain);
        oscR.connect(gain);
      }

      gain.connect(this.ctx.destination);

      oscL.start(now);
      oscR.start(now);
      sub.start(now);

      this.ambientNodes = { osc: oscL, oscR, sub, gain };
      return true;
    }
    return false;
  }

  stopAmbient() {
    if (this.ambientNodes) {
      try {
        const now = this.ctx ? this.ctx.currentTime : 0;
        if (this.ambientNodes.gain && this.ctx) {
          this.ambientNodes.gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
        }
        setTimeout(() => {
          try {
            if (this.ambientNodes) {
              if (this.ambientNodes.noise) this.ambientNodes.noise.stop();
              if (this.ambientNodes.osc) this.ambientNodes.osc.stop();
              if (this.ambientNodes.osc2) this.ambientNodes.osc2.stop();
              if (this.ambientNodes.osc3) this.ambientNodes.osc3.stop();
              if (this.ambientNodes.oscR) this.ambientNodes.oscR.stop();
              if (this.ambientNodes.sub) this.ambientNodes.sub.stop();
              if (this.ambientNodes.lfo) this.ambientNodes.lfo.stop();
              if (this.ambientNodes.gain) this.ambientNodes.gain.disconnect();
            }
          } catch (e) {}
          this.ambientNodes = null;
        }, 160);
      } catch (e) {
        this.ambientNodes = null;
      }
    }
    this.currentAmbient = null;
  }
}

window.soundEngine = new AudioEngine();
