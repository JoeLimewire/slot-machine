<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps({
    isSpinning: Boolean,
});

const emit = defineEmits(["pull"]);

const trackHeight = 320;
const handleHeight = 56;
const maxY = trackHeight - handleHeight;

const y = ref(0);
const dragging = ref(false);
const startPointerY = ref(0);
const startLeverY = ref(0);
const hasPulled = ref(false);

const handleScale = computed(() => {
    const trackCenter = trackHeight / 2;
    const handleCenter = y.value + handleHeight / 2;

    const maxDist = trackHeight / 2;
    const dist = Math.abs(handleCenter - trackCenter);

    const t = 1 - dist / maxDist;

    // scale range: 1 → 1.10
    return 1 + t * 0.125;
});
const handleStyle = computed(() => ({
    transform: `translateY(${y.value}px) scale(${handleScale.value})`,
    transition: dragging.value
        ? "none"
        : "transform 250ms cubic-bezier(.2,1.2,.4,1)",
}));

const rodStyle = computed(() => {
    const trackCenter = trackHeight / 2;
    const handleCenter = y.value + handleHeight / 2;

    const pastCentre = !(handleCenter - trackCenter < 0);

    return {
        top: `0px`,
        height: `${Math.abs(handleCenter - trackCenter)}px`,
        transform: `translateX(-50%) translateY(${Math.min(handleCenter, trackCenter)}px)`,
        transition: dragging.value
            ? "none"
            : "all 250ms cubic-bezier(.2,1.2,.4,1)",

        background: pastCentre
            ? "linear-gradient(to top, rgba(255,255,255,1) 0%, transparent 100%)"
            : "linear-gradient(to bottom, rgba(255,255,255,1) 0%, transparent 100%)",
    };
});

function pointerDown(e: PointerEvent) {
    dragging.value = true;
    hasPulled.value = false;
    startPointerY.value = e.clientY;
    startLeverY.value = y.value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function pointerMove(e: PointerEvent) {
    if (!dragging.value) return;

    const delta = e.clientY - startPointerY.value;
    y.value = Math.max(0, Math.min(maxY, startLeverY.value + delta));

    if (y.value >= maxY && !hasPulled.value) {
        hasPulled.value = true;
        emit("pull");
    }
}

function pointerUp() {
    dragging.value = false;
    y.value = 0;
}
</script>

<template>
    <div class="flicker my-auto flex flex-col justify-center">
        <!-- // lights -->
        <div class="mx-auto flex flex-row items-center">
            <div
                :class="`glow-box my-5 h-5 w-5 border border-gray-600 ${props.isSpinning ? 'flicker glow-red glow-border bg-red-50' : ''}`"
            ></div>
            <div
                :class="`glow-box my-5 h-5 w-5 border border-gray-600 ${props.isSpinning ? '' : 'flicker glow-green glow-border bg-green-50'}`"
            ></div>
        </div>
        <!-- //handle -->
        <div
            :class="`flicker relative w-20 select-none`"
            :style="{ height: `${trackHeight}px` }"
        >
            <!-- Track -->
            <div
                class="track flicker absolute top-0 left-1/2 h-full w-6 -translate-x-1/2 rounded-full"
            />
            <div
                class="rod absolute top-0 left-1/2 w-2 rounded-full bg-gray-300"
                :style="rodStyle"
            />

            <!-- Handle -->
            <div
                :class="`handle glow-red absolute left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg`"
                :style="handleStyle"
                @pointerdown="pointerDown"
                @pointermove="pointerMove"
                @pointerup="pointerUp"
                @pointercancel="pointerUp"
                @lostpointercapture="pointerUp"
            ></div>
        </div>
    </div>
</template>

<style>
.handle {
    cursor: grab;
    background: var(--bg);
    border: 1px solid #ffeef2;

    /* outline: red 2px solid; */

    box-shadow:
        inset 0px 0px 0px 2px #ff2e63,
        inset 0px 0px 30px 1px #ff2e63,
        0px 0px 0px 2px #ff2e63,
        0px 0px 15px 1px #ff2e63;
}

.handle:active {
    cursor: grabbing;
}

.track {
    border: 1px solid #eefdff;
    box-shadow:
        /* inset 0px 0px 0px 1px #35e7ff, */
        0px 0px 0px 1px #35e7ff,
        0px 0px 15px 1px #35e7ff;
}
</style>
