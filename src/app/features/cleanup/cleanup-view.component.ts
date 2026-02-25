import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { EmptyStateComponent } from '../../components/foundation/empty-state.component';
import { LoadingStateComponent } from '../../components/foundation/loading-state.component';
import { CleanupConfirmDialogComponent } from '../../components/ux/cleanup-confirm-dialog.component';
import { ToastService } from '../../core/services/toast.service';
import { CleanupStore } from '../../core/stores/cleanup.store';

@Component({
  selector: 'app-cleanup-view',
  imports: [
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    CleanupConfirmDialogComponent
  ],
  template: `
    <section class="ui-shell-enter space-y-2">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold">Cleanup Tools</h2>
          <p class="mt-1 text-xs text-muted-foreground">
            Preview reclaimable disk usage with <span class="mono">brew cleanup --dry-run</span>, then run cleanup explicitly.
          </p>
        </div>

        <div class="flex gap-1.5">
          <button type="button" z-button zType="outline" zSize="sm" (click)="refreshPreview()" [zDisabled]="busy()">
            Refresh preview
          </button>
          <button type="button" z-button zSize="sm" (click)="openConfirm()" [zDisabled]="busy()">
            Run cleanup
          </button>
        </div>
      </header>

      <z-card class="border-border/70 bg-card/95 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="space-y-1">
            <p class="text-xs text-muted-foreground uppercase tracking-[0.1em]">Estimated reclaimable space</p>
            <p class="mono text-xl font-semibold">{{ reclaimableLabel() }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <z-badge zType="outline" zShape="pill" class="mono text-[10px] uppercase">
              {{ cleanupStore.items().length }} items
            </z-badge>
            <z-badge zType="secondary" zShape="pill" class="mono text-[10px] uppercase">
              {{ generatedLabel() }}
            </z-badge>
          </div>
        </div>
      </z-card>

      <z-card class="border-border/70 bg-card/95 shadow-sm">
        <p class="text-xs text-muted-foreground uppercase tracking-[0.1em]">Command preview</p>
        <pre class="mt-1 overflow-x-auto rounded-md border border-border bg-muted/40 p-2 text-[11px] mono">{{ cleanupStore.command() }}</pre>
      </z-card>

      @if (cleanupStore.loadingPreview() && !cleanupStore.hasPreview()) {
        <app-loading-state label="Loading cleanup preview…" />
      } @else if (cleanupStore.error() && !cleanupStore.hasPreview()) {
        <app-empty-state label="Cleanup preview failed" [description]="cleanupStore.error() ?? ''" />
      } @else if (cleanupStore.items().length === 0) {
        <app-empty-state
          label="Nothing queued for cleanup"
          description="Dry-run did not return any removable Homebrew files."
        />
      } @else {
        <div class="stagger-list space-y-1.5">
          @for (item of cleanupStore.items(); track item.path) {
            <z-card class="fade-up border-border/70 bg-card/95 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="mono text-[11px] break-all">{{ item.path }}</p>
                  @if (item.metadata) {
                    <p class="mt-1 mono text-[10px] text-muted-foreground">{{ item.metadata }}</p>
                  }
                </div>
                <div class="text-right">
                  <p class="mono text-[11px]">{{ bytesLabel(item.sizeBytes) }}</p>
                  @if (item.fileCount !== null) {
                    <p class="mono text-[10px] text-muted-foreground">{{ item.fileCount }} files</p>
                  }
                </div>
              </div>
            </z-card>
          }
        </div>
      }

      <details class="rounded-md border border-border/70 bg-card/95">
        <summary class="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">Raw dry-run output</summary>
        <div class="px-3 pb-3">
          <pre class="max-h-64 overflow-auto rounded-md border border-border bg-muted/40 p-2 text-[11px] mono whitespace-pre-wrap">{{ cleanupStore.rawOutput() || 'No output captured.' }}</pre>
        </div>
      </details>

      @if (cleanupStore.error() && cleanupStore.hasPreview()) {
        <p class="text-sm text-destructive">{{ cleanupStore.error() }}</p>
      }
    </section>

    <app-cleanup-confirm-dialog
      [open]="confirmOpen()"
      [commandPreview]="'brew cleanup'"
      [estimatedReclaim]="reclaimableLabel()"
      [busy]="cleanupStore.running()"
      (cancel)="closeConfirm()"
      (confirm)="confirmCleanup()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CleanupViewComponent {
  protected readonly cleanupStore = inject(CleanupStore);
  private readonly toast = inject(ToastService);

  protected readonly confirmOpen = signal(false);
  protected readonly busy = computed(() => this.cleanupStore.loadingPreview() || this.cleanupStore.running());
  protected readonly reclaimableLabel = computed(() => this.bytesLabel(this.cleanupStore.totalBytes()));
  protected readonly generatedLabel = computed(() => {
    const generatedAt = this.cleanupStore.generatedAt();
    if (!generatedAt) {
      return 'not generated';
    }

    try {
      return `generated ${new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return `generated ${generatedAt}`;
    }
  });

  constructor() {
    if (!this.cleanupStore.loadingPreview() && !this.cleanupStore.hasPreview()) {
      void this.cleanupStore.refreshPreview();
    }
  }

  protected refreshPreview(): void {
    void this.cleanupStore.refreshPreview();
  }

  protected openConfirm(): void {
    if (this.busy()) {
      return;
    }

    this.confirmOpen.set(true);
  }

  protected closeConfirm(): void {
    if (this.cleanupStore.running()) {
      return;
    }

    this.confirmOpen.set(false);
  }

  protected async confirmCleanup(): Promise<void> {
    const started = await this.cleanupStore.runCleanup();
    if (!started) {
      return;
    }

    this.toast.push('Cleanup command started.', 'success');
    this.confirmOpen.set(false);
  }

  protected bytesLabel(value: number | null): string {
    if (value === null) {
      return 'unknown';
    }

    if (value === 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let current = value;
    let unitIndex = 0;

    while (current >= 1024 && unitIndex < units.length - 1) {
      current /= 1024;
      unitIndex += 1;
    }

    const formatted = unitIndex === 0 ? String(Math.round(current)) : current.toFixed(1);
    return `${formatted} ${units[unitIndex]}`;
  }
}
