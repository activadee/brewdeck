import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { BrewService } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';
import { ServicesStore } from './services.store';

const services: BrewService[] = [
  {
    name: 'postgresql@16',
    status: 'started',
    user: 'a1b3826',
    file: '/opt/homebrew/opt/postgresql@16/homebrew.mxcl.postgresql@16.plist',
    exitCode: null
  },
  {
    name: 'unbound',
    status: 'none',
    user: null,
    file: '/opt/homebrew/opt/unbound/homebrew.mxcl.unbound.plist',
    exitCode: null
  }
];

describe('ServicesStore', () => {
  function render() {
    const facade = {
      getServices: vi.fn(async () => services),
      serviceStart: vi.fn(async () => ({ success: true, output: '', action: 'serviceStart' })),
      serviceStop: vi.fn(async () => ({ success: true, output: '', action: 'serviceStop' })),
      serviceRestart: vi.fn(async () => ({ success: true, output: '', action: 'serviceRestart' }))
    };

    TestBed.configureTestingModule({
      providers: [{ provide: BrewFacadeService, useValue: facade }]
    });

    const store = TestBed.inject(ServicesStore);
    return { store, facade };
  }

  it('loads services data and exposes running count', async () => {
    const { store, facade } = render();

    await store.refresh();

    expect(facade.getServices).toHaveBeenCalledTimes(1);
    expect(store.totalCount()).toBe(2);
    expect(store.runningCount()).toBe(1);
    expect(store.error()).toBeNull();
  });

  it('filters by status and query', async () => {
    const { store } = render();
    await store.refresh();

    store.setStatusFilter('started');
    expect(store.filteredItems().map((item) => item.name)).toEqual(['postgresql@16']);

    store.setStatusFilter('all');
    store.setQuery('unbound');
    expect(store.filteredItems().map((item) => item.name)).toEqual(['unbound']);
  });

  it('runs service action and refreshes list on success', async () => {
    const { store, facade } = render();

    const started = await store.serviceStart({ name: 'unbound' });

    expect(started).toBe(true);
    expect(facade.serviceStart).toHaveBeenCalledWith({ name: 'unbound' });
    expect(facade.getServices).toHaveBeenCalledTimes(1);
  });

  it('returns false and stores output when service action fails', async () => {
    const { store, facade } = render();
    facade.serviceRestart.mockResolvedValueOnce({
      success: false,
      output: 'restart failed',
      action: 'serviceRestart'
    });

    const restarted = await store.serviceRestart({ name: 'postgresql@16' });

    expect(restarted).toBe(false);
    expect(store.error()).toBe('restart failed');
  });
});
