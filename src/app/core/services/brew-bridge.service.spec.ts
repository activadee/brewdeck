import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { DEFAULT_WINDOW_CHROME_STATE } from '../../../shared/contracts';
import { BrewBridgeService } from './brew-bridge.service';

describe('BrewBridgeService fallback bridge', () => {
  it('uses fallback bridge when window.brewdeck is unavailable', async () => {
    const originalBridge = window.brewdeck;

    try {
      window.brewdeck = undefined;

      TestBed.configureTestingModule({
        providers: [BrewBridgeService]
      });

      const service = TestBed.inject(BrewBridgeService);
      expect(service.isElectron).toBe(false);

      await expect(service.api.windowControl('close')).resolves.toBeUndefined();
      await expect(service.api.getWindowChromeState()).resolves.toEqual(DEFAULT_WINDOW_CHROME_STATE);
      await expect(service.api.getTaps()).resolves.toEqual([]);
      await expect(service.api.getServices()).resolves.toEqual([]);
      await expect(service.api.getCleanupPreview()).resolves.toMatchObject({
        command: 'brew cleanup --dry-run'
      });
      await expect(service.api.runDoctor()).resolves.toMatchObject({
        command: 'brew doctor',
        findings: [],
        counts: {
          warning: 0
        }
      });
      await expect(service.api.tapAdd({ name: 'sst/tap' })).resolves.toMatchObject({
        success: false,
        action: 'tapAdd'
      });
      await expect(service.api.tapRemove({ name: 'sst/tap' })).resolves.toMatchObject({
        success: false,
        action: 'tapRemove'
      });
      await expect(service.api.serviceStart({ name: 'unbound' })).resolves.toMatchObject({
        success: false,
        action: 'serviceStart'
      });
      await expect(service.api.serviceStop({ name: 'unbound' })).resolves.toMatchObject({
        success: false,
        action: 'serviceStop'
      });
      await expect(service.api.serviceRestart({ name: 'unbound' })).resolves.toMatchObject({
        success: false,
        action: 'serviceRestart'
      });
      await expect(service.api.runCleanup()).resolves.toMatchObject({
        success: false,
        action: 'cleanup'
      });
    } finally {
      window.brewdeck = originalBridge;
    }
  });
});
