import { markRaw } from "vue";
import Score from "./Score.ts";
import Reel from "./Reel.ts";
import ReelAudio from "./ReelAudio.ts";
import WinEvaluator from "./WinEvaluator.ts";
import {
    WEIGHTED_SYMBOLS,
    REELS,
    STRIP_REPEATS,
    SPIN_STAGGER_MS,
    type ReelSymbol,
} from "../config.ts";

// Orchestrates the reels: builds them, runs a staggered spin, gathers the grid,
// evaluates wins, and updates the score. All rendering/animation/audio lives in
// Reel; all win logic lives in WinEvaluator.
export default class SlotMachine {
    score = new Score();
    isSpinning = false;
    result: string[][] = [];
    lastWin = 0; // points awarded by the most recent spin

    private reels: Reel[] = [];
    private evaluator = new WinEvaluator();

    constructor(
        displayRef: HTMLDivElement,
        displayColumns: HTMLDivElement[],
        _resultRef: HTMLDivElement,
    ) {
        const symbols = this.loadSymbols();
        const iconHeight = displayRef.clientWidth / REELS;

        // markRaw: keep Vue from making the reels (and their Tone audio nodes)
        // reactive. Tone uses #private fields that throw when accessed through a
        // reactive Proxy. SlotMachine itself stays reactive so isSpinning/score/
        // result still drive the template.
        this.reels = displayColumns.map((col) =>
            markRaw(
                new Reel(col, iconHeight, symbols.length, STRIP_REPEATS, () =>
                    this.pickWeighted(symbols),
                ),
            ),
        );
    }

    async spin(): Promise<void> {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.result = [];
        this.lastWin = 0;

        try {
            await ReelAudio.unlock();

            // Fresh symbols off-screen before anything moves.
            this.reels.forEach((reel) => reel.reshuffleHidden());

            // Stagger each reel's start, then collect each column's symbols.
            const grid = await Promise.all(
                this.reels.map((reel, i) =>
                    this.delay(i * SPIN_STAGGER_MS).then(() => reel.spin(i)),
                ),
            );

            this.result = grid;

            for (const win of this.evaluator.evaluate(grid)) {
                console.log(win.description);
                this.score.addScore(win.points);
                this.lastWin += win.points;
            }
        } finally {
            // Always re-enable the button, even if a spin throws.
            this.isSpinning = false;
        }
    }

    private loadSymbols(): ReelSymbol[] {
        // Baked raster sprites (glow rendered in) — the live feGaussianBlur SVGs
        // were too expensive to re-rasterise per frame. The neon flicker those
        // SVGs had is re-created with a CSS opacity animation (see .reel-icon in
        // style.css). Regenerate with: npm run bake-symbols
        const modules = import.meta.glob("../../assets/symbols-baked/*.webp", {
            eager: true,
            import: "default",
        });
        return Object.values(modules).map((src) => ({
            src: src as string,
            title: (src as string).split("/").pop()?.split(".")[0] ?? "",
        }));
    }

    // Weighted selection with replacement, by WEIGHTED_SYMBOLS.
    private pickWeighted(symbols: ReelSymbol[]): ReelSymbol {
        const weightOf = (title: string) =>
            WEIGHTED_SYMBOLS.find((w) => w.title === title)?.weight ?? 0;
        const total = symbols.reduce((sum, s) => sum + weightOf(s.title), 0);

        let r = Math.random() * total;
        for (const s of symbols) {
            r -= weightOf(s.title);
            if (r < 0) return s;
        }
        return symbols[symbols.length - 1];
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
