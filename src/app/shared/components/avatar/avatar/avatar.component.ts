import { NgOptimizedImage } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import type { SafeUrl } from '@angular/platform-browser';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { avatarVariants, imageVariants, type ZardAvatarVariants, type ZardImageVariants } from '../avatar.variants';

export type ZardAvatarStatus = 'online' | 'offline' | 'doNotDisturb' | 'away';

@Component({
  selector: 'z-avatar, [z-avatar]',
  imports: [NgOptimizedImage],
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'containerClasses()',
    '[style.width]': 'customSize()',
    '[style.height]': 'customSize()',
    '[attr.data-slot]': '"avatar"',
    '[attr.data-status]': 'zStatus() ?? null',
  },
  exportAs: 'zAvatar',
  styleUrl: './avatar.component.css',
})
export class ZardAvatarComponent {
  readonly class = input<string>('');
  readonly zAlt = input<string>('');
  readonly zFallback = input<string>('');
  readonly zPriority = input(false, { transform: booleanAttribute });
  readonly zShape = input<ZardImageVariants['zShape']>('circle');
  readonly zSize = input<ZardAvatarVariants['zSize'] | number>('default');
  readonly zSrc = input<string | SafeUrl>('');
  readonly zStatus = input<ZardAvatarStatus>();

  protected readonly imageError = signal(false);
  protected readonly imageLoaded = signal(false);

  constructor() {
    effect(() => {
      // Reset image state when zSrc changes
      this.zSrc();
      this.imageError.set(false);
      this.imageLoaded.set(false);
    });
  }

  protected readonly containerClasses = computed(() => {
    const size = this.zSize();
    const zSize = typeof size === 'number' ? undefined : (size as ZardAvatarVariants['zSize']);

    return mergeClasses(avatarVariants({ zShape: this.zShape(), zSize }), this.class());
  });

  protected readonly customSize = computed(() => {
    const size = this.zSize();
    return typeof size === 'number' ? `${size}px` : null;
  });

  protected readonly imgClasses = computed(() => mergeClasses(imageVariants({ zShape: this.zShape() })));

  protected onImageLoad(): void {
    this.imageLoaded.set(true);
    this.imageError.set(false);
  }

  protected onImageError(): void {
    this.imageError.set(true);
    this.imageLoaded.set(false);
  }
}
