// Web Audio API synthesizer for mission-critical telemetry alerts

class TelemetryAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a tactical high-penetration dual-tone siren
  playSiren(durationMs = 2000) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + durationMs / 1000);

      // Warble alternating pitch between 880Hz and 580Hz
      const startTime = this.ctx.currentTime;
      for (let t = 0; t < durationMs / 1000; t += 0.2) {
        osc.frequency.setValueAtTime(880, startTime + t);
        osc.frequency.setValueAtTime(587.33, startTime + t + 0.1);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio context restricted or unsupported
    }
  }

  // Play ascending synchronic pulse chime
  playChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = this.ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // Audio context restricted
    }
  }

  // Quick UI beep / click feedback
  playBeep(freq = 950, duration = 0.08) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context restricted
    }
  }

  // Play subtle lub-dub acoustic pulse
  playHeartbeat(isStress = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Lub (S1 sound)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(isStress ? 85 : 65, t);
      osc1.frequency.exponentialRampToValueAtTime(32, t + 0.07);
      gain1.gain.setValueAtTime(0.04, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.09);

      // Dub (S2 sound) ~130ms later
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(isStress ? 95 : 75, t + 0.13);
      osc2.frequency.exponentialRampToValueAtTime(36, t + 0.20);
      gain2.gain.setValueAtTime(0.03, t + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.21);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.13);
      osc2.stop(t + 0.22);
    } catch {
      // Audio restricted
    }
  }

  private loopInterval: number | null = null;

  // Start continuous urgent alert beeps until explicitly stopped
  startLoopingAlarm() {
    if (this.loopInterval !== null) return;
    this.initContext();

    const beep = () => {
      if (this.isMuted) return;
      try {
        this.initContext();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.19);
      } catch {
        // Audio error
      }
    };

    beep();
    this.loopInterval = window.setInterval(beep, 250);
  }

  // Stop continuous alert beeps
  stopLoopingAlarm() {
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  isAlarmActive(): boolean {
    return this.loopInterval !== null;
  }
}

export const soundManager = new TelemetryAudio();
