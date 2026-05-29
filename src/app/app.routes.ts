import { Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'tray',
    loadComponent: () =>
      import('./features/tray/tray-popover/tray-popover.component').then(
        (m) => m.TrayPopoverComponent,
      ),
  },
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'updates',
        loadComponent: () =>
          import('./features/updates/updates-view/updates-view.component').then(
            (m) => m.UpdatesViewComponent,
          ),
      },
      {
        path: 'installed',
        loadComponent: () =>
          import('./features/installed/installed-packages-view/installed-packages-view.component').then(
            (m) => m.InstalledPackagesViewComponent,
          ),
      },
      {
        path: 'browse',
        loadComponent: () =>
          import('./features/browse/browse-catalog-view/browse-catalog-view.component').then(
            (m) => m.BrowseCatalogViewComponent,
          ),
      },
      {
        path: 'taps',
        loadComponent: () =>
          import('./features/taps/taps-view/taps-view.component').then((m) => m.TapsViewComponent),
      },
      {
        path: 'cleanup',
        loadComponent: () =>
          import('./features/cleanup/cleanup-view/cleanup-view.component').then(
            (m) => m.CleanupViewComponent,
          ),
      },
      {
        path: 'doctor',
        loadComponent: () =>
          import('./features/doctor/doctor-view/doctor-view.component').then(
            (m) => m.DoctorViewComponent,
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history-view/history-view.component').then(
            (m) => m.HistoryViewComponent,
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services-view/services-view.component').then(
            (m) => m.ServicesViewComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings-view/settings-view.component').then(
            (m) => m.SettingsViewComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'updates' },
    ],
  },
  { path: '**', redirectTo: '' },
];
