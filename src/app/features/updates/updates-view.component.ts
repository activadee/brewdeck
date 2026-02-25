import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ZardButtonComponent } from '@/shared/components/button';
import type { OutdatedPackage } from '../../../shared/contracts';
import { EmptyStateComponent } from '../../components/foundation/empty-state.component';
import { LoadingStateComponent } from '../../components/foundation/loading-state.component';
import { PackageFilterChipsComponent } from '../../components/shared/package-filter-chips.component';
import type { PackageRowOverflowAction } from '../../components/shared/package-row-overflow-menu.component';
import { PackageRowComponent } from '../../components/shared/package-row.component';
import { PackageSearchInputComponent } from '../../components/shared/package-search-input.component';
import { UpdateSummaryCardComponent } from '../../components/ux/update-summary-card.component';
import { UpgradeConfirmDialogComponent } from '../../components/ux/upgrade-confirm-dialog.component';
import { ToastService } from '../../core/services/toast.service';
import { InstalledStore } from '../../core/stores/installed.store';
import { UpdatesStore } from '../../core/stores/updates.store';

@Component({
  selector: 'app-updates-view',
  imports: [
    ZardButtonComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    PackageFilterChipsComponent,
    PackageRowComponent,
    PackageSearchInputComponent,
    UpdateSummaryCardComponent,
    UpgradeConfirmDialogComponent
  ],
  template: `
    <section class="ui-shell-enter space-y-2">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-semibold">Available Updates</h2>
        <div class="flex gap-1.5">
          <button
            type="button"
            z-button
            zType="outline"
            zSize="sm"
            (click)="updatesStore.checkNow()"
            [zDisabled]="updatesStore.loading()"
          >
            Check now
          </button>
          <button
            type="button"
            z-button
            zSize="sm"
            (click)="openUpgradeAll()"
            [zDisabled]="updatesStore.updateCount() === 0 || actionBusy()"
          >
            Upgrade all
          </button>
        </div>
      </header>

      <app-update-summary-card
        [count]="updatesStore.updateCount()"
        [lastCheckedAt]="updatesStore.lastCheckedAt()"
      />

      <app-package-search-input [value]="updatesStore.query()" (valueChange)="updatesStore.setQuery($event)" />

      <app-package-filter-chips
        [selected]="updatesStore.kindFilter()"
        [options]="filterOptions"
        (selectedChange)="onFilterChange($event)"
      />

      <app-package-filter-chips
        [selected]="updatesStore.pinFilter()"
        [options]="pinFilterOptions()"
        (selectedChange)="onPinFilterChange($event)"
      />

      @if (updatesStore.loading()) {
        <app-loading-state label="Checking outdated packages…" />
      } @else if (updatesStore.error()) {
        <app-empty-state label="Update check failed" [description]="updatesStore.error() ?? ''" />
      } @else if (updatesStore.filteredItems().length === 0) {
        <app-empty-state
          label="No updates"
          description="Everything looks up to date for the selected package type."
        />
      } @else {
        <div class="stagger-list space-y-1.5">
          @for (item of updatesStore.filteredItems(); track item.id) {
            <app-package-row
              [name]="item.name"
              [kind]="item.kind"
              [desc]="versionLabel(item)"
              [pinned]="item.pinned"
              [installedVersion]="item.installedVersions.at(0) ?? null"
              [currentVersion]="item.currentVersion"
              [actionLabel]="upgradeActionLabel(item)"
              [actionVariant]="upgradeActionVariant(item)"
              [actionDisabled]="upgradeActionDisabled(item)"
              [overflowActions]="overflowActionsFor(item)"
              (action)="openUpgradeOne(item)"
              (overflowAction)="onOverflowAction(item, $event)"
            />
          }
        </div>
      }
    </section>

    <app-upgrade-confirm-dialog
      [open]="confirmOpen()"
      [title]="dialogTitle()"
      [message]="dialogMessage()"
      [confirmLabel]="dialogConfirmLabel()"
      [busy]="updatesStore.upgrading()"
      (cancel)="closeDialog()"
      (confirm)="confirmUpgrade()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdatesViewComponent {
  protected readonly updatesStore = inject(UpdatesStore);
  protected readonly installedStore = inject(InstalledStore);
  private readonly toast = inject(ToastService);

  protected readonly filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'formula', label: 'Formulae' },
    { value: 'cask', label: 'Casks' }
  ];
  protected readonly pinFilterOptions = computed(() => [
    { value: 'all', label: 'All', count: this.updatesStore.updateCount() },
    { value: 'pinned', label: 'Pinned', count: this.updatesStore.pinnedCount() },
    { value: 'unpinned', label: 'Unpinned', count: this.updatesStore.unpinnedCount() }
  ]);
  protected readonly actionBusy = computed(() => this.updatesStore.upgrading() || this.updatesStore.pinning());

  protected onFilterChange(value: string): void {
    this.updatesStore.setKindFilter(value as 'all' | 'formula' | 'cask');
  }

  protected onPinFilterChange(value: string): void {
    this.updatesStore.setPinFilter(value as 'all' | 'pinned' | 'unpinned');
  }

  private readonly selectedPackage = signal<OutdatedPackage | null>(null);
  private readonly upgradeAllSelected = signal(false);

  protected readonly confirmOpen = computed(
    () => Boolean(this.selectedPackage()) || this.upgradeAllSelected()
  );

  protected readonly dialogTitle = computed(() =>
    this.upgradeAllSelected() ? 'Upgrade all outdated packages?' : `Upgrade ${this.selectedPackage()?.name}?`
  );

  protected readonly dialogMessage = computed(() =>
    this.upgradeAllSelected()
      ? 'This runs brew upgrade for formulae and casks. This can take several minutes.'
      : 'This runs brew upgrade for the selected package.'
  );

  protected readonly dialogConfirmLabel = computed(() =>
    this.upgradeAllSelected() ? 'Upgrade all' : 'Upgrade package'
  );

  protected versionLabel(item: OutdatedPackage): string {
    const installed = item.installedVersions.join(', ');
    return `Installed ${installed} → Latest ${item.currentVersion}`;
  }

  protected upgradeActionLabel(item: OutdatedPackage): string {
    return this.canUpgrade(item) ? 'Upgrade' : 'Pinned';
  }

  protected upgradeActionVariant(item: OutdatedPackage): 'primary' | 'secondary' {
    return this.canUpgrade(item) ? 'primary' : 'secondary';
  }

  protected upgradeActionDisabled(item: OutdatedPackage): boolean {
    return this.actionBusy() || !this.canUpgrade(item);
  }

  protected overflowActionsFor(item: OutdatedPackage): PackageRowOverflowAction[] {
    const busy = this.actionBusy();
    if (item.kind === 'cask') {
      return [
        {
          id: 'pin-not-supported',
          label: 'Pin not supported for casks',
          disabled: true
        }
      ];
    }

    return item.pinned
      ? [{ id: 'unpin', label: 'Unpin formula', disabled: busy }]
      : [{ id: 'pin', label: 'Pin formula', disabled: busy }];
  }

  protected openUpgradeOne(item: OutdatedPackage): void {
    if (!this.canUpgrade(item) || this.actionBusy()) {
      return;
    }

    this.selectedPackage.set(item);
    this.upgradeAllSelected.set(false);
  }

  protected openUpgradeAll(): void {
    if (this.actionBusy()) {
      return;
    }

    this.selectedPackage.set(null);
    this.upgradeAllSelected.set(true);
  }

  protected closeDialog(): void {
    this.selectedPackage.set(null);
    this.upgradeAllSelected.set(false);
  }

  protected async confirmUpgrade(): Promise<void> {
    if (this.upgradeAllSelected()) {
      const started = await this.updatesStore.upgradeAll();
      if (started) {
        this.toast.push('Upgrade-all command started.', 'success');
        this.closeDialog();
      }
      return;
    }

    const selected = this.selectedPackage();
    if (!selected) {
      return;
    }

    const started = await this.updatesStore.upgradeOne({ kind: selected.kind, name: selected.name });
    if (started) {
      this.toast.push(`Upgrade command started for ${selected.name}.`, 'success');
      this.closeDialog();
    }
  }

  protected async onOverflowAction(item: OutdatedPackage, action: string): Promise<void> {
    if (this.actionBusy() || item.kind !== 'formula') {
      return;
    }

    if (action === 'pin') {
      const started = await this.updatesStore.pinOne({ kind: 'formula', name: item.name });
      if (started) {
        await this.installedStore.refresh();
        this.toast.push(`Pinned ${item.name}.`, 'success');
      }
      return;
    }

    if (action === 'unpin') {
      const started = await this.updatesStore.unpinOne({ kind: 'formula', name: item.name });
      if (started) {
        await this.installedStore.refresh();
        this.toast.push(`Unpinned ${item.name}.`, 'success');
      }
    }
  }

  private canUpgrade(item: OutdatedPackage): boolean {
    return !(item.kind === 'formula' && item.pinned);
  }
}
