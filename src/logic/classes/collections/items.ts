import type { WeightedIcon, SymbolScore } from "../../config.ts";

export type ItemHooks = {
    modifyWeights?: (
        weights: WeightedIcon[],
        selectedIcon?: string,
    ) => WeightedIcon[];
    modifyScores?: (scores: SymbolScore, selectedIcon?: string) => SymbolScore;
};

export type TypeItem = {
    title: string;
    type: "Permanent" | "Temporary";
    description: string;
    cost: number;
    maxUses?: number;
    requiresIconSelection?: boolean;
    hooks: ItemHooks;
};

const Items: TypeItem[] = [
    {
        title: "Cherry Pip",
        description:
            "Replace all cherries with their pip. Pips score nothing but score +1 when they appear.",
        type: "Permanent",
        cost: 5,
        hooks: {
            modifyScores: (scores) => ({ ...scores, cherries: 1 }),
        },
    },
    {
        title: "Weighted Reel",
        description:
            "Select an icon to be weighed on the reel (the icon is more likely to appear)",
        type: "Permanent",
        cost: 5,
        requiresIconSelection: true,
        hooks: {
            modifyWeights: (weights, selectedIcon) =>
                weights.map((w) =>
                    w.title === selectedIcon
                        ? { ...w, weight: w.weight * 1.5 }
                        : w,
                ),
        },
    },
    {
        title: "Overcharged",
        description: "Select an icon to score +1",
        type: "Permanent",
        cost: 5,
        requiresIconSelection: true,
        hooks: {
            modifyScores: (scores, selectedIcon) => {
                if (!selectedIcon) return scores;
                return {
                    ...scores,
                    [selectedIcon]: (scores[selectedIcon] ?? 0) + 1,
                };
            },
        },
    },
    {
        title: "Rabbits Foot",
        description:
            "The next 3 spins have a 10% chance of forcing a jackpot on a random symbol",
        type: "Temporary",
        cost: 5,
        maxUses: 3,
        hooks: {
            modifyWeights: (weights) => {
                if (Math.random() >= 0.1) return weights;
                const eligible = weights.filter((w) => w.weight > 0);
                const chosen =
                    eligible[Math.floor(Math.random() * eligible.length)];
                return weights.map((w) => ({
                    ...w,
                    weight: w.title === chosen.title ? 1 : 0,
                }));
            },
        },
    },
];

export default Items;
