import { SYMBOL_SCORES } from "../config.ts";

export type Win = {
    type: "vertical" | "horizontal" | "diagonal";
    description: string;
    points: number;
};

// Pure win evaluation: takes the visible grid and returns the wins found.
// grid[col] = [top, middle, bottom] symbols for that column.
export default class WinEvaluator {
    evaluate(grid: string[][]): Win[] {
        const wins: Win[] = [];
        const scoreFor = (symbol: string) => SYMBOL_SCORES[symbol] ?? 0;

        for (let i = 0; i < grid.length; i++) {
            const col = grid[i];

            // Vertical: all three rows in a column match.
            if (col[0] === col[1] && col[1] === col[2]) {
                const symbol = col[0];
                wins.push({
                    type: "vertical",
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
                if (a[1] === b[1] && b[1] === c[1]) {
                    const symbol = a[1];
                    wins.push({
                        type: "horizontal",
                        description: `Horizontal win on row ${i + 1}: ${a[1]} ${b[1]} ${c[1]}`,
                        points: scoreFor(symbol),
                    });
                }

                // Diagonal "\" — top-left to bottom-right.
                if (a[0] === b[1] && b[1] === c[2]) {
                    const symbol = a[0];
                    wins.push({
                        type: "diagonal",
                        description: `Diagonal win (\\) starting at column ${i + 1}: ${a[0]} ${b[1]} ${c[2]}`,
                        points: scoreFor(symbol),
                    });
                }

                // Diagonal "/" — bottom-left to top-right.
                if (a[2] === b[1] && b[1] === c[0]) {
                    const symbol = a[2];
                    wins.push({
                        type: "diagonal",
                        description: `Diagonal win (/) starting at column ${i + 1}: ${a[2]} ${b[1]} ${c[0]}`,
                        points: scoreFor(symbol),
                    });
                }
            }
        }

        return wins;
    }
}
