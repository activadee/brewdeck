import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardInputDirective } from '@/shared/components/input';
import type { BrewTap } from '../../../shared/contracts';
import { EmptyStateComponent } from '../../components/foundation/empty-state.component';
import { LoadingStateComponent } from '../../components/foundation/loading-state.component';
import { PackageFilterChipsComponent } from '../../components/shared/package-filter-chips.component';
import {
  PackageRowOverflowMenuComponent,
  type PackageRowOverflowAction
} from '../../components/shared/package-row-overflow-menu.component';
import { PackageSearchInputComponent } from '../../components/shared/package-search-input.component';
import { ToastService } from '../../core/services/toast.service';
import { CatalogStore } from '../../core/stores/catalog.store';
import { InstalledStore } from '../../core/stores/installed.store';
import { TapsStore } from '../../core/stores/taps.store';
import { UpdatesStore } from '../../core/stores/updates.store';

@Component({
  selector: 'app-taps-view',
  imports: [
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    EmptyStateComponent,
    LoadingStateComponent,
    PackageFilterChipsComponent,
    PackageRowOverflowMenuComponent,
    PackageSearchInputComponent
  ],
  template: `
    <section class="ui-shell-enter space-y-2">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold">Tap Management</h2>
          <p class="mt-1 text-xs text-muted-foreground">Inspect tap repository health and manage third-party taps.</p>
        </div>
        <div class="flex gap-1.5">
          <button type="button" z-button zType="outline" zSize="sm" (click)="tapsStore.refresh()" [zDisabled]="busy()">
            Refresh
          </button>
          <button type="button" z-button zSize="sm" (click)="openAddDialog()" [zDisabled]="busy()">
            Add tap
          </button>
        </div>
      </header>

      <app-package-search-input
        [value]="tapsStore.query()"
        placeholder="Search taps, remotes, and paths"
        (valueChange)="tapsStore.setQuery($event)"
      />

      <app-package-filter-chips
        [selected]="tapsStore.scopeFilter()"
        [options]="scopeFilterOptions"
        (selectedChange)="onScopeFilterChange($event)"
      />

      <app-package-filter-chips
        [selected]="tapsStore.healthFilter()"
        [options]="healthFilterOptions"
        (selectedChange)="onHealthFilterChange($event)"
      />

      @if (tapsStore.loading()) {
        <app-loading-state label="Loading tap repositories…" />
      } @else if (tapsStore.error()) {
        <app-empty-state label="Tap listing failed" [description]="tapsStore.error() ?? ''" />
      } @else if (tapsStore.filteredItems().length === 0) {
        <app-empty-state label="No tap results" description="No taps match the current query and filters." />
      } @else {
        <div class="stagger-list space-y-1.5">
          @for (tap of tapsStore.filteredItems(); track tap.name) {
            <z-card class="fade-up border-border/70 bg-card/95 shadow-sm">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 space-y-1.5">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <h3 class="text-sm font-semibold">{{ tap.name }}</h3>
                    @if (tap.official) {
                      <z-badge zType="secondary" zShape="pill" class="mono text-[10px] uppercase">official</z-badge>
                    }
                    @if (tap.protected) {
                      <z-badge zType="outline" zShape="pill" class="mono text-[10px] uppercase">protected</z-badge>
                    }
                    @if (tap.dirty) {
                      <z-badge zType="destructive" zShape="pill" class="mono text-[10px] uppercase">dirty</z-badge>
                    }
                    <z-badge [zType]="healthBadgeType(tap.health)" zShape="pill" class="mono text-[10px] uppercase">{{ tap.health }}</z-badge>
                    <z-badge zType="outline" zShape="pill" class="mono text-[10px] uppercase">{{ syncStateLabel(tap.syncState) }}</z-badge>
                  </div>

                  <p class="mono text-[11px] text-muted-foreground">path {{ tap.path ?? 'unavailable' }}</p>
                  <p class="mono text-[11px] text-muted-foreground">remote {{ tap.remote ?? 'unavailable' }}</p>

                  <div class="flex flex-wrap gap-3 mono text-[10px] text-muted-foreground uppercase">
                    <span>branch {{ tap.branch ?? 'n/a' }}</span>
                    <span>upstream {{ tap.upstream ?? 'n/a' }}</span>
                    <span>ahead {{ tap.ahead ?? 'n/a' }}</span>
                    <span>behind {{ tap.behind ?? 'n/a' }}</span>
                  </div>

                  @if (tap.warning) {
                    <p class="text-xs text-destructive">{{ tap.warning }}</p>
                  }
                </div>

                <app-package-row-overflow-menu
                  [actions]="overflowActionsFor(tap)"
                  ariaLabel="Tap actions"
                  (selected)="onOverflowAction(tap, $event)"
                />
              </div>
            </z-card>
          }
        </div>
      }

      <footer class="mono text-[10px] text-muted-foreground">
        total {{ tapsStore.totalCount() }} • protected {{ tapsStore.protectedCount() }} • third-party {{ tapsStore.thirdPartyCount() }}
      </footer>
    </section>

    @if (addDialogOpen()) {
      <div class="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm" (click)="closeAddDialog()"></div>
      <section class="fixed left-1/2 top-1/2 z-50 w-[520px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2">
        <z-card class="border-border/70 bg-popover/95 shadow-2xl">
          <div class="space-y-3">
            <div>
              <h3 class="text-base font-semibold">Add tap</h3>
              <p class="mt-1 text-sm text-muted-foreground">Enter tap name in owner/repo format.</p>
            </div>

            <input
              z-input
              type="text"
              [value]="pendingTapName()"
              placeholder="owner/repo"
              (input)="onPendingTapNameChange($event)"
              [disabled]="busy()"
              class="mono"
            />

            <pre class="overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-[11px] mono">{{ addCommandPreview() }}</pre>

            <div class="flex justify-end gap-2">
              <button type="button" z-button zType="outline" zSize="sm" [zDisabled]="busy()" (click)="closeAddDialog()">
                Cancel
              </button>
              <button type="button" z-button zSize="sm" [zDisabled]="busy() || !canSubmitAdd()" (click)="confirmAdd()">
                {{ busy() ? 'Running…' : 'Add tap' }}
              </button>
            </div>
          </div>
        </z-card>
      </section>
    }

    @if (removeTarget(); as target) {
      <div class="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm" (click)="closeRemoveDialog()"></div>
      <section class="fixed left-1/2 top-1/2 z-50 w-[520px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2">
        <z-card class="border-border/70 bg-popover/95 shadow-2xl">
          <div class="space-y-3">
            <div>
              <h3 class="text-base font-semibold">Remove tap {{ target.name }}?</h3>
              <p class="mt-1 text-sm text-muted-foreground">This untaps the selected repository from Homebrew.</p>
            </div>

            <pre class="overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-[11px] mono">brew untap {{ target.name }}</pre>

            <div class="flex justify-end gap-2">
              <button type="button" z-button zType="outline" zSize="sm" [zDisabled]="busy()" (click)="closeRemoveDialog()">
                Cancel
              </button>
              <button type="button" z-button zType="destructive" zSize="sm" [zDisabled]="busy()" (click)="confirmRemove()">
                {{ busy() ? 'Running…' : 'Remove tap' }}
              </button>
            </div>
          </div>
        </z-card>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TapsViewComponent {
  protected readonly tapsStore = inject(TapsStore);
  protected readonly installedStore = inject(InstalledStore);
  protected readonly updatesStore = inject(UpdatesStore);
  protected readonly catalogStore = inject(CatalogStore);
  private readonly toast = inject(ToastService);

  protected readonly scopeFilterOptions = [
    { value: 'all', label: 'All taps' },
    { value: 'official', label: 'Official' },
    { value: 'thirdParty', label: 'Third-party' }
  ];

  protected readonly healthFilterOptions = [
    { value: 'all', label: 'All health' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'attention', label: 'Attention' },
    { value: 'error', label: 'Error' }
  ];

  protected readonly addDialogOpen = signal(false);
  protected readonly pendingTapName = signal('');
  protected readonly removeTarget = signal<BrewTap | null>(null);
  protected readonly busy = computed(() => this.tapsStore.mutating());
  protected readonly canSubmitAdd = computed(() => /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(this.pendingTapName().trim()));
  protected readonly addCommandPreview = computed(() => {
    const name = this.pendingTapName().trim();
    return name ? `brew tap ${name}` : 'brew tap owner/repo';
  });

  constructor() {
    if (!this.tapsStore.loading() && this.tapsStore.items().length === 0) {
      void this.tapsStore.refresh();
    }
  }

  protected onScopeFilterChange(value: string): void {
    this.tapsStore.setScopeFilter(value as 'all' | 'official' | 'thirdParty');
  }

  protected onHealthFilterChange(value: string): void {
    this.tapsStore.setHealthFilter(value as 'all' | 'healthy' | 'attention' | 'error');
  }

  protected healthBadgeType(health: BrewTap['health']): 'secondary' | 'outline' | 'destructive' {
    switch (health) {
      case 'healthy':
        return 'secondary';
      case 'attention':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  protected syncStateLabel(state: BrewTap['syncState']): string {
    switch (state) {
      case 'upToDate':
        return 'up to date';
      case 'noUpstream':
        return 'no upstream';
      default:
        return state;
    }
  }

  protected overflowActionsFor(tap: BrewTap): PackageRowOverflowAction[] {
    return [
      {
        id: 'remove',
        label: tap.protected ? 'Protected tap cannot be removed' : 'Remove tap',
        disabled: tap.protected || this.busy(),
        destructive: !tap.protected
      }
    ];
  }

  protected onOverflowAction(tap: BrewTap, action: string): void {
    if (action !== 'remove' || tap.protected || this.busy()) {
      return;
    }

    this.removeTarget.set(tap);
  }

  protected openAddDialog(): void {
    if (this.busy()) {
      return;
    }

    this.removeTarget.set(null);
    this.pendingTapName.set('');
    this.addDialogOpen.set(true);
  }

  protected closeAddDialog(): void {
    if (this.busy()) {
      return;
    }

    this.addDialogOpen.set(false);
  }

  protected onPendingTapNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.pendingTapName.set(target.value);
  }

  protected async confirmAdd(): Promise<void> {
    if (!this.canSubmitAdd()) {
      return;
    }

    const name = this.pendingTapName().trim();
    const started = await this.tapsStore.tapAdd({ name });
    if (!started) {
      return;
    }

    await Promise.all([
      this.installedStore.refresh(),
      this.updatesStore.refresh(),
      this.catalogStore.refresh(true)
    ]);

    this.toast.push(`Added tap ${name}.`, 'success');
    this.addDialogOpen.set(false);
    this.pendingTapName.set('');
  }

  protected closeRemoveDialog(): void {
    if (this.busy()) {
      return;
    }

    this.removeTarget.set(null);
  }

  protected async confirmRemove(): Promise<void> {
    const target = this.removeTarget();
    if (!target || target.protected) {
      return;
    }

    const started = await this.tapsStore.tapRemove({ name: target.name });
    if (!started) {
      return;
    }

    await Promise.all([
      this.installedStore.refresh(),
      this.updatesStore.refresh(),
      this.catalogStore.refresh(true)
    ]);

    this.toast.push(`Removed tap ${target.name}.`, 'success');
    this.removeTarget.set(null);
  }
}
