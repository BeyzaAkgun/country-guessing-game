// soundEffects.ts - Game sound effects utility
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createOscillator(
    frequency: number,
    type: OscillatorType = 'sine',
    duration: number = 0.2,
    volume: number = 0.3,
    startOffset: number = 0
  ) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const start = this.audioContext.currentTime + startOffset;
    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, start);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  // Correct answer — happy ascending chime
  playCorrect() {
    if (!this.audioContext || !this.enabled) return;
    this.createOscillator(523.25, 'sine', 0.15, 0.20, 0.00); // C5
    this.createOscillator(659.25, 'sine', 0.15, 0.20, 0.08); // E5
    this.createOscillator(783.99, 'sine', 0.25, 0.20, 0.16); // G5
  }

  // Wrong answer — low descending buzz
  playWrong() {
    if (!this.audioContext || !this.enabled) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // New hint revealed — soft ascending two-tone bell
  playHint() {
    if (!this.audioContext || !this.enabled) return;
    this.createOscillator(800,  'sine', 0.15, 0.15, 0.00);
    this.createOscillator(1000, 'sine', 0.20, 0.12, 0.06);
  }

  // Country selected on map — subtle tick
  playClick() {
    if (!this.audioContext || !this.enabled) return;
    this.createOscillator(600, 'sine', 0.05, 0.10);
  }

  // Achievement unlock — ascending scale
  playAchievement() {
    if (!this.audioContext || !this.enabled) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      this.createOscillator(freq, 'sine', 0.20, 0.15, i * 0.08);
    });
  }

  // New round starts — punchy double blip
  playRoundStart() {
    if (!this.audioContext || !this.enabled) return;
    this.createOscillator(440, 'sine', 0.10, 0.18, 0.00); // A4
    this.createOscillator(550, 'sine', 0.12, 0.18, 0.10); // C#5
  }

  // Victory — triumphant fanfare
  playVictory() {
    if (!this.audioContext || !this.enabled) return;
    // C  E  G  C(oct) — bright major chord arpeggiated
    this.createOscillator(523.25,  'sine',    0.35, 0.22, 0.00);
    this.createOscillator(659.25,  'sine',    0.35, 0.22, 0.10);
    this.createOscillator(783.99,  'sine',    0.35, 0.22, 0.20);
    this.createOscillator(1046.50, 'sine',    0.50, 0.20, 0.30);
    // Add a shimmer on top
    this.createOscillator(1318.51, 'triangle', 0.30, 0.10, 0.35);
  }

  // Defeat — low descending minor fall
  playDefeat() {
    if (!this.audioContext || !this.enabled) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Two slow descending notes
    const notes = [
      { freq: 311.13, start: 0.00 },  // Eb4
      { freq: 233.08, start: 0.22 },  // Bb3
    ];

    notes.forEach(({ freq, start }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      osc.frequency.linearRampToValueAtTime(freq * 0.88, now + start + 0.35);

      gain.gain.setValueAtTime(0.20, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.45);

      osc.start(now + start);
      osc.stop(now + start + 0.5);
    });
  }

  // Toggle sound on/off — returns new state
  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled()               { return this.enabled; }
  setEnabled(v: boolean)    { this.enabled = v; }
}

export const soundEffects = new SoundEffects();