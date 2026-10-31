/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SpeechHelper {
  private enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;
  private isAvailable: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isAvailable = true;
      this.loadVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  private loadVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for Malay / Malaysian / Indonesian voices or generic fallback
    const msVoice = voices.find(
      (v) => v.lang.startsWith('ms') || v.lang.startsWith('id') || v.name.toLowerCase().includes('malay')
    );
    this.voice = msVoice || voices[0] || null;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && this.isAvailable) {
      window.speechSynthesis.cancel();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public speak(text: string, rate: number = 0.95) {
    if (!this.enabled || !this.isAvailable) return;

    try {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = this.voice?.lang || 'ms-MY';
      utterance.rate = rate; // slightly slower for MBPK clarity
      utterance.pitch = 1.05; // slightly cheerful tone
      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback if speech synthesis errors
    }
  }

  public stop() {
    if (this.isAvailable) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speech = new SpeechHelper();
