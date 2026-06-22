<script setup lang="ts">
withDefaults(defineProps<{ score?: number; lastWin?: number }>(), {
    score: 0,
    lastWin: 0,
});
</script>

<template>
    <div
        class="major-mono-display-regular glow-amber glow-border glow-box score-grid h-full items-center justify-center p-4"
    >
        <div>
            <p
                class="digital glow-text border text-2xl transition-all duration-300"
            >
                <span class="flicker">score</span>
            </p>
        </div>
        <div>
            <span
                class="digital glow-text text-6xl transition-all duration-300"
            >
                {{ score.toString().padStart(4, "0") }}
            </span>
        </div>
        <div>
            <span class="digital glow-blue glow-text px-4 py-3 text-2xl">
                +{{ lastWin }}
            </span>
        </div>
    </div>
</template>

<style>
.score-grid {
    display: grid;
    grid-template-columns: 1;
    grid-template-rows: 1fr 3fr 2fr;
}
</style>
