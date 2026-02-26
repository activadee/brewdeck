import { describe, expect, it } from 'vitest';

import { normalizeInstalled, normalizeOutdated } from './homebrew-normalizer';

describe('homebrew normalizer', () => {
  it('normalizes installed formulae and casks', () => {
    const normalized = normalizeInstalled({
      formulae: [
        {
          name: 'ripgrep',
          desc: 'Recursively search directories',
          versions: { stable: '14.0.3' },
          installed: [{ version: '14.0.1' }],
          pinned: false,
          tap: 'homebrew/core',
          homepage: 'https://github.com/BurntSushi/ripgrep',
          deprecated: true,
          disabled: false,
          deprecation_reason: 'repo_archived',
          deprecation_replacement_formula: 'rgx'
        }
      ],
      casks: [
        {
          token: 'visual-studio-code',
          full_token: 'visual-studio-code',
          desc: 'Code editor',
          version: '1.99.0',
          installed: ['1.98.3'],
          tap: 'homebrew/cask',
          homepage: 'https://code.visualstudio.com',
          deprecated: false,
          disabled: true,
          disable_reason: 'unmaintained',
          disable_replacement_cask: 'vscodium'
        }
      ]
    });

    expect(normalized).toHaveLength(2);
    expect(normalized[0]?.id).toMatch(/cask:visual-studio-code|formula:ripgrep/);
    expect(normalized.map((item) => item.kind)).toContain('formula');
    expect(normalized.map((item) => item.kind)).toContain('cask');
    expect(normalized.find((item) => item.name === 'ripgrep')).toMatchObject({
      deprecated: true,
      disabled: false,
      deprecationReason: 'repo_archived',
      disableReason: null,
      replacement: {
        kind: 'formula',
        name: 'rgx'
      }
    });
    expect(normalized.find((item) => item.name === 'visual-studio-code')).toMatchObject({
      deprecated: false,
      disabled: true,
      deprecationReason: null,
      disableReason: 'unmaintained',
      replacement: {
        kind: 'cask',
        name: 'vscodium'
      }
    });
  });

  it('prefers disable replacement fields and falls back to deprecation replacement for disabled packages', () => {
    const normalized = normalizeInstalled({
      formulae: [
        {
          name: 'legacy-tool',
          versions: { stable: '1.0.0' },
          installed: [{ version: '1.0.0' }],
          deprecated: true,
          disabled: true,
          disable_replacement_formula: '',
          disable_replacement_cask: '',
          deprecation_replacement_formula: 'new-tool'
        }
      ]
    });

    expect(normalized[0]?.replacement).toEqual({
      kind: 'formula',
      name: 'new-tool'
    });
  });

  it('normalizes outdated packages', () => {
    const normalized = normalizeOutdated({
      formulae: [
        {
          name: 'node',
          installed_versions: ['22.6.0'],
          current_version: '22.7.0',
          pinned: false
        }
      ],
      casks: [
        {
          token: 'docker',
          installed_versions: ['4.37.0'],
          current_version: '4.38.0'
        }
      ]
    });

    expect(normalized).toHaveLength(2);
    expect(normalized.find((item) => item.kind === 'formula')?.name).toBe('node');
    expect(normalized.find((item) => item.kind === 'cask')?.name).toBe('docker');
  });
});
