import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'slots',
        loadComponent: () => import('./pages/slots/slots').then(m => m.Slots)
    },
    {
        path: 'appointments',
        loadComponent: () => import('./pages/appointments/appointments').then(m => m.Appointments)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register)
    }

];
