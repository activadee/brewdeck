import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { CleanupPreviewResult } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';
import { CleanupStore } from './cleanup.store';

const preview: CleanupPreviewResult = {
  command: 'brew cleanup --dry-run',
  items: [
    {
      path: '/opt/homebrew/Cellar/foo/1.0',
      sizeBytes: 237,
      fileCount: null,
      metadata: '237B'
    }
  ],
  totalBytes: 237,
  rawOutput: 'Would remove: /opt/homebrew/Cellar/foo/1.0 (237B)',
  generatedAt: '2026-02-25T00:00:00.000Z'
};

describe('CleanupStore', () => {
  function render() {
    const facade = {
      getCleanupPreview: vi.fn(async () => preview),
      runCleanup: vi.fn(async () => ({
        success: true,
        output: '',
        action: 'cleanup'
      }))
    };

    TestBed.configureTestingModule({
      providers: [{ provide: BrewFacadeService, useValue: facade }]
    });

    const store = TestBed.inject(CleanupStore);
    return { store, facade };
  }

  it('loads cleanup preview data', async () => {
    const { store, facade } = render();

    await store.refreshPreview();

    expect(facade.getCleanupPreview).toHaveBeenCalledTimes(1);
    expect(store.items()).toHaveLength(1);
    expect(store.totalBytes()).toBe(237);
    expect(store.error()).toBeNull();
  });

  it('runs cleanup and refreshes preview on success', async () => {
    const { store, facade } = render();

    const started = await store.runCleanup();

    expect(started).toBe(true);
    expect(facade.runCleanup).toHaveBeenCalledTimes(1);
    expect(facade.getCleanupPreview).toHaveBeenCalledTimes(1);
  });

  it('returns false and stores output when cleanup command fails', async () => {
    const { store, facade } = render();
    facade.runCleanup.mockResolvedValueOnce({
      success: false,
      output: 'cleanup failed',
      action: 'cleanup'
    });

    const started = await store.runCleanup();

    expect(started).toBe(false);
    expect(store.error()).toBe('cleanup failed');
  });
});
