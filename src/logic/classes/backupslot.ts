import * as Tone from "tone";
import { ref, type Ref } from "vue";

class SlotMachine {

    displayRef = ref<HTMLDivElement | null>(null);
    displayColumns = ref<Array<HTMLDivElement>>([]);
    resultRef = ref<HTMLDivElement | null>(null);

    isSpinning: boolean = false;
    result: string[] = [];

    constructor(displayRef: Ref<HTMLDivElement | null>, displayColumns: Ref<Array<HTMLDivElement>>, resultRef: Ref<HTMLDivElement | null>) {
        this.displayRef = displayRef;
        this.displayColumns = displayColumns;
        this.resultRef = resultRef;

        const icons = this.importIcons();
        this.appendIcons(icons);
    }

    icon_order: string[] = [
        "bar",
        "bell",
        "cherry",
        "clover",
        "diamond",
        "grapes",
        "horseshoe",
        "lemon",
        "plum",
        "seven",
        "strawberry",
        "watermelon",
        "bar",
    ];

    info = {
        reel_length: 0,
        icon_height: 0,
    };

    public spin() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.displayColumns.forEach((col, i) => {
            this.roll(col, i);
        });
    }


    importIcons() {
        const modules = import.meta.glob("../../assets/symbols/*.svg", {
            eager: true,
            import: "default",
        });
        return Object.values(modules);
    }

    appendIcons(icons: Array<HTMLImageElement>) {
        // Puts the icons onto the columns
        const imgWidth: number = this.displayRef.clientWidth / 5;

        const elements = icons.map((i) => {
            const img = document.createElement("img");
            img.src = i;
            img.classList.add("aspect-1/1", "w-full");
            // img.style.width = `${imgWidth}px`;
            return img;
        });

        this.displayColumns.forEach((col) => {
            for (let i: number = 0; i < 10; i++) {
                elements.forEach((element) => {
                    col.appendChild(element.cloneNode(true));
                });
            }
            // Randomise their starting heights
            const col_height = elements.length * imgWidth;

            let random = (Math.random() * col_height) % col_height;
            random = Math.round(random / imgWidth) * imgWidth;

            col.style.transform = `translateY(-${random}px)`;
        });
        this.info.reel_length = elements.length * imgWidth;
        this.info.number_of_icons = elements.length;
        this.info.icon_height = imgWidth;
    }

    private trackCrossing(startY: number, endY: number, anim: Animation, onCross: (index: number) => void) {
        const { icon_height, number_of_icons } = this.info;
        let last = -1;
        const tick = () => {
            const { progress } = anim.effect!.getComputedTiming();

            if (progress == null) return;
            const traveled = progress * (startY - endY);
            const currentY = startY - traveled;
            const idx = Math.floor(Math.abs(currentY) / icon_height) % number_of_icons;
            if (idx !== last) { last = idx; onCross(idx); }
            requestAnimationFrame(tick);
        };
        tick();
    };

    private roll(reel: HTMLDivElement, offset: number = 0): void {
        const { icon_height, number_of_icons } = this.info;

        const delta =
            number_of_icons * (offset + 2) +
            Math.round(Math.random() * number_of_icons);

        const reelStyle = getComputedStyle(reel);
        const startY = new DOMMatrix(reelStyle.transform).f; // Get current y value
        const endY = Math.abs(startY + delta * icon_height) * -1;

        const transition_time = 8 + delta * 100;

        // reel.style.transition = `transform ${transition_time}ms cubic-bezier(.4,.14,.58,1)`;
        // reel.style.transform = `translateY(${endY}px)`;

        const anim = reel.animate(
            [{ transform: `translateY(${startY}px)` },
            { transform: `translateY(${endY}px)` }],
            {
                duration: transition_time, easing: "cubic-bezier(.6,-0.15,.2,1.05)",
                fill: "forwards"
            },
        );

        const synth = new Tone.MonoSynth({
            oscillator: {
                type: "square"
            },
            envelope: {
                attack: 0,
                release: 0.2,
            }
        }).toDestination();

        const notes = [
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

        this.trackCrossing(startY, endY, anim, (index) => {
            synth.volume.value = -notes.length + index - 5;
            const note = notes[index % notes.length];
            synth.triggerAttackRelease(note, "64n");
        });

        setTimeout(() => {
            let imgIndex = Math.abs((startY / icon_height) % number_of_icons) + 1;

            // console.log(this.icon_order[imgIndex], imgIndex);
            // resultRef.value.textContent =
            //     resultRef.value.textContent + icon_order[imgIndex].toUpperCase() + ", ";
            this.result.push(this.icon_order[imgIndex]);
            let newPos = (imgIndex - 1) * icon_height * -1;

            reel.style.transition = `transform ${0}ms`;
            reel.style.transform = `translateY(${newPos}px)`;

            if (offset === 4) {
                this.isSpinning = false;
            }
        }, transition_time);
    };

}

export default SlotMachine;