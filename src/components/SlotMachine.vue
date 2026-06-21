<script setup lang="ts">
import { onMounted, useTemplateRef, ref } from "vue";
import SlotMachine from "../logic/classes/SlotMachine.ts";

const displayRef = useTemplateRef("display");
const displayColumns = useTemplateRef("column");
const resultRef = useTemplateRef("result");
const slotMachine = ref<SlotMachine | null>(null);

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
    });
});

const spin = () => {
    slotMachine.value?.score.addScore(-1);
    slotMachine.value.spin();
};
</script>

<template>
    <section
        class="grid aspect-5/3 w-full grid-cols-5 overflow-hidden border border-white"
        ref="display"
    >
        <div
            class="inset-shadow-indigo-500 will-change-transform backface-hidden"
            ref="column"
            v-for="n in 5"
        ></div>
    </section>
    <div class="flex h-50 flex-row">
        <input
            type="button"
            @click="spin"
            value="Spin"
            :disabled="slotMachine?.isSpinning ?? false"
            class="neonderthaw-regular reel-icon aspect-1/1 h-full cursor-pointer border-2 border-cyan-400 bg-transparent px-8 py-3 text-6xl font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 text-shadow-[0_0_15px_rgba(34,211,238,1)] text-shadow-cyan-400 hover:bg-cyan-100 hover:text-gray-900 hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:text-shadow-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 disabled:shadow-none disabled:grayscale disabled:text-shadow-none disabled:hover:bg-transparent disabled:hover:text-cyan-400 disabled:hover:shadow-none"
        />
        <span
            ref="score"
            class="monoton-regular reel-icon neonderthaw-regular flex h-full items-center justify-center border-2 border-amber-400 bg-transparent px-8 py-3 text-8xl font-bold text-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.6),0_0_20px_rgba(251,191,36,0.4),inset_0_0_10px_rgba(251,191,36,0.3)] transition-all duration-300 [text-shadow:0_0_5px_rgba(251,191,36,0.8),0_0_10px_rgba(251,191,36,0.8),0_0_20px_rgba(251,191,36,1)]"
        >
            {{ (slotMachine?.score.score ?? 0).toString().padStart(4, "0") }}
        </span>
    </div>
</template>
