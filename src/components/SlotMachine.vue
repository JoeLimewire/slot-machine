<script setup lang="ts">
import { onMounted, useTemplateRef, ref } from "vue";
import SlotMachine from "../logic/classes/SlotMachine.ts";
import ReelAudio from "../logic/classes/ReelAudio.ts";
import Bet from "./Bet.vue";
import Scoreboard from "./Scoreboard.vue";

const displayRef = useTemplateRef("display");
const displayColumns = useTemplateRef("column");
const resultRef = useTemplateRef("result");
const slotMachine = ref<SlotMachine | null>(null);
const currentBet = ref<number>(1);

onMounted(() => {
    slotMachine.value = new SlotMachine(
        displayRef.value,
        displayColumns.value,
        resultRef.value,
    );

    slotMachine.value.score.addScore(10);

    document.addEventListener("keypress", (k) => {
        if (k.key == " ") {
            k.preventDefault();
            spin();
        }
        if (k.key == "p") {
            const a = new ReelAudio();
            a.playJackpot();
        }
    });
});

const spin = () => {
    slotMachine.value.spin(currentBet.value);
};
</script>

<template>
    <div
        class="-2xl mx-auto my-4 w-full max-w-[80%] overflow-hidden rounded rounded-lg border-3 border-white"
    >
        <section
            class="relative grid aspect-5/3 w-full grid-cols-5 overflow-hidden border-white"
            ref="display"
        >
            <div
                class="will-change-transform backface-hidden"
                ref="column"
                v-for="n in 5"
            ></div>
        </section>
    </div>
    <div class="grid h-50 grid-cols-[auto_1fr_1fr] grid-rows-[1fr_3fr_2fr]">
        <input
            type="button"
            @click="spin"
            value="Spin"
            :disabled="slotMachine?.isSpinning ?? false"
            class="neonderthaw-regular flicker row-span-3 aspect-1/1 h-full cursor-pointer border-2 border-cyan-400 bg-transparent px-8 py-3 text-6xl font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 text-shadow-[0_0_15px_rgba(34,211,238,1)] text-shadow-cyan-400 hover:bg-cyan-100 hover:text-gray-900 hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:text-shadow-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 disabled:shadow-none disabled:grayscale disabled:text-shadow-none disabled:hover:bg-transparent disabled:hover:text-cyan-400 disabled:hover:shadow-none"
        />

        <Bet
            class="row-span-3"
            v-model="currentBet"
            :max="slotMachine?.score.score"
        />
        <Scoreboard
            class="row-span-3"
            :score="slotMachine?.score.score ?? 0"
            :lastWin="slotMachine?.lastWin ?? 0"
            :bet="slotMachine?.bet ?? 0"
        />
    </div>
</template>
