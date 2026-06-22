<script setup lang="ts">
import { computed } from "vue";
import { WEIGHTED_SYMBOLS, SYMBOL_SCORES } from "../logic/config";

const totalWeight = computed(() =>
    WEIGHTED_SYMBOLS.reduce((sum, s) => sum + s.weight, 0),
);

const getSrc = (title: string) =>
    new URL(`../assets/symbols/${title}.svg`, import.meta.url).href;

const rows = computed(() =>
    WEIGHTED_SYMBOLS.map((s) => ({
        title: s.title,
        src: getSrc(s.title),
        weight: s.weight,
        chancePct: (s.weight / totalWeight.value) * 100,
        chance: ((s.weight / totalWeight.value) * 100).toFixed(1) + "%",
        score: SYMBOL_SCORES[s.title] ?? 0,
    })),
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
                <td class="num-col score-cell">{{ row.score }}x</td>
                <td class="chance-col chance-cell">
                    <div class="chance-bar-wrap">
                        <div
                            class="chance-bar"
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
    /* text-transform: uppercase; */
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
    /* text-transform: capitalize; */
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
    transition: width 0.3s ease;
    min-width: 2px;
    max-width: 80px;
    width: 0;
}

.chance-label {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
    color: var(--text);
    white-space: nowrap;
}
</style>
