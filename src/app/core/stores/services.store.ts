import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { BrewService, BrewServiceStatus, ServiceRequest } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';

export type ServiceStatusFilter = 'all' | BrewServiceStatus;

interface ServicesState {
  items: BrewService[];
  loading: boolean;
  mutating: boolean;
  error: string | null;
  query: string;
  statusFilter: ServiceStatusFilter;
  lastRefreshedAt: string | null;
}

const initialState: ServicesState = {
  items: [],
  loading: false,
  mutating: false,
  error: null,
  query: '',
  statusFilter: 'all',
  lastRefreshedAt: null
};

export const ServicesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalCount: computed(() => store.items().length),
    runningCount: computed(() => store.items().filter((service) => service.status === 'started').length),
    errorCount: computed(() => store.items().filter((service) => service.status === 'error').length),
    unknownCount: computed(() => store.items().filter((service) => service.status === 'unknown').length),
    filteredItems: computed(() => {
      const query = store.query().trim().toLocaleLowerCase();
      const statusFilter = store.statusFilter();

      return store.items().filter((service) => {
        if (statusFilter !== 'all' && service.status !== statusFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [
          service.name,
          service.status,
          service.user ?? '',
          service.file ?? '',
          service.exitCode === null ? '' : String(service.exitCode)
        ]
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

    setStatusFilter(statusFilter: ServiceStatusFilter): void {
      patchState(store, { statusFilter });
    },

    async refresh(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const items = await facade.getServices();
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

    async serviceStart(payload: ServiceRequest): Promise<boolean> {
      patchState(store, { mutating: true, error: null });

      try {
        const result = await facade.serviceStart(payload);
        if (!result.success) {
          patchState(store, { error: result.output || `Unable to start service ${payload.name}.` });
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

    async serviceStop(payload: ServiceRequest): Promise<boolean> {
      patchState(store, { mutating: true, error: null });

      try {
        const result = await facade.serviceStop(payload);
        if (!result.success) {
          patchState(store, { error: result.output || `Unable to stop service ${payload.name}.` });
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

    async serviceRestart(payload: ServiceRequest): Promise<boolean> {
      patchState(store, { mutating: true, error: null });

      try {
        const result = await facade.serviceRestart(payload);
        if (!result.success) {
          patchState(store, { error: result.output || `Unable to restart service ${payload.name}.` });
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
