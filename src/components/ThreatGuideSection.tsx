import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { THREAT_GUIDE_ITEMS, type Lang, type ThreatItem } from '../data/cyberData';

interface ThreatGuideSectionProps {
  lang: Lang;
}

type FilterCategory = 'all' | ThreatItem['category'];

export function ThreatGuideSection({ lang }: ThreatGuideSectionProps) {
  const [filter, setFilter] = useState<FilterCategory>('all');

  const filteredItems =
    filter === 'all'
      ? THREAT_GUIDE_ITEMS
      : THREAT_GUIDE_ITEMS.filter((item) => item.category === filter);

  const filterTabs: { id: FilterCategory; en: string; hi: string }[] = [
    { id: 'all', en: 'All Threats', hi: 'सभी खतरे' },
    { id: 'phishing', en: 'Phishing & Links', hi: 'फ़िशिंग लिंक' },
    { id: 'payments', en: 'UPI & Banking', hi: 'UPI और बैंकिंग' },
    { id: 'passwords', en: 'Passwords', hi: 'पासवर्ड' },
    { id: 'devices', en: 'Fake Sites & APK', hi: 'नकली ऐप / साइट' },
  ];

  return (
    <section id="threats" className="border-b border-slate-200 bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en' ? 'Common Cyber Threats & Fraud Guide' : 'आम साइबर खतरे और धोखाधड़ी से बचाव'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Learn the exact warning signs used in phishing messages, fake payment pages, weak passwords, and banking scams.'
                : 'फ़िशिंग संदेश, नकली पेमेंट पेज, कमजोर पासवर्ड और बैंकिंग ठगी के संकेतों को पहचानना सीखें।'}
            </p>
          </div>

          <div
            className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Filter cyber threats"
          >
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredItems.map((threat) => (
            <article
              key={threat.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="text-sky-700 font-semibold">{threat.categoryLabel[lang]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-rose-700 font-semibold">{threat.riskLevel[lang]}</span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-slate-950">{threat.title[lang]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{threat.summary[lang]}</p>

                <div className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-200 pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-rose-800">
                      {lang === 'en' ? 'Warning Signs' : 'चेतावनी संकेत'}
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {threat.warningSigns[lang].map((sign, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-rose-600 shrink-0" />
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-emerald-800">
                      {lang === 'en' ? 'How to Stay Safe' : 'सुरक्षित रहने के उपाय'}
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {threat.protectionSteps[lang].map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
