import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, Search } from 'lucide-react';
import { OFFICIAL_DIRECTORY_ITEMS, type DirectoryEntry, type Lang } from '../data/cyberData';

interface DirectorySectionProps {
  lang: Lang;
}

export function DirectorySection({ lang }: DirectorySectionProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | DirectoryEntry['category']>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OFFICIAL_DIRECTORY_ITEMS.filter((item) => {
      const catMatch = category === 'all' || item.category === category;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        item.name.en.toLowerCase().includes(q) ||
        item.name.hi.toLowerCase().includes(q) ||
        item.number.toLowerCase().includes(q) ||
        item.website.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const handleCopyNumber = async (id: string, num: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section id="directory" className="border-b border-slate-200 bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en'
                ? 'Verified Helpline & Bank Support Directory'
                : 'आधिकारिक हेल्पलाइन और बैंक सहायता निर्देशिका'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Never search Google for bank or courier customer care numbers—fraudsters buy fake search ads. Use verified portals below.'
                : 'गूगल पर सर्च करके कस्टमर केयर नंबर न ढूंढें—ठग नकली विज्ञापन चलाते हैं। नीचे दिए गए सत्यापित नंबर और पोर्टल ही इस्तेमाल करें।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search bank or 1930...' : 'बैंक या 1930 खोजें...'}
                className="w-56 rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {(
                [
                  { id: 'all', en: 'All', hi: 'सभी' },
                  { id: 'government', en: 'Govt', hi: 'सरकारी' },
                  { id: 'banks', en: 'Banks', hi: 'बैंक' },
                  { id: 'upi', en: 'UPI', hi: 'UPI' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    category === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
          <p>
            {lang === 'en'
              ? 'Safety Tip: Official Indian banks and government portals never ask you to download AnyDesk/TeamViewer or share your OTP on a helpline call.'
              : 'सुरक्षा सलाह: कोई भी असली बैंक या सरकारी हेल्पलाइन कॉल पर आपसे AnyDesk/TeamViewer डाउनलोड करने या OTP बताने को नहीं कहती।'}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            {lang === 'en'
              ? 'No matching helpline found. Try searching "SBI", "1930", or "NPCI".'
              : 'कोई मिलान नहीं मिला। "SBI", "1930" या "NPCI" खोजें।'}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <div>
                  <span className="text-xs font-semibold text-sky-700 capitalize">
                    {entry.category === 'government'
                      ? lang === 'en'
                        ? 'Government Portal'
                        : 'सरकारी पोर्टल'
                      : entry.category === 'banks'
                        ? lang === 'en'
                          ? 'Official Bank'
                          : 'आधिकारिक बैंक'
                        : 'UPI Network'}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-slate-950">{entry.name[lang]}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{entry.purpose[lang]}</p>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                      {entry.number}
                    </span>
                    {/\d/.test(entry.number) && (
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(entry.id, entry.number)}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>{lang === 'en' ? 'Copied' : 'कॉपी'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{lang === 'en' ? 'Copy' : 'कॉपी'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    <span className="truncate max-w-[190px]">
                      {entry.website.replace(/^https?:\/\//, '')}
                    </span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
