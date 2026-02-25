import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

import type { ClassValue } from 'clsx';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { loaderVariants, type ZardLoaderVariants } from '../loader.variants';

@Component({
  selector: 'z-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'zLoader',
})
export class ZardLoaderComponent {
  readonly class = input<ClassValue>('');
  readonly zSize = input<ZardLoaderVariants['zSize']>('default');

  protected readonly bars = Array.from({ length: 12 });
  protected readonly animationDelay = (index: number) => `-${1.3 - index * 0.1}s`;
  protected readonly transform = (index: number) => `rotate(${30 * index}deg) translate(146%)`;

  protected readonly classes = computed(() => mergeClasses(loaderVariants({ zSize: this.zSize() }), this.class()));
}
