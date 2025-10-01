import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AppointmentsService, TimeDoc } from '../services/appointments.service';

/**
 * Resolver to pre-fetch all time slots for SSR
 * This ensures time slots are available on initial server render
 */
export const timesResolver: ResolveFn<TimeDoc[]> = async () => {
  const appointmentsService = inject(AppointmentsService);
  
  try {
    console.log('🔄 [SSR Resolver] Pre-fetching all time slots...');
    const times = await appointmentsService.getAllTimes();
    console.log('✅ [SSR Resolver] Pre-fetched', times.length, 'time slots');
    return times;
  } catch (error) {
    console.error('❌ [SSR Resolver] Error pre-fetching times:', error);
    return [];
  }
};
