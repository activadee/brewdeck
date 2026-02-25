import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { BrewTap, TapAddRequest, TapRemoveRequest } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';

type ScopeFilter = 'all' | 'official' | 'thirdParty';
type HealthFilter = 'all' | 'healthy' | 'attention' | 'error';

interface TapsState {
  items: BrewTap[];
  loading: boolean;
  error: string | null;
  query: string;
  scopeFilter: ScopeFilter;
  healthFilter: HealthFilter;
  mutating: boolean;
  lastRefreshedAt: string | null;
}

const initialState: TapsState = {
  items: [],
  loading: false,
  error: null,
  query: '',
  scopeFilter: 'all',
  healthFilter: 'all',
  mutating: false,
  lastRefreshedAt: null
};

export const TapsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalCount: computed(() => store.items().length),
    protectedCount: computed(() => store.items().filter((tap) => tap.protected).length),
    thirdPartyCount: computed(() => store.items().filter((tap) => !tap.official).length),
    filteredItems: computed(() => {
      const query = store.query().trim().toLocaleLowerCase();
      const scopeFilter = store.scopeFilter();
      const healthFilter = store.healthFilter();

      return store.items().filter((tap) => {
        if (scopeFilter === 'official' && !tap.official) {
          return false;
        }

        if (scopeFilter === 'thirdParty' && tap.official) {
          return false;
        }

        if (healthFilter !== 'all' && tap.health !== healthFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [tap.name, tap.path ?? '', tap.remote ?? '', tap.warning ?? '']
          .join(' ')
          .toLocaleLowerCase()
          .includes(query);
      });
    })
  })),
  withMethods((store, facade = inject(BrewFacadeService)) => ({
    setQuery(query: string): void {
      patchState(store, { query });
    },

    setScopeFilter(scopeFilter: ScopeFilter): void {
      patchState(store, { scopeFilter });
    },

    setHealthFilter(healthFilter: HealthFilter): void {
      patchState(store, { healthFilter });
    },

    async refresh(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const items = await facade.getTaps();
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

    async tapAdd(payload: TapAddRequest): Promise<boolean> {
      patchState(store, { mutating: true, error: null });

      try {
        const result = await facade.tapAdd(payload);
        if (!result.success) {
          patchState(store, { error: result.output || 'Tap add command failed' });
          return false;
        }

        await this.refresh();
        return true;
      } catch (error) {
        patchState(store, { error: (error as Error).message });
        return false;
      } finally {
        patchState(store, { mutating: false });
      }
    },

    async tapRemove(payload: TapRemoveRequest): Promise<boolean> {
      patchState(store, { mutating: true, error: null });

      try {
        const result = await facade.tapRemove(payload);
        if (!result.success) {
          patchState(store, { error: result.output || 'Tap remove command failed' });
          return false;
        }

        await this.refresh();
        return true;
      } catch (error) {
        patchState(store, { error: (error as Error).message });
        return false;
      } finally {
        patchState(store, { mutating: false });
      }
    }
  }))
);
