import { REELS, ROWS } from "../config.ts";

export default class CanvasController {
    private canvas: HTMLCanvasElement;

    constructor(displayRef: HTMLDivElement) {
        const canvas = document.createElement("canvas");
        canvas.style.cssText =
            "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
        displayRef.appendChild(canvas);
        this.canvas = canvas;
    }

    private resize(): CanvasRenderingContext2D {
        const W = this.canvas.offsetWidth;
        const H = this.canvas.offsetHeight;
        this.canvas.width = W;
        this.canvas.height = H;
        return this.canvas.getContext("2d")!;
    }

    clear(): void {
        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLine(location: {
        start: [x: number, y: number];
        end: [x: number, y: number];
    }): void {
        const ctx = this.resize();
        const W = this.canvas.width;
        const H = this.canvas.height;

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

    drawJackpot(): Promise<void> {
        return new Promise((resolve) => {
            const DURATION = 2500;
            const start = performance.now();

            const frame = (now: number) => {
                const t = Math.min((now - start) / DURATION, 1);

                const ctx = this.resize();
                const W = this.canvas.width;
                const H = this.canvas.height;

                ctx.clearRect(0, 0, W, H);

                const hue = (t * 1080) % 360;

                // Pulsing coloured overlay
                const pulse = 0.06 + Math.sin(t * Math.PI * 12) * 0.04;
                ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${pulse})`;
                ctx.fillRect(0, 0, W, H);

                // Two diagonal cross lines
                ctx.lineWidth = 6;
                ctx.lineCap = "round";
                ctx.strokeStyle = "white";
                ctx.shadowBlur = 20;

                for (let i = 0; i < 2; i++) {
                    ctx.shadowColor = `hsl(${(hue + i * 180) % 360}, 100%, 65%)`;
                    ctx.beginPath();
                    if (i === 0) {
                        ctx.moveTo(0, 0);
                        ctx.lineTo(W, H);
                    } else {
                        ctx.moveTo(W, 0);
                        ctx.lineTo(0, H);
                    }
                    ctx.stroke();
                }

                // "JACKPOT!" text
                const fontSize = Math.round(Math.min(W, H) * 0.18);
                ctx.font = `bold ${fontSize}px "Major Mono Display", monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
                ctx.shadowBlur = 30;
                ctx.fillStyle = "white";
                ctx.fillText("JACKPOT", W / 2, H / 2);

                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    this.clear();
                    resolve();
                }
            };

            requestAnimationFrame(frame);
        });
    }
}
