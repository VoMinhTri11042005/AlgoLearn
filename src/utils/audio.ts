import { PolySynth, Synth, FeedbackDelay, Reverb, start, now as toneNow } from 'tone';

class AudioSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playSuccess() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // A sweet climbing major fifth arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.08 },
      { freq: 783.99, delay: 0.16 },
      { freq: 1046.50, delay: 0.24 }
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm woodwind-like timbre
      osc.frequency.setValueAtTime(note.freq, now + note.delay);

      // Sweet volume envelope: smooth fade-in, decay-out
      gain.gain.setValueAtTime(0, now + note.delay);
      gain.gain.linearRampToValueAtTime(0.12, now + note.delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + 0.55);
    });
  }

  async playGoalAchieved() {
    // 1. Try playing with the premium Tone.js library
    try {
      await start();
      const now = toneNow();

      // Create a majestic spatial chain: Reverb + Delay for professional game cues!
      const delay = new FeedbackDelay("16n", 0.25).toDestination();
      const reverb = new Reverb({ decay: 1.6, wet: 0.35 }).toDestination();
      
      // Lush PolySynth for the supporting triumphant chord progression
      const polySynth = new PolySynth(Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.08, decay: 0.15, sustain: 0.7, release: 0.5 }
      }).connect(reverb);
      polySynth.volume.value = -14; // balanced under the lead

      // High-register sparkling lead Synth for a majestic melody
      const leadSynth = new Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.04, decay: 0.12, sustain: 0.5, release: 0.4 }
      }).connect(reverb).connect(delay);
      leadSynth.volume.value = -8;

      // Sparkling chime/metal Synth for celestial visual sparkles
      const chimeSynth = new Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
      }).connect(delay);
      chimeSynth.volume.value = -12;

      // --- VICTORY FANFARE SCORE ---
      // Beat 1 (0.00s): C Major chord + high E5 start
      polySynth.triggerAttackRelease(["C4", "E4", "G4"], "4n", now);
      leadSynth.triggerAttackRelease("E5", "4n", now);

      // Beat 2 (0.35s): F Major chord + proud A5 climb
      polySynth.triggerAttackRelease(["F4", "A4", "C5"], "4n", now + 0.35);
      leadSynth.triggerAttackRelease("A5", "4n", now + 0.35);

      // Beat 3 (0.70s): G Major chord + soaring B5 step
      polySynth.triggerAttackRelease(["G4", "B4", "D5"], "4n", now + 0.70);
      leadSynth.triggerAttackRelease("B5", "4n", now + 0.70);

      // Beat 4 (1.05s - 2.50s): Grande C Major Add 9 Chord and soaring C6 core resolution!
      polySynth.triggerAttackRelease(["C4", "E4", "G4", "B4", "D5"], "2n", now + 1.05);
      leadSynth.triggerAttackRelease("C6", "2n", now + 1.05);

      // Celestial sparkle glissando running upward to the heavens!
      const glissando = [
        { note: "E6", t: 1.10 },
        { note: "G6", t: 1.18 },
        { note: "B6", t: 1.26 },
        { note: "C7", t: 1.34 },
        { note: "E7", t: 1.42 },
        { note: "G7", t: 1.50 },
        { note: "C8", t: 1.58 }
      ];
      glissando.forEach((sparkle) => {
        chimeSynth.triggerAttackRelease(sparkle.note, "8n", now + sparkle.t);
      });

      // Cleanup synthesizer objects after finished to prevent memory leaks or audio node clutter
      setTimeout(() => {
        polySynth.dispose();
        leadSynth.dispose();
        chimeSynth.dispose();
        delay.dispose();
        reverb.dispose();
      }, 4000);

      return; // Succeeded playing Tone.js jingle!
    } catch (e) {
      console.warn("Tone.js victory jingle failed to play or load, playing Web Audio fallback:", e);
    }

    // 2. Fallback: High-fidelity Multi-voice Web Audio API Synthesizer (Chords + Escalation)
    const ctx = this.init();
    if (!ctx) return;

    const fallbackNow = ctx.currentTime;

    const chords = [
      // Beat 1: C Major Chords
      { freqs: [130.81, 261.63, 329.63, 392.00], delay: 0, duration: 0.35 }, // C3, C4, E4, G4
      // Beat 2: F Major Chords
      { freqs: [174.61, 349.23, 440.00, 523.25], delay: 0.35, duration: 0.35 }, // F3, F4, A4, C5
      // Beat 3: G Major Chords
      { freqs: [196.00, 392.00, 493.88, 587.33], delay: 0.70, duration: 0.35 }, // G3, G4, B4, D5
      // Beat 4: C Major 9 Chords
      { freqs: [130.81, 261.63, 329.63, 392.00, 493.88, 587.33], delay: 1.05, duration: 1.40 } // C3, C4, E4, G4, B4, D5
    ];

    chords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm triangle wave for chord structure
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, fallbackNow + chord.delay);

        // Volume envelope
        gain.gain.setValueAtTime(0, fallbackNow + chord.delay);
        gain.gain.linearRampToValueAtTime(0.04, fallbackNow + chord.delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, fallbackNow + chord.delay + chord.duration - 0.01);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(fallbackNow + chord.delay);
        osc.stop(fallbackNow + chord.delay + chord.duration);
      });
    });

    // Soaring high melody over chords
    const melody = [
      { freq: 659.25, delay: 0, duration: 0.35 }, // E5
      { freq: 880.00, delay: 0.35, duration: 0.35 }, // A5
      { freq: 987.77, delay: 0.70, duration: 0.35 }, // B5
      { freq: 1046.50, delay: 1.05, duration: 1.40 } // C6
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine'; // Pure sweet bell-like melody
      osc.frequency.setValueAtTime(note.freq, fallbackNow + note.delay);

      gain.gain.setValueAtTime(0, fallbackNow + note.delay);
      gain.gain.linearRampToValueAtTime(0.08, fallbackNow + note.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, fallbackNow + note.delay + note.duration - 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(fallbackNow + note.delay);
      osc.stop(fallbackNow + note.delay + note.duration);
    });

    // Glitter cascades
    const sparkles = [
      { freq: 1318.51, delay: 1.10 }, // E6
      { freq: 1567.98, delay: 1.18 }, // G6
      { freq: 1975.53, delay: 1.26 }, // B6
      { freq: 2093.00, delay: 1.34 }, // C7
      { freq: 2637.02, delay: 1.42 }, // E7
      { freq: 3135.96, delay: 1.50 }  // G7
    ];

    sparkles.forEach((sparkle) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(sparkle.freq, fallbackNow + sparkle.delay);

      gain.gain.setValueAtTime(0, fallbackNow + sparkle.delay);
      gain.gain.linearRampToValueAtTime(0.05, fallbackNow + sparkle.delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, fallbackNow + sparkle.delay + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(fallbackNow + sparkle.delay);
      osc.stop(fallbackNow + sparkle.delay + 0.28);
    });
  }
}

export const getSoundEnabled = (): boolean => {
  try {
    return localStorage.getItem('algolearn_sound_enabled') !== 'false';
  } catch {
    return true;
  }
};

export const setSoundEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem('algolearn_sound_enabled', enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to save sound settings:', error);
  }
};

export const playAudioCue = (type: 'success' | 'goal'): void => {
  try {
    const isSoundEnabled = getSoundEnabled();
    if (!isSoundEnabled) return;

    const synth = new AudioSynth();
    if (type === 'success') {
      synth.playSuccess();
    } else if (type === 'goal') {
      synth.playGoalAchieved();
    }
  } catch (error) {
    console.warn('Audio Context is blocked or not supported:', error);
  }
};
