import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Sign in',
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup').then((m) => m.Signup),
    title: 'Create account',
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./features/auth/forbidden/forbidden').then((m) => m.Forbidden),
    title: 'Access denied',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list/customer-list').then((m) => m.CustomerList),
        title: 'Customers',
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/sale-list/sale-list').then((m) => m.SaleList),
        title: 'Sales',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
