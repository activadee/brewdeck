import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { PackageDetails } from '../../../../shared/contracts';
import { PackageDetailsStore } from '../../../core/stores/package-details.store';
import { PackageDetailsDrawerComponent } from './package-details-drawer.component';

const sampleDetails: PackageDetails = {
  id: 'formula:ripgrep',
  kind: 'formula',
  name: 'ripgrep',
  fullName: 'ripgrep',
  desc: 'Search recursively',
  homepage: 'https://example.com/ripgrep',
  tap: 'homebrew/core',
  license: 'Unlicense',
  dependencies: [{ key: 'runtime', label: 'Runtime dependencies', items: ['pcre2'] }],
  caveats: null,
  versionSnapshot: {
    installedVersions: ['14.1.0'],
    currentVersion: '14.1.0',
    stableVersion: '14.1.0',
    headVersion: null
  },
  deprecated: false,
  disabled: false,
  pinned: false,
  warnings: [],
  source: 'hybrid',
  fetchedAt: '2026-02-25T00:00:00.000Z'
};

describe('PackageDetailsDrawerComponent', () => {
  async function render() {
    const store = {
      open: signal(false),
      target: signal<{ kind: 'formula' | 'cask'; name: string } | null>(null),
      loading: signal(false),
      error: signal<string | null>(null),
      details: signal<PackageDetails | null>(null),
      warnings: signal<string[]>([]),
      close: vi.fn(),
      reload: vi.fn(async () => undefined)
    };

    await TestBed.configureTestingModule({
      imports: [PackageDetailsDrawerComponent],
      providers: [{ provide: PackageDetailsStore, useValue: store }]
    }).compileComponents();

    const fixture = TestBed.createComponent(PackageDetailsDrawerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, store };
  }

  it('renders loading state when details are being fetched', async () => {
    const { fixture, store } = await render();
    const html = fixture.nativeElement as HTMLElement;

    store.open.set(true);
    store.loading.set(true);
    fixture.detectChanges();

    expect(html.textContent).toContain('Package details');
    expect(html.querySelectorAll('z-skeleton').length).toBeGreaterThan(0);
  });

  it('renders details sections after successful load', async () => {
    const { fixture, store } = await render();
    const html = fixture.nativeElement as HTMLElement;

    store.open.set(true);
    store.loading.set(false);
    store.details.set(sampleDetails);
    fixture.detectChanges();

    expect(html.textContent).toContain('Version snapshot');
    expect(html.textContent).toContain('Runtime dependencies');
    expect(html.textContent).toContain('No caveats provided.');
    expect(html.textContent).toContain('Open homepage');
  });

  it('renders warnings when partial data is returned', async () => {
    const { fixture, store } = await render();
    const html = fixture.nativeElement as HTMLElement;

    store.open.set(true);
    store.details.set(sampleDetails);
    store.warnings.set(['Remote Homebrew API unavailable']);
    fixture.detectChanges();

    expect(html.textContent).toContain('Warnings');
    expect(html.textContent).toContain('Remote Homebrew API unavailable');
  });

  it('renders error state and retries', async () => {
    const { fixture, store } = await render();
    const html = fixture.nativeElement as HTMLElement;

    store.open.set(true);
    store.error.set('Lookup failed');
    fixture.detectChanges();

    expect(html.textContent).toContain('Unable to load package details');

    const retryButton = Array.from(html.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Retry')
    );
    retryButton?.click();
    await fixture.whenStable();

    expect(store.reload).toHaveBeenCalled();
  });

  it('closes on escape when open', async () => {
    const { fixture, store } = await render();

    store.open.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(store.close).toHaveBeenCalled();
  });
});
