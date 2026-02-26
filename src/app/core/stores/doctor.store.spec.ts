import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { BrewDoctorResult } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';
import { DoctorStore } from './doctor.store';

const sampleReport: BrewDoctorResult = {
  command: 'brew doctor',
  exitCode: 1,
  findings: [
    {
      id: 'warning-1',
      severity: 'warning',
      title: 'Deprecated tap detected',
      details: ['Homebrew/homebrew-services'],
      suggestedFix: 'Untap them with `brew untap`.'
    },
    {
      id: 'error-1',
      severity: 'error',
      title: 'Broken symlink detected',
      details: ['/usr/local/bin/broken'],
      suggestedFix: 'Run `brew cleanup`.'
    }
  ],
  counts: {
    error: 1,
    warning: 1,
    info: 0
  },
  rawOutput: 'Warning: Deprecated tap detected',
  generatedAt: '2026-02-26T00:00:00.000Z'
};

describe('DoctorStore', () => {
  function render() {
    const facade = {
      runDoctor: vi.fn(async () => sampleReport)
    };

    TestBed.configureTestingModule({
      providers: [{ provide: BrewFacadeService, useValue: facade }]
    });

    const store = TestBed.inject(DoctorStore);
    return { store, facade };
  }

  it('loads doctor report data', async () => {
    const { store, facade } = render();

    const started = await store.runDoctor();

    expect(started).toBe(true);
    expect(facade.runDoctor).toHaveBeenCalledTimes(1);
    expect(store.hasReport()).toBe(true);
    expect(store.findings()).toHaveLength(2);
    expect(store.counts()).toEqual({
      error: 1,
      warning: 1,
      info: 0
    });
  });

  it('filters findings by severity and query', async () => {
    const { store } = render();

    await store.runDoctor();

    store.setSeverityFilter('error');
    expect(store.filteredFindings().map((finding) => finding.id)).toEqual(['error-1']);

    store.setSeverityFilter('all');
    store.setQuery('untap');
    expect(store.filteredFindings().map((finding) => finding.id)).toEqual(['warning-1']);
  });

  it('stores error when doctor run fails', async () => {
    const { store, facade } = render();
    facade.runDoctor.mockRejectedValueOnce(new Error('doctor unavailable'));

    const started = await store.runDoctor();

    expect(started).toBe(false);
    expect(store.error()).toBe('doctor unavailable');
    expect(store.initialRunAttempted()).toBe(true);
  });

  it('ensureInitialRun executes only once', async () => {
    const { store, facade } = render();

    await store.ensureInitialRun();
    await store.ensureInitialRun();

    expect(facade.runDoctor).toHaveBeenCalledTimes(1);
  });
});
