<script setup lang="ts">
import { ref } from "vue";

import SlotMachine from "./components/SlotMachine.vue";
import Chances from "./components/Chances.vue";
import Shop from "./components/Shop.vue";
import Modal from "./components/Modal.vue";

const showChances = ref(false);
const showShop = ref(false);
</script>

<template>
    <SlotMachine />
    <div class="neonderthaw-regular flex h-50 flex-row">
        <input
            type="button"
            @click="showChances = true"
            value="Chances"
            class="flicker glow-button glow-red glow-text glow-box glow-border flex-1 text-6xl"
        />

        <input
            type="button"
            @click="showShop = true"
            value="Shop"
            class="neonderthaw-regular flicker glow-button glow-purple glow-text glow-box glow-border flex-1 text-6xl"
        />
    </div>

    <Modal
        v-model="showChances"
        title="chances"
        glow-class="glow-red neonderthaw-regular "
    >
        <Chances />
    </Modal>

    <Modal
        v-model="showShop"
        title="shop"
        glow-class="glow-purple neonderthaw-regular "
    >
        <Shop />
    </Modal>
</template>
