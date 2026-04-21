import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BookingCalendar from '@/components/BookingCalendar';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 relative z-10 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p
              className="text-xs tracking-widest uppercase mb-3"
              style={{ color: 'var(--ct-gold)' }}
            >
              Wonder with Rigor
            </p>
            <h1
              className="text-3xl sm:text-4xl font-semibold mb-3"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
            >
              Book a recording
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ct-muted)' }}>
              Pick a slot on the calendar. Tuesday and Thursday, 2:00{'\u2013'}6:00{'\u00a0'}PM Central.
              Recordings run 75 minutes. You&apos;ll get a Google Calendar invite and a confirmation email.
            </p>
          </div>
          <BookingCalendar />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
