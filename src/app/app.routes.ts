import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AppLayoutComponent } from './layout/app-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/task-list/task-list.component').then(m => m.TaskListComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];