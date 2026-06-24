<script setup lang="ts">
import type { ReelSymbol } from "../logic/config.ts";

defineProps<{ symbols: ReelSymbol[] }>();

const emit = defineEmits<{
    select: [title: string];
    cancel: [];
}>();
</script>

<template>
    <div>
        <p class="mb-4 text-sm text-white/60">Select a symbol:</p>
        <div class="flex flex-wrap justify-center gap-3">
            <button
                v-for="sym in symbols"
                :key="sym.title"
                @click="emit('select', sym.title)"
                class="flex cursor-pointer flex-col items-center gap-1 rounded border border-white/20 bg-transparent p-3 capitalize text-white/70 transition-all hover:border-purple-400/60 hover:bg-purple-400/10 hover:text-white"
            >
                <img :src="sym.src" :alt="sym.title" class="h-10 w-10 object-contain" />
                <span class="text-xs">{{ sym.title }}</span>
            </button>
        </div>
        <button
            @click="emit('cancel')"
            class="mt-5 w-full cursor-pointer border-none bg-transparent text-sm text-white/30 hover:text-white/60"
        >
            Cancel
        </button>
    </div>
</template>
