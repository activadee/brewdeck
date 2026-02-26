import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { BrewDoctorFinding, BrewDoctorResult, BrewDoctorSeverity } from '../../../shared/contracts';
import { BrewFacadeService } from '../services/brew-facade.service';

export type DoctorSeverityFilter = 'all' | BrewDoctorSeverity;

interface DoctorState {
  report: BrewDoctorResult | null;
  loading: boolean;
  error: string | null;
  query: string;
  severityFilter: DoctorSeverityFilter;
  initialRunAttempted: boolean;
  lastRefreshedAt: string | null;
}

const initialState: DoctorState = {
  report: null,
  loading: false,
  error: null,
  query: '',
  severityFilter: 'all',
  initialRunAttempted: false,
  lastRefreshedAt: null
};

const emptyCounts: BrewDoctorResult['counts'] = {
  error: 0,
  warning: 0,
  info: 0
};

const emptyGroups: Record<BrewDoctorSeverity, BrewDoctorFinding[]> = {
  error: [],
  warning: [],
  info: []
};

export const DoctorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasReport: computed(() => Boolean(store.report())),
    findings: computed(() => store.report()?.findings ?? []),
    counts: computed(() => store.report()?.counts ?? emptyCounts),
    generatedAt: computed(() => store.report()?.generatedAt ?? null),
    rawOutput: computed(() => store.report()?.rawOutput ?? ''),
    filteredFindings: computed(() =>
      filterDoctorFindings(store.report()?.findings ?? [], store.query(), store.severityFilter())
    ),
    groupedFindings: computed(() => {
      const grouped: Record<BrewDoctorSeverity, BrewDoctorFinding[]> = {
        ...emptyGroups,
        error: [],
        warning: [],
        info: []
      };
      const filtered = filterDoctorFindings(store.report()?.findings ?? [], store.query(), store.severityFilter());

      for (const finding of filtered) {
        grouped[finding.severity].push(finding);
      }

      return grouped;
    })
  })),
  withMethods((store, facade = inject(BrewFacadeService)) => ({
    setQuery(query: string): void {
      patchState(store, { query });
    },

    setSeverityFilter(severityFilter: DoctorSeverityFilter): void {
      patchState(store, { severityFilter });
    },

    async runDoctor(): Promise<boolean> {
      patchState(store, {
        loading: true,
        error: null,
        initialRunAttempted: true
      });

      try {
        const report = await facade.runDoctor();
        patchState(store, {
          report,
          loading: false,
          lastRefreshedAt: report.generatedAt
        });

        return true;
      } catch (error) {
        patchState(store, {
          loading: false,
          error: (error as Error).message
        });

        return false;
      }
    },

    async ensureInitialRun(): Promise<void> {
      if (store.initialRunAttempted() || store.loading()) {
        return;
      }

      await this.runDoctor();
    }
  }))
);

function filterDoctorFindings(
  findings: BrewDoctorFinding[],
  query: string,
  severityFilter: DoctorSeverityFilter
): BrewDoctorFinding[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return findings.filter((finding) => {
    if (severityFilter !== 'all' && finding.severity !== severityFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      finding.title,
      finding.details.join(' '),
      finding.suggestedFix ?? ''
    ]
      .join(' ')
      .toLocaleLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
