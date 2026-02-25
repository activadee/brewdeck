import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type {
  InstalledPackage,
  PackageKind,
  PinOneRequest,
  UnpinOneRequest
} from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';
import { JobsStore } from './jobs.store';

type KindFilter = 'all' | PackageKind;
type PinFilter = 'all' | 'pinned' | 'unpinned';

interface InstalledState {
  items: InstalledPackage[];
  loading: boolean;
  error: string | null;
  query: string;
  kindFilter: KindFilter;
  pinFilter: PinFilter;
  lastRefreshedAt: string | null;
  pinning: boolean;
}

const initialState: InstalledState = {
  items: [],
  loading: false,
  error: null,
  query: '',
  kindFilter: 'all',
  pinFilter: 'all',
  lastRefreshedAt: null,
  pinning: false
};

export const InstalledStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalCount: computed(() => store.items().length),
    formulaCount: computed(() => store.items().filter((item) => item.kind === 'formula').length),
    caskCount: computed(() => store.items().filter((item) => item.kind === 'cask').length),
    pinnedCount: computed(() => store.items().filter((item) => item.pinned).length),
    unpinnedCount: computed(() => store.items().filter((item) => !item.pinned).length),
    installedIdSet: computed(() => new Set(store.items().map((item) => item.id))),
    filteredItems: computed(() => {
      const query = store.query().trim().toLocaleLowerCase();
      const kindFilter = store.kindFilter();
      const pinFilter = store.pinFilter();

      return store.items().filter((item) => {
        if (kindFilter !== 'all' && item.kind !== kindFilter) {
          return false;
        }

        if (pinFilter === 'pinned' && !item.pinned) {
          return false;
        }

        if (pinFilter === 'unpinned' && item.pinned) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [item.name, item.desc ?? '', item.installedVersion].some((field) =>
          field.toLocaleLowerCase().includes(query)
        );
      });
    })
  })),
  withMethods((store, facade = inject(BrewFacadeService), jobsStore = inject(JobsStore)) => ({
    setQuery(query: string): void {
      patchState(store, { query });
    },

    setKindFilter(kindFilter: KindFilter): void {
      patchState(store, { kindFilter });
    },

    setPinFilter(pinFilter: PinFilter): void {
      patchState(store, { pinFilter });
    },

    async refresh(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const items = await facade.getInstalled();
        patchState(store, {
          items,
          loading: false,
          lastRefreshedAt: new Date().toISOString()
        });
      } catch (error) {
        patchState(store, {
          loading: false,
          error: (error as Error).message
        });
      }
    },

    async pinOne(payload: PinOneRequest): Promise<boolean> {
      patchState(store, { pinning: true, error: null });

      try {
        const result = await facade.pinOne(payload);
        if (!result.success) {
          jobsStore.markFailed({
            jobId: result.jobId,
            error: result.output || 'Pin command failed',
            output: result.output,
            timestamp: result.timestamp
          });
          patchState(store, { error: result.output || 'Pin command failed' });
          return false;
        }

        await this.refresh();
        return true;
      } catch (error) {
        jobsStore.markFailed({
          jobId: crypto.randomUUID(),
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        });
        patchState(store, { error: (error as Error).message });
        return false;
      } finally {
        patchState(store, { pinning: false });
      }
    },

    async unpinOne(payload: UnpinOneRequest): Promise<boolean> {
      patchState(store, { pinning: true, error: null });

      try {
        const result = await facade.unpinOne(payload);
        if (!result.success) {
          jobsStore.markFailed({
            jobId: result.jobId,
            error: result.output || 'Unpin command failed',
            output: result.output,
            timestamp: result.timestamp
          });
          patchState(store, { error: result.output || 'Unpin command failed' });
          return false;
        }

        await this.refresh();
        return true;
      } catch (error) {
        jobsStore.markFailed({
          jobId: crypto.randomUUID(),
          error: (error as Error).message,
          output: '',
          timestamp: new Date().toISOString()
        });
        patchState(store, { error: (error as Error).message });
        return false;
      } finally {
        patchState(store, { pinning: false });
      }
    }
  }))
);
