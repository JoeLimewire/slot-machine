import * as Tone from "tone";

// One descending scale; the crossing index picks the note.
const NOTES = [
    "B5",
    "G5",
    "E5",
    "C5",
    "D5",
    "B4",
    "G4",
    "E4",
    "C4",
    "D4",
    "B3",
    "G3",
    "E3",
    "C3",
    "D3",
];

// Audio for one reel. Every reel needs the crossing voice (a cheap MonoSynth),
// but only the shared win/jackpot instance needs the effects chain (reverb +
// delay + extra synths). Building that chain eagerly meant all 5 reels each
// spun up an idle reverb that ran every audio block for nothing — enough
// baseline load to make the jackpot underrun. It's now built on first use (see
// ensureFx); reels only ever call playCrossing, so theirs is never built.
export default class ReelAudio {
    private synth: Tone.MonoSynth; // crossings + the jackpot run

    // Win/jackpot effects, built lazily on the first playWin/playJackpot.
    private winSynth?: Tone.PolySynth;
    private chordSynth?: Tone.PolySynth;
    private fxSend?: Tone.Gain; // gate into the jackpot effects
    private pingPong?: Tone.PingPongDelay; // stereo delay
    private reverb?: Tone.Reverb;

    volume = -20;

    constructor() {
        // The crossing voice, dry to the speakers. This is all a reel needs.
        this.synth = new Tone.MonoSynth({
            oscillator: { type: "square" },
            volume: -15 + this.volume,
        }).toDestination();
    }

    // Build the win/jackpot effects chain once, on first use.
    private ensureFx(): void {
        if (this.fxSend) return;

        // --- jackpot effects chain ---
        this.reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();
        this.pingPong = new Tone.PingPongDelay({
            delayTime: "16n", // echoes locked to the run's rhythm
            feedback: 0.35, // how many repeats
            wet: 1, // fully wet; dry path is separate below
        }).connect(this.reverb);
        this.fxSend = new Tone.Gain(0).connect(this.pingPong); // starts closed (silent)
        this.synth.connect(this.fxSend); // tap the run in; inaudible while gain = 0

        this.winSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            volume: -15 + this.volume,
            // Default release is 1s, so during the accelerating win arpeggio
            // ~36 voices ring at once and the render thread underruns (audible
            // as the jackpot cutting out). A short release frees each voice
            // almost immediately, keeping the peak ~13 voices.
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.15 },
        }).toDestination();
        this.winSynth.maxPolyphony = 128;

        this.chordSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "fatsawtooth", count: 8, spread: 30 },
            volume: -20 + this.volume,
            envelope: { attack: 0.1 },
        }).toDestination();
    }

    // Resume the audio context. Must be called from a user gesture (a spin).
    static unlock(): Promise<void> {
        return Tone.start();
    }

    playWin(pitch: number): void {
        this.ensureFx();

        const midi = 32 + pitch;
        const note = Tone.Frequency(midi, "midi").toNote();
        this.winSynth!.triggerAttackRelease(note, "16n");

        const midic = 36 + pitch;
        const notec = Tone.Frequency(midic, "midi").toNote();
        this.winSynth!.triggerAttackRelease(notec, "16n");

        const midib = 60 + pitch;
        const noteb = Tone.Frequency(midib, "midi").toNote();
        this.winSynth!.triggerAttackRelease(noteb, "8n");
    }

    playJackpot(): void {
        this.ensureFx();

        const now = Tone.now();
        const step = 0.03;
        const up = ["A4", "C5", "E5", "G5", "A5", "C6", "E6", "G6"];
        const down = [...up].reverse();

        const repeats = 10;
        const cycle = up.length * step;
        const total = cycle * repeats;

        // open the effects send for this jackpot only
        this.fxSend!.gain.setValueAtTime(1, now);

        // fade fx to avoid pops in audio
        const off = now + total;
        this.fxSend!.gain.setValueAtTime(1, off);
        this.fxSend!.gain.linearRampToValueAtTime(0, off + 0.02);

        for (let r = 0; r < repeats; r++) {
            const offset = now + r * cycle;
            down.forEach((note, i) => {
                this.synth.triggerAttackRelease(note, "32n", offset + i * step);
            });
        }

        const chord = ["A4", "C4", "E4", "G4", "B4", "D5"];
        this.chordSynth!.triggerAttackRelease(chord, total, now);
        this.chordSynth!.volume.setValueAtTime(-10, now);
        this.chordSynth!.volume.linearRampToValueAtTime(-40, now + total);
    }

    playCrossing(index: number): void {
        this.synth.triggerAttackRelease(NOTES[index % NOTES.length], "32n");
    }

    dispose(): void {
        this.synth.dispose();
        this.winSynth?.dispose();
        this.chordSynth?.dispose();
        this.fxSend?.dispose();
        this.pingPong?.dispose();
        this.reverb?.dispose();
    }
}
