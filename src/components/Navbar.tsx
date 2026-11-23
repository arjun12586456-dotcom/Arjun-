import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { UI_COPY, type Lang } from '../data/cyberData';

interface NavbarProps {
  lang: Lang;
}

export function Navbar({ lang }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#guide', label: UI_COPY.nav.guide[lang] },
    { href: '#tools', label: UI_COPY.nav.tools[lang] },
    { href: '#cyber-3d', label: lang === 'en' ? '3D Lab' : '3D लैब' },
    { href: '#locator', label: lang === 'en' ? 'Locator' : 'लोकेटर' },
    { href: '#quiz', label: UI_COPY.nav.quiz[lang] },
    { href: '#emergency', label: UI_COPY.nav.emergency[lang] },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          Cyber Security
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main navigation">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 py-1 hover:text-slate-950 hover:underline underline-offset-4 decoration-sky-600/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#emergency"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            {UI_COPY.nav.cta[lang]}
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#emergency"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {UI_COPY.nav.cta[lang]}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
