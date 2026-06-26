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
import SpinLever from "./SpinLever.vue";

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
    <section class="flex flex-col justify-between">
        <div
            class="neon-box glow-blue glow-border glow-box mx-auto mb-4 flex w-full flex-row overflow-hidden rounded rounded-lg"
        >
            <div
                class="relative m-auto grid !aspect-5/3 h-full min-w-0 flex-1 grid-cols-5 overflow-hidden rounded-xl"
                ref="display"
            >
                <div
                    class="will-change-transform backface-hidden"
                    ref="column"
                    v-for="n in 5"
                ></div>
            </div>
            <SpinLever
                @pull="spin"
                v-bind:isSpinning="slotMachine?.isSpinning"
            />
        </div>

        <div class="flex flex-row">
            <Bet
                class="w-full"
                v-model="currentBet"
                :max="slotMachine?.score.score"
            />
            <Scoreboard
                class="w-full"
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
    </section>
</template>
