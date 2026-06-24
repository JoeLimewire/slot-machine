<script setup lang="ts">
import { useTemplateRef } from "vue";
import SlotMachine from "./components/SlotMachine.vue";

const gameRef = useTemplateRef<{ openShop: () => void; openChances: () => void }>("game");
</script>

<template>
    <SlotMachine ref="game" />
    <div class="neonderthaw-regular flex h-50 flex-row">
        <input
            type="button"
            @click="gameRef?.openChances()"
            value="Chances"
            class="flicker glow-button glow-red glow-text glow-box glow-border flex-1 text-6xl"
        />

        <input
            type="button"
            @click="gameRef?.openShop()"
            value="Shop"
            class="neonderthaw-regular flicker glow-button glow-purple glow-text glow-box glow-border flex-1 text-6xl"
        />
    </div>
</template>
