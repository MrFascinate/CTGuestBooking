import { NextRequest, NextResponse } from 'next/server';
import { getBookingByToken } from '@/lib/airtable';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const booking = await getBookingByToken(token);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ booking });
  } catch (err) {
    console.error('[booking/token]', err);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
