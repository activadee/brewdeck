import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import type { ClassValue } from 'clsx';

import { ZardIdDirective } from '@/shared/core';
import { mergeClasses, noopFn } from '@/shared/utils/merge-classes';

import {
  checkboxLabelVariants,
  checkboxVariants,
  type ZardCheckboxShapeVariants,
  type ZardCheckboxSizeVariants,
  type ZardCheckboxTypeVariants,
} from '../checkbox.variants';
import { ZardIconComponent } from '../../icon/icon/icon.component';

type OnTouchedType = () => void;
type OnChangeType = (value: boolean) => void;

@Component({
  selector: 'z-checkbox, [z-checkbox]',
  imports: [ZardIconComponent, ZardIdDirective],
  templateUrl: './checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZardCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': "(disabled() ? 'cursor-not-allowed' : 'cursor-pointer') + ' flex items-center gap-2'",
    '[attr.aria-disabled]': 'disabled()',
  },
  exportAs: 'zCheckbox',
  styleUrl: './checkbox.component.css',
})
export class ZardCheckboxComponent implements ControlValueAccessor {
  readonly checkChange = output<boolean>();

  readonly class = input<ClassValue>('');
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zType = input<ZardCheckboxTypeVariants>('default');
  readonly zSize = input<ZardCheckboxSizeVariants>('default');
  readonly zShape = input<ZardCheckboxShapeVariants>('default');

  private onChange: OnChangeType = noopFn;
  private onTouched: OnTouchedType = noopFn;

  protected readonly classes = computed(() =>
    mergeClasses(checkboxVariants({ zType: this.zType(), zSize: this.zSize(), zShape: this.zShape() }), this.class()),
  );

  readonly disabledByForm = signal(false);
  protected readonly labelClasses = computed(() => mergeClasses(checkboxLabelVariants({ zSize: this.zSize() })));
  protected readonly disabled = computed(() => this.zDisabled() || this.disabledByForm());
  readonly checked = signal(false);

  writeValue(val: boolean): void {
    this.checked.set(val);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  onCheckboxBlur(): void {
    this.onTouched();
  }

  onCheckboxChange(): void {
    if (this.disabled()) {
      return;
    }

    this.checked.update(v => !v);
    this.onChange(this.checked());
    this.checkChange.emit(this.checked());
  }
}
