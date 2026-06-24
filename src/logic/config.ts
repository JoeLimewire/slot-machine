export type WeightedIcon = { title: string; weight: number };
export type SymbolScore = { [title: string]: number };
export type ReelSymbol = { src: string; title: string };

// Draw weights — higher = more common. Rare symbols (seven/bar) seldom appear.
// NOTE: titles must match the baked sprite filenames (assets/symbols-baked/*).
// "cherry" currently does NOT match the "cherries" sprite, so that symbol draws
// at weight 0 — preserved from the original; fix the title if that's unintended.
export const WEIGHTED_SYMBOLS: WeightedIcon[] = [
    { title: "cherries", weight: 40 },
    { title: "lemon", weight: 35 },
    { title: "grapes", weight: 30 },
    { title: "plum", weight: 25 },
    { title: "strawberry", weight: 20 },
    { title: "watermelon", weight: 18 },
    { title: "clover", weight: 15 },
    { title: "diamond", weight: 10 },
    { title: "bell", weight: 6 },
    { title: "horseshoe", weight: 4 },
    { title: "bar", weight: 1.5 },
    { title: "seven", weight: 0.5 },
];

// export const WEIGHTED_SYMBOLS: WeightedIcon[] = [
//     { title: "cherries", weight: 0 },
//     { title: "lemon", weight: 0 },
//     { title: "grapes", weight: 0 },
//     { title: "plum", weight: 0 },
//     { title: "strawberry", weight: 0 },
//     { title: "watermelon", weight: 0 },
//     { title: "clover", weight: 0 },
//     { title: "diamond", weight: 30 },
//     { title: "bell", weight: 0 },
//     { title: "horseshoe", weight: 0 },
//     { title: "bar", weight: 0 },
//     { title: "seven", weight: 0 },
// ];

// Points awarded for a win with these symbols
export const SYMBOL_SCORES = {
    cherries: 5,
    lemon: 6,
    grapes: 7,
    plum: 8,
    strawberry: 10,
    watermelon: 12,
    clover: 15,
    diamond: 20,
    bell: 30,
    horseshoe: 45,
    bar: 120,
    seven: 300,
};

export const REELS = 5; // number of columns
export const ROWS = 3; // visible rows per column (the board height)
export const STRIP_REPEATS = 10; // copies of the symbol set stacked per reel
export const SPIN_STAGGER_MS = 120; // delay between each reel starting to spin
export const WIN_ANIM = 800; // duration of win animation - lines

// Spin distance/timing — preserves the original feel.
// travel (in icons) = symbolCount * (reelIndex + baseTurns) + random(0..symbolCount)
// duration (ms)     = baseMs + travel * msPerIcon
export const SPIN = {
    baseTurns: 2,
    baseMs: 8,
    msPerIcon: 100,
};
