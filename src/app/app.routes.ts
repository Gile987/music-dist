import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./routes/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./routes/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./routes/upload/upload.component').then((m) => m.UploadComponent),
  },
  {
    path: 'releases',
    loadComponent: () =>
      import('./routes/releases/releases.component').then(
        (m) => m.ReleasesComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./routes/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'royalties',
    loadComponent: () =>
      import('./routes/royalties/royalties.component').then(
        (m) => m.RoyaltiesComponent
      ),
  },
];
