import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import type { PackageDetails, PackageDetailsRequest } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';

interface PackageDetailsState {
  open: boolean;
  target: PackageDetailsRequest | null;
  loading: boolean;
  error: string | null;
  details: PackageDetails | null;
  warnings: string[];
}

const initialState: PackageDetailsState = {
  open: false,
  target: null,
  loading: false,
  error: null,
  details: null,
  warnings: []
};

export const PackageDetailsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, facade = inject(BrewFacadeService)) => {
    let activeLoadId = 0;

    const isCurrentLoad = (loadId: number, target: PackageDetailsRequest): boolean => {
      if (loadId !== activeLoadId) {
        return false;
      }

      const currentTarget = store.target();
      if (!currentTarget) {
        return false;
      }

      return currentTarget.kind === target.kind && currentTarget.name === target.name;
    };

    const loadFor = async (target: PackageDetailsRequest): Promise<void> => {
      const loadId = ++activeLoadId;
      patchState(store, {
        loading: true,
        error: null,
        details: null,
        warnings: []
      });

      try {
        const details = await facade.getPackageDetails(target);
        if (!isCurrentLoad(loadId, target)) {
          return;
        }

        patchState(store, {
          loading: false,
          details,
          warnings: details.warnings
        });
      } catch (error) {
        if (!isCurrentLoad(loadId, target)) {
          return;
        }

        patchState(store, {
          loading: false,
          error: (error as Error).message
        });
      }
    };

    return {
      async openFor(target: PackageDetailsRequest): Promise<void> {
        patchState(store, {
          open: true,
          target,
          error: null
        });
        await loadFor(target);
      },

      close(): void {
        activeLoadId += 1;
        patchState(store, {
          open: false,
          loading: false,
          error: null
        });
      },

      async reload(): Promise<void> {
        const target = store.target();
        if (!target) {
          return;
        }

        await loadFor(target);
      }
    };
  })
);
