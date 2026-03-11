import { Routes } from '@angular/router';
import { landingRoutes } from './features/landing/landing.routes';
import { localStorageRoutes } from './features/local-storage/local-storage.routes';
import { indexedDbRoutes } from './features/indexed-db/indexed-db.routes';

export const routes: Routes = [
  ...landingRoutes,
  ...localStorageRoutes,
  ...indexedDbRoutes,
  {
    path: '**',
    redirectTo: '',
  },
];

