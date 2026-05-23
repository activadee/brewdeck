import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { ZardButtonComponent } from '@/shared/components/button';
import type { CatalogPackage } from '../../../../shared/contracts';
import { EmptyStateComponent } from '../../../components/foundation/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../../components/foundation/loading-state/loading-state.component';
import { PackageFilterChipsComponent } from '../../../components/shared/package-filter-chips/package-filter-chips.component';
import type { PackageRowOverflowAction } from '../../../components/shared/package-row-overflow-menu/package-row-overflow-menu.component';
import { PackageRowComponent } from '../../../components/shared/package-row/package-row.component';
import { PackageSearchInputComponent } from '../../../components/shared/package-search-input/package-search-input.component';
import { UpgradeConfirmDialogComponent } from '../../../components/ux/upgrade-confirm-dialog/upgrade-confirm-dialog.component';
import { PackageActionsService } from '../../../core/services/package-actions.service';
import { DiagnosticPanelComponent } from '../../../components/ux/diagnostic-panel/diagnostic-panel.component';
import { SettingsStore } from '../../../core/stores/settings.store';
import { TemplatesStore } from '../../../core/stores/templates.store';
import { CatalogStore } from '../../../core/stores/catalog.store';
import { InstalledStore } from '../../../core/stores/installed.store';
import { PackageDetailsStore } from '../../../core/stores/package-details.store';
import { UpdatesStore } from '../../../core/stores/updates.store';

@Component({
  selector: 'app-browse-catalog-view',
  imports: [
    ZardButtonComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    PackageFilterChipsComponent,
    PackageRowComponent,
    PackageSearchInputComponent,
    UpgradeConfirmDialogComponent,
    DiagnosticPanelComponent
  ],
  templateUrl: './browse-catalog-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './browse-catalog-view.component.css',
})
export class BrowseCatalogViewComponent {
  protected readonly catalogStore = inject(CatalogStore);
  protected readonly installedStore = inject(InstalledStore);
  protected readonly updatesStore = inject(UpdatesStore);
  protected readonly packageDetailsStore = inject(PackageDetailsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly packageActions = inject(PackageActionsService);
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly templatesStore = inject(TemplatesStore);

  protected readonly filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'formula', label: 'Formulae' },
    { value: 'cask', label: 'Casks' }
  ];

  private readonly installTarget = signal<CatalogPackage | null>(null);
  protected readonly forceSelected = signal(false);
  protected readonly installBusy = signal(false);
  protected readonly installConfirmOpen = computed(() => Boolean(this.installTarget()));
  protected readonly installDialogTitle = computed(() =>
    this.installTarget() ? `Install ${this.installTarget()!.name}?` : 'Install package?'
  );
  protected readonly installDialogMessage = computed(() =>
    this.installTarget()
      ? 'This will run Homebrew install for the selected package.'
      : 'This will run Homebrew install.'
  );
  protected readonly installCommandPreview = computed(() => {
    const target = this.installTarget();
    if (!target) {
      return null;
    }

    const forceFlag = this.forceSelected() ? ' --force' : '';
    return target.kind === 'formula'
      ? `brew install --formula${forceFlag} ${target.name}`
      : `brew install --cask${forceFlag} ${target.name}`;
  });
  protected readonly showForceInstallOption = computed(
    () => this.packageActions.showAdvancedInstallOptions()
  );

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    void this.templatesStore.load();
    this.destroyRef.onDestroy(() => {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
    });
  }

  protected onQueryChange(query: string): void {
    this.catalogStore.setQuery(query);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      void this.catalogStore.refresh();
    }, 220);
  }

  protected onKindChange(kind: string): void {
    this.catalogStore.setKindFilter(kind as 'all' | 'formula' | 'cask');
    void this.catalogStore.refresh();
  }

  protected packageDescription(item: CatalogPackage): string | null {
    const badges: string[] = [];
    if (item.deprecated) {
      badges.push('Deprecated');
    }
    if (item.disabled) {
      badges.push('Disabled');
    }

    const prefix = badges.length > 0 ? `[${badges.join(' • ')}] ` : '';
    const desc = item.desc ?? '';
    const combined = `${prefix}${desc}`.trim();
    return combined || null;
  }

  protected installActionLabel(item: CatalogPackage): string {
    if (this.isInstalled(item)) {
      return 'Installed';
    }
    if (item.disabled) {
      return 'Disabled';
    }
    return 'Install';
  }

  protected installActionVariant(item: CatalogPackage): 'primary' | 'secondary' {
    return this.canInstall(item) ? 'primary' : 'secondary';
  }

  protected installActionDisabled(item: CatalogPackage): boolean {
    return !this.canInstall(item);
  }

  protected overflowActionsFor(item: CatalogPackage): PackageRowOverflowAction[] {
    return [
      { id: 'view-details', label: 'View details' },
      {
        id: 'run-template',
        label: 'Run template…',
        disabled: this.templatesStore.templates().length === 0
      }
    ];
  }

  protected openInstallDialog(item: CatalogPackage): void {
    if (!this.canInstall(item) || this.installBusy()) {
      return;
    }

    this.installTarget.set(item);
    this.forceSelected.set(false);
  }

  protected closeInstallDialog(): void {
    if (this.installBusy()) {
      return;
    }

    this.installTarget.set(null);
    this.forceSelected.set(false);
  }

  protected onForceSelectedChange(selected: boolean): void {
    this.forceSelected.set(selected);
  }

  protected async onOverflowAction(item: CatalogPackage, action: string): Promise<void> {
    if (action === 'view-details') {
      await this.packageDetailsStore.openFor({ kind: item.kind, name: item.name });
      return;
    }

    if (action === 'run-template') {
      const template = this.templatesStore.templates().at(0);
      if (!template) {
        return;
      }
      await this.packageActions.runTemplate(
        { templateId: template.id, kind: item.kind, name: item.name },
        template.name
      );
      await Promise.all([
        this.installedStore.refresh(),
        this.updatesStore.refresh(),
        this.catalogStore.refresh()
      ]);
    }
  }

  protected async confirmInstall(): Promise<void> {
    const target = this.installTarget();
    if (!target) {
      return;
    }

    this.installBusy.set(true);
    try {
      const request = this.forceSelected()
        ? { kind: target.kind, name: target.name, force: true }
        : { kind: target.kind, name: target.name };
      const success = await this.packageActions.installOne(request);
      if (!success) {
        return;
      }
      await Promise.all([
        this.installedStore.refresh(),
        this.updatesStore.refresh(),
        this.catalogStore.refresh()
      ]);
      this.installTarget.set(null);
      this.forceSelected.set(false);
    } finally {
      this.installBusy.set(false);
    }
  }

  private isInstalled(item: CatalogPackage): boolean {
    return this.installedStore.installedIdSet().has(item.id);
  }

  private canInstall(item: CatalogPackage): boolean {
    if (item.disabled) {
      return false;
    }

    return !this.isInstalled(item);
  }
}
