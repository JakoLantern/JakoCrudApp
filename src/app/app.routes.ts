import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'login',
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
        path: 'appointments/book',
        loadComponent: () => import('./pages/appointments/book-appointment/book-appointment').then(m => m.BookAppointment)
    },
    {
        path: 'appointments/view',
        loadComponent: () => import('./pages/appointments/view-appointment/view-appointment').then(m => m.ViewAppointment)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register)
    },
    // fallback
    {
        path: '**',
        redirectTo: ''
    }
];
