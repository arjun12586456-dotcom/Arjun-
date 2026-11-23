import { ArrowRight, Globe, Lock, ShieldCheck } from 'lucide-react';
import { STUDENT_PROJECT_INFO, UI_COPY, type Lang } from '../data/cyberData';
import type { ActiveToolTab } from './ToolsWorkbench';

interface HeroSectionProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
  onJumpToTool: (tool: ActiveToolTab) => void;
}

export function HeroSection({ lang, onChangeLang, onJumpToTool }: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        {/* Language & Project Context Toolbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-semibold text-slate-900">{STUDENT_PROJECT_INFO.projectTitle}</span>
            <span aria-hidden="true">·</span>
            <span>{UI_COPY.hero.kicker[lang]}</span>
          </div>

          <div
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Language switcher"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 text-xs font-medium text-slate-500">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Language' : 'भाषा'}</span>
            </span>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('hi')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'hi'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* 2-Column Hero Grid */}
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                {UI_COPY.hero.title[lang]}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {UI_COPY.hero.subtitle[lang]}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#tools"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  {UI_COPY.hero.primaryBtn[lang]}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#advanced-tools"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  {lang === 'en' ? 'Pro Forensics & 1930 Drafts' : 'प्रो फॉरेंसिक और 1930 ड्राफ्ट'}
                </a>
                <a
                  href="#guide"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                >
                  {UI_COPY.hero.secondaryBtn[lang]}
                </a>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <p className="text-xs font-semibold tracking-wide text-slate-500">
                {UI_COPY.hero.missionHeading[lang]}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {UI_COPY.hero.missionBody[lang]}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Quick Tool Launcher */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-slate-900 p-6 text-slate-100">
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-sky-400 shrink-0" />
                    <span className="text-sm font-semibold tracking-tight text-white">
                      {lang === 'en' ? 'Quick Tool Access' : 'त्वरित सुरक्षा टूल्स'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    {lang === 'en' ? '11+ Interactive Tools' : '11+ एडवांस टूल्स'}
                  </span>
                </div>

                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onJumpToTool('password')}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-left hover:border-sky-500/60 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lang === 'en' ? '01. Password Strength & Data-Breach Check' : '01. पासवर्ड और डेटा-लीक जांच'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {lang === 'en'
                          ? 'k-Anonymity leak lookup, entropy & generator'
                          : 'पासवर्ड लीक जांच, मजबूती और जनरेटर'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onJumpToTool('phishing')}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-left hover:border-sky-500/60 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lang === 'en' ? '02. Phishing Link, SMS & UPI QR Decoder' : '02. लिंक, SMS और UPI QR डिकोडर'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {lang === 'en'
                          ? 'Inspect fake links or decode uploaded QR images'
                          : 'नकली लिंक और अपलोड किए गए QR कोड जांचें'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onJumpToTool('assistant')}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-left hover:border-sky-500/60 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lang === 'en' ? '03. AI Cyber Sahayak (Scam Helper)' : '03. AI साइबर सहायक (स्मार्ट सलाह)'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {lang === 'en'
                          ? 'Paste any suspicious call, job or KYC message'
                          : 'संदिग्ध कॉल, नौकरी या KYC संदेश की तुरंत जांच'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-400 shrink-0" />
                  </button>

                  <a
                    href="#advanced-tools"
                    className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-left hover:border-sky-500/60 hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {lang === 'en' ? '04. 1930 Complaint, Email & AES-256 Lab' : '04. 1930 शिकायत, ईमेल और AES-256 लैब'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {lang === 'en'
                          ? '1930/bank drafts, Android APK audit, SPF/DKIM & Crypto'
                          : '1930 ड्राफ्ट, APK अनुमति जोखिम, SPF/DKIM व क्रिप्टो लैब'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-400 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'ITI COPA Project · Arjun Kumar'
                      : 'ITI COPA प्रोजेक्ट · अर्जुन कुमार'}
                  </span>
                </div>
                <a
                  href="#emergency"
                  className="font-mono font-semibold text-sky-400 hover:text-sky-300 whitespace-nowrap"
                >
                  1930 · cybercrime.gov.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
