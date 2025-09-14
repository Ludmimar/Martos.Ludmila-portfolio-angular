import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/hero/hero').then(m => m.Hero)
  },
  {
    path: 'projects',
    loadComponent: () => import('./components/projects/projects').then(m => m.Projects)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact').then(m => m.Contact)
  },
  {
    path: 'skills',
    loadComponent: () => import('./components/skills/skills').then(m => m.Skills)
  },
  {
    path: 'timeline',
    loadComponent: () => import('./components/timeline/timeline').then(m => m.Timeline)
  },
  {
    path: 'passions',
    loadComponent: () => import('./components/passions/passions').then(m => m.Passions)
  },
  {
    path: 'future',
    loadComponent: () => import('./components/future/future').then(m => m.Future)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
