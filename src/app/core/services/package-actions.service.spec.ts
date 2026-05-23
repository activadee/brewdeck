import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { BrewFacadeService } from './brew-facade.service';
import { PackageActionsService } from './package-actions.service';
import { SettingsStore } from '../stores/settings.store';
import { ToastService } from './toast.service';

describe('PackageActionsService', () => {
  const facade = {
    installOne: vi.fn(async () => ({ success: true })),
    uninstallOne: vi.fn(async () => ({ success: true })),
    upgradeMany: vi.fn(async () => ({ succeeded: 2, failed: 0, results: [] })),
    uninstallMany: vi.fn(async () => ({ succeeded: 1, failed: 0, results: [] })),
    pinMany: vi.fn(async () => ({ succeeded: 1, failed: 0, results: [] })),
    pinOne: vi.fn(async () => ({ success: true })),
    unpinOne: vi.fn(async () => ({ success: true })),
    getUninstallImpact: vi.fn(async () => ({ dependents: ['dep'], note: null })),
    runTemplate: vi.fn(async () => ({ success: true }))
  };

  const toast = {
    push: vi.fn(),
    pushWithAction: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PackageActionsService,
        { provide: BrewFacadeService, useValue: facade },
        { provide: ToastService, useValue: toast },
        {
          provide: SettingsStore,
          useValue: { settings: () => ({ showAdvancedInstallOptions: true }) }
        }
      ]
    });
  });

  it('validates template step transitions', () => {
    const service = TestBed.inject(PackageActionsService);
    expect(service.validateTemplateSteps([{ action: 'install' }, { action: 'pin' }])).toBeNull();
    expect(service.validateTemplateSteps([{ action: 'pin' }, { action: 'install' }])).toMatch(/not allowed/);
  });

  it('runs batch upgrade and shows toast', async () => {
    const service = TestBed.inject(PackageActionsService);
    await service.upgradeMany({ items: [{ kind: 'formula', name: 'ripgrep' }] });
    expect(facade.upgradeMany).toHaveBeenCalled();
    expect(toast.push).toHaveBeenCalledWith(expect.stringContaining('Batch upgrade'), 'success');
  });

  it('shows pin undo toast', () => {
    const service = TestBed.inject(PackageActionsService);
    service.notifyPinSuccess({ kind: 'formula', name: 'node' });
    expect(toast.pushWithAction).toHaveBeenCalledWith(
      'Pinned node.',
      'success',
      expect.objectContaining({ label: 'Unpin' })
    );
  });
});
