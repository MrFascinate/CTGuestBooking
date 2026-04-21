export const config = {
  recordingDays: (process.env.RECORDING_DAYS ?? '2,4').split(',').map(Number),
  recordingStartHour: Number(process.env.RECORDING_START_HOUR ?? 14),
  recordingEndHour: Number(process.env.RECORDING_END_HOUR ?? 18),
  recordingTimezone: process.env.RECORDING_TIMEZONE ?? 'America/Chicago',
  slotDurationMinutes: Number(process.env.SLOT_DURATION_MINUTES ?? 75),
  lookaheadDays: Number(process.env.LOOKAHEAD_DAYS ?? 30),
  minLeadHours: Number(process.env.MIN_LEAD_HOURS ?? 48),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
  riversideLink: process.env.RIVERSIDE_STUDIO_LINK ?? '',
  fromEmail: process.env.FROM_EMAIL ?? 'info@curiositytheorypod.com',
};

// US federal holidays (static list, updated annually)
export const US_HOLIDAYS_2024_2025 = new Set([
  '2024-11-28', '2024-12-25',
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-05-26',
  '2025-06-19', '2025-07-04', '2025-09-01', '2025-10-13',
  '2025-11-11', '2025-11-27', '2025-12-25',
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-05-25',
  '2026-06-19', '2026-07-03', '2026-09-07', '2026-10-12',
  '2026-11-11', '2026-11-26', '2026-12-25',
]);
