import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  type TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import type { ClassValue } from 'clsx';

import {
  ZardButtonComponent,
  type ZardButtonSizeVariants,
  type ZardButtonTypeVariants,
} from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import {
  paginationContentVariants,
  paginationEllipsisVariants,
  paginationNextVariants,
  paginationPreviousVariants,
  paginationVariants,
} from '@/shared/components/pagination/pagination.variants';
import { mergeClasses } from '@/shared/utils/merge-classes';

@Component({
  selector: 'ul[z-pagination-content]',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'pagination-content',
    '[class]': 'classes()',
  },
  exportAs: 'zPaginationContent',
})
export class ZardPaginationContentComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationContentVariants(), this.class()));
}

@Component({
  selector: 'li[z-pagination-item]',
  templateUrl: './pagination-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'pagination-item',
  },
  exportAs: 'zPaginationItem',
})
export class ZardPaginationItemComponent {}
// Structural wrapper component for pagination items (<li>). No inputs required.

@Component({
  selector: 'button[z-pagination-button], a[z-pagination-button]',
  imports: [ZardButtonComponent],
  templateUrl: './pagination-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-slot': 'pagination-button',
  },
  exportAs: 'zPaginationButton',
})
export class ZardPaginationButtonComponent {
  readonly class = input<ClassValue>('');
  readonly zActive = input(false, { transform: booleanAttribute });
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zSize = input<ZardButtonSizeVariants>('default');

  protected readonly zType = computed<ZardButtonTypeVariants>(() => (this.zActive() ? 'outline' : 'ghost'));
}

@Component({
  selector: 'z-pagination-previous',
  imports: [ZardPaginationButtonComponent, ZardIconComponent],
  templateUrl: './pagination-previous.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'zPaginationPrevious',
})
export class ZardPaginationPreviousComponent {
  readonly class = input<ClassValue>('');
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zSize = input<ZardButtonSizeVariants>('default');

  protected readonly classes = computed(() => mergeClasses(paginationPreviousVariants(), this.class()));
}

@Component({
  selector: 'z-pagination-next',
  imports: [ZardPaginationButtonComponent, ZardIconComponent],
  templateUrl: './pagination-next.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'zPaginationNext',
})
export class ZardPaginationNextComponent {
  readonly class = input<ClassValue>('');
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zSize = input<ZardButtonSizeVariants>('default');

  protected readonly classes = computed(() => mergeClasses(paginationNextVariants(), this.class()));
}

@Component({
  selector: 'z-pagination-ellipsis',
  imports: [ZardIconComponent],
  templateUrl: './pagination-ellipsis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    'aria-hidden': 'true',
  },
  exportAs: 'zPaginationEllipsis',
})
export class ZardPaginationEllipsisComponent {
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => mergeClasses(paginationEllipsisVariants(), this.class()));
}

@Component({
  selector: 'z-pagination',
  imports: [
    ZardPaginationContentComponent,
    ZardPaginationItemComponent,
    ZardPaginationButtonComponent,
    ZardPaginationPreviousComponent,
    ZardPaginationNextComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './pagination-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'group',
    '[attr.aria-label]': 'zAriaLabel()',
    'data-slot': 'pagination',
    '[class]': 'classes()',
  },
  exportAs: 'zPagination',
  styleUrl: './pagination.component.css',
})
export class ZardPaginationComponent {
  readonly zPageIndex = model<number>(1);
  readonly zTotal = input<number>(1);
  readonly zSize = input<ZardButtonSizeVariants>('default');
  readonly zDisabled = input(false, { transform: booleanAttribute });
  readonly zContent = input<TemplateRef<void> | undefined>();
  readonly zAriaLabel = input('Pagination');

  readonly class = input<ClassValue>('');

  readonly zPageIndexChange = output<number>();
  readonly Math = Math;

  protected readonly classes = computed(() => mergeClasses(paginationVariants(), this.class()));
  readonly pages = computed<number[]>(() => Array.from({ length: Math.max(0, this.zTotal()) }, (_, i) => i + 1));

  goToPage(page: number): void {
    if (!this.zDisabled() && page !== this.zPageIndex()) {
      this.zPageIndex.set(page);
      this.zPageIndexChange.emit(page);
    }
  }
}
