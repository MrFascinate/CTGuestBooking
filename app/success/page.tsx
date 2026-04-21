import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function SuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div
            className="inline-block text-4xl mb-6 p-4 rounded-full"
            style={{ backgroundColor: 'var(--ct-gold-dim, rgba(212,168,71,0.1))' }}
          >
            ✓
          </div>
          <h1
            className="text-3xl font-semibold mb-4"
            style={{ fontFamily: 'Clash Display, sans-serif', color: 'var(--ct-gold)' }}
          >
            You&apos;re booked.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--ct-muted)' }}>
            Check your inbox for a confirmation email and a Google Calendar invite. The invite
            includes the Riverside studio link and a prep checklist.
          </p>

          <div
            className="text-left rounded-lg p-5 mb-8"
            style={{ backgroundColor: 'var(--ct-card)', border: '1px solid var(--ct-border)' }}
          >
            <h2
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: 'var(--ct-gold)', fontFamily: 'Clash Display, sans-serif' }}
            >
              Before the recording
            </h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--ct-muted)' }}>
              <li>Headphones in. Mic tested.</li>
              <li>Browser tabs closed except Riverside.</li>
              <li>Phone on silent.</li>
              <li>Join 5 minutes early for a sound check.</li>
              <li>Have your topic points ready but don&apos;t over-script it.</li>
            </ul>
          </div>

          <Link
            href="/"
            className="text-sm"
            style={{ color: 'var(--ct-muted)' }}
          >
            Back to calendar →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
