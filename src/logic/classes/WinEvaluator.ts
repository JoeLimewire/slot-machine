import { SYMBOL_SCORES, ROWS, type SymbolScore } from "../config.ts";

export type Win = {
    type: "vertical" | "horizontal" | "diagonal" | "jackpot" | "per-visible";
    location: { start: [x: number, y: number]; end: [x: number, y: number] };
    description: string;
    points: number;
};

// Pure win evaluation: takes the visible grid and returns the wins found.
// grid[col] = [top, middle, bottom] symbols for that column.
export default class WinEvaluator {
    evaluate(
        grid: string[][],
        scores: SymbolScore = SYMBOL_SCORES,
        nonChaining: string[] = [],
        perVisible: { [symbol: string]: number } = {},
    ): Win[] {
        const wins: Win[] = [];
        const row_arr = Array.from({ length: ROWS }, (_, i) => i);

        const scoreFor = (symbol: string) => scores[symbol] ?? 0;
        const chains = (symbol: string) => !nonChaining.includes(symbol);

        for (let i = 0; i < grid.length; i++) {
            const col = grid[i];

            // Vertical: all three rows in a column match.
            if (col[0] === col[1] && col[1] === col[2] && chains(col[0])) {
                const symbol = col[0];
                wins.push({
                    type: "vertical",
                    location: { start: [i, 0], end: [i, 2] },
                    description: `Vertical win on column ${i + 1}: ${col.join(" ")}`,
                    points: scoreFor(symbol),
                });
            }

            // Lines that span three consecutive columns starting at i.
            if (i < grid.length - 2) {
                const a = grid[i];
                const b = grid[i + 1];
                const c = grid[i + 2];

                // Horizontal across each row.
                for (const r of row_arr) {
                    if (a[r] === b[r] && b[r] === c[r] && chains(a[r])) {
                        wins.push({
                            type: "horizontal",
                            location: { start: [i, r], end: [i + 2, r] },
                            description: `Horizontal win on row ${r + 1}: ${a[r]} ${b[r]} ${c[r]}`,
                            points: scoreFor(a[r]),
                        });
                    }
                }

                // Diagonal "\" — top-left to bottom-right.
                if (a[0] === b[1] && b[1] === c[2] && chains(a[0])) {
                    const symbol = a[0];
                    wins.push({
                        type: "diagonal",
                        location: { start: [i, 0], end: [i + 2, 2] },
                        description: `Diagonal win (\\) starting at column ${i + 1}: ${a[0]} ${b[1]} ${c[2]}`,
                        points: scoreFor(symbol),
                    });
                }

                // Diagonal "/" — bottom-left to top-right.
                if (a[2] === b[1] && b[1] === c[0] && chains(a[2])) {
                    const symbol = a[2];
                    wins.push({
                        type: "diagonal",
                        location: { start: [i, 2], end: [i + 2, 0] },
                        description: `Diagonal win (/) starting at column ${i + 1}: ${a[2]} ${b[1]} ${c[0]}`,
                        points: scoreFor(symbol),
                    });
                }
            }
        }

        // Jackpot: all 15 cells identical — non-chaining symbols cannot jackpot.
        const firstSymbol = grid[0][0];
        const isJackpot =
            chains(firstSymbol) &&
            grid.every((col) => col.every((cell) => cell === firstSymbol));

        if (isJackpot) {
            wins.push({
                type: "jackpot",
                location: { start: [0, 0], end: [grid.length - 1, ROWS - 1] },
                description: `JACKPOT!`,
                points: scoreFor(firstSymbol) * grid.length * ROWS,
            });
        }

        // Per-visible: symbols that score per occurrence rather than per win-line.
        for (const [symbol, pts] of Object.entries(perVisible)) {
            const count = grid.flat().filter((s) => s === symbol).length;
            if (count > 0) {
                for (let i = 0; i <= grid.length - 1; i++) {
                    for (let j = 0; j <= grid[0].length - 1; j++) {
                        console.log(grid[i][j]);
                        if (grid[i][j] === symbol) {
                            wins.push({
                                type: "per-visible",
                                location: {
                                    start: [i, j],
                                    end: [i, j],
                                },
                                description: `${symbol} ×${count}`,
                                points: pts,
                            });
                        }
                    }
                }
            }
        }

        return wins;
    }
}
