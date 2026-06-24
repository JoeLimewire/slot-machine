<script setup lang="ts">
import { onMounted, useTemplateRef, ref } from "vue";
import SlotMachineClass from "../logic/classes/SlotMachine.ts";
import Inventory from "../logic/classes/Inventory.ts";
import ReelAudio from "../logic/classes/ReelAudio.ts";
import type { TypeItem } from "../logic/classes/collections/items.ts";
import Bet from "./Bet.vue";
import Scoreboard from "./Scoreboard.vue";
import Shop from "./Shop.vue";
import Chances from "./Chances.vue";
import Modal from "./Modal.vue";

const displayRef = useTemplateRef("display");
const displayColumns = useTemplateRef("column");
const slotMachine = ref<SlotMachineClass | null>(null);
const currentBet = ref<number>(1);
const showShop = ref(false);
const showChances = ref(false);

const inventory = new Inventory();

onMounted(() => {
    slotMachine.value = new SlotMachineClass(
        displayRef.value,
        displayColumns.value,
        null,
        inventory,
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

const handlePurchase = ({
    item,
    selectedIcon,
}: {
    item: TypeItem;
    selectedIcon?: string;
}) => {
    if (!slotMachine.value) return;
    slotMachine.value.score.addScore(-item.cost);
    inventory.add(item, { selectedIcon });
};

defineExpose({
    openShop: () => (showShop.value = true),
    openChances: () => (showChances.value = true),
});
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
    <div
        class="flex grid flex-col lg:grid-cols-[auto_1fr_1fr] lg:grid-rows-[1fr_3fr_2fr]"
    >
        <input
            type="button"
            @click="spin"
            value="Spin"
            :disabled="slotMachine?.isSpinning ?? false"
            class="neonderthaw-regular flicker row-span-3 h-full cursor-pointer border-2 border-cyan-400 bg-transparent px-8 py-3 text-6xl font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-300 text-shadow-[0_0_15px_rgba(34,211,238,1)] text-shadow-cyan-400 hover:bg-cyan-100 hover:text-gray-900 hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:text-shadow-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 disabled:shadow-none disabled:grayscale disabled:text-shadow-none disabled:hover:bg-transparent disabled:hover:text-cyan-400 disabled:hover:shadow-none lg:aspect-1/1"
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

    <Modal
        v-model="showShop"
        title="shop"
        glow-class="glow-purple neonderthaw-regular"
    >
        <Shop
            :inventory="inventory"
            :score="slotMachine?.score.score ?? 0"
            :symbols="slotMachine?.symbols ?? []"
            @purchase="handlePurchase"
        />
    </Modal>

    <Modal
        v-model="showChances"
        title="chances"
        glow-class="glow-red neonderthaw-regular"
    >
        <Chances :inventory="inventory" />
    </Modal>
</template>
