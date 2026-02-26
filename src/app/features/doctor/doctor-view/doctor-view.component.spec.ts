import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { BrewDoctorFinding, BrewDoctorResult } from '../../../../shared/contracts';
import { DoctorStore } from '../../../core/stores/doctor.store';
import { DoctorViewComponent } from './doctor-view.component';

const warningFinding: BrewDoctorFinding = {
  id: 'warning-1',
  severity: 'warning',
  title: 'Deprecated tap detected',
  details: ['Homebrew/homebrew-services'],
  suggestedFix: 'Untap them with `brew untap`.'
};

const sampleReport: BrewDoctorResult = {
  command: 'brew doctor',
  exitCode: 1,
  findings: [warningFinding],
  counts: {
    error: 0,
    warning: 1,
    info: 0
  },
  rawOutput: 'Warning: Deprecated tap detected',
  generatedAt: '2026-02-26T00:00:00.000Z'
};

describe('DoctorViewComponent', () => {
  async function render(options?: {
    loading?: boolean;
    error?: string | null;
    hasReport?: boolean;
    findings?: BrewDoctorFinding[];
    filteredFindings?: BrewDoctorFinding[];
  }) {
    const findings = options?.findings ?? [warningFinding];
    const filteredFindings = options?.filteredFindings ?? findings;
    const hasReport = options?.hasReport ?? true;
    const report = hasReport ? sampleReport : null;

    const store = {
      report: signal<BrewDoctorResult | null>(report),
      loading: signal(options?.loading ?? false),
      error: signal<string | null>(options?.error ?? null),
      query: signal(''),
      severityFilter: signal<'all' | 'error' | 'warning' | 'info'>('all'),
      initialRunAttempted: signal(false),
      lastRefreshedAt: signal<string | null>(sampleReport.generatedAt),
      hasReport: signal(hasReport),
      findings: signal(findings),
      counts: signal(sampleReport.counts),
      generatedAt: signal<string | null>(hasReport ? sampleReport.generatedAt : null),
      rawOutput: signal(hasReport ? sampleReport.rawOutput : ''),
      filteredFindings: signal(filteredFindings),
      groupedFindings: signal({
        error: filteredFindings.filter((finding) => finding.severity === 'error'),
        warning: filteredFindings.filter((finding) => finding.severity === 'warning'),
        info: filteredFindings.filter((finding) => finding.severity === 'info')
      }),
      setQuery: vi.fn(),
      setSeverityFilter: vi.fn(),
      runDoctor: vi.fn(async () => true),
      ensureInitialRun: vi.fn(async () => undefined)
    };

    await TestBed.configureTestingModule({
      imports: [DoctorViewComponent],
      providers: [{ provide: DoctorStore, useValue: store }]
    }).compileComponents();

    const fixture = TestBed.createComponent(DoctorViewComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, store };
  }

  it('renders grouped findings and suggested fixes', async () => {
    const { fixture } = await render();
    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Doctor Diagnostics');
    expect(html.textContent).toContain('Warnings');
    expect(html.textContent).toContain('Deprecated tap detected');
    expect(html.textContent).toContain('Suggested fix');
    expect(html.textContent).toContain('brew untap');
  });

  it('forwards severity filter changes to store', async () => {
    const { fixture, store } = await render();
    const component = fixture.componentInstance as any;

    component.onSeverityFilterChange('error');

    expect(store.setSeverityFilter).toHaveBeenCalledWith('error');
  });

  it('requests initial run on first open and supports manual rerun', async () => {
    const { fixture, store } = await render();
    const component = fixture.componentInstance as any;

    expect(store.ensureInitialRun).toHaveBeenCalledTimes(1);

    await component.runDiagnostics();

    expect(store.runDoctor).toHaveBeenCalledTimes(1);
  });

  it('renders loading state when report is unavailable', async () => {
    const { fixture } = await render({
      loading: true,
      hasReport: false,
      findings: [],
      filteredFindings: []
    });
    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Running Homebrew doctor');
  });
});
