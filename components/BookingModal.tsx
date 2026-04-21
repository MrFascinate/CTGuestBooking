'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useRouter } from 'next/navigation';

interface Slot {
  startUtc: string;
  endUtc: string;
  startLocal: string;
}

interface Props {
  slot: Slot;
  onClose: () => void;
  onSuccess: () => void;
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function BookingModal({ slot, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: '',
    bioLink: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slotStart: slot.startUtc }),
      });

      if (res.status === 409) {
        setError('That slot was just taken. Pick another time.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }

      router.push('/success');
    } catch {
      setError('Connection error. Check your internet and try again.');
      setSubmitting(false);
    }
  }

  const displayTime = format(
    toZonedTime(parseISO(slot.startUtc), form.timezone),
    "EEEE, MMMM d 'at' h:mm a",
  );

  const inputStyle = {
    backgroundColor: 'var(--ct-card)',
    border: '1px solid var(--ct-border)',
    color: 'var(--ct-text)',
    borderRadius: '4px',
    padding: '10px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--ct-muted)',
    marginBottom: '6px',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(5,5,5,0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-lg p-6 relative"
        style={{ backgroundColor: 'var(--ct-card)', border: '1px solid var(--ct-border-hover)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm"
          style={{ color: 'var(--ct-muted)' }}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2
            className="text-xl font-semibold mb-1"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            Confirm your slot
          </h2>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--ct-gold)' }}
          >
            {displayTime}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--ct-muted)' }}>
            75 minutes — Curiosity Theory recording
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Your name"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ct-gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ct-border)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ct-gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ct-border)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Topic / what you want to talk about</label>
            <textarea
              required
              rows={3}
              value={form.topic}
              onChange={set('topic')}
              placeholder="The specific focus or angle you'd bring to the show"
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ct-gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ct-border)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Bio / social link (optional)</label>
            <input
              type="url"
              value={form.bioLink}
              onChange={set('bioLink')}
              placeholder="https://yourwebsite.com or @handle"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ct-gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ct-border)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Your timezone</label>
            <select
              value={form.timezone}
              onChange={set('timezone')}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--ct-gold)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--ct-border)'; }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz} style={{ backgroundColor: '#111' }}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm py-2 px-3 rounded" style={{ backgroundColor: 'rgba(212,168,71,0.1)', color: 'var(--ct-gold-light, #e8c36a)', borderLeft: '2px solid var(--ct-gold)' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded transition-colors"
              style={{ border: '1px solid var(--ct-border)', color: 'var(--ct-muted)', backgroundColor: 'transparent' }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold rounded transition-opacity"
              style={{ backgroundColor: 'var(--ct-gold)', color: 'var(--ct-bg)', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Booking...' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
