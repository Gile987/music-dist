import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./routes/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./routes/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./routes/upload/upload.component').then((m) => m.UploadComponent)
      },
      {
        path: 'releases',
        loadComponent: () =>
          import('./routes/releases/releases.component').then((m) => m.ReleasesComponent)
      },
      {
        path: 'royalties',
        loadComponent: () =>
          import('./routes/royalties/royalties.component').then((m) => m.RoyaltiesComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./routes/profile/profile.component').then((m) => m.ProfileComponent)
      }
    ]
  }
];
