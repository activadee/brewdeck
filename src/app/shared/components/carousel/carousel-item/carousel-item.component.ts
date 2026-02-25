import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';

import { type ClassValue } from 'clsx';

import { ZardCarouselComponent } from '../carousel/carousel.component';
import { carouselItemVariants } from '@/shared/components/carousel/carousel.variants';
import { mergeClasses } from '@/shared/utils/merge-classes';

@Component({
  selector: 'z-carousel-item',
  templateUrl: './carousel-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    role: 'group',
    'aria-roledescription': 'slide',
  },
  styleUrl: './carousel-item.component.css',
})
export class ZardCarouselItemComponent {
  readonly #parent = inject(ZardCarouselComponent);

  readonly #orientation = computed<'horizontal' | 'vertical'>(() => this.#parent.zOrientation());
  readonly class = input<ClassValue>('');
  protected readonly classes = computed(() =>
    mergeClasses(carouselItemVariants({ zOrientation: this.#orientation() }), this.class()),
  );
}
