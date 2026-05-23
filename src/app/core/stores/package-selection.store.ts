import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

interface PackageSelectionState {
  selectedIds: string[];
}

const initialState: PackageSelectionState = {
  selectedIds: []
};

export const PackageSelectionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    count: computed(() => store.selectedIds().length),
    selectedSet: computed(() => new Set(store.selectedIds()))
  })),
  withMethods((store) => ({
    isSelected(id: string): boolean {
      return store.selectedIds().includes(id);
    },

    toggle(id: string): void {
      const current = new Set(store.selectedIds());
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }
      patchState(store, { selectedIds: [...current] });
    },

    selectAll(ids: string[]): void {
      patchState(store, { selectedIds: [...new Set(ids)] });
    },

    clear(): void {
      patchState(store, { selectedIds: [] });
    }
  }))
);
