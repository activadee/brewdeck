import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import type { BrewDoctorFinding, BrewDoctorSeverity } from '../../../../shared/contracts';
import { EmptyStateComponent } from '../../../components/foundation/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../components/foundation/loading-state/loading-state.component';
import { PackageFilterChipsComponent } from '../../../components/shared/package-filter-chips/package-filter-chips.component';
import { PackageSearchInputComponent } from '../../../components/shared/package-search-input/package-search-input.component';
import { DoctorStore, type DoctorSeverityFilter } from '../../../core/stores/doctor.store';

@Component({
  selector: 'app-doctor-view',
  imports: [
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    PackageFilterChipsComponent,
    PackageSearchInputComponent
  ],
  templateUrl: './doctor-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './doctor-view.component.css',
})
export class DoctorViewComponent {
  protected readonly doctorStore = inject(DoctorStore);

  protected readonly severityOrder: BrewDoctorSeverity[] = ['error', 'warning', 'info'];

  protected readonly busy = computed(() => this.doctorStore.loading());
  protected readonly generatedLabel = computed(() => this.formatGeneratedAt(this.doctorStore.generatedAt()));
  protected readonly severityFilterOptions = computed(() => {
    const counts = this.doctorStore.counts();

    return [
      {
        value: 'all',
        label: 'All findings',
        count: this.doctorStore.findings().length
      },
      { value: 'error', label: 'Errors', count: counts.error },
      { value: 'warning', label: 'Warnings', count: counts.warning },
      { value: 'info', label: 'Info', count: counts.info }
    ];
  });

  constructor() {
    void this.doctorStore.ensureInitialRun();
  }

  protected onSeverityFilterChange(value: string): void {
    this.doctorStore.setSeverityFilter(value as DoctorSeverityFilter);
  }

  protected async runDiagnostics(): Promise<void> {
    if (this.busy()) {
      return;
    }

    await this.doctorStore.runDoctor();
  }

  protected findingsForSeverity(severity: BrewDoctorSeverity): BrewDoctorFinding[] {
    return this.doctorStore.groupedFindings()[severity];
  }

  protected severityBadgeType(severity: BrewDoctorSeverity): 'secondary' | 'outline' | 'destructive' {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      case 'info':
      default:
        return 'secondary';
    }
  }

  protected severityLabel(severity: BrewDoctorSeverity): string {
    switch (severity) {
      case 'error':
        return 'Errors';
      case 'warning':
        return 'Warnings';
      case 'info':
      default:
        return 'Info';
    }
  }

  private formatGeneratedAt(value: string | null): string {
    if (!value) {
      return 'not generated';
    }

    try {
      return `generated ${new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return `generated ${value}`;
    }
  }
}
