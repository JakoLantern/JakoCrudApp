/**
 * Shared type definitions for the booking system
 */

export interface DateSelectedEvent {
  date: Date;
  dateId: string;
  availableCount: number;
}

export interface TimeSelectedEvent {
  time: string;
  timeId: string;
}
