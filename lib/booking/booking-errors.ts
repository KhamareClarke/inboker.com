/** Thrown when a workspace CRM booking overlaps an existing appointment for the same provider. */
export class WorkspaceBookingConflictError extends Error {
  readonly conflictingBooking: Record<string, unknown> | null;

  constructor(message: string, conflictingBooking: Record<string, unknown> | null) {
    super(message);
    this.name = 'WorkspaceBookingConflictError';
    this.conflictingBooking = conflictingBooking;
  }
}

/** Thrown when a booking is outside configured working hours / time off / overrides. */
export class StaffNotAvailableError extends Error {
  readonly reason?: string;

  constructor(message: string, reason?: string) {
    super(message);
    this.name = 'StaffNotAvailableError';
    this.reason = reason;
  }
}
