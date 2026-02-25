import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDropdownMenuItemComponent, ZardDropdownMenuComponent } from '@/shared/components/dropdown';
import { ZardIconComponent } from '@/shared/components/icon';

export interface PackageRowOverflowAction {
  id: string;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
}

@Component({
  selector: 'app-package-row-overflow-menu',
  imports: [
    ZardButtonComponent,
    ZardDropdownMenuComponent,
    ZardDropdownMenuItemComponent,
    ZardIconComponent
  ],
  template: `
    <z-dropdown-menu class="shrink-0">
      <button
        type="button"
        dropdown-trigger
        z-button
        zType="ghost"
        zSize="icon-sm"
        [attr.aria-label]="ariaLabel()"
      >
        <z-icon zType="ellipsis" zSize="sm" />
      </button>

      @for (action of actions(); track action.id) {
        <z-dropdown-menu-item
          [disabled]="action.disabled ?? false"
          [variant]="action.destructive ? 'destructive' : 'default'"
          (click)="onSelect(action)"
        >
          {{ action.label }}
        </z-dropdown-menu-item>
      }
    </z-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageRowOverflowMenuComponent {
  readonly actions = input<PackageRowOverflowAction[]>([]);
  readonly ariaLabel = input('More package actions');

  readonly selected = output<string>();

  protected onSelect(action: PackageRowOverflowAction): void {
    if (action.disabled) {
      return;
    }

    this.selected.emit(action.id);
  }
}
