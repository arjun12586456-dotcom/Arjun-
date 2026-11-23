import { useState } from 'react';
import { Check, Copy, Download, ExternalLink, PhoneCall, ShieldAlert } from 'lucide-react';
import { STUDENT_PROJECT_INFO, type Lang } from '../data/cyberData';
import { downloadSafetyPosterPng } from '../utils/securityAnalyzers';

interface EmergencySectionProps {
  lang: Lang;
}

export function EmergencySection({ lang }: EmergencySectionProps) {
  const [copiedHelpline, setCopiedHelpline] = useState(false);

  const handleCopy1930 = async () => {
    try {
      await navigator.clipboard.writeText('1930');
      setCopiedHelpline(true);
      setTimeout(() => setCopiedHelpline(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const goldenHourSteps = [
    {
      num: '01',
      enTitle: 'Call 1930 Immediately',
      hiTitle: 'तुरंत 1930 पर कॉल करें',
      enDesc: 'Dial India’s National Cyber Crime Helpline 1930 within the first hour ("Golden Hour") to freeze stolen funds before withdrawal.',
      hiDesc: 'ठगी होने के पहले एक घंटे ("गोल्डन आवर") के भीतर राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें ताकि पैसे फ्रीज किए जा सकें।',
    },
    {
      num: '02',
      enTitle: 'Freeze Bank & UPI Channels',
      hiTitle: 'बैंक खाता और UPI तुरंत ब्लॉक करें',
      enDesc: 'Call your bank’s official toll-free number to temporarily block your debit card, netbanking, and UPI ID.',
      hiDesc: 'अपने बैंक के आधिकारिक नंबर पर कॉल करके तुरंत अपना ATM कार्ड, नेटबैंकिंग और UPI बंद कराएं।',
    },
    {
      num: '03',
      enTitle: 'Preserve All Evidence',
      hiTitle: 'सभी सबूत सुरक्षित रखें',
      enDesc: 'Take screenshots of the transaction UTR number, fraudster’s phone number, SMS/WhatsApp chat, and phishing link.',
      hiDesc: 'लेनदेन का UTR नंबर, ठग का मोबाइल नंबर, SMS/WhatsApp चैट और संदिग्ध लिंक के स्क्रीनशॉट सुरक्षित रखें।',
    },
    {
      num: '04',
      enTitle: 'File Complaint on cybercrime.gov.in',
      hiTitle: 'cybercrime.gov.in पर रिपोर्ट दर्ज करें',
      enDesc: 'Submit an official online complaint with your acknowledgement number at the Ministry of Home Affairs portal.',
      hiDesc: 'गृह मंत्रालय के आधिकारिक पोर्टल cybercrime.gov.in पर शिकायत दर्ज करें और पावती संख्या (Acknowledgement No.) संभाल कर रखें।',
    },
  ];

  return (
    <section id="emergency" className="border-b border-slate-200 bg-slate-900 py-14 text-slate-100 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Official Emergency Action */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Official Cybercrime Reporting — India'
                  : 'आधिकारिक साइबर अपराध सहायता — भारत'}
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {lang === 'en'
                ? 'Lost money or clicked a scam link? Act within the Golden Hour.'
                : 'धोखाधड़ी हो गई है? पहले एक घंटे (Golden Hour) में तुरंत कदम उठाएं।'}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {lang === 'en'
                ? 'Never share your OTP, UPI PIN, passwords, or banking details. In case of financial cyber fraud in India, contact your bank immediately, call 1930, and report at cybercrime.gov.in.'
                : 'अपना OTP, UPI पिन, पासवर्ड या बैंकिंग जानकारी कभी साझा न करें। वित्तीय साइबर ठगी होने पर तुरंत अपने बैंक से संपर्क करें, 1930 पर कॉल करें और cybercrime.gov.in पर रिपोर्ट करें।'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 font-mono text-sm font-bold text-white hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
              >
                <PhoneCall className="h-4 w-4" />
                {lang === 'en' ? 'Call Helpline: 1930' : 'हेल्पलाइन कॉल: 1930'}
              </a>

              <button
                type="button"
                onClick={handleCopy1930}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedHelpline ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedHelpline
                  ? lang === 'en'
                    ? '1930 Copied'
                    : '1930 कॉपी हुआ'
                  : lang === 'en'
                    ? 'Copy 1930'
                    : '1930 कॉपी करें'}
              </button>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-semibold text-sky-300 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => downloadSafetyPosterPng(lang)}
                className="inline-flex items-center gap-2 rounded-lg border border-sky-700/70 bg-sky-950/60 px-4 py-3 text-xs font-semibold text-sky-200 hover:bg-sky-900/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{lang === 'en' ? 'Download 1930 Poster' : '1930 पोस्टर डाउनलोड करें'}</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {goldenHourSteps.map((step) => (
                <div key={step.num} className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 tabular-nums">
                      {step.num}.
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {lang === 'en' ? step.enTitle : step.hiTitle}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {lang === 'en' ? step.enDesc : step.hiDesc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: ITI Project Attribution Card */}
          <div className="lg:col-span-4">
            <div className="flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-6">
              <div>
                <p className="text-xs font-semibold tracking-wide text-sky-400">
                  {lang === 'en' ? 'ITI COPA Project Details' : 'ITI COPA प्रोजेक्ट विवरण'}
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-white">
                  {STUDENT_PROJECT_INFO.projectTitle}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {STUDENT_PROJECT_INFO.tagline[lang]}
                </p>

                <dl className="mt-5 space-y-3 border-t border-slate-800 pt-5 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">{lang === 'en' ? 'Student Name' : 'छात्र का नाम'}</dt>
                    <dd className="text-right font-semibold text-white">{STUDENT_PROJECT_INFO.studentName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">{lang === 'en' ? 'Trade' : 'ट्रेड'}</dt>
                    <dd className="text-right font-medium text-slate-200">{STUDENT_PROJECT_INFO.trade}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">{lang === 'en' ? 'Institute' : 'संस्थान'}</dt>
                    <dd className="text-right font-medium text-slate-200">{STUDENT_PROJECT_INFO.itiName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">{lang === 'en' ? 'Email' : 'ईमेल'}</dt>
                    <dd className="break-all text-right font-mono text-slate-200">{STUDENT_PROJECT_INFO.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">{lang === 'en' ? 'Contact No.' : 'संपर्क नंबर'}</dt>
                    <dd className="text-right font-mono tabular-nums text-slate-200">{STUDENT_PROJECT_INFO.contact}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-400">
                {lang === 'en'
                  ? 'Built with interactive browser tools and AI Cyber Sahayak to promote bilingual cyber awareness for students and everyday internet users.'
                  : 'छात्रों और आम इंटरनेट उपयोगकर्ताओं में हिंदी व अंग्रेजी साइबर जागरूकता बढ़ाने के लिए निर्मित।'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
