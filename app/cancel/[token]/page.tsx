'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useParams } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

interface Booking {
  name: string;
  scheduledDate: string;
  timezone: string;
  status: string;
  topic: string;
}

export default function CancelPage() {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [canceled, setCanceled] = useState(false);
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

  async function handleCancel() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Something went wrong.');
        return;
      }
      setCanceled(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Shell><p style={{ color: 'var(--ct-muted)' }}>Loading...</p></Shell>;

  if (notFound || (booking && booking.status === 'Canceled')) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          This booking is no longer active.
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ct-muted)' }}>
          It may have already been canceled.
        </p>
        <a href="/" className="text-sm" style={{ color: 'var(--ct-gold)' }}>Book a new slot →</a>
      </Shell>
    );
  }

  if (canceled) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
          Recording canceled.
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ct-muted)' }}>
          Your calendar invite has been removed.
        </p>
        <a href="/" className="text-sm" style={{ color: 'var(--ct-gold)' }}>Pick a new time →</a>
      </Shell>
    );
  }

  const displayTime = booking
    ? format(
        toZonedTime(parseISO(booking.scheduledDate), booking.timezone),
        "EEEE, MMMM d 'at' h:mm a",
      )
    : '';

  return (
    <Shell>
      <h1 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Clash Display, sans-serif' }}>
        Cancel this recording?
      </h1>
      <div
        className="rounded-lg p-4 mb-6 text-left"
        style={{ backgroundColor: 'var(--ct-card)', border: '1px solid var(--ct-border)' }}
      >
        <p className="text-sm font-medium mb-1">{booking?.name}</p>
        <p className="text-sm" style={{ color: 'var(--ct-gold)' }}>{displayTime}</p>
        {booking?.topic && (
          <p className="text-xs mt-2" style={{ color: 'var(--ct-muted)' }}>Topic: {booking.topic}</p>
        )}
      </div>

      {error && (
        <p className="text-sm mb-4 py-2 px-3 rounded" style={{ backgroundColor: 'rgba(212,168,71,0.1)', color: 'var(--ct-gold)', borderLeft: '2px solid var(--ct-gold)' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleCancel}
        disabled={submitting}
        className="w-full py-3 rounded font-semibold text-sm mb-3 transition-opacity"
        style={{ backgroundColor: '#c0392b', color: '#fff', opacity: submitting ? 0.6 : 1 }}
      >
        {submitting ? 'Canceling...' : 'Yes, cancel this recording'}
      </button>
      <a
        href="/"
        className="block text-sm text-center"
        style={{ color: 'var(--ct-muted)' }}
      >
        Never mind, keep my slot
      </a>
    </Shell>
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
