import { useMemo, useState, type ChangeEvent } from 'react';
import jsQR from 'jsqr';
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileSearch,
  Film,
  Image as ImageIcon,
  Info,
  KeyRound,
  Link2,
  Loader2,
  MessageSquare,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
} from 'lucide-react';
import { SCAM_SCENARIOS, UI_COPY, type Lang } from '../data/cyberData';
import { CyberChatPanel } from './CyberChatPanel';
import { VideoAnimatorTool } from './VideoAnimatorTool';
import {
  analyzePassword,
  checkPasswordBreach,
  generateSecurePassword,
  inspectFileLocally,
  inspectPhishingInput,
  parseUpiPaymentUri,
  stripImageExifMetadata,
  type FileSafetyResult,
} from '../utils/securityAnalyzers';

export type ActiveToolTab = 'password' | 'phishing' | 'assistant' | 'files' | 'video' | 'scam' | 'audit';

interface ToolsWorkbenchProps {
  lang: Lang;
  activeTab: ActiveToolTab;
  onChangeTab: (tab: ActiveToolTab) => void;
}

interface AiSahayakResult {
  riskLevel: 'safe' | 'caution' | 'high_risk';
  scamType: string;
  summary: string;
  redFlags: string[];
  nextSteps: string[];
}

const AUDIT_QUESTIONS = [
  {
    id: 'a1',
    en: 'Do you use a unique password for your primary email (Gmail/Outlook) that is not used anywhere else?',
    hi: 'क्या आपके मुख्य ईमेल (Gmail) का पासवर्ड बाकी सभी वेबसाइटों से बिल्कुल अलग है?',
    fixEn: 'Change your primary email password immediately so it is 100% unique.',
    fixHi: 'अपने मुख्य ईमेल का पासवर्ड तुरंत बदलकर एक अलग पासवर्ड रखें।',
  },
  {
    id: 'a2',
    en: 'Is Two-Factor Authentication (2FA) enabled on your email and WhatsApp (Two-Step PIN)?',
    hi: 'क्या आपके ईमेल और WhatsApp पर Two-Factor Authentication / Two-Step PIN चालू है?',
    fixEn: 'Turn on Two-Step Verification in WhatsApp Settings > Account and Google Account > Security.',
    fixHi: 'WhatsApp और Google अकाउंट की सुरक्षा सेटिंग में जाकर 2FA जरूर चालू करें।',
  },
  {
    id: 'a3',
    en: 'Have you set a daily transaction limit on your UPI app and bank debit card?',
    hi: 'क्या आपने अपने UPI ऐप और डेबिट कार्ड पर दैनिक लेनदेन की सीमा (Limit) कम रखी है?',
    fixEn: 'Open your bank app and cap daily card/UPI limits to reduce maximum loss risk.',
    fixHi: 'अपने बैंक ऐप में जाकर रोजाना पेमेंट की सीमा सीमित करें।',
  },
  {
    id: 'a4',
    en: 'Do you avoid installing .APK files received via WhatsApp or Telegram?',
    hi: 'क्या आप WhatsApp या Telegram से आई किसी भी .APK फाइल को इंस्टॉल करने से बचते हैं?',
    fixEn: 'Disable "Install Unknown Apps" in Android Settings and delete unsolicited .apk files.',
    fixHi: 'Android सेटिंग्स में "Install Unknown Apps" बंद रखें और अनजान .apk फाइल न खोलें।',
  },
  {
    id: 'a5',
    en: 'Do you always use mobile data instead of free public Wi-Fi when making online payments?',
    hi: 'क्या ऑनलाइन पेमेंट करते समय आप पब्लिक Wi-Fi के बजाय अपने मोबाइल डेटा का उपयोग करते हैं?',
    fixEn: 'Turn off Wi-Fi and switch to 4G/5G mobile data before opening banking or UPI apps.',
    fixHi: 'बैंकिंग या UPI ऐप खोलने से पहले पब्लिक Wi-Fi बंद करके मोबाइल डेटा चालू करें।',
  },
  {
    id: 'a6',
    en: 'Do you know the 1930 helpline and cybercrime.gov.in to report financial fraud within the first hour?',
    hi: 'क्या आपको पता है कि ठगी होने पर पहले घंटे में 1930 और cybercrime.gov.in पर शिकायत करनी होती है?',
    fixEn: 'Save 1930 in your contacts as "National Cyber Helpline" for emergency access.',
    fixHi: 'आपातकालीन मदद के लिए अपने फोन में 1930 नंबर को सेव कर लें।',
  },
];

const TOOL_MINI_GUIDE: Record<ActiveToolTab, { en: string; hi: string }> = {
  password: {
    en: 'How to use: Type a sample password on the left to check strength & real-world data leaks (k-Anonymity), or generate a 16-char password on the right.',
    hi: 'उपयोग कैसे करें: बाईं ओर पासवर्ड लिखकर उसकी मजबूती और डेटा-लीक जांचें (k-Anonymity), या दाईं ओर से नया मजबूत पासवर्ड बनाएं।',
  },
  phishing: {
    en: 'How to use: Pick Check URL, SMS/WhatsApp, or UPI QR Decoder. Paste a link/message or upload a QR screenshot to reveal the real owner or UPI receiver.',
    hi: 'उपयोग कैसे करें: लिंक, SMS या UPI QR डिकोडर चुनें। संदिग्ध लिंक/संदेश पेस्ट करें या QR फोटो अपलोड करके असली मालिक की पहचान करें।',
  },
  assistant: {
    en: 'How to use: Use Multi-Turn Chat for follow-up questions with live Google Search alerts or Google Maps place data, or switch to Quick Scam Risk Report.',
    hi: 'उपयोग कैसे करें: Google Search अलर्ट या Google Maps सहायता केंद्र खोजने के लिए मल्टी-टर्न चैट का उपयोग करें, या तुरंत जोखिम रिपोर्ट बनाएं।',
  },
  files: {
    en: 'How to use: Upload any downloaded file to check its SHA-256 hash & .apk/.exe risks, or clean GPS/camera metadata from a photo before posting online.',
    hi: 'उपयोग कैसे करें: फाइल का SHA-256 कोड व .apk/.exe जोखिम जांचने के लिए फाइल चुनें, या फोटो से GPS लोकेशन हटाने के लिए फोटो अपलोड करें।',
  },
  video: {
    en: 'How to use: Upload an awareness image or photo, select 16:9 or 9:16, customize your 1930 safety caption, and export a playable .WEBM reel.',
    hi: 'उपयोग कैसे करें: कोई भी फोटो अपलोड करें, 16:9 या 9:16 आकार और एनीमेशन चुनें, फिर अपना जागरूकता .WEBM वीडियो बनाएं।',
  },
  scam: {
    en: 'How to use: Choose Case 1–4, read the fraudster message, select the safest reaction, and review the red flags on the right.',
    hi: 'उपयोग कैसे करें: केस 1 से 4 चुनें, ठग का संदेश पढ़ें, सुरक्षित विकल्प चुनें और दाईं ओर खतरे के संकेत समझें।',
  },
  audit: {
    en: 'How to use: Answer Yes or No honestly to all 6 digital hygiene questions to generate your personalized fix list.',
    hi: 'उपयोग कैसे करें: सभी 6 सुरक्षा प्रश्नों का हाँ या नहीं में ईमानदारी से उत्तर दें और अपनी सुरक्षा कार्य-योजना देखें।',
  },
};

export function ToolsWorkbench({ lang, activeTab, onChangeTab }: ToolsWorkbenchProps) {
  // Tool 1: Password & Breach State
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [breachLoading, setBreachLoading] = useState(false);
  const [breachResult, setBreachResult] = useState<{ count: number; status: 'clean' | 'pwned' } | null>(null);
  const [breachError, setBreachError] = useState<string | null>(null);

  const [genLength, setGenLength] = useState(14);
  const [genUpper, setGenUpper] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPwd, setGeneratedPwd] = useState(() =>
    generateSecurePassword({ length: 14, upper: true, numbers: true, symbols: true }),
  );
  const [copiedPwd, setCopiedPwd] = useState(false);

  // Tool 2: Phishing & UPI QR State
  const [inspectMode, setInspectMode] = useState<'url' | 'message' | 'qr'>('url');
  const [phishInput, setPhishInput] = useState('http://sbi-pan-kyc88.xyz/verify/login');
  const [upiInput, setUpiInput] = useState(
    'upi://pay?pa=cashback-refund99@okaxis&pn=Customer%20Refund%20Desk&am=4999&cu=INR&tn=Claim%20Cashback',
  );
  const [qrStatus, setQrStatus] = useState<string | null>(null);

  // Tool 3: AI Cyber Sahayak State
  const [aiSubMode, setAiSubMode] = useState<'chat' | 'analyzer'>('chat');
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiSahayakResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Tool 4: File Hash & Photo EXIF Stripper State
  const [fileResult, setFileResult] = useState<FileSafetyResult | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const [exifLoading, setExifLoading] = useState(false);
  const [exifError, setExifError] = useState<string | null>(null);
  const [cleanPhoto, setCleanPhoto] = useState<{
    cleanUrl: string;
    cleanBlobSize: number;
    originalSize: number;
    width: number;
    height: number;
    cleanFileName: string;
  } | null>(null);

  // Tool 5: Scam Simulator State
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Tool 6: Security Audit State
  const [auditAnswers, setAuditAnswers] = useState<Record<string, boolean | null>>({
    a1: null,
    a2: null,
    a3: null,
    a4: null,
    a5: null,
    a6: null,
  });

  const pwdAnalysis = useMemo(() => analyzePassword(passwordInput), [passwordInput]);
  const phishReport = useMemo(
    () =>
      inspectMode !== 'qr' && phishInput.trim()
        ? inspectPhishingInput(phishInput, inspectMode)
        : null,
    [phishInput, inspectMode],
  );
  const upiDecoded = useMemo(
    () => (inspectMode === 'qr' && upiInput.trim() ? parseUpiPaymentUri(upiInput) : null),
    [upiInput, inspectMode],
  );

  const handleCheckBreach = async () => {
    if (!passwordInput) return;
    setBreachLoading(true);
    setBreachError(null);
    setBreachResult(null);
    try {
      const res = await checkPasswordBreach(passwordInput);
      setBreachResult(res);
    } catch (err) {
      setBreachError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Unable to verify data breach right now.'
            : 'डेटा लीक सेवा अभी उपलब्ध नहीं है।',
      );
    } finally {
      setBreachLoading(false);
    }
  };

  const handleRegenerate = () => {
    const next = generateSecurePassword({
      length: genLength,
      upper: genUpper,
      numbers: genNumbers,
      symbols: genSymbols,
    });
    setGeneratedPwd(next);
    setCopiedPwd(false);
  };

  const handleCopyGenerated = async () => {
    try {
      await navigator.clipboard.writeText(generatedPwd);
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 1800);
    } catch {
      setPasswordInput(generatedPwd);
    }
  };

  const handleQrImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrStatus(lang === 'en' ? 'Decoding QR image locally...' : 'QR कोड पढ़ा जा रहा है...');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setQrStatus(lang === 'en' ? 'Unable to read image.' : 'इमेज पढ़ी नहीं जा सकी।');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);
        if (decoded?.data) {
          setUpiInput(decoded.data);
          setQrStatus(
            lang === 'en'
              ? `QR decoded from "${file.name}".`
              : `"${file.name}" से QR कोड सफलतापूर्वक पढ़ा गया।`,
          );
        } else {
          setQrStatus(
            lang === 'en'
              ? 'No QR code detected in this image. Try a clearer crop or paste the UPI link below.'
              : 'इस फोटो में कोई QR कोड नहीं मिला। साफ फोटो चुनें या नीचे UPI लिंक पेस्ट करें।',
          );
        }
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleAiAnalyze = async () => {
    const trimmed = aiQuery.trim();
    if (!trimmed) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const resp = await fetch('/api/cyber-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, lang }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'AI analysis request failed.');
      }
      setAiResult(data as AiSahayakResult);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Unable to reach AI Cyber Sahayak.'
            : 'AI साइबर सहायक से संपर्क नहीं हो सका।',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleInspectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setCopiedHash(false);
    try {
      const res = await inspectFileLocally(file);
      setFileResult(res);
    } finally {
      setFileLoading(false);
    }
  };

  const handleStripPhotoExif = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExifLoading(true);
    setExifError(null);
    if (cleanPhoto?.cleanUrl) {
      URL.revokeObjectURL(cleanPhoto.cleanUrl);
    }
    setCleanPhoto(null);
    try {
      const cleaned = await stripImageExifMetadata(file);
      setCleanPhoto(cleaned);
    } catch (err) {
      setExifError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Could not process image.'
            : 'फोटो प्रोसेस नहीं हो सकी।',
      );
    } finally {
      setExifLoading(false);
    }
  };

  const currentScenario = SCAM_SCENARIOS[scenarioIdx];
  const selectedOption = currentScenario.options.find((o) => o.id === selectedOptionId) || null;
  const answeredCount = Object.values(auditAnswers).filter((v) => v !== null).length;
  const safeYesCount = Object.values(auditAnswers).filter((v) => v === true).length;
  const auditIssues = AUDIT_QUESTIONS.filter((q) => auditAnswers[q.id] === false);

  return (
    <section id="tools" className="border-b border-slate-200 bg-slate-50 py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {UI_COPY.workbench.heading[lang]}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {UI_COPY.workbench.subheading[lang]}
            </p>
          </div>
        </div>

        {/* 6 Tool Tabs */}
        <div
          className="mt-7 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 sm:flex sm:flex-wrap"
          role="tablist"
          aria-label="Cyber security tools"
        >
          {(
            [
              { id: 'password', label: UI_COPY.workbench.tabs.password[lang], icon: KeyRound },
              { id: 'phishing', label: UI_COPY.workbench.tabs.phishing[lang], icon: Link2 },
              { id: 'assistant', label: UI_COPY.workbench.tabs.assistant[lang], icon: Bot },
              { id: 'files', label: UI_COPY.workbench.tabs.files[lang], icon: FileSearch },
              { id: 'video', label: lang === 'en' ? 'Video Studio' : 'वीडियो स्टूडियो', icon: Film },
              { id: 'scam', label: UI_COPY.workbench.tabs.scam[lang], icon: ShieldAlert },
              { id: 'audit', label: UI_COPY.workbench.tabs.audit[lang], icon: SlidersHorizontal },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChangeTab(tab.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contextual Tool Guidance Strip */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50/70 px-4 py-3 text-xs text-sky-950">
          <Info className="mt-0.5 h-4 w-4 text-sky-700 shrink-0" />
          <p className="leading-relaxed">{TOOL_MINI_GUIDE[activeTab][lang]}</p>
        </div>

        {/* TOOL 1: PASSWORD STRENGTH, K-ANONYMITY BREACH CHECK & GENERATOR */}
        {activeTab === 'password' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? 'Password Strength & Breach Lookup' : 'पासवर्ड मजबूती और डेटा-लीक जांच'}
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {pwdAnalysis.entropyBits} {lang === 'en' ? 'bits entropy' : 'बिट्स एन्ट्रॉपी'}
                </span>
              </div>

              <div className="mt-4">
                <label htmlFor="pwd-test-input" className="block text-xs font-semibold text-slate-700">
                  {lang === 'en'
                    ? 'Enter a password to check strength & k-Anonymity breach history'
                    : 'मजबूती और डेटा-लीक जांचने के लिए पासवर्ड दर्ज करें'}
                </label>
                <div className="relative mt-2">
                  <input
                    id="pwd-test-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setBreachResult(null);
                      setBreachError(null);
                    }}
                    placeholder={
                      lang === 'en' ? 'e.g. 123456 or Kite#River84!Moon' : 'उदाहरण लिखें...'
                    }
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 pr-14 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="rounded-md p-2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500">{lang === 'en' ? 'Try sample:' : 'उदाहरण:'}</span>
                  {['123456', 'Arjun2002', 'Kite#River84!Moon'].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setPasswordInput(sample);
                        setBreachResult(null);
                        setBreachError(null);
                      }}
                      className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={!passwordInput || breachLoading}
                    onClick={handleCheckBreach}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-45 cursor-pointer whitespace-nowrap"
                  >
                    {breachLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{lang === 'en' ? 'Check Data Breach' : 'डेटा लीक जांचें'}</span>
                  </button>
                </div>
              </div>

              {breachError && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {breachError}
                </div>
              )}

              {breachResult && (
                <div
                  className={`mt-4 flex items-start gap-3 rounded-lg border p-3.5 text-xs ${
                    breachResult.status === 'pwned'
                      ? 'border-rose-200 bg-rose-50 text-rose-950'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  }`}
                >
                  {breachResult.status === 'pwned' ? (
                    <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-600 shrink-0" />
                  ) : (
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {breachResult.status === 'pwned'
                        ? lang === 'en'
                          ? `Leaked in ${breachResult.count.toLocaleString()} public data breaches!`
                          : `यह पासवर्ड ${breachResult.count.toLocaleString()} बार डेटा लीक में मिला है!`
                        : lang === 'en'
                          ? 'Not found in known public data-breach databases.'
                          : 'यह पासवर्ड किसी ज्ञात डेटा लीक में नहीं मिला।'}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {lang === 'en'
                        ? 'Verified privately via k-Anonymity (only the first 5 SHA-1 hash characters were checked).'
                        : 'k-Anonymity तकनीक से सुरक्षित जांच (केवल SHA-1 हैश के पहले 5 अक्षर जांचे गए)।'}
                    </p>
                  </div>
                </div>
              )}

              {/* Strength Meter */}
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {pwdAnalysis.score >= 3 ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : pwdAnalysis.score === 2 ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        pwdAnalysis.score >= 3
                          ? 'text-emerald-700'
                          : pwdAnalysis.score === 2
                            ? 'text-amber-700'
                            : pwdAnalysis.score === 1
                              ? 'text-rose-700'
                              : 'text-slate-700'
                      }`}
                    >
                      {pwdAnalysis.label[lang]}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-600 tabular-nums">
                    {lang === 'en' ? 'Crack estimate:' : 'अनुमानित समय:'} {pwdAnalysis.crackTime[lang]}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((step) => {
                    let barColor = 'bg-slate-200';
                    if (pwdAnalysis.score >= step) {
                      if (pwdAnalysis.score === 1) barColor = 'bg-rose-600';
                      else if (pwdAnalysis.score === 2) barColor = 'bg-amber-500';
                      else if (pwdAnalysis.score === 3) barColor = 'bg-sky-600';
                      else barColor = 'bg-emerald-600';
                    }
                    return <div key={step} className={`h-2 rounded-full transition-colors ${barColor}`} />;
                  })}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-3">
                  {[
                    {
                      ok: pwdAnalysis.length >= 12,
                      label: lang === 'en' ? `12+ chars (${pwdAnalysis.length})` : `12+ अक्षर (${pwdAnalysis.length})`,
                    },
                    { ok: pwdAnalysis.hasUpper, label: lang === 'en' ? 'Uppercase (A–Z)' : 'बड़े अक्षर (A–Z)' },
                    { ok: pwdAnalysis.hasLower, label: lang === 'en' ? 'Lowercase (a–z)' : 'छोटे अक्षर (a–z)' },
                    { ok: pwdAnalysis.hasNumber, label: lang === 'en' ? 'Numbers (0–9)' : 'अंक (0–9)' },
                    { ok: pwdAnalysis.hasSymbol, label: lang === 'en' ? 'Symbols (@#$!)' : 'विशेष चिह्न (@#$!)' },
                    {
                      ok: pwdAnalysis.length > 0 && !pwdAnalysis.hasCommonPattern,
                      label: lang === 'en' ? 'No common pattern' : 'कोई आसान पैटर्न नहीं',
                    },
                  ].map((crit) => (
                    <div
                      key={crit.label}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium ${
                        crit.ok ? 'bg-emerald-50 text-emerald-800' : 'border border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${crit.ok ? 'text-emerald-600' : 'text-slate-300'}`}
                      />
                      <span className="truncate">{crit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Control Deck: Secure Password Generator */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
              <h3 className="text-lg font-semibold text-slate-950">
                {lang === 'en' ? 'Strong Password Generator' : 'सुरक्षित पासवर्ड जनरेटर'}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                {lang === 'en'
                  ? 'Generate a cryptographically random password directly on your device.'
                  : 'अपने डिवाइस पर तुरंत एक मजबूत और यादृच्छिक पासवर्ड बनाएं।'}
              </p>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-900 p-4 text-white">
                <p className="font-mono text-base font-medium tracking-wide break-all select-all">
                  {generatedPwd}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {lang === 'en' ? 'Regenerate' : 'नया बनाएं'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyGenerated}
                    className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 cursor-pointer"
                  >
                    {copiedPwd ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedPwd ? (lang === 'en' ? 'Copied' : 'कॉपी हो गया') : lang === 'en' ? 'Copy' : 'कॉपी करें'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput(generatedPwd);
                      setBreachResult(null);
                    }}
                    className="ml-auto text-xs font-medium text-sky-300 hover:text-sky-200 cursor-pointer"
                  >
                    {lang === 'en' ? 'Test in analyzer' : 'जांच में डालें'}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="pwd-length-slider">
                      {lang === 'en' ? 'Password Length' : 'पासवर्ड की लंबाई'}
                    </label>
                    <span className="font-mono tabular-nums text-sky-700">{genLength} chars</span>
                  </div>
                  <input
                    id="pwd-length-slider"
                    type="range"
                    min={8}
                    max={24}
                    value={genLength}
                    onChange={(e) => {
                      const nextLen = Number(e.target.value);
                      setGenLength(nextLen);
                      setGeneratedPwd(
                        generateSecurePassword({
                          length: nextLen,
                          upper: genUpper,
                          numbers: genNumbers,
                          symbols: genSymbols,
                        }),
                      );
                    }}
                    className="mt-2 w-full accent-sky-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                  {[
                    {
                      id: 'opt-upper',
                      checked: genUpper,
                      onChange: (val: boolean) => {
                        setGenUpper(val);
                        setGeneratedPwd(
                          generateSecurePassword({
                            length: genLength,
                            upper: val,
                            numbers: genNumbers,
                            symbols: genSymbols,
                          }),
                        );
                      },
                      label: lang === 'en' ? 'Include Uppercase (A–Z)' : 'बड़े अक्षर शामिल करें (A–Z)',
                    },
                    {
                      id: 'opt-num',
                      checked: genNumbers,
                      onChange: (val: boolean) => {
                        setGenNumbers(val);
                        setGeneratedPwd(
                          generateSecurePassword({
                            length: genLength,
                            upper: genUpper,
                            numbers: val,
                            symbols: genSymbols,
                          }),
                        );
                      },
                      label: lang === 'en' ? 'Include Numbers (2–9)' : 'अंक शामिल करें (2–9)',
                    },
                    {
                      id: 'opt-sym',
                      checked: genSymbols,
                      onChange: (val: boolean) => {
                        setGenSymbols(val);
                        setGeneratedPwd(
                          generateSecurePassword({
                            length: genLength,
                            upper: genUpper,
                            numbers: genNumbers,
                            symbols: val,
                          }),
                        );
                      },
                      label: lang === 'en' ? 'Include Symbols (@#$%&*)' : 'विशेष चिह्न शामिल करें (@#$%&*)',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      htmlFor={opt.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-800">{opt.label}</span>
                      <input
                        id={opt.id}
                        type="checkbox"
                        checked={opt.checked}
                        onChange={(e) => opt.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 accent-sky-700 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 2: PHISHING LINK, SMS & UPI QR CODE DECODER */}
        {activeTab === 'phishing' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? 'Link, SMS & UPI QR Inspector' : 'लिंक, SMS और UPI QR जांच'}
                </h3>
                <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectMode('url');
                      setPhishInput('http://sbi-pan-kyc88.xyz/verify/login');
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                      inspectMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {lang === 'en' ? 'Check URL' : 'वेब लिंक'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectMode('message');
                      setPhishInput(
                        'Dear Customer, your SBI account will be blocked tonight! Update KYC urgently at http://sbi-kyc-help.top/login or call now.',
                      );
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                      inspectMode === 'message' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {lang === 'en' ? 'SMS / Text' : 'SMS / संदेश'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectMode('qr')}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                      inspectMode === 'qr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>{lang === 'en' ? 'UPI QR' : 'UPI QR'}</span>
                  </button>
                </div>
              </div>

              {inspectMode === 'qr' ? (
                <div className="mt-4 space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-sky-500 hover:bg-sky-50/40">
                    <Upload className="h-6 w-6 text-sky-700" />
                    <span className="mt-2 text-xs font-semibold text-slate-800">
                      {lang === 'en'
                        ? 'Upload a UPI QR Code Image (PNG / JPG)'
                        : 'UPI QR कोड की फोटो अपलोड करें (PNG / JPG)'}
                    </span>
                    <span className="mt-1 text-[11px] text-slate-500">
                      {lang === 'en'
                        ? 'Decoded locally in your browser before you scan in any payment app.'
                        : 'किसी भी पेमेंट ऐप में स्कैन करने से पहले यहाँ सुरक्षित रूप से जांचें।'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="sr-only"
                    />
                  </label>

                  {qrStatus && (
                    <p className="text-xs font-medium text-sky-800">{qrStatus}</p>
                  )}

                  <div>
                    <label htmlFor="upi-uri-input" className="block text-xs font-semibold text-slate-700">
                      {lang === 'en' ? 'Or paste raw UPI link / QR payload:' : 'या UPI लिंक यहाँ पेस्ट करें:'}
                    </label>
                    <textarea
                      id="upi-uri-input"
                      rows={3}
                      value={upiInput}
                      onChange={(e) => setUpiInput(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <label htmlFor="phish-textarea" className="block text-xs font-semibold text-slate-700">
                      {inspectMode === 'url'
                        ? lang === 'en'
                          ? 'Paste suspicious website URL to inspect its real domain'
                          : 'असली डोमेन जांचने के लिए संदिग्ध लिंक यहाँ पेस्ट करें'
                        : lang === 'en'
                          ? 'Paste SMS, WhatsApp, or Email message text'
                          : 'संदिग्ध SMS, WhatsApp या ईमेल संदेश यहाँ पेस्ट करें'}
                    </label>
                    <textarea
                      id="phish-textarea"
                      rows={4}
                      value={phishInput}
                      onChange={(e) => setPhishInput(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3.5 font-mono text-xs sm:text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {lang === 'en' ? 'Load example:' : 'उदाहरण:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectMode('url');
                        setPhishInput('https://cybercrime.gov.in');
                      }}
                      className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {lang === 'en' ? 'Official Gov Portal' : 'सरकारी पोर्टल'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectMode('url');
                        setPhishInput('http://hdfc.account-verify.click/update.apk');
                      }}
                      className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {lang === 'en' ? 'Lookalike + .APK' : 'नकली बैंक + .APK'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectMode('message');
                        setPhishInput(
                          'आपका बिजली बिल बकाया है। आज रात कनेक्शन कटने से बचाने के लिए तुरंत bit.ly/bill-pay99 पर क्लिक करें और OTP साझा करें।',
                        );
                      }}
                      className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {lang === 'en' ? 'Hindi Electricity Scam' : 'बिजली बिल ठगी'}
                    </button>
                  </div>

                  {phishReport?.urlAnatomy && (
                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-700">
                        {lang === 'en'
                          ? 'URL Anatomy Breakdown — Who really owns this link?'
                          : 'URL संरचना — इस लिंक का असली मालिक कौन है?'}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded border border-slate-200 bg-white p-2.5">
                          <span className="block text-[11px] text-slate-500">
                            {lang === 'en' ? 'Protocol' : 'प्रोटोकॉल'}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs font-semibold text-slate-900 truncate">
                            {phishReport.urlAnatomy.protocol}
                          </span>
                        </div>
                        <div className="rounded border border-slate-200 bg-white p-2.5">
                          <span className="block text-[11px] text-slate-500">
                            {lang === 'en' ? 'Subdomain' : 'सब-डोमेन'}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs font-semibold text-slate-700 truncate">
                            {phishReport.urlAnatomy.subdomain || '—'}
                          </span>
                        </div>
                        <div className="rounded border border-sky-300 bg-sky-50 p-2.5">
                          <span className="block text-[11px] font-medium text-sky-800">
                            {lang === 'en' ? 'Real Domain' : 'असली डोमेन'}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs font-bold text-sky-950 truncate">
                            {phishReport.urlAnatomy.rootDomain}
                          </span>
                        </div>
                        <div className="rounded border border-slate-200 bg-white p-2.5">
                          <span className="block text-[11px] text-slate-500">
                            {lang === 'en' ? 'Path' : 'पेज पथ'}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs font-semibold text-slate-700 truncate">
                            {phishReport.urlAnatomy.path || '/'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column: Verdict */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <h3 className="text-lg font-semibold text-slate-950">
                {inspectMode === 'qr'
                  ? lang === 'en'
                    ? 'Decoded UPI QR Details'
                    : 'डिकोड किया गया UPI QR विवरण'
                  : lang === 'en'
                    ? 'Inspection Verdict & Red Flags'
                    : 'जांच परिणाम और चेतावनी संकेत'}
              </h3>

              {inspectMode === 'qr' ? (
                upiDecoded ? (
                  <div className="mt-4 space-y-4">
                    {upiDecoded.valid && (
                      <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-slate-500">{lang === 'en' ? 'Payee Name' : 'प्राप्तकर्ता का नाम'}</span>
                          <p className="mt-0.5 font-semibold text-slate-950">{upiDecoded.payeeName || '—'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{lang === 'en' ? 'UPI ID (VPA)' : 'UPI आईडी'}</span>
                          <p className="mt-0.5 font-mono font-semibold text-sky-800 break-all">{upiDecoded.vpa}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">{lang === 'en' ? 'Pre-filled Amount' : 'तय राशि (Amount)'}</span>
                          <p className="mt-0.5 font-mono font-bold text-rose-700 tabular-nums">
                            {upiDecoded.amount ? `₹${upiDecoded.amount} (${upiDecoded.currency})` : lang === 'en' ? 'Not locked' : 'निर्धारित नहीं'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">{lang === 'en' ? 'Transaction Note' : 'विवरण'}</span>
                          <p className="mt-0.5 font-medium text-slate-800">{upiDecoded.note || '—'}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {upiDecoded.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                          <p className="leading-relaxed">{w[lang]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">
                    {lang === 'en' ? 'Upload a QR image or paste a UPI string.' : 'QR फोटो अपलोड करें या UPI लिंक पेस्ट करें।'}
                  </p>
                )
              ) : !phishReport ? (
                <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  {lang === 'en'
                    ? 'Enter a URL or message on the left to inspect it.'
                    : 'जांच करने के लिए बाईं ओर लिंक या संदेश दर्ज करें।'}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      phishReport.riskLevel === 'danger'
                        ? 'border-rose-200 bg-rose-50 text-rose-950'
                        : phishReport.riskLevel === 'caution'
                          ? 'border-amber-200 bg-amber-50 text-amber-950'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    }`}
                  >
                    {phishReport.riskLevel === 'danger' ? (
                      <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" />
                    ) : phishReport.riskLevel === 'caution' ? (
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{phishReport.verdict[lang]}</p>
                      <p className="mt-1 font-mono text-xs opacity-80 tabular-nums">
                        {lang === 'en' ? 'Heuristic Risk Index:' : 'जोखिम स्कोर:'} {phishReport.riskScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {phishReport.findings.map((finding, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                        <div className="flex items-center gap-2">
                          {finding.severity === 'danger' ? (
                            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                          ) : finding.severity === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                          <h4 className="text-sm font-semibold text-slate-900">{finding.title[lang]}</h4>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{finding.detail[lang]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOOL 3: AI CYBER SAHAYAK (MULTI-TURN GROUNDED CHAT + QUICK ANALYZER) */}
        {activeTab === 'assistant' && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAiSubMode('chat')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  aiSubMode === 'chat'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  {lang === 'en'
                    ? 'Multi-Turn Chat (Search & Maps Grounding)'
                    : 'मल्टी-टर्न चैट (Search और Maps डेटा)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAiSubMode('analyzer')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  aiSubMode === 'analyzer'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                <span>
                  {lang === 'en' ? 'Quick Scam Risk Report' : 'त्वरित ठगी जांच रिपोर्ट'}
                </span>
              </button>
            </div>

            {aiSubMode === 'chat' ? (
              <CyberChatPanel lang={lang} />
            ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-sky-700 shrink-0" />
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? 'AI Cyber Sahayak (Smart Scam Helper)' : 'AI साइबर सहायक (स्मार्ट ठगी जांच)'}
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                {lang === 'en'
                  ? 'Describe a suspicious phone call, WhatsApp job offer, courier threat, or cyber question for instant bilingual guidance.'
                  : 'किसी भी संदिग्ध कॉल, व्हाट्सएप नौकरी ऑफर, कूरियर धमकी या साइबर सुरक्षा सवाल के बारे में यहाँ पूछें।'}
              </p>

              <div className="mt-4">
                <label htmlFor="ai-sahayak-input" className="block text-xs font-semibold text-slate-700">
                  {lang === 'en'
                    ? 'Message or situation (never enter real passwords or OTPs)'
                    : 'संदेश या स्थिति लिखें (असली पासवर्ड या OTP न लिखें)'}
                </label>
                <textarea
                  id="ai-sahayak-input"
                  rows={5}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Example: A caller claiming to be from Customs says a parcel with my Aadhaar has illegal items and I am under Digital Arrest on video call...'
                      : 'उदाहरण: कोई व्यक्ति पुलिस या कस्टम अधिकारी बनकर वीडियो कॉल पर "डिजिटल अरेस्ट" की धमकी दे रहा है और पैसे मांग रहा है...'
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3.5 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">
                  {lang === 'en' ? 'Quick examples:' : 'त्वरित उदाहरण:'}
                </span>
                {[
                  {
                    label: lang === 'en' ? 'Digital Arrest Call' : 'डिजिटल अरेस्ट कॉल',
                    text:
                      lang === 'en'
                        ? 'Someone on WhatsApp video call wearing a police uniform says my Aadhaar is linked to a seized parcel and demands ₹50,000 for verification.'
                        : 'WhatsApp वीडियो कॉल पर पुलिस की वर्दी में एक व्यक्ति कह रहा है कि मेरे आधार कार्ड से पार्सल पकड़ा गया है और बचने के लिए ₹50,000 ट्रांसफर करने होंगे।',
                  },
                  {
                    label: lang === 'en' ? 'Fake Part-Time Job' : 'नकली पार्ट-टाइम जॉब',
                    text:
                      lang === 'en'
                        ? 'A Telegram group offers ₹3,000 daily for liking YouTube videos, and now asks me to deposit ₹5,000 into a merchant task to unlock ₹15,000 withdrawal.'
                        : 'Telegram पर YouTube वीडियो लाइक करने के बदले रोज ₹3,000 देने का वादा किया गया और अब पैसे निकालने के लिए ₹5,000 जमा करने को कहा जा रहा है।',
                  },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => setAiQuery(ex.text)}
                    className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  disabled={!aiQuery.trim() || aiLoading}
                  onClick={handleAiAnalyze}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-45 cursor-pointer"
                >
                  {aiLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>
                    {aiLoading
                      ? lang === 'en'
                        ? 'Analyzing with AI Cyber Sahayak...'
                        : 'AI साइबर सहायक जांच कर रहा है...'
                      : lang === 'en'
                        ? 'Analyze with AI Cyber Sahayak'
                        : 'AI साइबर सहायक से जांचें'}
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <h3 className="text-lg font-semibold text-slate-950">
                {lang === 'en' ? 'AI Assessment & Safety Plan' : 'AI विश्लेषण और सुरक्षा सलाह'}
              </h3>

              {aiError && (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  {aiError}
                </div>
              )}

              {!aiResult && !aiLoading && !aiError && (
                <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  {lang === 'en'
                    ? 'Submit a suspicious message or scenario on the left to get structured guidance.'
                    : 'सही विश्लेषण और सुरक्षा कदम जानने के लिए बाईं ओर अपना सवाल भेजें।'}
                </div>
              )}

              {aiLoading && (
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-700" />
                  <span>{lang === 'en' ? 'Evaluating risk patterns...' : 'जोखिम पैटर्न जांचे जा रहे हैं...'}</span>
                </div>
              )}

              {aiResult && (
                <div className="mt-4 space-y-4">
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      aiResult.riskLevel === 'high_risk'
                        ? 'border-rose-200 bg-rose-50 text-rose-950'
                        : aiResult.riskLevel === 'caution'
                          ? 'border-amber-200 bg-amber-50 text-amber-950'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    }`}
                  >
                    {aiResult.riskLevel === 'high_risk' ? (
                      <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" />
                    ) : aiResult.riskLevel === 'caution' ? (
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                        {aiResult.scamType}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed font-medium">{aiResult.summary}</p>
                    </div>
                  </div>

                  {aiResult.redFlags.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-xs font-semibold text-slate-800">
                        {lang === 'en' ? 'Warning Signs Identified' : 'पहचाने गए खतरे के संकेत'}
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                        {aiResult.redFlags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResult.nextSteps.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-xs font-semibold text-slate-800">
                        {lang === 'en' ? 'Recommended Next Steps' : 'आगे क्या करें'}
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                        {aiResult.nextSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
            )}
          </div>
        )}

        {/* TOOL 4: VIDEO AWARENESS MOTION STUDIO */}
        {activeTab === 'video' && <VideoAnimatorTool lang={lang} />}

        {/* TOOL 5: FILE SHA-256 CHECKER & PHOTO EXIF PRIVACY CLEANER */}
        {activeTab === 'files' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* File SHA-256 & Extension Checker */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-sky-700 shrink-0" />
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? 'File SHA-256 & Malware Extension Check' : 'फाइल SHA-256 और जोखिम जांच'}
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                {lang === 'en'
                  ? 'Select any downloaded file to verify its cryptographic SHA-256 fingerprint and detect disguised .apk or .exe threats.'
                  : 'फाइल का SHA-256 कोड निकालने और खतरनाक .apk / .exe या दोहरे एक्सटेंशन पहचानने के लिए फाइल चुनें।'}
              </p>

              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-sky-500 hover:bg-sky-50/40">
                <Upload className="h-6 w-6 text-sky-700" />
                <span className="mt-2 text-xs font-semibold text-slate-800">
                  {lang === 'en' ? 'Choose any file (stays 100% on your device)' : 'कोई भी फाइल चुनें (आपके डिवाइस पर ही रहती है)'}
                </span>
                <input type="file" onChange={handleInspectFile} className="sr-only" />
              </label>

              {fileLoading && (
                <p className="mt-4 text-xs text-slate-600">
                  {lang === 'en' ? 'Computing SHA-256 locally...' : 'SHA-256 कोड बनाया जा रहा है...'}
                </p>
              )}

              {fileResult && (
                <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div
                    className={`flex items-start gap-2.5 rounded-md border p-3 ${
                      fileResult.riskLevel === 'danger'
                        ? 'border-rose-200 bg-rose-50 text-rose-950'
                        : fileResult.riskLevel === 'caution'
                          ? 'border-amber-200 bg-amber-50 text-amber-950'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    }`}
                  >
                    {fileResult.riskLevel === 'danger' ? (
                      <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-600 shrink-0" />
                    ) : fileResult.riskLevel === 'caution' ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <p className="font-semibold leading-relaxed">{fileResult.verdict[lang]}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">{lang === 'en' ? 'File Name' : 'फाइल नाम'}</span>
                      <p className="font-mono font-semibold text-slate-900 truncate">{fileResult.fileName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">{lang === 'en' ? 'Size' : 'आकार'}</span>
                      <p className="font-mono font-semibold text-slate-900 tabular-nums">
                        {(fileResult.sizeBytes / 1024).toFixed(1)} KB ({fileResult.extension})
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">SHA-256 Checksum</span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(fileResult.sha256);
                            setCopiedHash(true);
                            setTimeout(() => setCopiedHash(false), 1500);
                          } catch {
                            // Ignore
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 cursor-pointer"
                      >
                        {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="mt-1 rounded border border-slate-200 bg-white p-2 font-mono text-[11px] text-slate-800 break-all">
                      {fileResult.sha256}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Privacy (EXIF/GPS) Stripper */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-sky-700 shrink-0" />
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? 'Photo Privacy (EXIF & GPS) Cleaner' : 'फोटो प्राइवेसी (EXIF और GPS) क्लीनर'}
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                {lang === 'en'
                  ? 'Phone photos hide exact GPS coordinates and camera model inside EXIF data. Strip hidden metadata before sharing photos publicly.'
                  : 'फोन से खींची फोटो में घर की GPS लोकेशन और डिवाइस की जानकारी छुपी होती है। शेयर करने से पहले उसे यहाँ साफ़ करें।'}
              </p>

              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-sky-500 hover:bg-sky-50/40">
                <Upload className="h-6 w-6 text-sky-700" />
                <span className="mt-2 text-xs font-semibold text-slate-800">
                  {lang === 'en' ? 'Select Photo (JPG / PNG / WebP)' : 'फोटो चुनें (JPG / PNG / WebP)'}
                </span>
                <input type="file" accept="image/*" onChange={handleStripPhotoExif} className="sr-only" />
              </label>

              {exifLoading && (
                <p className="mt-4 text-xs text-slate-600">
                  {lang === 'en' ? 'Removing EXIF & GPS tags...' : 'EXIF और GPS जानकारी हटाई जा रही है...'}
                </p>
              )}

              {exifError && (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                  {exifError}
                </div>
              )}

              {cleanPhoto && (
                <div className="mt-4 space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'en'
                        ? 'Metadata stripped! Clean copy is ready.'
                        : 'छिपा हुआ डेटा हटा दिया गया! सुरक्षित फोटो तैयार है।'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 tabular-nums">
                    <div>
                      <span className="block text-slate-500">{lang === 'en' ? 'Resolution' : 'रिज़ॉल्यूशन'}</span>
                      <span>
                        {cleanPhoto.width}×{cleanPhoto.height}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">{lang === 'en' ? 'Original' : 'मूल आकार'}</span>
                      <span>{(cleanPhoto.originalSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">{lang === 'en' ? 'Cleaned' : 'नया आकार'}</span>
                      <span>{(cleanPhoto.cleanBlobSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <a
                    href={cleanPhoto.cleanUrl}
                    download={cleanPhoto.cleanFileName}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{lang === 'en' ? 'Download Clean Photo' : 'सुरक्षित फोटो डाउनलोड करें'}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOOL 5: SCAM & FRAUD SIMULATOR */}
        {activeTab === 'scam' && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? 'Real-World Scam Simulator' : 'वास्तविक ठगी सिम्युलेटर'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {lang === 'en'
                    ? 'Test how you would react to common UPI, QR code, KYC, and WhatsApp APK traps.'
                    : 'आम UPI, QR कोड, KYC और WhatsApp APK धोखाधड़ी पर अपनी प्रतिक्रिया का अभ्यास करें।'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SCAM_SCENARIOS.map((sc, i) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setScenarioIdx(i);
                      setSelectedOptionId(null);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      scenarioIdx === i
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang === 'en' ? `Case ${i + 1}` : `केस ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold text-sky-700">{currentScenario.channel[lang]}</p>
                <h4 className="mt-1 text-xl font-bold text-slate-950">{currentScenario.title[lang]}</h4>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-100">
                  {currentScenario.messagePreview[lang]}
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-900">{currentScenario.question[lang]}</p>

                <div className="mt-3 space-y-2.5">
                  {currentScenario.options.map((opt) => {
                    const isPicked = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm font-medium transition-colors cursor-pointer ${
                          isPicked
                            ? opt.isSafe
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                              : 'border-rose-500 bg-rose-50 text-rose-950'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label[lang]}</span>
                        {isPicked &&
                          (opt.isSafe ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                          ) : (
                            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                          ))}
                      </button>
                    );
                  })}
                </div>

                {selectedOption && (
                  <div
                    className={`mt-4 rounded-lg border p-4 text-sm ${
                      selectedOption.isSafe
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border-rose-200 bg-rose-50 text-rose-900'
                    }`}
                  >
                    <p className="font-semibold">
                      {selectedOption.isSafe
                        ? lang === 'en'
                          ? 'Safe Response'
                          : 'सुरक्षित निर्णय'
                        : lang === 'en'
                          ? 'Fraud Alert — Unsafe Choice'
                          : 'चेतावनी — असुरक्षित विकल्प'}
                    </p>
                    <p className="mt-1 leading-relaxed">{selectedOption.feedback[lang]}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 lg:col-span-5">
                <h5 className="text-sm font-semibold text-slate-950">
                  {lang === 'en' ? 'Red Flags in This Scenario' : 'इस मामले के मुख्य खतरे के संकेत'}
                </h5>
                <ul className="mt-4 space-y-3">
                  {currentScenario.redFlags[lang].map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 6: PERSONAL DIGITAL SECURITY AUDIT */}
        {activeTab === 'audit' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-950">
                  {lang === 'en' ? '6-Point Digital Hygiene Audit' : '6-बिंदु डिजिटल सुरक्षा ऑडिट'}
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {answeredCount}/6 {lang === 'en' ? 'answered' : 'उत्तरित'}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {AUDIT_QUESTIONS.map((q, idx) => {
                  const ans = auditAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        <span className="mr-2 font-mono text-xs text-slate-400 tabular-nums">0{idx + 1}.</span>
                        {q[lang]}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAuditAnswers((prev) => ({ ...prev, [q.id]: true }))}
                          className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            ans === true
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lang === 'en' ? 'Yes' : 'हाँ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuditAnswers((prev) => ({ ...prev, [q.id]: false }))}
                          className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            ans === false
                              ? 'bg-rose-600 text-white'
                              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lang === 'en' ? 'No' : 'नहीं'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
              <h3 className="text-lg font-semibold text-slate-950">
                {lang === 'en' ? 'Your Action Plan' : 'आपकी सुरक्षा कार्य-योजना'}
              </h3>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    {lang === 'en' ? 'Protected Practices' : 'सुरक्षित आदतें'}
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-950 tabular-nums">
                    {safeYesCount} / 6
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all duration-200 ${
                      safeYesCount >= 5 ? 'bg-emerald-600' : safeYesCount >= 3 ? 'bg-amber-500' : 'bg-rose-600'
                    }`}
                    style={{ width: `${(safeYesCount / 6) * 100}%` }}
                  />
                </div>
              </div>

              {answeredCount === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  {lang === 'en'
                    ? 'Select Yes or No on the left to generate your personalized security fixes.'
                    : 'अपनी व्यक्तिगत सुरक्षा योजना देखने के लिए बाईं ओर उत्तर चुनें।'}
                </p>
              ) : auditIssues.length === 0 && answeredCount === 6 ? (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {lang === 'en' ? 'Strong Cyber Hygiene!' : 'बेहतरीन साइबर सुरक्षा आदतें!'}
                    </p>
                    <p className="mt-1">
                      {lang === 'en'
                        ? 'You follow all 6 essential digital safety habits. Keep your phone OS updated and stay alert.'
                        : 'आप सभी 6 मुख्य डिजिटल सुरक्षा नियमों का पालन करते हैं। अपने फोन को हमेशा अपडेट रखें।'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-semibold text-slate-600">
                    {lang === 'en'
                      ? auditIssues.length > 0
                        ? 'Recommended Immediate Fixes:'
                        : 'Continue answering remaining questions:'
                      : auditIssues.length > 0
                        ? 'तुरंत सुधार के लिए सुझाव:'
                        : 'बाकी प्रश्नों के उत्तर दें:'}
                  </p>
                  {auditIssues.map((issue) => (
                    <div key={issue.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
                      <p className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>{lang === 'en' ? issue.fixEn : issue.fixHi}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
