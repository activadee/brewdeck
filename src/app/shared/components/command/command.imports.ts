import { ZardCommandDividerComponent } from './command-divider/command-divider.component';
import { ZardCommandEmptyComponent } from './command-empty/command-empty.component';
import { ZardCommandInputComponent } from './command-input/command-input.component';
import { ZardCommandListComponent } from './command-list/command-list.component';
import { ZardCommandOptionGroupComponent } from './command-option-group/command-option-group.component';
import { ZardCommandOptionComponent } from './command-option/command-option.component';
import { ZardCommandComponent } from './command/command.component';

export const ZardCommandImports = [
  ZardCommandComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandEmptyComponent,
  ZardCommandOptionComponent,
  ZardCommandOptionGroupComponent,
  ZardCommandDividerComponent,
] as const;
