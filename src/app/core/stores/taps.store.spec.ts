import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { BrewTap } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';
import { TapsStore } from './taps.store';

const protectedTap: BrewTap = {
  name: 'homebrew/core',
  official: true,
  protected: true,
  userTapped: false,
  path: '/opt/homebrew/Library/Taps/homebrew/homebrew-core',
  remote: 'https://github.com/Homebrew/homebrew-core',
  branch: 'master',
  upstream: 'origin/master',
  ahead: 0,
  behind: 0,
  dirty: false,
  syncState: 'upToDate',
  health: 'healthy',
  lastCheckedAt: '2026-02-25T00:00:00.000Z',
  warning: null
};

const thirdPartyTap: BrewTap = {
  name: 'sst/tap',
  official: false,
  protected: false,
  userTapped: true,
  path: '/opt/homebrew/Library/Taps/sst/homebrew-tap',
  remote: 'https://github.com/sst/homebrew-tap',
  branch: 'main',
  upstream: 'origin/main',
  ahead: 0,
  behind: 2,
  dirty: false,
  syncState: 'behind',
  health: 'attention',
  lastCheckedAt: '2026-02-25T00:00:00.000Z',
  warning: null
};

describe('TapsStore', () => {
  function render() {
    const facade = {
      getTaps: vi.fn(async () => [protectedTap, thirdPartyTap]),
      tapAdd: vi.fn(async () => ({ success: true, output: '', action: 'tapAdd' })),
      tapRemove: vi.fn(async () => ({ success: true, output: '', action: 'tapRemove' }))
    };

    TestBed.configureTestingModule({
      providers: [{ provide: BrewFacadeService, useValue: facade }]
    });

    const store = TestBed.inject(TapsStore);
    return { store, facade };
  }

  it('loads taps on refresh', async () => {
    const { store, facade } = render();

    await store.refresh();

    expect(facade.getTaps).toHaveBeenCalledTimes(1);
    expect(store.items()).toHaveLength(2);
    expect(store.error()).toBeNull();
  });

  it('filters by scope, health, and query', async () => {
    const { store } = render();

    await store.refresh();
    expect(store.filteredItems()).toHaveLength(2);

    store.setScopeFilter('thirdParty');
    expect(store.filteredItems().map((tap) => tap.name)).toEqual(['sst/tap']);

    store.setScopeFilter('all');
    store.setHealthFilter('healthy');
    expect(store.filteredItems().map((tap) => tap.name)).toEqual(['homebrew/core']);

    store.setHealthFilter('all');
    store.setQuery('github.com/sst');
    expect(store.filteredItems().map((tap) => tap.name)).toEqual(['sst/tap']);
  });

  it('runs tapAdd and refreshes state', async () => {
    const { store, facade } = render();

    const started = await store.tapAdd({ name: 'steipete/tap' });

    expect(started).toBe(true);
    expect(facade.tapAdd).toHaveBeenCalledWith({ name: 'steipete/tap' });
    expect(facade.getTaps).toHaveBeenCalled();
  });

  it('returns false and stores error on tapRemove failure', async () => {
    const { store, facade } = render();
    facade.tapRemove.mockResolvedValueOnce({ success: false, output: 'cannot untap', action: 'tapRemove' });

    const started = await store.tapRemove({ name: 'sst/tap' });

    expect(started).toBe(false);
    expect(store.error()).toBe('cannot untap');
  });
});
