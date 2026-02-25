import { Routes } from '@angular/router';

import { BrowseCatalogViewComponent } from './features/browse/browse-catalog-view.component';
import { CleanupViewComponent } from './features/cleanup/cleanup-view.component';
import { InstalledPackagesViewComponent } from './features/installed/installed-packages-view.component';
import { SettingsViewComponent } from './features/settings/settings-view.component';
import { TapsViewComponent } from './features/taps/taps-view.component';
import { TrayPopoverComponent } from './features/tray/tray-popover.component';
import { UpdatesViewComponent } from './features/updates/updates-view.component';
import { AppShellComponent } from './layout/app-shell.component';

export const routes: Routes = [
  {
    path: 'tray',
    component: TrayPopoverComponent
  },
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'updates', component: UpdatesViewComponent },
      { path: 'installed', component: InstalledPackagesViewComponent },
      { path: 'browse', component: BrowseCatalogViewComponent },
      { path: 'taps', component: TapsViewComponent },
      { path: 'cleanup', component: CleanupViewComponent },
      { path: 'settings', component: SettingsViewComponent },
      { path: '', pathMatch: 'full', redirectTo: 'updates' }
    ]
  },
  { path: '**', redirectTo: '' }
];
