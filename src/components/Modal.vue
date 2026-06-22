<script setup lang="ts">
const show = defineModel<boolean>({ default: false });
defineProps<{ title?: string; glowClass?: string }>();
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="show"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
                @click.self="show = false"
            >
                <div
                    class="modal-panel major-mono-display-regular glow-border glow-box relative w-full max-w-2xl bg-[#0a0a0f] p-8"
                    :class="glowClass ?? 'glow-amber'"
                >
                    <button
                        class="glow-red glow-text absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-xl transition-all duration-200 hover:scale-110"
                        aria-label="Close"
                        @click="show = false"
                    >
                        ✕
                    </button>

                    <p v-if="title" class="digital glow-text mb-6 text-3xl">
                        {{ title }}
                    </p>

                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
@keyframes flicker-on {
    0% {
        opacity: 0;
    }
    /* first weak attempt */
    8% {
        opacity: 0.6;
    }
    9% {
        opacity: 0;
    }
    /* dead air */
    22% {
        opacity: 0;
    }
    23% {
        opacity: 0.9;
    }
    25% {
        opacity: 0.2;
    }
    /* stutter cluster */
    35% {
        opacity: 0.8;
    }
    36% {
        opacity: 0;
    }
    37% {
        opacity: 0.7;
    }
    38% {
        opacity: 0.1;
    }
    /* nearly there, brief drop */
    60% {
        opacity: 1;
    }
    62% {
        opacity: 0.3;
    }
    /* settle */
    70% {
        opacity: 1;
    }
    100% {
        opacity: 1;
    }
}

/* Backdrop fades; panel slides up and scales simultaneously */
/* ENTER: flicker on */
.modal-enter-active,
.modal-enter-active .modal-panel {
    animation: flicker-on 0.5s steps(1, end) forwards;
}

/* LEAVE: flicker off (reverse the keyframes) */
.modal-leave-active,
.modal-leave-active .modal-panel {
    animation: flicker-on 0.5s steps(1, end) reverse forwards;
}
</style>
