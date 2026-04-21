import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month');
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month param required (YYYY-MM)' }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(month);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error('[availability]', err);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
