/**
 * Empire OS — event types emitted from Inboker to external intelligence layer.
 * Skills 1–33 consume these on the Empire OS side.
 */
export type InbokerEvent =
  | 'booking_created'
  | 'booking_cancelled'
  | 'review_posted'
  | 'customer_signup'
  | 'staff_assigned'
  | 'service_created'
  | 'subscription_created'
  | 'payment_received'
  | 'time_based_check';

export type EmpireEventPayload = Record<string, unknown>;
