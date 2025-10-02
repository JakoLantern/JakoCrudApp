import { Routes } from '@angular/router';
import { timesResolver } from './resolvers/times.resolver';
import { datesResolver } from './resolvers/dates.resolver';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layouts/main/main').then(m => m.Main),
        canActivate: [authGuard], // Protect all main layout routes
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
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
                loadComponent: () => import('./pages/appointments/book-appointment/book-appointment').then(m => m.BookAppointment),
                resolve: {
                    times: timesResolver,
                    dates: datesResolver
                }
            },
            {
                path: 'appointments/view',
                loadComponent: () => import('./pages/appointments/view-appointment/view-appointment').then(m => m.ViewAppointment)
            },
            {
                path: 'metrics',
                loadComponent: () => import('./pages/metrics/metrics').then(m => m.Metrics)
            },
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login),
        canActivate: [guestGuard] // Redirect to dashboard if already logged in
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register),
        canActivate: [guestGuard] // Redirect to dashboard if already logged in
    },
    // Fallback - redirect unknown routes to dashboard (or login if not authenticated)
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
