import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { BrewTap } from '../../../shared/contracts';
import { ToastService } from '../../core/services/toast.service';
import { CatalogStore } from '../../core/stores/catalog.store';
import { InstalledStore } from '../../core/stores/installed.store';
import { TapsStore } from '../../core/stores/taps.store';
import { UpdatesStore } from '../../core/stores/updates.store';
import { TapsViewComponent } from './taps-view.component';

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
  ahead: 1,
  behind: 0,
  dirty: false,
  syncState: 'ahead',
  health: 'attention',
  lastCheckedAt: '2026-02-25T00:00:00.000Z',
  warning: null
};

describe('TapsViewComponent', () => {
  async function render() {
    const tapsStore = {
      items: signal([protectedTap, thirdPartyTap]),
      loading: signal(false),
      error: signal<string | null>(null),
      query: signal(''),
      scopeFilter: signal<'all' | 'official' | 'thirdParty'>('all'),
      healthFilter: signal<'all' | 'healthy' | 'attention' | 'error'>('all'),
      mutating: signal(false),
      totalCount: signal(2),
      protectedCount: signal(1),
      thirdPartyCount: signal(1),
      filteredItems: signal([protectedTap, thirdPartyTap]),
      refresh: vi.fn(async () => undefined),
      setQuery: vi.fn(),
      setScopeFilter: vi.fn(),
      setHealthFilter: vi.fn(),
      tapAdd: vi.fn(async () => true),
      tapRemove: vi.fn(async () => true)
    };

    const installedStore = { refresh: vi.fn(async () => undefined) };
    const updatesStore = { refresh: vi.fn(async () => undefined) };
    const catalogStore = { refresh: vi.fn(async () => undefined) };
    const toast = { push: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TapsViewComponent],
      providers: [
        { provide: TapsStore, useValue: tapsStore },
        { provide: InstalledStore, useValue: installedStore },
        { provide: UpdatesStore, useValue: updatesStore },
        { provide: CatalogStore, useValue: catalogStore },
        { provide: ToastService, useValue: toast }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TapsViewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, tapsStore, installedStore, updatesStore, catalogStore, toast };
  }

  it('disables remove action for protected taps', async () => {
    const { fixture } = await render();
    const component = fixture.componentInstance as any;

    const action = component.overflowActionsFor(protectedTap)[0];

    expect(action.disabled).toBe(true);
    expect(action.label).toContain('Protected tap');
  });

  it('submits add tap flow and refreshes dependent views', async () => {
    const { fixture, tapsStore, installedStore, updatesStore, catalogStore, toast } = await render();
    const component = fixture.componentInstance as any;

    component.openAddDialog();
    component.pendingTapName.set('steipete/tap');
    await component.confirmAdd();

    expect(tapsStore.tapAdd).toHaveBeenCalledWith({ name: 'steipete/tap' });
    expect(installedStore.refresh).toHaveBeenCalled();
    expect(updatesStore.refresh).toHaveBeenCalled();
    expect(catalogStore.refresh).toHaveBeenCalledWith(true);
    expect(toast.push).toHaveBeenCalledWith('Added tap steipete/tap.', 'success');
  });

  it('submits remove tap flow and refreshes dependent views', async () => {
    const { fixture, tapsStore, installedStore, updatesStore, catalogStore, toast } = await render();
    const component = fixture.componentInstance as any;

    component.onOverflowAction(thirdPartyTap, 'remove');
    await component.confirmRemove();

    expect(tapsStore.tapRemove).toHaveBeenCalledWith({ name: 'sst/tap' });
    expect(installedStore.refresh).toHaveBeenCalled();
    expect(updatesStore.refresh).toHaveBeenCalled();
    expect(catalogStore.refresh).toHaveBeenCalledWith(true);
    expect(toast.push).toHaveBeenCalledWith('Removed tap sst/tap.', 'success');
  });
});
