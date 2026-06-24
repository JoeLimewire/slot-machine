<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(
    defineProps<{ score?: number; lastWin?: number; bet?: number }>(),
    {
        score: 0,
        lastWin: 0,
        bet: 1,
    },
);

function fmt(n: number) {
    return n >= 1_000_000 ? n.toExponential(2) : n.toString();
}

const scoreString = computed(() => {
    if (props.score >= 1_000_000) return props.score.toExponential(1);
    return props.score.toString().padStart(4, "0");
});

const scoreFontClass = computed(() => {
    const len = scoreString.value.length;
    if (len <= 6) return "text-6xl lg:text-7xl";
    if (len <= 8) return "text-5xl lg:text-6xl";
    return "text-xl lg:text-2xl";
});

const equationString = computed(
    () =>
        `+${fmt(props.lastWin)} x ${fmt(props.bet)} = ${fmt(props.lastWin * props.bet)}`,
);

const equationFontClass = computed(() => {
    const len = equationString.value.length;
    if (len <= 18) return "text-2xl";
    if (len <= 26) return "text-lg";
    if (len <= 34) return "text-sm";
    return "text-xs";
});
</script>

<template>
    <div
        class="major-mono-display-regular glow-amber glow-border glow-box flex flex-col gap-2 py-4"
    >
        <div>
            <p
                class="digital glow-text m-y-auto m-auto text-2xl transition-all duration-300"
            >
                <span class="flicker">score</span>
            </p>
        </div>
        <div class="flex items-center justify-center">
            <span
                class="digital glow-text transition-all duration-300"
                :class="scoreFontClass"
            >
                {{ scoreString }}
            </span>
        </div>
        <div class="flex items-center justify-center">
            <span
                class="digital glow-blue glow-text transition-all duration-300"
                :class="equationFontClass"
            >
                {{ equationString }}
            </span>
        </div>
    </div>
</template>
