import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import type { BrewService } from '../../../../shared/contracts';
import { EmptyStateComponent } from '../../../components/foundation/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../components/foundation/loading-state/loading-state.component';
import { PackageFilterChipsComponent } from '../../../components/shared/package-filter-chips/package-filter-chips.component';
import {
  PackageRowOverflowMenuComponent,
  type PackageRowOverflowAction
} from '../../../components/shared/package-row-overflow-menu/package-row-overflow-menu.component';
import { PackageSearchInputComponent } from '../../../components/shared/package-search-input/package-search-input.component';
import { ToastService } from '../../../core/services/toast.service';
import { ServicesStore, type ServiceStatusFilter } from '../../../core/stores/services.store';

@Component({
  selector: 'app-services-view',
  imports: [
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    PackageFilterChipsComponent,
    PackageRowOverflowMenuComponent,
    PackageSearchInputComponent
  ],
  templateUrl: './services-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './services-view.component.css',
})
export class ServicesViewComponent {
  protected readonly servicesStore = inject(ServicesStore);
  private readonly toast = inject(ToastService);

  protected readonly busy = computed(() => this.servicesStore.mutating());

  protected readonly statusFilterOptions = computed(() => [
    { value: 'all', label: 'All statuses', count: this.servicesStore.totalCount() },
    { value: 'started', label: 'Started', count: this.countByStatus('started') },
    { value: 'stopped', label: 'Stopped', count: this.countByStatus('stopped') },
    { value: 'none', label: 'None', count: this.countByStatus('none') },
    { value: 'scheduled', label: 'Scheduled', count: this.countByStatus('scheduled') },
    { value: 'error', label: 'Error', count: this.countByStatus('error') },
    { value: 'unknown', label: 'Unknown', count: this.countByStatus('unknown') }
  ]);

  constructor() {
    if (!this.servicesStore.loading() && this.servicesStore.items().length === 0) {
      void this.servicesStore.refresh();
    }
  }

  protected onStatusFilterChange(value: string): void {
    this.servicesStore.setStatusFilter(value as ServiceStatusFilter);
  }

  protected statusBadgeType(status: BrewService['status']): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'started':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'scheduled':
        return 'default';
      default:
        return 'outline';
    }
  }

  protected overflowActionsFor(service: BrewService): PackageRowOverflowAction[] {
    return [
      {
        id: 'start',
        label: 'Start service',
        disabled: this.busy() || service.status === 'started'
      },
      {
        id: 'stop',
        label: 'Stop service',
        disabled: this.busy() || service.status !== 'started'
      },
      {
        id: 'restart',
        label: 'Restart service',
        disabled: this.busy() || service.status !== 'started'
      }
    ];
  }

  protected onOverflowAction(service: BrewService, action: string): void {
    switch (action) {
      case 'start':
        void this.startService(service.name);
        break;
      case 'stop':
        void this.stopService(service.name);
        break;
      case 'restart':
        void this.restartService(service.name);
        break;
      default:
        break;
    }
  }

  protected async startService(name: string): Promise<void> {
    const started = await this.servicesStore.serviceStart({ name });
    if (!started) {
      return;
    }

    this.toast.push(`Started service ${name}.`, 'success');
  }

  protected async stopService(name: string): Promise<void> {
    const stopped = await this.servicesStore.serviceStop({ name });
    if (!stopped) {
      return;
    }

    this.toast.push(`Stopped service ${name}.`, 'success');
  }

  protected async restartService(name: string): Promise<void> {
    const restarted = await this.servicesStore.serviceRestart({ name });
    if (!restarted) {
      return;
    }

    this.toast.push(`Restarted service ${name}.`, 'success');
  }

  private countByStatus(status: BrewService['status']): number {
    return this.servicesStore.items().filter((item) => item.status === status).length;
  }
}
