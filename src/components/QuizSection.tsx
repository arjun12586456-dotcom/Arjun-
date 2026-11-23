import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Crown,
  Download,
  Lock,
  Medal,
  RotateCcw,
  Shield,
  ShieldCheck,
  Trophy,
  XCircle,
} from 'lucide-react';
import { QUIZ_QUESTIONS, type BilingualText, type Lang } from '../data/cyberData';
import { downloadCertificatePng } from '../utils/securityAnalyzers';

interface QuizSectionProps {
  lang: Lang;
}

type BadgeId =
  | 'first-step'
  | 'halfway-vigilant'
  | 'quiz-finisher'
  | 'fraud-spotter'
  | 'cyber-hero'
  | 'flawless-sentinel';

interface QuizBadge {
  id: BadgeId;
  title: BilingualText;
  requirement: BilingualText;
  icon: typeof Shield;
}

const BADGE_STORAGE_KEY = 'cyber-security-hero-badges-v1';

const QUIZ_BADGES: QuizBadge[] = [
  {
    id: 'first-step',
    title: { en: 'First Step Defender', hi: 'पहला सुरक्षा कदम' },
    requirement: { en: 'Answer 1st question', hi: 'पहला प्रश्न हल करें' },
    icon: Shield,
  },
  {
    id: 'halfway-vigilant',
    title: { en: 'Halfway Vigilant', hi: 'अर्ध-सजग रक्षक' },
    requirement: { en: 'Answer 4 questions', hi: '4 प्रश्न पूरे करें' },
    icon: ShieldCheck,
  },
  {
    id: 'quiz-finisher',
    title: { en: 'Assessment Finisher', hi: 'क्विज़ विजेता' },
    requirement: { en: 'Complete all 8 questions', hi: 'सभी 8 प्रश्न पूरे करें' },
    icon: Medal,
  },
  {
    id: 'fraud-spotter',
    title: { en: 'Fraud Spotter', hi: 'ठगी पहचान विशेषज्ञ' },
    requirement: { en: 'Score 5+ correct answers', hi: '5+ सही उत्तर दें' },
    icon: Award,
  },
  {
    id: 'cyber-hero',
    title: { en: 'Cyber Hero', hi: 'साइबर हीरो' },
    requirement: { en: 'Score 7+ correct answers', hi: '7+ सही उत्तर प्राप्त करें' },
    icon: Trophy,
  },
  {
    id: 'flawless-sentinel',
    title: { en: 'Flawless Sentinel', hi: 'सर्वश्रेष्ठ साइबर प्रहरी' },
    requirement: { en: 'Perfect 8 / 8 score', hi: 'पूर्ण 8 / 8 स्कोर' },
    icon: Crown,
  },
];

export function QuizSection({ lang }: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeId[]>(() => {
    try {
      const saved = localStorage.getItem(BADGE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });
  const [newlyUnlockedId, setNewlyUnlockedId] = useState<BadgeId | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const chosenIdx = selectedAnswers[currentQuestion.id];
  const hasAnswered = chosenIdx !== undefined;

  const totalQuestions = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = showSummary
    ? 100
    : Math.round((answeredCount / totalQuestions) * 100);
  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex,
  ).length;

  useEffect(() => {
    const earnedNow: BadgeId[] = [];
    if (answeredCount >= 1) earnedNow.push('first-step');
    if (answeredCount >= 4) earnedNow.push('halfway-vigilant');
    if (showSummary || answeredCount === totalQuestions) earnedNow.push('quiz-finisher');
    if (correctCount >= 5) earnedNow.push('fraud-spotter');
    if (correctCount >= 7) earnedNow.push('cyber-hero');
    if (correctCount === totalQuestions && answeredCount === totalQuestions) {
      earnedNow.push('flawless-sentinel');
    }

    if (earnedNow.length === 0) return;

    setUnlockedBadges((prev) => {
      const fresh = earnedNow.filter((id) => !prev.includes(id));
      if (fresh.length === 0) return prev;
      const merged = [...prev, ...fresh];
      try {
        localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // Ignore storage errors
      }
      setNewlyUnlockedId(fresh[fresh.length - 1]);
      return merged;
    });
  }, [answeredCount, correctCount, showSummary, totalQuestions]);

  const handleSelectOption = (optIndex: number) => {
    if (hasAnswered) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optIndex }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowSummary(false);
    setNewlyUnlockedId(null);
  };

  const latestBadge = newlyUnlockedId
    ? QUIZ_BADGES.find((b) => b.id === newlyUnlockedId) || null
    : null;

  return (
    <section id="quiz" className="border-b border-slate-200 bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en' ? 'Cyber Safety Quiz & Certificate' : 'साइबर सुरक्षा क्विज़ और प्रमाणपत्र'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Complete quiz milestones to earn Cyber Hero badges and download your personalized certificate.'
                : 'साइबर हीरो बैज अनलॉक करने और अपना प्रमाणपत्र डाउनलोड करने के लिए 8 प्रश्नों का क्विज़ पूरा करें।'}
            </p>
          </div>
          {!showSummary && (
            <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
              {lang === 'en' ? 'Question' : 'प्रश्न'} {currentIndex + 1} / {totalQuestions}
            </span>
          )}
        </div>

        {/* Visual Quiz Progress Bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>
              {showSummary
                ? lang === 'en'
                  ? 'Assessment completed'
                  : 'मूल्यांकन पूरा हुआ'
                : lang === 'en'
                  ? `Progress: ${answeredCount} of ${totalQuestions} answered`
                  : `प्रगति: ${totalQuestions} में से ${answeredCount} प्रश्न पूर्ण`}
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {progressPercent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={lang === 'en' ? 'Quiz progress' : 'क्विज़ प्रगति'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className={`h-full transition-all duration-200 ${
                progressPercent === 100 ? 'bg-emerald-600' : 'bg-sky-700'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Newly Unlocked Badge Toast */}
        {latestBadge && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-950">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4 text-sky-700 shrink-0" />
              <span>
                <strong>
                  {lang === 'en' ? 'Milestone Unlocked:' : 'नया बैज अनलॉक हुआ:'}
                </strong>{' '}
                {latestBadge.title[lang]} — {latestBadge.requirement[lang]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNewlyUnlockedId(null)}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer shrink-0"
            >
              {lang === 'en' ? 'Dismiss' : 'बंद करें'}
            </button>
          </div>
        )}

        {!showSummary ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-sky-700">{currentQuestion.topic[lang]}</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {lang === 'en' ? 'Score:' : 'स्कोर:'} {correctCount}/{answeredCount}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-slate-950 sm:text-xl">
              {currentQuestion.question[lang]}
            </h3>

            <div className="mt-5 space-y-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = chosenIdx === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let optionStyle =
                  'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50';
                if (hasAnswered) {
                  if (isCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                  } else {
                    optionStyle = 'border-slate-200 bg-white/70 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm font-medium transition-colors ${
                      hasAnswered ? 'cursor-default' : 'cursor-pointer'
                    } ${optionStyle}`}
                  >
                    <span>
                      <span className="mr-2.5 font-mono text-xs text-slate-400">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt[lang]}
                    </span>
                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className="mt-5 flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">
                    {chosenIdx === currentQuestion.correctIndex
                      ? lang === 'en'
                        ? 'Correct Answer'
                        : 'सही उत्तर'
                      : lang === 'en'
                        ? 'Explanation'
                        : 'सही जानकारी'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {currentQuestion.explanation[lang]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {currentIndex + 1 < totalQuestions
                    ? lang === 'en'
                      ? 'Next Question'
                      : 'अगला प्रश्न'
                    : lang === 'en'
                      ? 'View Score & Certificate'
                      : 'स्कोर और प्रमाणपत्र देखें'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                {correctCount >= 7 ? (
                  <Trophy className="h-8 w-8 text-sky-700 shrink-0" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-950">
                    {correctCount >= 7
                      ? lang === 'en'
                        ? 'Cyber Hero Status Earned'
                        : 'साइबर हीरो उपाधि प्राप्त हुई'
                      : lang === 'en'
                        ? 'Quiz Completed'
                        : 'क्विज़ पूरा हुआ'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {correctCount >= 6
                      ? lang === 'en'
                        ? 'Great work! Enter your name below to download your awareness certificate.'
                        : 'बढ़िया! नीचे अपना नाम दर्ज करके जागरूकता प्रमाणपत्र डाउनलोड करें।'
                      : lang === 'en'
                        ? 'Review the explanations below or retake to unlock the Cyber Hero badge (7+).'
                        : 'नीचे दी गई व्याख्या पढ़ें या साइबर हीरो बैज (7+) पाने के लिए फिर प्रयास करें।'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-slate-950 tabular-nums">
                  {correctCount} / {totalQuestions}
                </p>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {lang === 'en' ? 'Retake Quiz' : 'दोबारा क्विज़ दें'}
                </button>
              </div>
            </div>

            {/* Downloadable Certificate Card */}
            <div className="mt-6 rounded-xl border border-sky-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                <Award className="h-5 w-5 text-sky-700 shrink-0" />
                <span>
                  {lang === 'en' ? 'Download Awareness Certificate (PNG)' : 'साइबर जागरूकता प्रमाणपत्र डाउनलोड करें'}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder={lang === 'en' ? 'Enter your full name (e.g. Arjun Kumar)' : 'अपना पूरा नाम लिखें'}
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => downloadCertificatePng(participantName, correctCount, totalQuestions, lang)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Download Certificate' : 'प्रमाणपत्र डाउनलोड करें'}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {QUIZ_QUESTIONS.map((q, i) => {
                const isRight = selectedAnswers[q.id] === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-900">
                        {i + 1}. {q.question[lang]}
                      </p>
                      <span
                        className={`font-semibold whitespace-nowrap shrink-0 ${
                          isRight ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isRight ? (lang === 'en' ? 'Correct' : 'सही') : lang === 'en' ? 'Review' : 'सुधारें'}
                      </span>
                    </div>
                    <p className="mt-1.5 leading-relaxed text-slate-600">{q.explanation[lang]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cyber Hero Milestone Badges Grid */}
        <div className="mt-8 border-t border-slate-200 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-950">
                {lang === 'en' ? 'Cyber Hero Milestone Badges' : 'साइबर हीरो माइलस्टोन बैज'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                {lang === 'en'
                  ? 'Virtual badges unlock automatically as you complete quiz milestones.'
                  : 'क्विज़ के विभिन्न पड़ाव पूरे करने पर ये वर्चुअल बैज अपने आप अनलॉक होते हैं।'}
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {unlockedBadges.length} / {QUIZ_BADGES.length}{' '}
              {lang === 'en' ? 'Unlocked' : 'अनलॉक'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZ_BADGES.map((badge) => {
              const Icon = badge.icon;
              const isUnlocked = unlockedBadges.includes(badge.id);
              const isHeroBadge = badge.id === 'cyber-hero';

              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                    isUnlocked
                      ? isHeroBadge
                        ? 'border-sky-300 bg-sky-50'
                        : 'border-emerald-200 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 ${
                      isUnlocked
                        ? isHeroBadge
                          ? 'border-sky-300 bg-white text-sky-700'
                          : 'border-emerald-300 bg-white text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isUnlocked ? 'text-slate-950' : 'text-slate-600'
                        }`}
                      >
                        {badge.title[lang]}
                      </p>
                      <span
                        className={`text-[11px] font-semibold shrink-0 ${
                          isUnlocked
                            ? isHeroBadge
                              ? 'text-sky-700'
                              : 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {isUnlocked
                          ? lang === 'en'
                            ? 'Earned'
                            : 'प्राप्त'
                          : lang === 'en'
                            ? 'Locked'
                            : 'लॉक'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">{badge.requirement[lang]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
