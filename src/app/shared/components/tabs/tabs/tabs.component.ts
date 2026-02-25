import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  DOCUMENT,
  type ElementRef,
  inject,
  Injector,
  input,
  output,
  runInInjectionContext,
  signal,
  type TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import clsx from 'clsx';
import { debounceTime, fromEvent, merge, map, distinctUntilChanged } from 'rxjs';
import { twMerge } from 'tailwind-merge';

import { ZardButtonComponent } from '@/shared/components/button';
import { ZardIconComponent } from '@/shared/components/icon';
import {
  tabButtonVariants,
  tabContainerVariants,
  tabNavVariants,
  type ZardTabVariants,
} from '@/shared/components/tabs/tabs.variants';

export type zPosition = 'top' | 'bottom' | 'left' | 'right';
export type zAlign = 'center' | 'start' | 'end';

@Component({
  selector: 'z-tab',
  imports: [],
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZardTabComponent {
  readonly label = input.required<string>();
  readonly contentTemplate = viewChild.required<TemplateRef<unknown>>('content');
}

@Component({
  selector: 'z-tab-group',
  imports: [NgTemplateOutlet, ZardButtonComponent, ZardIconComponent],
  templateUrl: './tabs-root.component.html',
  styleUrl: './tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class]': 'containerClasses()' },
})
export class ZardTabGroupComponent implements AfterViewInit {
  private readonly tabComponents = contentChildren(ZardTabComponent, { descendants: true });
  private readonly tabsContainer = viewChild.required<ElementRef>('tabNav');
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly window = inject(DOCUMENT).defaultView;

  protected readonly tabs = computed(() => this.tabComponents());
  protected readonly activeTabIndex = signal<number>(0);
  protected readonly scrollPresent = signal<boolean>(false);

  protected readonly zTabChange = output<{
    index: number;
    label: string;
    tab: ZardTabComponent;
  }>();

  protected readonly zDeselect = output<{
    index: number;
    label: string;
    tab: ZardTabComponent;
  }>();

  readonly zTabsPosition = input<ZardTabVariants['zPosition']>('top');
  readonly zActivePosition = input<ZardTabVariants['zActivePosition']>('bottom');
  readonly zShowArrow = input(true);
  readonly zScrollAmount = input(100);
  readonly zAlignTabs = input<zAlign>('start');
  // Preserve consumer classes on host
  readonly class = input<string>('');

  protected readonly showArrow = computed(() => this.zShowArrow() && this.scrollPresent());

  ngAfterViewInit(): void {
    // default tab selection
    if (this.tabs().length) {
      this.setActiveTab(0);
    }

    runInInjectionContext(this.injector, () => {
      const observeInputs$ = merge(
        toObservable(this.zShowArrow),
        toObservable(this.tabs),
        toObservable(this.zTabsPosition),
      );

      // Re-observe whenever #tabNav reference changes (e.g., when placement toggles)
      let observedEl: HTMLElement | null = null;
      const tabNavEl$ = toObservable(this.tabsContainer).pipe(
        map(ref => ref.nativeElement as HTMLElement),
        distinctUntilChanged(),
      );

      afterNextRender(() => {
        // SSR/browser guard
        if (!this.window || typeof ResizeObserver === 'undefined') {
          return;
        }

        const resizeObserver = new ResizeObserver(() => this.setScrollState());

        tabNavEl$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(el => {
          if (observedEl) {
            resizeObserver.unobserve(observedEl);
          }
          observedEl = el;
          resizeObserver.observe(el);
          this.setScrollState();
        });

        merge(observeInputs$, fromEvent(this.window, 'resize'))
          .pipe(debounceTime(10), takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.setScrollState());

        this.destroyRef.onDestroy(() => resizeObserver.disconnect());
      });
    });
  }

  private setScrollState(): void {
    if (this.hasScroll() !== this.scrollPresent()) {
      this.scrollPresent.set(this.hasScroll());
    }
  }

  private hasScroll(): boolean {
    const navElement: HTMLElement = this.tabsContainer().nativeElement;
    if (this.zShowArrow()) {
      return navElement.scrollWidth > navElement.clientWidth || navElement.scrollHeight > navElement.clientHeight;
    }
    return false;
  }

  protected setActiveTab(index: number) {
    const currentTab = this.tabs()[this.activeTabIndex()];
    if (index !== this.activeTabIndex()) {
      this.zDeselect.emit({
        index: this.activeTabIndex(),
        label: currentTab.label(),
        tab: currentTab,
      });
    }

    this.activeTabIndex.set(index);
    const activeTabComponent = this.tabs()[index];
    if (activeTabComponent) {
      this.zTabChange.emit({
        index,
        label: activeTabComponent.label(),
        tab: activeTabComponent,
      });
    }
  }

  protected readonly navBeforeContent = computed(() => {
    const position = this.zTabsPosition();
    return position === 'top' || position === 'left';
  });

  protected readonly isHorizontal = computed(() => {
    const position = this.zTabsPosition();
    return position === 'top' || position === 'bottom';
  });

  protected readonly navGridClasses = computed(() => {
    const gridLayout = this.isHorizontal() ? 'grid-cols-[25px_1fr_25px]' : 'grid-rows-[25px_1fr_25px]';
    if (this.showArrow()) {
      return twMerge(clsx('grid', gridLayout));
    }
    return 'grid';
  });

  protected readonly containerClasses = computed(() =>
    twMerge(tabContainerVariants({ zPosition: this.zTabsPosition() }), this.class()),
  );

  protected readonly navClasses = computed(() =>
    tabNavVariants({ zPosition: this.zTabsPosition(), zAlignTabs: this.showArrow() ? 'start' : this.zAlignTabs() }),
  );

  protected readonly buttonClassesSignal = computed(() => {
    const activeIndex = this.activeTabIndex();
    const position = this.zActivePosition();
    return this.tabs().map((_, index) => {
      const isActive = activeIndex === index;
      return tabButtonVariants({ zActivePosition: position, isActive });
    });
  });

  protected scrollNav(direction: 'left' | 'right' | 'up' | 'down') {
    const container = this.tabsContainer().nativeElement;
    const scrollAmount = this.zScrollAmount();
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else if (direction === 'right') {
      container.scrollLeft += scrollAmount;
    } else if (direction === 'up') {
      container.scrollTop -= scrollAmount;
    } else if (direction === 'down') {
      container.scrollTop += scrollAmount;
    }
  }

  selectTabByIndex(index: number): void {
    if (index >= 0 && index < this.tabs().length) {
      this.setActiveTab(index);
    } else {
      console.warn(`Index ${index} outside the range of available tabs.`);
    }
  }
}
