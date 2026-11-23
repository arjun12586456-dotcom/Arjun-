import { ArrowRight, BookOpen } from 'lucide-react';
import { TOOL_GUIDANCE_ITEMS, type Lang } from '../data/cyberData';
import type { ActiveToolTab } from './ToolsWorkbench';

interface GuideSectionProps {
  lang: Lang;
  onJumpToTool: (tool: ActiveToolTab) => void;
}

export function GuideSection({ lang, onJumpToTool }: GuideSectionProps) {
  return (
    <section id="guide" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>
                {lang === 'en' ? 'Step-by-Step User Guidance' : 'उपयोगकर्ता मार्गदर्शन (कैसे इस्तेमाल करें)'}
              </span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en'
                ? 'How to use Cyber Security tools safely'
                : 'इन साइबर सुरक्षा टूल्स को कैसे इस्तेमाल करें'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Follow these simple instructions before entering passwords, scanning payment QR codes, or sharing photos online.'
                : 'पासवर्ड जांचने, पेमेंट QR स्कैन करने, फाइल खोलने या फोटो शेयर करने से पहले नीचे दिए आसान चरण पढ़ें।'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TOOL_GUIDANCE_ITEMS.map((guide) => (
            <div
              key={guide.stepNumber}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-sky-700 tabular-nums">
                    {lang === 'en' ? `Guide ${guide.stepNumber}` : `गाइड ${guide.stepNumber}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToTool(guide.toolId)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer whitespace-nowrap"
                  >
                    {lang === 'en' ? 'Open tool' : 'टूल खोलें'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="mt-2 text-lg font-bold text-slate-950">{guide.title[lang]}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{guide.whenToUse[lang]}</p>

                <ol className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs sm:text-sm text-slate-700">
                  {guide.steps[lang].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="mt-0.5 font-mono text-xs font-bold text-slate-400 tabular-nums shrink-0">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
