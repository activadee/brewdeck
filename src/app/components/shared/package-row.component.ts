import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ZardCardComponent } from '@/shared/components/card';
import type { PackageKind } from '../../../shared/contracts';
import { PackageActionButtonComponent } from './package-action-button.component';
import { PackageMetaComponent } from './package-meta.component';
import {
  PackageRowOverflowMenuComponent,
  type PackageRowOverflowAction
} from './package-row-overflow-menu.component';

@Component({
  selector: 'app-package-row',
  imports: [
    ZardCardComponent,
    PackageMetaComponent,
    PackageActionButtonComponent,
    PackageRowOverflowMenuComponent
  ],
  template: `
    <z-card class="fade-up border-border/70 bg-card/95 shadow-sm">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h4 class="truncate text-sm font-semibold">{{ name() }}</h4>
          @if (desc()) {
            <p class="mt-0.5 text-xs text-muted-foreground">{{ desc() }}</p>
          }
          <app-package-meta
            [kind]="kind()"
            [pinned]="pinned()"
            [installedVersion]="installedVersion()"
            [currentVersion]="currentVersion()"
            [tap]="tap()"
          />
        </div>

        <div class="flex items-center gap-1.5">
          @if (actionLabel(); as label) {
            <app-package-action-button
              [label]="label"
              [disabled]="actionDisabled()"
              [variant]="actionVariant()"
              (pressed)="action.emit()"
            />
          }

          @if (overflowActions().length > 0) {
            <app-package-row-overflow-menu
              [actions]="overflowActions()"
              (selected)="overflowAction.emit($event)"
            />
          }
        </div>
      </div>
    </z-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageRowComponent {
  readonly name = input.required<string>();
  readonly kind = input<PackageKind>('formula');
  readonly desc = input<string | null>(null);
  readonly pinned = input(false);
  readonly installedVersion = input<string | null>(null);
  readonly currentVersion = input<string | null>(null);
  readonly tap = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly actionDisabled = input(false);
  readonly actionVariant = input<'primary' | 'secondary'>('secondary');
  readonly overflowActions = input<PackageRowOverflowAction[]>([]);

  readonly action = output<void>();
  readonly overflowAction = output<string>();
}
