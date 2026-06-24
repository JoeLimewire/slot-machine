<script setup lang="ts">
import { computed } from "vue";
import { WEIGHTED_SYMBOLS, SYMBOL_SCORES, type SymbolScore } from "../logic/config";
import type Inventory from "../logic/classes/Inventory.ts";

const props = defineProps<{ inventory?: Inventory }>();

const effectiveWeights = computed(() => {
    if (!props.inventory) return WEIGHTED_SYMBOLS;
    // Touch the reactive array so this computed re-runs when items change.
    props.inventory.activeItems.length;
    return props.inventory.getEffectiveWeights(WEIGHTED_SYMBOLS);
});

const effectiveScores = computed((): SymbolScore => {
    if (!props.inventory) return SYMBOL_SCORES;
    props.inventory.activeItems.length;
    return props.inventory.getEffectiveScores(SYMBOL_SCORES);
});

const totalWeight = computed(() =>
    effectiveWeights.value.reduce((sum, s) => sum + s.weight, 0),
);

const getSrc = (title: string) =>
    new URL(`../assets/symbols/${title}.svg`, import.meta.url).href;

const rows = computed(() =>
    effectiveWeights.value
        .filter((s) => s.weight > 0)
        .map((s) => {
            const baseWeight = WEIGHTED_SYMBOLS.find((w) => w.title === s.title)?.weight ?? 0;
            const baseScore = (SYMBOL_SCORES as SymbolScore)[s.title] ?? 0;
            const score = effectiveScores.value[s.title] ?? 0;
            return {
                title: s.title,
                src: getSrc(s.title),
                chancePct: (s.weight / totalWeight.value) * 100,
                chance: ((s.weight / totalWeight.value) * 100).toFixed(1) + "%",
                score,
                weightUp: s.weight > baseWeight,
                weightDown: s.weight < baseWeight,
                scoreUp: score > baseScore,
                scoreDown: score < baseScore,
            };
        }),
);

const maxChance = computed(() =>
    Math.max(...rows.value.map((r) => r.chancePct)),
);
</script>

<template>
    <table class="symbol-table">
        <thead>
            <tr>
                <th>symbol</th>
                <th>name</th>
                <th class="num-col">score</th>
                <th class="chance-col">chance</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in rows" :key="row.title">
                <td class="icon-cell">
                    <img :src="row.src" :alt="row.title" class="symbol-icon" />
                </td>
                <td class="name-cell">{{ row.title }}</td>
                <td
                    class="num-col score-cell"
                    :class="{
                        'score-up': row.scoreUp,
                        'score-down': row.scoreDown,
                    }"
                >
                    {{ row.score }}x
                </td>
                <td class="chance-col chance-cell">
                    <div class="chance-bar-wrap">
                        <div
                            class="chance-bar"
                            :class="{
                                'chance-bar--up': row.weightUp,
                                'chance-bar--down': row.weightDown,
                            }"
                            :style="{
                                width: (row.chancePct / maxChance) * 100 + '%',
                            }"
                        ></div>
                        <span class="chance-label">{{ row.chance }}</span>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.symbol-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

thead tr {
    border-bottom: 1px solid rgba(248, 113, 113, 0.4);
}

thead th {
    padding: 0.6rem 1rem;
    text-align: left;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: rgb(248, 113, 113);
    text-shadow: 0 0 8px rgba(248, 113, 113, 0.6);
}

tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.15s;
}

tbody tr:last-child {
    border-bottom: none;
}

tbody tr:hover {
    background: rgba(248, 113, 113, 0.06);
}

tbody td {
    padding: 0.5rem 1rem;
    vertical-align: middle;
}

.icon-cell {
    width: 3.5rem;
    padding-right: 0;
}

.symbol-icon {
    width: 2.5rem;
    height: 2.5rem;
    display: block;
}

.name-cell {
    color: var(--text-h);
    font-weight: 500;
}

.num-col {
    text-align: right;
}

.score-cell {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: rgb(248, 113, 113);
    text-shadow: 0 0 6px rgba(248, 113, 113, 0.5);
    white-space: nowrap;
    transition: color 0.2s;
}

.score-up {
    color: rgb(34, 211, 238);
    text-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

.score-down {
    color: rgb(251, 191, 36);
    text-shadow: 0 0 6px rgba(251, 191, 36, 0.5);
}

.chance-col {
    width: 10rem;
}

.chance-bar-wrap {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.chance-bar {
    height: 6px;
    border-radius: 3px;
    background: rgba(248, 113, 113, 0.7);
    box-shadow: 0 0 6px rgba(248, 113, 113, 0.5);
    flex-shrink: 0;
    transition: width 0.3s ease, background 0.2s;
    min-width: 2px;
    max-width: 80px;
    width: 0;
}

.chance-bar--up {
    background: rgba(34, 211, 238, 0.8);
    box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

.chance-bar--down {
    background: rgba(251, 191, 36, 0.7);
    box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
}

.chance-label {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
    color: var(--text);
    white-space: nowrap;
}
</style>
