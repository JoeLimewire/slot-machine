<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(defineProps<{ max?: number; step?: number }>(), {
    max: 100,
    step: 1,
});

const bet = defineModel<number>({ default: 1 });
const shake = ref(false);

function bump() {
    shake.value = true;
    requestAnimationFrame(() => (shake.value = true));
}

function decrease() {
    const next = Math.max(1, bet.value - props.step);
    if (next === bet.value) return bump();
    bet.value = next;
}

function increase() {
    const next = Math.min(props.max, bet.value + props.step);
    if (next === bet.value) return bump();
    bet.value = next;
}

function maxBet() {
    bet.value = props.max;
}

function halfBet() {
    bet.value = props.max / 2;
}

function minBet() {
    bet.value = 1;
}

watch(
    () => props.max,
    (newMax) => {
        if (bet.value > newMax) bet.value = Math.max(1, newMax);
    },
);
</script>

<template>
    <div
        class="flicker bet-container glow-green glow-border glow-box major-mono-display-regular bet-grid"
        :class="{ 'bet-shake': shake }"
        @animationend="shake = false"
    >
        <div>
            <p
                class="digital glow-text border text-2xl transition-all duration-300"
            >
                <span class="flicker">bet</span>
            </p>
        </div>

        <div class="flex flex-row">
            <button
                class="glow-button bet-arrow glow-text"
                aria-label="Decrease bet"
                @click="decrease"
            >
                &#9664;
            </button>

            <div
                class="digital glow-text bet-value flex flex-col items-center justify-evenly text-6xl"
            >
                <span>{{ bet.toString().padStart(3, "0") }}</span>
            </div>

            <button
                class="glow-button bet-arrow glow-text"
                aria-label="Increase bet"
                @click="increase"
            >
                &#9654;
            </button>
        </div>

        <!-- bottom row: spans all three columns -->
        <div class="bet-presets flex text-2xl">
            <button
                class="glow-button glow-text"
                aria-label="Minimum bet"
                @click="minBet"
            >
                min
            </button>
            <button
                class="glow-button glow-text"
                aria-label="Half bet"
                @click="halfBet"
            >
                half
            </button>
            <button
                class="glow-button glow-text"
                aria-label="Maximum bet"
                @click="maxBet"
            >
                max
            </button>
        </div>
    </div>
</template>

<style>
.bet-grid {
    display: grid;
    grid-template-columns: 1;
    grid-template-rows: 1fr 3fr 2fr;
}

/* the presets row spans all three columns */
.bet-presets {
    grid-column: 1 / -1; /* from first line to last → full width */
}

/* let each preset button share the width equally */
.bet-presets > button {
    flex: 1;
}
.bet-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0.75rem 1.25rem;
    font-size: 3rem;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
    transition: all 300ms;
}

.glow-button {
    height: 100%;
    width: 100%;
    cursor: pointer;
    transition: all 300ms;
    display: flex;
    align-items: center;
    align-content: center;
    align-self: center;
    justify-content: center;
}

/* fill-and-invert on hover, matching the spin button */
.glow-button:hover {
    background-color: white;
    color: #111;
    text-shadow: none;
    box-shadow: 0 0 30px rgba(var(--glow), 0.8);
}

@keyframes bet-flicker {
    0% {
        opacity: 1;
    }
    10% {
        opacity: 0.2;
    }
    20% {
        opacity: 1;
    }
    30% {
        opacity: 0.3;
    }
    40% {
        opacity: 1;
    }
    55% {
        opacity: 0.15;
    }
    70% {
        opacity: 1;
    }
    85% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
}

.bet-shake {
    animation: bet-flicker 0.4s steps(1, end);
}
</style>
