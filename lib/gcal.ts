import { google } from 'googleapis';

function makeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GCAL_CLIENT_ID,
    process.env.GCAL_CLIENT_SECRET,
    process.env.GCAL_REDIRECT_URI,
  );
}

export async function getCalendarClient(refreshToken: string) {
  const auth = makeOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth });
}

export async function getJustinClient() {
  return getCalendarClient(process.env.GCAL_JUSTIN_REFRESH_TOKEN!);
}

export interface FreeBusySlot {
  start: string;
  end: string;
}

export async function getFreeBusy(
  timeMin: string,
  timeMax: string,
): Promise<FreeBusySlot[]> {
  const cal = await getJustinClient();
  const calendarIds = [
    process.env.GCAL_JUSTIN_CALENDAR_ID ?? 'primary',
    process.env.GCAL_DAKOTAH_CALENDAR_ID!,
  ].filter(Boolean);

  const res = await cal.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: calendarIds.map((id) => ({ id })),
    },
  });

  const busy: FreeBusySlot[] = [];
  for (const cal of Object.values(res.data.calendars ?? {})) {
    for (const slot of cal.busy ?? []) {
      if (slot.start && slot.end) {
        busy.push({ start: slot.start, end: slot.end });
      }
    }
  }
  return busy;
}

export interface CreateEventParams {
  guestName: string;
  guestEmail: string;
  topic: string;
  bioLink: string;
  startIso: string;
  endIso: string;
  bookingToken: string;
  rescheduleUrl: string;
  cancelUrl: string;
}

export async function createBookingEvent(params: CreateEventParams): Promise<string> {
  const cal = await getJustinClient();
  const justinCalId = process.env.GCAL_JUSTIN_CALENDAR_ID ?? 'primary';
  const dakotahEmail = process.env.GCAL_DAKOTAH_EMAIL ?? '';

  const description = [
    `Guest: ${params.guestName}`,
    `Topic: ${params.topic}`,
    params.bioLink ? `Bio / Social: ${params.bioLink}` : '',
    '',
    `Riverside Studio: ${process.env.RIVERSIDE_STUDIO_LINK ?? '(see env RIVERSIDE_STUDIO_LINK)'}`,
    '',
    'Pre-recording checklist:',
    '- Headphones in, mic tested',
    '- Browser tabs closed except Riverside',
    '- Phone on silent',
    '- 5 min early to sound-check',
    '',
    `Reschedule: ${params.rescheduleUrl}`,
    `Cancel: ${params.cancelUrl}`,
  ].filter((l) => l !== undefined).join('\n');

  const attendees = [
    { email: guestEmail(params.guestEmail), displayName: params.guestName },
    ...(dakotahEmail ? [{ email: dakotahEmail }] : []),
  ];

  const event = await cal.events.insert({
    calendarId: justinCalId,
    sendUpdates: 'all',
    requestBody: {
      summary: `Curiosity Theory Recording: ${params.guestName}`,
      description,
      start: { dateTime: params.startIso, timeZone: 'UTC' },
      end: { dateTime: params.endIso, timeZone: 'UTC' },
      attendees,
    },
  });

  return event.data.id!;
}

export async function updateBookingEvent(
  eventId: string,
  newStartIso: string,
  newEndIso: string,
): Promise<void> {
  const cal = await getJustinClient();
  const justinCalId = process.env.GCAL_JUSTIN_CALENDAR_ID ?? 'primary';
  await cal.events.patch({
    calendarId: justinCalId,
    eventId,
    sendUpdates: 'all',
    requestBody: {
      start: { dateTime: newStartIso, timeZone: 'UTC' },
      end: { dateTime: newEndIso, timeZone: 'UTC' },
    },
  });
}

export async function deleteBookingEvent(eventId: string): Promise<void> {
  const cal = await getJustinClient();
  const justinCalId = process.env.GCAL_JUSTIN_CALENDAR_ID ?? 'primary';
  await cal.events.delete({
    calendarId: justinCalId,
    eventId,
    sendUpdates: 'all',
  });
}

function guestEmail(email: string) {
  return email;
}
