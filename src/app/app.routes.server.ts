import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'dashboard', renderMode: RenderMode.Prerender },
  { path: 'slots', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'appointments', renderMode: RenderMode.Server }, // SSR with dynamic data
  { path: 'appointments/book', renderMode: RenderMode.Server }, // SSR with dynamic time slots
  { path: 'appointments/view', renderMode: RenderMode.Server }, // SSR with user appointments
  { path: '**', renderMode: RenderMode.Server }, // Fallback
];