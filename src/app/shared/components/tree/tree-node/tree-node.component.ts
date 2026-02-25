import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  type TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { ClassValue } from 'clsx';

import { ZardCheckboxComponent } from '../../checkbox/checkbox/checkbox.component';
import { ZardIconComponent } from '@/shared/components/icon';
import { mergeClasses } from '@/shared/utils/merge-classes';

import { ZardTreeService } from '../tree.service';
import type { TreeNode, TreeNodeTemplateContext } from '../tree.types';
import {
  treeNodeChildrenVariants,
  treeNodeContentVariants,
  treeNodeToggleVariants,
  treeNodeVariants,
} from '../tree.variants';

@Component({
  selector: 'z-tree-node',
  imports: [NgTemplateOutlet, FormsModule, ZardIconComponent, ZardCheckboxComponent],
  templateUrl: './tree-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-key]': 'node().key',
  },
  exportAs: 'zTreeNode',
  styleUrl: './tree-node.component.css',
})
export class ZardTreeNodeComponent<T = any> {
  readonly treeService = inject(ZardTreeService);

  readonly node = input.required<TreeNode<T>>();
  readonly level = input<number>(0);
  readonly selectable = input<boolean>(false);
  readonly checkable = input<boolean>(false);
  readonly flat = input<boolean>(false);
  readonly nodeTemplate = input<TemplateRef<TreeNodeTemplateContext<T>> | null>(null);
  readonly class = input<ClassValue>('');

  readonly isExpanded = computed(() => this.treeService.isExpanded(this.node().key));

  readonly isSelected = computed(() => this.treeService.isSelected(this.node().key));

  readonly checkState = computed(() => this.treeService.getCheckState(this.node().key));

  protected readonly hostClasses = computed(() =>
    mergeClasses(treeNodeVariants({ disabled: this.node().disabled ?? false }), this.class()),
  );

  protected readonly toggleClasses = computed(() =>
    mergeClasses(treeNodeToggleVariants({ isExpanded: this.isExpanded() })),
  );

  protected readonly contentClasses = computed(() =>
    mergeClasses(treeNodeContentVariants({ isSelected: this.isSelected() })),
  );

  protected readonly childrenClasses = computed(() =>
    mergeClasses(treeNodeChildrenVariants({ isExpanded: this.isExpanded() })),
  );

  onToggle(event: Event) {
    event.stopPropagation();
    this.treeService.toggle(this.node().key);
  }

  onContentClick() {
    if (this.node().disabled) {
      return;
    }
    this.treeService.notifyNodeClick(this.node());
    if (this.selectable()) {
      this.treeService.select(this.node().key, 'single');
    }
  }

  onCheckChange() {
    if (this.node().disabled) {
      return;
    }
    this.treeService.toggleCheck(this.node());
  }
}
