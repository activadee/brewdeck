import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { CleanupPreviewResult } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';

interface CleanupState {
  preview: CleanupPreviewResult | null;
  loadingPreview: boolean;
  running: boolean;
  error: string | null;
  lastRefreshedAt: string | null;
}

const initialState: CleanupState = {
  preview: null,
  loadingPreview: false,
  running: false,
  error: null,
  lastRefreshedAt: null
};

export const CleanupStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    items: computed(() => store.preview()?.items ?? []),
    command: computed(() => store.preview()?.command ?? 'brew cleanup --dry-run'),
    totalBytes: computed(() => store.preview()?.totalBytes ?? null),
    rawOutput: computed(() => store.preview()?.rawOutput ?? ''),
    generatedAt: computed(() => store.preview()?.generatedAt ?? null),
    hasPreview: computed(() => Boolean(store.preview()))
  })),
  withMethods((store, facade = inject(BrewFacadeService)) => ({
    async refreshPreview(): Promise<void> {
      patchState(store, { loadingPreview: true, error: null });

      try {
        const preview = await facade.getCleanupPreview();
        patchState(store, {
          preview,
          loadingPreview: false,
          lastRefreshedAt: preview.generatedAt
        });
      } catch (error) {
        patchState(store, {
          loadingPreview: false,
          error: (error as Error).message
        });
      }
    },

    async runCleanup(): Promise<boolean> {
      patchState(store, { running: true, error: null });

      try {
        const result = await facade.runCleanup();
        if (!result.success) {
          patchState(store, { error: result.output || 'Cleanup command failed' });
          return false;
        }

        await this.refreshPreview();
        return true;
      } catch (error) {
        patchState(store, { error: (error as Error).message });
        return false;
      } finally {
        patchState(store, { running: false });
      }
    }
  }))
);
