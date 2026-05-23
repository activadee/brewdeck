import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import {
  ZardCommandComponent,
  ZardCommandEmptyComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandOptionComponent,
  ZardCommandOptionGroupComponent,
  type ZardCommandOption
} from '@/shared/components/command';

export interface CommandPaletteAction {
  id: string;
  label: string;
  hint: string;
  group?: string;
}

export interface PackagePickerItem {
  id: string;
  label: string;
  hint: string;
}

export type CommandPaletteMode = 'root' | 'pickPackage' | 'pickTemplate';

@Component({
  selector: 'app-command-palette',
  imports: [
    ZardCommandComponent,
    ZardCommandInputComponent,
    ZardCommandListComponent,
    ZardCommandEmptyComponent,
    ZardCommandOptionGroupComponent,
    ZardCommandOptionComponent
  ],
  templateUrl: './command-palette.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './command-palette.component.css',
})
export class CommandPaletteComponent {
  readonly open = input(false);
  readonly mode = input<CommandPaletteMode>('root');
  readonly actions = input<CommandPaletteAction[]>([]);
  readonly packageItems = input<PackagePickerItem[]>([]);
  readonly templateItems = input<PackagePickerItem[]>([]);
  readonly placeholder = input('Type a command…');

  readonly selected = output<string>();
  readonly closed = output<void>();
  readonly back = output<void>();

  protected readonly query = signal('');

  protected readonly filteredActions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.actions();
    if (!q) {
      return items;
    }
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
    );
  });

  protected readonly filteredPackages = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.packageItems();
    if (!q) {
      return items;
    }
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q)
    );
  });

  protected readonly filteredTemplates = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.templateItems();
    if (!q) {
      return items;
    }
    return items.filter((item) => item.label.toLowerCase().includes(q));
  });

  protected readonly actionGroups = computed(() => {
    const groups = new Map<string, CommandPaletteAction[]>();
    for (const action of this.filteredActions()) {
      const key = action.group ?? 'Commands';
      const current = groups.get(key) ?? [];
      current.push(action);
      groups.set(key, current);
    }
    return [...groups.entries()];
  });

  protected onCommandSelected(option: ZardCommandOption): void {
    this.selected.emit(String(option.value));
    this.query.set('');
  }

  protected onBackClick(): void {
    this.query.set('');
    this.back.emit();
  }
}
