import ReelAudio from "./ReelAudio.ts";
import { ROWS, SPIN, type ReelSymbol } from "../config.ts";

// A single column. Owns its DOM strip, its symbol model (the source of truth),
// its spin animation, and its own audio voice.
export default class Reel {
    private symbols: string[] = []; // title at each strip position (parallels the DOM children)
    private audio = new ReelAudio();

    private element: HTMLDivElement;
    private iconHeight: number;
    private symbolCount: number;
    private repeats: number;
    private pick: () => ReelSymbol;

    constructor(
        element: HTMLDivElement,
        iconHeight: number,
        symbolCount: number,
        repeats: number,
        pick: () => ReelSymbol,
    ) {
        this.element = element;
        this.iconHeight = iconHeight;
        this.symbolCount = symbolCount;
        this.repeats = repeats;
        this.pick = pick;
        this.build();
    }

    private build(): void {
        for (let r = 0; r < this.repeats; r++) {
            for (let i = 0; i < this.symbolCount; i++) {
                const sym = this.pick();
                this.symbols.push(sym.title);
                this.element.appendChild(this.makeIcon(sym));
            }
        }
        // Random, icon-aligned starting offset.
        const start =
            Math.floor(Math.random() * this.symbolCount) * this.iconHeight;
        this.element.style.transform = `translateY(-${start}px)`;
    }

    private makeIcon(sym: ReelSymbol): HTMLImageElement {
        const img = document.createElement("img");
        img.src = sym.src;
        img.classList.add("aspect-1/1", "w-full", "flicker");

        // Random phase so the neon icons don't flicker in unison.
        img.style.animationDelay = `${-Math.random() * 5.52}s`;
        return img;
    }

    private get translateY(): number {
        return new DOMMatrix(getComputedStyle(this.element).transform).f;
    }

    private get topIndex(): number {
        return Math.round(Math.abs(this.translateY) / this.iconHeight);
    }

    // Repaint every off-screen icon with a fresh weighted symbol; leave the
    // icons currently on the board untouched so nothing visibly pops.
    reshuffleHidden(): void {
        const first = this.topIndex;
        const children = this.element.children;
        for (let idx = 0; idx < children.length; idx++) {
            if (idx >= first && idx < first + ROWS) continue;
            const sym = this.pick();
            this.symbols[idx] = sym.title;
            (children[idx] as HTMLImageElement).src = sym.src;
        }
    }

    // Spin the reel; resolves with the visible symbols (top→bottom) once settled.
    spin(index: number): Promise<string[]> {
        const ih = this.iconHeight;
        const delta =
            this.symbolCount * (index + SPIN.baseTurns) +
            Math.round(Math.random() * this.symbolCount);

        const startY = this.translateY;
        const endY = Math.abs(startY + delta * ih) * -1;
        const duration = SPIN.baseMs + delta * SPIN.msPerIcon;

        const anim = this.element.animate(
            [
                { transform: `translateY(${startY}px)` },
                { transform: `translateY(${endY}px)` },
            ],
            {
                duration,
                easing: "cubic-bezier(.6,-0.15,.2,1.05)",
                fill: "forwards",
            },
        );

        this.trackCrossing(startY, endY, anim, (i) =>
            this.audio.playCrossing(i),
        );

        return new Promise((resolve) => {
            anim.onfinish = () => {
                // Set inline style before canceling to prevent a flash back to the pre-animation position.
                this.element.style.transform = `translateY(${endY}px)`;
                // Cancel the fill so inline style takes cascade precedence over the animation.
                anim.cancel();

                const totalIcons = this.symbolCount * this.repeats;
                const topIdx = Math.round(Math.abs(endY) / ih) % totalIcons;

                const visible = this.symbols.slice(topIdx, topIdx + ROWS);
                this.element.style.transform = `translateY(${-topIdx * ih}px)`;

                // console.log("[Reel] topIdx:", topIdx, "visible:", visible);

                resolve(visible);
            };
        });
    }

    // Fire onCross each time a new icon passes, for note timing.
    private trackCrossing(
        startY: number,
        endY: number,
        anim: Animation,
        onCross: (index: number) => void,
    ): void {
        let last = -1;
        const tick = () => {
            const { progress } = anim.effect!.getComputedTiming();
            if (progress == null) return;

            const currentY = startY - progress * (startY - endY);
            const idx =
                Math.floor(Math.abs(currentY) / this.iconHeight) %
                this.symbolCount;
            if (idx !== last) {
                last = idx;
                onCross(idx);
            }
            requestAnimationFrame(tick);
        };
        tick();
    }
}
