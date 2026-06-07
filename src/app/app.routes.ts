import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/address-finder/address-finder.component').then(m => m.AddressFinderComponent)
    }
];
