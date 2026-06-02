import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'cars/:id',
    loadComponent: () => import('./pages/car-detail/car-detail').then(m => m.CarDetail)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/inscription/inscription').then(m => m.Inscription)
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'annonces/nouveau',
    loadComponent: () => import('./pages/car-create/car-create').then(m => m.CarCreate)
  },
  { path: '**', redirectTo: '' }
];
