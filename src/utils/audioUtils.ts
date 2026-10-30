// Web Audio API Sound Effects & Playback Utilities

class AudioEffectManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Quiz Correct Ding-Dong Chime (골든벨 정답 딩동댕)
  playCorrectChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.65);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Quiz Wrong Buzzer (땡 소리)
  playWrongBuzzer() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(146.83, now); // D3
      osc.frequency.linearRampToValueAtTime(110.0, now + 0.35); // A2
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {
      console.warn('Audio buzzer error:', e);
    }
  }

  // Dramatic Tension Drum / Gongs (오늘의 난제 텐션)
  playTensionBoom() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.9);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    } catch (e) {
      console.warn('Tension boom error:', e);
    }
  }

  // Grand Fanfare for Title Congratulations (골든벨 명예 팡파르)
  playGrandFanfare() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const chord = [
        { f: 523.25, t: 0, d: 0.25 },     // C5
        { f: 659.25, t: 0.15, d: 0.25 },  // E5
        { f: 783.99, t: 0.3, d: 0.3 },   // G5
        { f: 1046.5, t: 0.45, d: 0.8 },  // C6
        { f: 1318.51, t: 0.45, d: 0.8 }, // E6
      ];
      chord.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + d + 0.05);
      });
    } catch (e) {
      console.warn('Fanfare error:', e);
    }
  }
}

export const sfx = new AudioEffectManager();

// Download base64 audio as a .wav file
export function downloadWav(base64Data: string, filename: string) {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download WAV:', err);
  }
}

// Convert Base64 to Blob URL for fast smooth playback
export function base64ToBlobUrl(base64Data: string, mimeType = 'audio/wav'): string {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}
