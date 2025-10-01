import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AppointmentsService, DateDoc } from '../services/appointments.service';

/**
 * Resolver to pre-fetch all dates for SSR
 * This ensures date availability is loaded on initial server render
 */
export const datesResolver: ResolveFn<DateDoc[]> = async () => {
  const appointmentsService = inject(AppointmentsService);
  
  try {
    console.log('🔄 [SSR Resolver] Pre-fetching all dates...');
    const dates = await appointmentsService.getAllDates();
    console.log('✅ [SSR Resolver] Pre-fetched', dates.length, 'dates');
    return dates;
  } catch (error) {
    console.error('❌ [SSR Resolver] Error pre-fetching dates:', error);
    return [];
  }
};
