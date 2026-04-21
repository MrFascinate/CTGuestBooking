import Airtable from 'airtable';

function getBase() {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID!,
  );
  return base(process.env.AIRTABLE_TABLE_NAME ?? 'Bookings');
}

export interface BookingRecord {
  id?: string;
  name: string;
  email: string;
  topic: string;
  bioLink: string;
  timezone: string;
  scheduledDate: string; // ISO
  status: 'Booked' | 'Recorded' | 'Published' | 'Canceled' | 'No-show';
  googleEventId: string;
  bookingToken: string;
  createdAt?: string;
}

export async function createBooking(data: Omit<BookingRecord, 'id' | 'createdAt'>): Promise<string> {
  const table = getBase();
  const rec = await table.create({
    Name: data.name,
    Email: data.email,
    Topic: data.topic,
    'Bio Link': data.bioLink,
    Timezone: data.timezone,
    'Scheduled Date': data.scheduledDate,
    Status: data.status,
    'Google Event ID': data.googleEventId,
    'Booking Token': data.bookingToken,
    'Created At': new Date().toISOString(),
    'Last Modified': new Date().toISOString(),
  });
  return rec.id;
}

export async function getBookingByToken(token: string): Promise<BookingRecord | null> {
  const table = getBase();
  const records = await table
    .select({ filterByFormula: `{Booking Token} = '${token}'`, maxRecords: 1 })
    .firstPage();
  if (records.length === 0) return null;
  const r = records[0];
  return {
    id: r.id,
    name: r.get('Name') as string,
    email: r.get('Email') as string,
    topic: r.get('Topic') as string,
    bioLink: (r.get('Bio Link') as string) ?? '',
    timezone: r.get('Timezone') as string,
    scheduledDate: r.get('Scheduled Date') as string,
    status: r.get('Status') as BookingRecord['status'],
    googleEventId: r.get('Google Event ID') as string,
    bookingToken: r.get('Booking Token') as string,
  };
}

export async function updateBookingDate(
  airtableId: string,
  newScheduledDate: string,
): Promise<void> {
  const table = getBase();
  await table.update(airtableId, {
    'Scheduled Date': newScheduledDate,
    'Last Modified': new Date().toISOString(),
  });
}

export async function cancelBooking(airtableId: string): Promise<void> {
  const table = getBase();
  await table.update(airtableId, {
    Status: 'Canceled',
    'Last Modified': new Date().toISOString(),
  });
}
