import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import type { ActionTemplate, TemplatesSaveRequest } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';

interface TemplatesState {
  templates: ActionTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  loading: false,
  error: null
};

export const TemplatesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, facade = inject(BrewFacadeService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const templates = await facade.listTemplates();
        patchState(store, { templates, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: (error as Error).message });
      }
    },

    async save(request: TemplatesSaveRequest): Promise<ActionTemplate> {
      const saved = await facade.saveTemplate(request);
      await this.load();
      return saved;
    },

    async remove(id: string): Promise<void> {
      await facade.deleteTemplate({ id });
      await this.load();
    }
  }))
);
