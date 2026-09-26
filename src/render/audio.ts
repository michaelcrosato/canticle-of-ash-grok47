export class AshAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  music: GainNode | null = null;
  muted = false;
  volume = 0.7;
  private started = false;

  ensure(): void {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain();
    this.music.gain.value = 0.18;
    this.music.connect(this.master);
    this.started = true;
    this.drone(55, 0.05);
    this.drone(82.5, 0.03);
    this.drone(110, 0.02);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.volume;
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.master && !this.muted) this.master.gain.value = v;
  }

  private drone(freq: number, gain: number): void {
    if (!this.ctx || !this.music) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(this.music);
    o.start();
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain = 0.2): void {
    if (!this.ctx || !this.master || this.muted) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  miss(): void {
    this.tone(520, 0.08, 'triangle', 0.08);
  }

  hit(): void {
    this.tone(90, 0.12, 'sine', 0.3);
    this.tone(140, 0.08, 'square', 0.05);
  }

  spell(): void {
    this.tone(440, 0.15, 'sine', 0.12);
    this.tone(660, 0.2, 'sine', 0.08);
  }

  reward(): void {
    this.tone(392, 0.12, 'sine', 0.12);
    setTimeout(() => this.tone(523, 0.18, 'sine', 0.12), 90);
  }

  ui(): void {
    this.tone(660, 0.05, 'sine', 0.06);
  }

  get active(): boolean {
    return this.started;
  }
}
