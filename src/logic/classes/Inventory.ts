import { reactive, toRaw } from "vue";
import type { TypeItem } from "./collections/items.ts";
import type { WeightedIcon, SymbolScore, ReelSymbol } from "../config.ts";

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

    applyModifySymbols(base: ReelSymbol[]): ReelSymbol[] {
        return toRaw(this.activeItems).reduce(
            (symbols, entry) => {
                const { quantity } = entry;
                const hooks = toRaw(toRaw(entry.item).hooks);
                if (!hooks.modifySymbols) return symbols;
                let result = [...symbols];
                for (let i = 0; i < quantity; i++) {
                    result = hooks.modifySymbols(result);
                }
                return result;
            },
            [...base],
        );
    }

    getNonChainingSymbols(): string[] {
        return toRaw(this.activeItems).flatMap((entry) => {
            const hooks = toRaw(toRaw(entry.item).hooks);
            return hooks.nonChainingSymbols ?? [];
        });
    }

    getPerVisibleScores(): { [symbol: string]: number } {
        return toRaw(this.activeItems).reduce(
            (acc, entry) => {
                const hooks = toRaw(toRaw(entry.item).hooks);
                const perVisible = hooks.perVisibleScore ?? {};
                for (const [sym, pts] of Object.entries(perVisible)) {
                    acc[sym] = (acc[sym] ?? 0) + pts * entry.quantity;
                }
                return acc;
            },
            {} as { [symbol: string]: number },
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
