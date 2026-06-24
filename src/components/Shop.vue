<script setup lang="ts">
import { ref } from "vue";
import Items, { type TypeItem } from "../logic/classes/collections/items.ts";
import type Inventory from "../logic/classes/Inventory.ts";
import type { ReelSymbol } from "../logic/config.ts";
import SymbolPicker from "./SymbolPicker.vue";

const props = defineProps<{
    inventory: Inventory;
    score: number;
    symbols: ReelSymbol[];
}>();

const emit = defineEmits<{
    purchase: [{ item: TypeItem; selectedIcon?: string }];
}>();

const pendingItem = ref<TypeItem | null>(null);

const buyItem = (item: TypeItem) => {
    if (props.score < item.cost) return;
    if (item.requiresIconSelection) {
        pendingItem.value = item;
    } else {
        emit("purchase", { item });
    }
};

const onSymbolSelected = (title: string) => {
    if (!pendingItem.value) return;
    emit("purchase", { item: pendingItem.value, selectedIcon: title });
    pendingItem.value = null;
};
</script>

<template>
    <!-- Symbol picker shown after buying an item that needs icon selection -->
    <div v-if="pendingItem">
        <p class="mb-1 text-sm text-white/50">
            Buying:
            <span class="font-bold text-white">{{ pendingItem.title }}</span>
        </p>
        <SymbolPicker
            :symbols="symbols"
            @select="onSymbolSelected"
            @cancel="pendingItem = null"
        />
    </div>

    <div v-else>
        <!-- Items for sale -->
        <div class="mb-6 grid grid-cols-2 gap-3">
            <div
                v-for="item in Items"
                :key="item.title"
                class="flex flex-col gap-2 rounded border border-white/20 p-3"
            >
                <div class="flex items-start justify-between gap-2">
                    <span class="text-sm font-bold text-white">{{ item.title }}</span>
                    <span
                        class="shrink-0 rounded px-1.5 py-0.5 text-xs"
                        :class="
                            item.type === 'Permanent'
                                ? 'border border-cyan-400/40 text-cyan-400'
                                : 'border border-amber-400/40 text-amber-400'
                        "
                    >
                        {{ item.type }}
                    </span>
                </div>
                <p class="flex-1 text-xs leading-relaxed text-white/60">
                    {{ item.description }}
                </p>
                <button
                    @click="buyItem(item)"
                    :disabled="score < item.cost"
                    class="w-full rounded border py-1.5 text-sm transition-all"
                    :class="
                        score >= item.cost
                            ? 'cursor-pointer border-purple-400 bg-transparent text-purple-300 hover:bg-purple-400/20'
                            : 'cursor-not-allowed border-white/20 bg-transparent text-white/30'
                    "
                >
                    {{ item.cost }} pts
                </button>
            </div>
        </div>

        <!-- Active inventory -->
        <div v-if="inventory.activeItems.length > 0">
            <p class="mb-2 text-xs uppercase tracking-widest text-white/40">Inventory</p>
            <div class="flex flex-col gap-1">
                <div
                    v-for="entry in inventory.activeItems"
                    :key="entry.item.title + (entry.selectedIcon ?? '')"
                    class="flex items-center justify-between rounded border border-white/10 px-3 py-1.5 text-sm text-white/80"
                >
                    <span>
                        {{ entry.item.title }}
                        <span v-if="entry.selectedIcon" class="ml-1 text-xs text-white/40">
                            ({{ entry.selectedIcon }})
                        </span>
                    </span>
                    <span class="text-xs text-white/40">
                        <template v-if="entry.remainingUses !== undefined">
                            {{ entry.remainingUses }} spin{{ entry.remainingUses !== 1 ? 's' : '' }} left
                        </template>
                        <template v-else-if="entry.quantity > 1">×{{ entry.quantity }}</template>
                    </span>
                </div>
            </div>
        </div>
        <p v-else class="text-center text-sm text-white/30">No items yet.</p>
    </div>
</template>
