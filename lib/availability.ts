import { addDays, addMinutes, startOfDay, format, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime, format as tzFormat } from 'date-fns-tz';
import { config, US_HOLIDAYS_2024_2025 } from './config';
import { getFreeBusy, FreeBusySlot } from './gcal';

export interface AvailableSlot {
  startUtc: string;   // ISO UTC
  endUtc: string;     // ISO UTC
  startLocal: string; // formatted for display (CT)
}

function isHoliday(date: Date): boolean {
  const key = format(toZonedTime(date, config.recordingTimezone), 'yyyy-MM-dd');
  return US_HOLIDAYS_2024_2025.has(key);
}

function isWeekend(date: Date): boolean {
  const zonedDay = toZonedTime(date, config.recordingTimezone).getDay();
  return zonedDay === 0 || zonedDay === 6;
}

function overlaps(slotStart: Date, slotEnd: Date, busy: FreeBusySlot[]): boolean {
  return busy.some((b) => {
    const bs = new Date(b.start);
    const be = new Date(b.end);
    return slotStart < be && slotEnd > bs;
  });
}

export async function getAvailableSlots(month: string): Promise<AvailableSlot[]> {
  // month = "YYYY-MM"
  const [year, mon] = month.split('-').map(Number);
  const tz = config.recordingTimezone;

  // Determine the window: start = max(today+minLead, first day of month), end = last day of month
  const now = new Date();
  const minLeadMs = config.minLeadHours * 60 * 60 * 1000;
  const earliest = new Date(now.getTime() + minLeadMs);
  const lookaheadCutoff = addDays(now, config.lookaheadDays);

  // First and last day of the requested month in CT
  const firstOfMonth = fromZonedTime(new Date(year, mon - 1, 1, 0, 0, 0), tz);
  const lastOfMonth = fromZonedTime(new Date(year, mon, 0, 23, 59, 59), tz);

  const windowStart = earliest > firstOfMonth ? earliest : firstOfMonth;
  const windowEnd = lookaheadCutoff < lastOfMonth ? lookaheadCutoff : lastOfMonth;

  if (windowStart > windowEnd) return [];

  // Fetch busy periods once for the whole window
  const busy = await getFreeBusy(windowStart.toISOString(), windowEnd.toISOString());

  const slots: AvailableSlot[] = [];
  let cursor = startOfDay(windowStart);

  while (cursor <= windowEnd) {
    const zonedCursor = toZonedTime(cursor, tz);
    const dayOfWeek = zonedCursor.getDay();

    if (config.recordingDays.includes(dayOfWeek) && !isHoliday(cursor) && !isWeekend(cursor)) {
      // Generate slots within recording window
      for (
        let hour = config.recordingStartHour;
        hour < config.recordingEndHour;
        hour += config.slotDurationMinutes / 60
      ) {
        const slotHour = Math.floor(hour);
        const slotMin = Math.round((hour % 1) * 60);
        const slotStartCt = new Date(
          zonedCursor.getFullYear(),
          zonedCursor.getMonth(),
          zonedCursor.getDate(),
          slotHour,
          slotMin,
          0,
        );
        const slotStartUtc = fromZonedTime(slotStartCt, tz);
        const slotEndUtc = addMinutes(slotStartUtc, config.slotDurationMinutes);

        // Must end within window
        if (slotEndUtc > new Date(year, mon - 1 + 1, 0, 23, 59, 59)) continue;
        // Must be after earliest
        if (slotStartUtc < earliest) continue;
        // Must be before lookahead cutoff
        if (slotStartUtc > lookaheadCutoff) continue;
        // Must not overlap any busy period
        if (overlaps(slotStartUtc, slotEndUtc, busy)) continue;

        slots.push({
          startUtc: slotStartUtc.toISOString(),
          endUtc: slotEndUtc.toISOString(),
          startLocal: tzFormat(toZonedTime(slotStartUtc, tz), 'h:mm a zzz', { timeZone: tz }),
        });
      }
    }

    cursor = addDays(cursor, 1);
  }

  return slots;
}
