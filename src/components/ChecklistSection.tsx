import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { SAFETY_CHECKLIST_ITEMS, type Lang } from '../data/cyberData';

interface ChecklistSectionProps {
  lang: Lang;
}

const STORAGE_KEY = 'cyber-rakshak-checklist-v1';

export function ChecklistSection({ lang }: ChecklistSectionProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return ['chk-1', 'chk-4'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore storage errors
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const completedCount = checkedIds.length;
  const totalCount = SAFETY_CHECKLIST_ITEMS.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <section id="checklist" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en' ? 'Daily Cyber Safety Checklist' : 'दैनिक साइबर सुरक्षा चेकलिस्ट'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Track your essential cyber hygiene habits across accounts, UPI payments, browsing, and mobile devices.'
                : 'अपने खातों, UPI पेमेंट, ब्राउज़िंग और मोबाइल सुरक्षा की आदतों को यहाँ चेक करके ट्रैक करें।'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                {completedCount}/{totalCount} ({percent}%)
              </p>
              <p className="text-xs text-slate-500">
                {lang === 'en' ? 'Habits secured' : 'नियम पूरे हुए'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCheckedIds([])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {lang === 'en' ? 'Reset' : 'रीसेट'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all duration-200 ${
              percent === 100 ? 'bg-emerald-600' : 'bg-sky-700'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {SAFETY_CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-pressed={isChecked}
                className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                  isChecked
                    ? 'border-emerald-300 bg-emerald-50/70'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border shrink-0 transition-colors ${
                    isChecked
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="block text-xs font-medium text-slate-500">
                    {item.categoryLabel[lang]}
                  </span>
                  <span
                    className={`mt-0.5 block text-sm font-semibold ${
                      isChecked ? 'text-emerald-950' : 'text-slate-900'
                    }`}
                  >
                    {item.title[lang]}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    {item.detail[lang]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
