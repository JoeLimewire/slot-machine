import { markRaw } from "vue";
import Score from "./Score.ts";
import Reel from "./Reel.ts";
import ReelAudio from "./ReelAudio.ts";
import WinEvaluator from "./WinEvaluator.ts";
import {
    WEIGHTED_SYMBOLS,
    REELS,
    ROWS,
    STRIP_REPEATS,
    SPIN_STAGGER_MS,
    WIN_ANIM,
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
    private canvas: HTMLCanvasElement;

    constructor(
        displayRef: HTMLDivElement,
        displayColumns: HTMLDivElement[],
        _resultRef: HTMLDivElement,
    ) {
        const symbols = this.loadSymbols();
        const iconHeight = displayRef.clientWidth / REELS;

        const canvas = document.createElement("canvas");
        canvas.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
        displayRef.appendChild(canvas);
        this.canvas = canvas;

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

        this.score.addScore(-1);

        this.isSpinning = true;
        this.result = [];
        this.lastWin = 0;

        const audio = new ReelAudio();

        try {
            await ReelAudio.unlock();

            const ctx = this.canvas.getContext("2d")!;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Fresh symbols off-screen before anything moves.
            this.reels.forEach((reel) => reel.reshuffleHidden());

            // Stagger each reel's start, then collect each column's symbols.
            const grid = await Promise.all(
                this.reels.map((reel, i) =>
                    this.delay(i * SPIN_STAGGER_MS).then(() => reel.spin(i)),
                ),
            );

            this.result = grid;
            let waitInterval = WIN_ANIM;

            const wins = this.evaluator.evaluate(grid);
            let i = 0;

            const winLoop = (): Promise<void> => {
                return new Promise((resolve) => {
                    const step = () => {
                        setTimeout(() => {
                            const win = wins[i];
                            this.drawLine(win.location);
                            this.score.addScore(win.points);
                            this.lastWin += win.points;
                            audio.playWin(i);
                            i++;
                            waitInterval /= 1.15;

                            if (i < wins.length) {
                                step(); // recurse the inner fn — same promise
                            } else {
                                console.log("resolved");
                                resolve(); // the one resolve the caller awaits
                            }
                        }, waitInterval);
                    };

                    step(); // kick it off
                });
            };

            await winLoop();

            audio.playJackpot();
        } finally {
            // Always re-enable the button, even if a spin throws.
            this.isSpinning = false;
        }
    }

    private loadSymbols(): ReelSymbol[] {
        const modules = import.meta.glob("../../assets/symbols-baked/*.webp", {
            eager: true,
            import: "default",
        });

        const images = Object.values(modules).map((src) => ({
            src: src as string,
            title: (src as string).split("/").pop()?.split(".")[0] ?? "",
        }));
        return images;
    }

    drawLine(location: {
        start: [x: number, y: number];
        end: [x: number, y: number];
    }) {
        const ctx = this.canvas.getContext("2d")!;
        const W = this.canvas.offsetWidth;
        const H = this.canvas.offsetHeight;
        this.canvas.width = W;
        this.canvas.height = H;

        const cellW = W / REELS;
        const cellH = H / ROWS;

        const toPixel = ([col, row]: [number, number]) =>
            [(col + 0.5) * cellW, (row + 0.5) * cellH] as const;

        const [sx, sy] = toPixel(location.start);
        const [ex, ey] = toPixel(location.end);

        const neon = `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.shadowColor = neon;
        ctx.shadowBlur = 15;
        ctx.stroke();
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
