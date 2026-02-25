import { ZardResizableHandleComponent } from './resizable-handle/resizable-handle.component';
import { ZardResizablePanelComponent } from './resizable-panel/resizable-panel.component';
import { ZardResizableComponent } from './resizable/resizable.component';

export const ZardResizableImports = [
  ZardResizableComponent,
  ZardResizableHandleComponent,
  ZardResizablePanelComponent,
] as const;
