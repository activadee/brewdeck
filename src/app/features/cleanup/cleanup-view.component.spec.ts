import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ToastService } from '../../core/services/toast.service';
import { CleanupStore } from '../../core/stores/cleanup.store';
import { CleanupViewComponent } from './cleanup-view.component';

describe('CleanupViewComponent', () => {
  async function render() {
    const cleanupStore = {
      preview: signal({
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
      }),
      loadingPreview: signal(false),
      running: signal(false),
      error: signal<string | null>(null),
      hasPreview: signal(true),
      items: signal([
        {
          path: '/opt/homebrew/Cellar/foo/1.0',
          sizeBytes: 237,
          fileCount: null,
          metadata: '237B'
        }
      ]),
      command: signal('brew cleanup --dry-run'),
      totalBytes: signal(237),
      rawOutput: signal('Would remove: /opt/homebrew/Cellar/foo/1.0 (237B)'),
      generatedAt: signal('2026-02-25T00:00:00.000Z'),
      refreshPreview: vi.fn(async () => undefined),
      runCleanup: vi.fn(async () => true)
    };
    const toast = { push: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CleanupViewComponent],
      providers: [
        { provide: CleanupStore, useValue: cleanupStore },
        { provide: ToastService, useValue: toast }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CleanupViewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, cleanupStore, toast };
  }

  it('opens confirm and runs cleanup with success toast', async () => {
    const { fixture, cleanupStore, toast } = await render();
    const component = fixture.componentInstance as any;

    component.openConfirm();
    await component.confirmCleanup();

    expect(cleanupStore.runCleanup).toHaveBeenCalledTimes(1);
    expect(toast.push).toHaveBeenCalledWith('Cleanup command started.', 'success');
    expect(component.confirmOpen()).toBe(false);
  });

  it('does not close confirm or show success toast when cleanup fails', async () => {
    const { fixture, cleanupStore, toast } = await render();
    const component = fixture.componentInstance as any;
    cleanupStore.runCleanup.mockResolvedValue(false);

    component.openConfirm();
    await component.confirmCleanup();

    expect(toast.push).not.toHaveBeenCalled();
    expect(component.confirmOpen()).toBe(true);
  });

  it('refreshes preview when refresh button action is triggered', async () => {
    const { fixture, cleanupStore } = await render();
    const component = fixture.componentInstance as any;

    component.refreshPreview();

    expect(cleanupStore.refreshPreview).toHaveBeenCalledTimes(1);
  });
});
