import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { BrewService } from '../../../../shared/contracts';
import { ToastService } from '../../../core/services/toast.service';
import { ServicesStore } from '../../../core/stores/services.store';
import { ServicesViewComponent } from './services-view.component';

const startedService: BrewService = {
  name: 'postgresql@16',
  status: 'started',
  user: 'a1b3826',
  file: '/opt/homebrew/opt/postgresql@16/homebrew.mxcl.postgresql@16.plist',
  exitCode: null
};

const idleService: BrewService = {
  name: 'unbound',
  status: 'none',
  user: null,
  file: '/opt/homebrew/opt/unbound/homebrew.mxcl.unbound.plist',
  exitCode: null
};

describe('ServicesViewComponent', () => {
  async function render() {
    const servicesStore = {
      items: signal([startedService, idleService]),
      loading: signal(false),
      mutating: signal(false),
      error: signal<string | null>(null),
      query: signal(''),
      statusFilter: signal<'all' | 'started' | 'stopped' | 'none' | 'scheduled' | 'error' | 'unknown'>('all'),
      lastRefreshedAt: signal<string | null>(null),
      totalCount: signal(2),
      runningCount: signal(1),
      errorCount: signal(0),
      unknownCount: signal(0),
      filteredItems: signal([startedService, idleService]),
      refresh: vi.fn(async () => undefined),
      setQuery: vi.fn(),
      setStatusFilter: vi.fn(),
      serviceStart: vi.fn(async () => true),
      serviceStop: vi.fn(async () => true),
      serviceRestart: vi.fn(async () => true)
    };

    const toast = { push: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ServicesViewComponent],
      providers: [
        { provide: ServicesStore, useValue: servicesStore },
        { provide: ToastService, useValue: toast }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ServicesViewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, servicesStore, toast };
  }

  it('renders services and status metadata', async () => {
    const { fixture } = await render();
    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Services Management');
    expect(html.textContent).toContain('postgresql@16');
    expect(html.textContent).toContain('started');
    expect(html.textContent).toContain('unbound');
  });

  it('submits start/stop/restart actions and shows success toasts', async () => {
    const { fixture, servicesStore, toast } = await render();
    const component = fixture.componentInstance as any;

    await component.startService('unbound');
    await component.stopService('postgresql@16');
    await component.restartService('postgresql@16');

    expect(servicesStore.serviceStart).toHaveBeenCalledWith({ name: 'unbound' });
    expect(servicesStore.serviceStop).toHaveBeenCalledWith({ name: 'postgresql@16' });
    expect(servicesStore.serviceRestart).toHaveBeenCalledWith({ name: 'postgresql@16' });
    expect(toast.push).toHaveBeenCalledWith('Started service unbound.', 'success');
    expect(toast.push).toHaveBeenCalledWith('Stopped service postgresql@16.', 'success');
    expect(toast.push).toHaveBeenCalledWith('Restarted service postgresql@16.', 'success');
  });

  it('disables action availability based on status', async () => {
    const { fixture } = await render();
    const component = fixture.componentInstance as any;

    const startedActions = component.overflowActionsFor(startedService);
    const idleActions = component.overflowActionsFor(idleService);

    expect(startedActions.find((action: { id: string }) => action.id === 'start')?.disabled).toBe(true);
    expect(startedActions.find((action: { id: string }) => action.id === 'restart')?.disabled).toBe(false);
    expect(idleActions.find((action: { id: string }) => action.id === 'stop')?.disabled).toBe(true);
  });

  it('forwards status filter changes to store', async () => {
    const { fixture, servicesStore } = await render();
    const component = fixture.componentInstance as any;

    component.onStatusFilterChange('error');

    expect(servicesStore.setStatusFilter).toHaveBeenCalledWith('error');
  });
});
