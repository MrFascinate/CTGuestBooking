import { NextRequest, NextResponse } from 'next/server';
import { getBookingByToken, cancelBooking } from '@/lib/airtable';
import { deleteBookingEvent } from '@/lib/gcal';
import { sendCancellationConfirmation } from '@/lib/email';

export async function POST(req: NextRequest) {
  let body: { token: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const booking = await getBookingByToken(token);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status === 'Canceled') {
    return NextResponse.json({ error: 'Already canceled' }, { status: 409 });
  }

  try {
    await deleteBookingEvent(booking.googleEventId);
  } catch (err) {
    console.error('[cancel] GCal error:', err);
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }

  try {
    await cancelBooking(booking.id!);
  } catch (err) {
    console.error('[cancel] Airtable error:', err);
  }

  try {
    await sendCancellationConfirmation({
      guestName: booking.name,
      guestEmail: booking.email,
      startUtc: booking.scheduledDate,
      guestTimezone: booking.timezone,
    });
  } catch (err) {
    console.error('[cancel] Email error:', err);
  }

  return NextResponse.json({ success: true });
}
