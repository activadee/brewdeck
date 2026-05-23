import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardCheckboxComponent } from '@/shared/components/checkbox';
import { ZardDividerComponent } from '@/shared/components/divider';

@Component({
  selector: 'app-upgrade-confirm-dialog',
  imports: [FormsModule, ZardCardComponent, ZardButtonComponent, ZardCheckboxComponent, ZardDividerComponent],
  templateUrl: './upgrade-confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './upgrade-confirm-dialog.component.css',
})
export class UpgradeConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm upgrade');
  readonly message = input('Run this operation?');
  readonly commandPreview = input<string | null>(null);
  readonly installedVersion = input<string | null>(null);
  readonly currentVersion = input<string | null>(null);
  readonly changelogSnippet = input<string | null>(null);
  readonly showForceOption = input(false);
  readonly forceSelected = input(false);
  readonly confirmLabel = input('Run');
  readonly busy = input(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
  readonly forceSelectedChange = output<boolean>();
}
