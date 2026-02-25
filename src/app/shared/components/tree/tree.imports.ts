import { ZardTreeNodeContentComponent } from './tree-node-content/tree-node-content.component';
import { ZardTreeNodeToggleDirective } from '@/shared/components/tree/tree-node-toggle.directive';
import { ZardTreeNodeComponent } from './tree-node/tree-node.component';
import { ZardTreeComponent } from './tree/tree.component';

export const ZardTreeImports = [
  ZardTreeComponent,
  ZardTreeNodeComponent,
  ZardTreeNodeToggleDirective,
  ZardTreeNodeContentComponent,
] as const;
