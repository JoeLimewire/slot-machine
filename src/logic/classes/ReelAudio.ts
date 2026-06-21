import * as Tone from "tone";

// One descending scale; the crossing index picks the note.
const NOTES = [
    "B5", "G5", "E5", "C5", "D5",
    "B4", "G4", "E4", "C4", "D4",
    "B3", "G3", "E3", "C3", "D3",
];

// A single reel voice. Created once and reused across spins (the old code made
// a new synth per reel per spin and never disposed it, leaking audio nodes).
export default class ReelAudio {
    private synth: Tone.MonoSynth;

    constructor() {
        this.synth = new Tone.MonoSynth({
            oscillator: { type: "sine" },
            volume: -15,
        }).toDestination();
    }

    // Resume the audio context. Must be called from a user gesture (a spin).
    static unlock(): Promise<void> {
        return Tone.start();
    }

    playCrossing(index: number): void {
        this.synth.triggerAttackRelease(NOTES[index % NOTES.length], "64n");
    }

    dispose(): void {
        this.synth.dispose();
    }
}
