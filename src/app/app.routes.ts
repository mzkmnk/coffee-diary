import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/map',
    pathMatch: 'full'
  },
  {
    path: 'map',
    loadComponent: () => import('./features/map/map-view/map-view').then(m => m.MapViewComponent),
    title: '地図 - カフェ日記'
  },
  {
    path: 'cafes',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/cafe-list/cafe-list.component').then(m => m.CafeListComponent),
        title: 'カフェ一覧 - カフェ日記'
      },
      {
        path: 'new',
        loadComponent: () => import('./features/cafe-form/cafe-form.component').then(m => m.CafeFormComponent),
        title: '新規登録 - カフェ日記'
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/cafe-detail/cafe-detail.component').then(m => m.CafeDetailComponent),
            title: 'カフェ詳細 - カフェ日記'
          },
          {
            path: 'edit',
            loadComponent: () => import('./features/cafe-form/cafe-form.component').then(m => m.CafeFormComponent),
            title: '編集 - カフェ日記'
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/map'
  }
];
