'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useParams } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BookingCalendar from '@/components/BookingCalendar';

interface Booking {
  name: string;
  scheduledDate: string;
  timezone: string;
  status: string;
}

export default function ReschedulePage() {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ startUtc: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/booking/${token}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.booking) setBooking(data.booking);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleReschedule() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newSlotStart: selectedSlot.startUtc }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Something went wrong.');
        return;
      }
      setRescheduled(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Shell><p style={{ color: 'var(--ct-muted)' }}>Loading...</p></Shell>;

  if (notFound || (booking && (booking.status === 'Canceled' || new Date(booking.scheduledDate) < new Date()))) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          This booking is no longer active.
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ct-muted)' }}>
          It may have already been canceled or the recording date has passed.
        </p>
        <a href="/" className="text-sm" style={{ color: 'var(--ct-gold)' }}>Book a new slot →</a>
      </Shell>
    );
  }

  if (rescheduled) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Clash Display, sans-serif', color: 'var(--ct-gold)' }}>
          Recording moved.
        </h1>
        <p className="text-sm" style={{ color: 'var(--ct-muted)' }}>
          You&apos;ll receive an updated calendar invite and a confirmation email.
        </p>
      </Shell>
    );
  }

  const currentTime = booking
    ? format(toZonedTime(parseISO(booking.scheduledDate), booking.timezone), "EEEE, MMMM d 'at' h:mm a zzz", { timeZone: booking.timezone } as Parameters<typeof format>[2])
    : '';

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 relative z-10 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--ct-gold)' }}>
              Reschedule
            </p>
            <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Pick a new time, {booking?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm" style={{ color: 'var(--ct-muted)' }}>
              Current slot: {currentTime}
            </p>
          </div>

          <BookingCalendar rescheduleMode onSlotSelect={setSelectedSlot} />

          {selectedSlot && (
            <div className="mt-6">
              {error && (
                <p className="text-sm mb-4 py-2 px-3 rounded" style={{ backgroundColor: 'rgba(212,168,71,0.1)', color: 'var(--ct-gold)', borderLeft: '2px solid var(--ct-gold)' }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleReschedule}
                disabled={submitting}
                className="w-full py-3 rounded font-semibold text-sm transition-opacity"
                style={{ backgroundColor: 'var(--ct-gold)', color: 'var(--ct-bg)', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Rescheduling...' : 'Confirm new time'}
              </button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
