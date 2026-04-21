import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header
      className="w-full flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: 'var(--ct-border)', backgroundColor: 'rgba(5,5,5,0.92)' }}
    >
      <Link href="/" className="flex items-center gap-3 group">
        <Image
          src="/logo.png"
          alt="Curiosity Theory"
          width={36}
          height={36}
          className="rounded-full"
        />
        <div>
          <span
            className="block text-xs tracking-widest uppercase"
            style={{ color: 'var(--ct-gold)', fontFamily: 'Clash Display, sans-serif' }}
          >
            Curiosity Theory
          </span>
          <span className="block text-sm" style={{ color: 'var(--ct-muted)' }}>
            Book a Recording
          </span>
        </div>
      </Link>
      <a
        href="https://curiositytheorypod.com"
        className="text-xs tracking-wide transition-colors"
        style={{ color: 'var(--ct-muted)' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        curiositytheorypod.com →
      </a>
    </header>
  );
}
