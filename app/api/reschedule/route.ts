import { NextRequest, NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';
import { getBookingByToken, updateBookingDate } from '@/lib/airtable';
import { updateBookingEvent } from '@/lib/gcal';
import { sendRescheduleConfirmation } from '@/lib/email';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  let body: { token: string; newSlotStart: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token, newSlotStart } = body;
  if (!token || !newSlotStart) {
    return NextResponse.json({ error: 'Missing token or newSlotStart' }, { status: 400 });
  }

  const booking = await getBookingByToken(token);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status === 'Canceled') {
    return NextResponse.json({ error: 'This booking is already canceled' }, { status: 409 });
  }

  const oldStart = booking.scheduledDate;
  const newStart = new Date(newSlotStart);
  const newEnd = addMinutes(newStart, config.slotDurationMinutes);

  try {
    await updateBookingEvent(booking.googleEventId, newStart.toISOString(), newEnd.toISOString());
  } catch (err) {
    console.error('[reschedule] GCal error:', err);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }

  try {
    await updateBookingDate(booking.id!, newStart.toISOString());
  } catch (err) {
    console.error('[reschedule] Airtable error:', err);
  }

  try {
    await sendRescheduleConfirmation({
      guestName: booking.name,
      guestEmail: booking.email,
      oldStartUtc: oldStart,
      newStartUtc: newStart.toISOString(),
      guestTimezone: booking.timezone,
      rescheduleUrl: `${config.publicBaseUrl}/reschedule/${token}`,
      cancelUrl: `${config.publicBaseUrl}/cancel/${token}`,
    });
  } catch (err) {
    console.error('[reschedule] Email error:', err);
  }

  return NextResponse.json({ success: true });
}
