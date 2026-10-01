/**
 * Dźwięki i wibracje dla aplikacji mobilnej na Androidzie (Web Audio API & Haptics)
 * Działa w 100% offline bez zewnętrznych plików audio.
 */

export const soundService = {
  playTimerBeep(frequencies = [880, 1100], durationMs = 120): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      let startTime = ctx.currentTime;

      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + durationMs / 1000);

        startTime += durationMs / 1000 + 0.05;
      });
    } catch {
      // Audio może być zablokowane przed pierwszą interakcją użytkownika - ignorujemy cicho
    }
  },

  triggerHaptic(pattern: number[] = [100, 50, 100]): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignorujemy na urządzeniach bez wsparcia wibracji
    }
  },

  notifyTimerFinished(): void {
    this.playTimerBeep([587.33, 880, 1174.66], 150);
    this.triggerHaptic([150, 80, 200]);
  }
};
