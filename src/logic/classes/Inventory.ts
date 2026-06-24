import { reactive, toRaw } from "vue";
import type { TypeItem } from "./collections/items.ts";
import type { WeightedIcon, SymbolScore } from "../config.ts";

export interface ActiveItem {
    item: TypeItem;
    quantity: number;
    remainingUses?: number;
    selectedIcon?: string;
}

export default class Inventory {
    readonly activeItems = reactive<ActiveItem[]>([]);

    add(item: TypeItem, opts?: { selectedIcon?: string }): void {
        const existing = this.activeItems.find(
            (a) =>
                a.item.title === item.title &&
                a.selectedIcon === opts?.selectedIcon,
        );

        if (existing) {
            existing.quantity++;
            if (existing.remainingUses !== undefined && item.maxUses !== undefined) {
                existing.remainingUses += item.maxUses;
            }
        } else {
            this.activeItems.push({
                item,
                quantity: 1,
                selectedIcon: opts?.selectedIcon,
                remainingUses: item.maxUses,
            });
        }
    }

    remove(title: string): void {
        const idx = this.activeItems.findIndex((a) => a.item.title === title);
        if (idx !== -1) this.activeItems.splice(idx, 1);
    }

    getEffectiveWeights(base: WeightedIcon[]): WeightedIcon[] {
        return toRaw(this.activeItems).reduce(
            (weights, entry) => {
                const { quantity, selectedIcon } = entry;
                const hooks = toRaw(toRaw(entry.item).hooks);
                if (!hooks.modifyWeights) return weights;
                let result = [...weights];
                for (let i = 0; i < quantity; i++) {
                    result = hooks.modifyWeights(result, selectedIcon);
                }
                return result;
            },
            base,
        );
    }

    getEffectiveScores(base: SymbolScore): SymbolScore {
        return toRaw(this.activeItems).reduce(
            (scores, entry) => {
                const { quantity, selectedIcon } = entry;
                const hooks = toRaw(toRaw(entry.item).hooks);
                if (!hooks.modifyScores) return scores;
                let result = { ...scores };
                for (let i = 0; i < quantity; i++) {
                    result = hooks.modifyScores(result, selectedIcon);
                }
                return result;
            },
            base,
        );
    }

    onSpinComplete(): void {
        for (let i = this.activeItems.length - 1; i >= 0; i--) {
            const entry = this.activeItems[i];
            if (entry.remainingUses !== undefined) {
                entry.remainingUses--;
                if (entry.remainingUses <= 0) {
                    this.activeItems.splice(i, 1);
                }
            }
        }
    }
}
