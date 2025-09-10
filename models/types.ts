export interface AvailabilityInput {
  activityId: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
}

export interface BookingInput {
  email: string;
  name?: string;
  date: Date;
  size: number;
  resourceId: string;
  addOnIds?: string[];
}
