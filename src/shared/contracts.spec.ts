import { describe, expect, it } from 'vitest';

import {
  packageDetailsRequestSchema,
  packageDetailsSchema,
  windowChromeStateSchema,
  windowControlActionSchema,
  type WindowChromeState
} from './contracts';

describe('window chrome contracts', () => {
  it('parses supported window control actions', () => {
    expect(windowControlActionSchema.parse('close')).toBe('close');
    expect(windowControlActionSchema.parse('minimize')).toBe('minimize');
    expect(windowControlActionSchema.parse('toggleZoom')).toBe('toggleZoom');
    expect(windowControlActionSchema.parse('toggleFullScreen')).toBe('toggleFullScreen');
  });

  it('rejects unsupported window control actions', () => {
    const result = windowControlActionSchema.safeParse('zoom');
    expect(result.success).toBe(false);
  });

  it('parses window chrome state payloads', () => {
    const sample: WindowChromeState = {
      platform: 'darwin',
      isFocused: true,
      isMaximized: false,
      isFullScreen: false,
      canClose: true,
      canMinimize: true,
      canZoom: true,
      canFullScreen: true
    };

    expect(windowChromeStateSchema.parse(sample)).toEqual(sample);
  });

  it('rejects invalid platform values in chrome state payloads', () => {
    const result = windowChromeStateSchema.safeParse({
      platform: 'solaris',
      isFocused: false,
      isMaximized: false,
      isFullScreen: false,
      canClose: false,
      canMinimize: false,
      canZoom: false,
      canFullScreen: false
    });

    expect(result.success).toBe(false);
  });

  it('parses package details payloads', () => {
    const parsed = packageDetailsSchema.parse({
      id: 'formula:ripgrep',
      kind: 'formula',
      name: 'ripgrep',
      fullName: 'ripgrep',
      desc: 'Search tool',
      homepage: 'https://example.com',
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
    });

    expect(parsed.name).toBe('ripgrep');
    expect(parsed.versionSnapshot.stableVersion).toBe('14.1.0');
  });

  it('rejects invalid package detail requests', () => {
    const parsed = packageDetailsRequestSchema.safeParse({ kind: 'formula', name: '' });
    expect(parsed.success).toBe(false);
  });
});
