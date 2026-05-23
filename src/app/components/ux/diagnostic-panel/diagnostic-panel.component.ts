import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ZardButtonComponent } from '@/shared/components/button';
import { ZardCardComponent } from '@/shared/components/card';

@Component({
  selector: 'app-diagnostic-panel',
  imports: [ZardCardComponent, ZardButtonComponent],
  templateUrl: './diagnostic-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagnosticPanelComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly copyText = input<string | null>(null);

  protected async copy(): Promise<void> {
    const text = this.copyText() ?? this.message();
    await navigator.clipboard.writeText(text);
  }
}
