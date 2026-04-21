export default function SiteFooter() {
  const socials = [
    { label: 'YouTube', href: 'https://www.youtube.com/@curiositytheorypod' },
    { label: 'Instagram', href: 'https://www.instagram.com/curiositytheorypod' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@curiositytheorypod' },
    { label: 'Facebook', href: 'https://www.facebook.com/p/Curiosity-Theory-61577271295288/' },
  ];

  return (
    <footer
      className="mt-auto w-full px-6 py-8 border-t"
      style={{ borderColor: 'var(--ct-border)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href="https://curiositytheorypod.com"
          className="text-sm transition-colors"
          style={{ color: 'var(--ct-muted)' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          curiositytheorypod.com
        </a>
        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="text-xs tracking-wide transition-colors hover:text-white"
              style={{ color: 'var(--ct-muted)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
