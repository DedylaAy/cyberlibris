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

  // --- PROCEDURAL AMBIENT GENERATOR ---
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

    if (type === 'rain') {
      // Pink/White noise through bandpass
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08 * this.volume, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.ambientNodes = { noise, gain };
      return true;
    } else if (type === 'cyber') {
      // Low drone (55Hz) with subtle LFO
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06 * this.volume, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.ambientNodes = { osc, gain };
      return true;
    } else if (type === 'binaural') {
      // 432Hz focus tone
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05 * this.volume, now);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.ambientNodes = { osc, gain };
      return true;
    } else if (type === 'fire') {
      // Warm crackling fireplace & cozy library hearth
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.03 * white) / 1.03;
        data[i] = last * 2.5;
        if (Math.random() < 0.0015) {
          data[i] += (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.5);
        }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08 * this.volume, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.ambientNodes = { noise, gain };
      return true;
    }
    return false;
  }

  stopAmbient() {
    if (this.ambientNodes) {
      try {
        if (this.ambientNodes.noise) this.ambientNodes.noise.stop();
        if (this.ambientNodes.osc) this.ambientNodes.osc.stop();
        if (this.ambientNodes.gain) this.ambientNodes.gain.disconnect();
      } catch (e) {}
      this.ambientNodes = null;
    }
    this.currentAmbient = null;
  }
}

window.soundEngine = new AudioEngine();
