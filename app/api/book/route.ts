import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from 'date-fns';
import { createBookingEvent } from '@/lib/gcal';
import { createBooking } from '@/lib/airtable';
import { sendBookingConfirmation } from '@/lib/email';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  let body: {
    name: string;
    email: string;
    topic: string;
    bioLink: string;
    timezone: string;
    slotStart: string; // ISO UTC
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, topic, bioLink, timezone, slotStart } = body;
  if (!name || !email || !topic || !timezone || !slotStart) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const bookingToken = uuidv4();
  const startDate = new Date(slotStart);
  const endDate = addMinutes(startDate, config.slotDurationMinutes);
  const rescheduleUrl = `${config.publicBaseUrl}/reschedule/${bookingToken}`;
  const cancelUrl = `${config.publicBaseUrl}/cancel/${bookingToken}`;

  let googleEventId: string;
  try {
    googleEventId = await createBookingEvent({
      guestName: name,
      guestEmail: email,
      topic,
      bioLink: bioLink ?? '',
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      bookingToken,
      rescheduleUrl,
      cancelUrl,
    });
  } catch (err) {
    console.error('[book] Google Calendar error:', err);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }

  try {
    await createBooking({
      name,
      email,
      topic,
      bioLink: bioLink ?? '',
      timezone,
      scheduledDate: startDate.toISOString(),
      status: 'Booked',
      googleEventId,
      bookingToken,
    });
  } catch (err) {
    console.error('[book] Airtable error:', err);
    // Don't fail the request — calendar event was created, guest can still get email
  }

  try {
    await sendBookingConfirmation({
      guestName: name,
      guestEmail: email,
      startUtc: startDate.toISOString(),
      guestTimezone: timezone,
      topic,
      rescheduleUrl,
      cancelUrl,
    });
  } catch (err) {
    console.error('[book] Email error:', err);
    // Non-fatal — calendar invite will still reach guest
  }

  return NextResponse.json({ success: true, bookingToken });
}
