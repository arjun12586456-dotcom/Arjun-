import { STUDENT_PROJECT_INFO, type Lang } from '../data/cyberData';

interface FooterProps {
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
}

export function Footer({ lang, onChangeLang }: FooterProps) {
  return (
    <footer className="bg-slate-950 py-8 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-sm font-semibold text-white">
            {STUDENT_PROJECT_INFO.projectTitle}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {STUDENT_PROJECT_INFO.tagline[lang]} · {STUDENT_PROJECT_INFO.studentName} ({STUDENT_PROJECT_INFO.itiName})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a href="#guide" className="hover:text-white transition-colors">
            {lang === 'en' ? 'How to Use' : 'कैसे उपयोग करें'}
          </a>
          <a href="#tools" className="hover:text-white transition-colors">
            {lang === 'en' ? 'Safety Tools' : 'सुरक्षा टूल्स'}
          </a>
          <a href="#directory" className="hover:text-white transition-colors">
            {lang === 'en' ? 'Directory' : 'हेल्पलाइन सूची'}
          </a>
          <a href="#quiz" className="hover:text-white transition-colors">
            {lang === 'en' ? 'Quiz' : 'क्विज़'}
          </a>
          <button
            type="button"
            onClick={() => onChangeLang(lang === 'en' ? 'hi' : 'en')}
            className="rounded border border-slate-800 px-2.5 py-1 font-medium text-slate-300 hover:border-slate-700 hover:text-white cursor-pointer"
          >
            {lang === 'en' ? 'हिंदी में देखें' : 'Switch to English'}
          </button>
        </div>
      </div>
    </footer>
  );
}
