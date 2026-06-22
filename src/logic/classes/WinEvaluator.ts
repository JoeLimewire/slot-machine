import { SYMBOL_SCORES, ROWS } from "../config.ts";

export type Win = {
    type: "vertical" | "horizontal" | "diagonal";
    location: {start: [x: number, y:number], end: [x: number, y:number]};
    description: string;
    points: number;
};

// Pure win evaluation: takes the visible grid and returns the wins found.
// grid[col] = [top, middle, bottom] symbols for that column.
export default class WinEvaluator {
    evaluate(grid: string[][]): Win[] {
        const wins: Win[] = [];
        const row_arr = Array.from({ length: ROWS }, (_, i) => i); // iterable array for each row -> [0,1,2]

        const scoreFor = (symbol: string) => SYMBOL_SCORES[symbol] ?? 0;

        for (let i = 0; i < grid.length; i++) {
            const col = grid[i];

            // Vertical: all three rows in a column match.
            if (col[0] === col[1] && col[1] === col[2]) {
                const symbol = col[0];
                wins.push({
                    type: "vertical",
                    location: {start: [i, 0], end:[i, 2]},
                    description: `Vertical win on column ${i + 1}: ${col.join(" ")}`,
                    points: scoreFor(symbol),
                });
            }

            // Lines that span three consecutive columns starting at i.
            if (i < grid.length - 2) {
                const a = grid[i];
                const b = grid[i + 1];
                const c = grid[i + 2];

                // Horizontal across the middle row.
                 for (const r of row_arr) {
                    if (a[r] === b[r] && b[r] === c[r]) {
                        wins.push({
                            type: "horizontal",
                            location: { start: [i, r], end: [i + 2, r] },                                                                                                                                              description: `Horizontal win on row ${r + 1}: ${a[r]} ${b[r]} ${c[r]}`,
                            points: scoreFor(a[r]),                                                                                                                                                               });
                    }
                }

                // Diagonal "\" — top-left to bottom-right.
                if (a[0] === b[1] && b[1] === c[2]) {
                    const symbol = a[0];
                    wins.push({
                        type: "diagonal",
                        location: {start: [i, 0], end: [i+2,2]},
                        description: `Diagonal win (\\) starting at column ${i + 1}: ${a[0]} ${b[1]} ${c[2]}`,
                        points: scoreFor(symbol),
                    });
                }

                // Diagonal "/" — bottom-left to top-right.
                if (a[2] === b[1] && b[1] === c[0]) {
                    const symbol = a[2];
                    wins.push({
                        type: "diagonal",
                        location: {start: [i, 2], end: [i+2,0]},
                        description: `Diagonal win (/) starting at column ${i + 1}: ${a[2]} ${b[1]} ${c[0]}`,
                        points: scoreFor(symbol),
                    });
                }
            }
        }

        return wins;
    }
}
