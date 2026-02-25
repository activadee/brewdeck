import { ZardDropdownMenuItemComponent } from './dropdown-item/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from './dropdown-menu-content/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@/shared/components/dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuComponent } from './dropdown/dropdown.component';
import { ZardMenuLabelComponent } from '../menu/menu-label/menu-label.component';

export const ZardDropdownImports = [
  ZardDropdownMenuComponent,
  ZardDropdownMenuItemComponent,
  ZardMenuLabelComponent,
  ZardDropdownMenuContentComponent,
  ZardDropdownDirective,
] as const;
