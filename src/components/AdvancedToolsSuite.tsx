import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileWarning,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Terminal,
  Unlock,
} from 'lucide-react';
import type { Lang } from '../data/cyberData';
import {
  ANDROID_PERMISSIONS,
  computeAllDigests,
  decodeJwtLocally,
  decryptAesGcm,
  encryptAesGcm,
  evaluateAppPermissions,
  generateEmergencyDrafts,
  parseEmailForensics,
  type AppCategoryId,
  type DecodedJwtReport,
  type EmergencyDraftInput,
  type FraudCategory,
  type MultiHashOutput,
} from '../utils/advancedAnalyzers';

interface AdvancedToolsSuiteProps {
  lang: Lang;
}

type AdvancedTabId = 'emergency-draft' | 'permissions' | 'email-forensics' | 'crypto-lab' | 'lockdown';

interface LockdownStep {
  id: string;
  platform: 'whatsapp' | 'upi' | 'google' | 'telecom';
  title: { en: string; hi: string };
  path: { en: string; hi: string };
}

const LOCKDOWN_STEPS: LockdownStep[] = [
  {
    id: 'ld-wa-1',
    platform: 'whatsapp',
    title: { en: 'Enable Two-Step Verification 6-digit PIN', hi: 'WhatsApp Two-Step 6-अंक पिन चालू करें' },
    path: { en: 'WhatsApp > Settings > Account > Two-step verification > Turn on', hi: 'WhatsApp > Settings > Account > Two-step verification > Turn on' },
  },
  {
    id: 'ld-wa-2',
    platform: 'whatsapp',
    title: { en: 'Silence Unknown Callers (stops Video/Digital Arrest calls)', hi: 'अनजान कॉल साइलेंट करें (Digital Arrest कॉल रोकें)' },
    path: { en: 'WhatsApp > Settings > Privacy > Calls > Silence unknown callers', hi: 'WhatsApp > Settings > Privacy > Calls > Silence unknown callers' },
  },
  {
    id: 'ld-wa-3',
    platform: 'whatsapp',
    title: { en: 'Audit & Log out unfamiliar Linked Devices', hi: 'Linked Devices में अनजान कंप्यूटर/ब्राउज़र हटाएं' },
    path: { en: 'WhatsApp > Menu (⋮) > Linked devices > Log out unknown sessions', hi: 'WhatsApp > मेन्यू (⋮) > Linked devices > अज्ञात सेशन लॉगआउट करें' },
  },
  {
    id: 'ld-upi-1',
    platform: 'upi',
    title: { en: 'Enable Biometric / Screen Lock inside UPI Apps', hi: 'GPay / PhonePe / Paytm ऐप लॉक चालू करें' },
    path: { en: 'UPI App > Profile > Privacy & Security > Screen Lock / App Lock ON', hi: 'UPI ऐप > Profile > Security > Screen Lock / Biometric ON करें' },
  },
  {
    id: 'ld-upi-2',
    platform: 'upi',
    title: { en: 'Cap Daily Debit Card & NetBanking Limits', hi: 'बैंक ऐप में डेबिट कार्ड और ऑनलाइन सीमा कम रखें' },
    path: { en: 'Bank Mobile App > Card Control > Set Daily Online & ATM Limits', hi: 'बैंक ऐप > Card Control > दैनिक ऑनलाइन और ATM सीमा घटाएं' },
  },
  {
    id: 'ld-upi-3',
    platform: 'upi',
    title: { en: 'Disable International Card Usage when not traveling', hi: 'जरूरत न होने पर इंटरनेशनल कार्ड ट्रांजेक्शन बंद रखें' },
    path: { en: 'Bank App > Cards > International Transactions > OFF', hi: 'बैंक ऐप > Cards > International Usage > OFF रखें' },
  },
  {
    id: 'ld-gg-1',
    platform: 'google',
    title: { en: 'Enable Authenticator / Passkey 2FA on Google Account', hi: 'Gmail / Google खाते पर 2FA / Passkey लगाएं' },
    path: { en: 'myaccount.google.com > Security > 2-Step Verification > ON', hi: 'myaccount.google.com > Security > 2-Step Verification > ON' },
  },
  {
    id: 'ld-gg-2',
    platform: 'google',
    title: { en: 'Remove Unknown Third-Party App Access from Gmail/Drive', hi: 'Gmail से अनजान थर्ड-पार्टी ऐप्स की अनुमति हटाएं' },
    path: { en: 'Google Account > Security > Your connections to third-party apps', hi: 'Google Account > Security > Third-party apps & services से हटाएं' },
  },
  {
    id: 'ld-tel-1',
    platform: 'telecom',
    title: { en: 'Check all SIMs issued on your Aadhaar via TAFCOP', hi: 'TAFCOP (Sanchar Saathi) पर अपने नाम के सभी SIM जांचें' },
    path: { en: 'sancharsaathi.gov.in > Know Your Mobile Connections (TAFCOP)', hi: 'sancharsaathi.gov.in > Know Your Mobile Connections (TAFCOP)' },
  },
  {
    id: 'ld-tel-2',
    platform: 'telecom',
    title: { en: 'Set SIM PIN Lock to prevent SIM-swap phone theft', hi: 'फोन चोरी होने पर दुरुपयोग रोकने के लिए SIM PIN लॉक लगाएं' },
    path: { en: 'Phone Settings > Security > SIM card lock > Lock SIM card', hi: 'Phone Settings > Security > SIM card lock > SIM PIN सेट करें' },
  },
];

const SAMPLE_HEADERS = {
  spoofTax: `From: "Income Tax Refund India" <refund@incometax-portal-update.xyz>
Reply-To: claim-desk@gmail.com
Return-Path: <bounce@mailer-unknown.top>
Authentication-Results: mx.google.com; spf=fail (sender IP 185.220.101.44 not permitted); dkim=fail; dmarc=fail
Received: from mail.suspicious-relay.top (185.220.101.44) by mx.example.in`,
  spoofReply: `From: "SBI Customer Security" <alerts@sbi-care.co.in>
Reply-To: urgent.verify99@outlook.com
Return-Path: <bounces@bulk-sender.work>
Authentication-Results: mx.google.com; spf=softfail (45.88.14.92); dkim=none; dmarc=fail
Received: from node92.bulk-sender.work (45.88.14.92) by inbound.mail.in`,
  cleanGov: `From: "Indian Cyber Crime Coordination Centre" <no-reply@cybercrime.gov.in>
Return-Path: <no-reply@cybercrime.gov.in>
Authentication-Results: mx.google.com; spf=pass (164.100.12.24); dkim=pass header.d=cybercrime.gov.in; dmarc=pass
Received: from nicmail.nic.in (164.100.12.24) by mx.google.com`,
};

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJDVFpfMTkzMCIsIm5hbWUiOiJBcmp1biBLdW1hciIsInJvbGUiOiJDT1BBX1N0dWRlbnQiLCJpc3MiOiJjeWJlci1zZWN1cml0eS1sYWIiLCJleHAiOjE5MDAwMDAwMDB9.demo_signature_only';

export function AdvancedToolsSuite({ lang }: AdvancedToolsSuiteProps) {
  const [activeTab, setActiveTab] = useState<AdvancedTabId>('emergency-draft');

  // 1. Emergency 1930 Draft State
  const [draftForm, setDraftForm] = useState<EmergencyDraftInput>(() => {
    const nowLocal = new Date(Date.now() - 25 * 60000);
    const isoLocal = new Date(nowLocal.getTime() - nowLocal.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return {
      category: 'upi_qr',
      victimName: '',
      phone: '',
      bankName: '',
      amountInr: '5000',
      utrOrRef: '',
      fraudsterInfo: '',
      incidentDateTime: isoLocal,
      briefNote: '',
    };
  });
  const [activeDraftDoc, setActiveDraftDoc] = useState<'call' | 'portal' | 'email'>('call');
  const [copiedDraft, setCopiedDraft] = useState(false);

  const emergencyOutput = useMemo(
    () => generateEmergencyDrafts(draftForm, lang),
    [draftForm, lang],
  );

  // 2. Android Permission Auditor State
  const [appCategory, setAppCategory] = useState<AppCategoryId>('invite_reader');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([
    'REQUEST_INSTALL_PACKAGES',
    'READ_SMS',
    'BIND_ACCESSIBILITY_SERVICE',
  ]);
  const permReport = useMemo(
    () => evaluateAppPermissions(appCategory, selectedPerms),
    [appCategory, selectedPerms],
  );

  // 3. Email Forensics State
  const [emailHeaderInput, setEmailHeaderInput] = useState(SAMPLE_HEADERS.spoofTax);
  const emailReport = useMemo(
    () => (emailHeaderInput.trim() ? parseEmailForensics(emailHeaderInput) : null),
    [emailHeaderInput],
  );

  // 4. Web Crypto & JWT Lab State
  const [cryptoMode, setCryptoMode] = useState<'aes' | 'hash' | 'jwt'>('aes');
  const [aesAction, setAesAction] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [aesSecret, setAesSecret] = useState('COPA-Cyber-Key#2026');
  const [aesInput, setAesInput] = useState('Account Recovery Backup Note: Never share OTP with anyone.');
  const [aesOutput, setAesOutput] = useState('');
  const [aesError, setAesError] = useState<string | null>(null);

  const [hashInput, setHashInput] = useState('Cyber Security Stay Alert 1930');
  const [hashResult, setHashResult] = useState<MultiHashOutput | null>(null);

  const [jwtInput, setJwtInput] = useState(SAMPLE_JWT);
  const [jwtReport, setJwtReport] = useState<DecodedJwtReport | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    computeAllDigests(hashInput)
      .then((res) => {
        if (active) setHashResult(res);
      })
      .catch(() => {
        if (active) setHashResult(null);
      });
    return () => {
      active = false;
    };
  }, [hashInput]);

  useEffect(() => {
    if (!jwtInput.trim()) {
      setJwtReport(null);
      setJwtError(null);
      return;
    }
    try {
      setJwtReport(decodeJwtLocally(jwtInput));
      setJwtError(null);
    } catch (err) {
      setJwtReport(null);
      setJwtError(err instanceof Error ? err.message : 'Invalid JWT.');
    }
  }, [jwtInput]);

  // 5. Account Lockdown Wizard State
  const [lockdownPlatform, setLockdownPlatform] = useState<'all' | 'whatsapp' | 'upi' | 'google' | 'telecom'>('all');
  const [doneLockdownIds, setDoneLockdownIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cyber_lockdown_v1');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cyber_lockdown_v1', JSON.stringify(doneLockdownIds));
    } catch {
      // Ignore storage errors
    }
  }, [doneLockdownIds]);

  const handleRunAes = async () => {
    setAesError(null);
    if (!aesSecret) {
      setAesError(lang === 'en' ? 'Enter a secret passphrase.' : 'कृपया गुप्त पासफ़्रेज़ दर्ज करें।');
      return;
    }
    try {
      if (aesAction === 'encrypt') {
        const encrypted = await encryptAesGcm(aesInput, aesSecret);
        setAesOutput(encrypted);
      } else {
        const decrypted = await decryptAesGcm(aesInput, aesSecret);
        setAesOutput(decrypted);
      }
    } catch {
      setAesError(
        aesAction === 'decrypt'
          ? lang === 'en'
            ? 'Decryption failed: wrong passphrase or corrupted cipher text.'
            : 'डिक्रिप्ट विफल: गलत पासवर्ड या अमान्य डेटा।'
          : lang === 'en'
            ? 'Encryption error.'
            : 'एन्क्रिप्शन में त्रुटि।',
      );
    }
  };

  const currentDraftText =
    activeDraftDoc === 'call'
      ? emergencyOutput.callScript1930
      : activeDraftDoc === 'portal'
        ? emergencyOutput.portalComplaint
        : `Subject: ${emergencyOutput.bankFreezeEmailSubject}\n\n${emergencyOutput.bankFreezeEmailBody}`;

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(currentDraftText);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadDraftTxt = () => {
    const content = [
      '=== 1930 HELPLINE CALL SCRIPT ===',
      emergencyOutput.callScript1930,
      '',
      '=== CYBERCRIME.GOV.IN PORTAL COMPLAINT ===',
      emergencyOutput.portalComplaint,
      '',
      '=== BANK FREEZE / LIEN REQUEST EMAIL ===',
      `Subject: ${emergencyOutput.bankFreezeEmailSubject}`,
      emergencyOutput.bankFreezeEmailBody,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1930-cyber-fraud-report-${draftForm.utrOrRef || 'draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLockdownSteps =
    lockdownPlatform === 'all'
      ? LOCKDOWN_STEPS
      : LOCKDOWN_STEPS.filter((s) => s.platform === lockdownPlatform);
  const armorPct = Math.round((doneLockdownIds.length / LOCKDOWN_STEPS.length) * 100);

  return (
    <section id="advanced-tools" className="border-b border-slate-200 bg-white py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <Terminal className="h-4 w-4 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Advanced Incident, Forensics & Crypto Suite'
                  : 'एडवांस फॉरेंसिक, क्रिप्टो और 1930 शिकायत सूट'}
              </span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {lang === 'en'
                ? 'Pro Cyber Response & Forensics Workbench'
                : 'प्रो साइबर सुरक्षा और फॉरेंसिक टूल्स'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {lang === 'en'
                ? 'Generate 1930 complaint & bank-freeze drafts, audit dangerous Android app permissions, detect spoofed email headers, run live AES-256 cryptography, and lock down your accounts.'
                : '1930 शिकायत ड्राफ्ट बनाएं, खतरनाक ऐप अनुमतियां जांचें, नकली ईमेल हेडर पकड़ें, AES-256 एन्क्रिप्शन सीखें और अपने सभी खातों को लॉक करें।'}
            </p>
          </div>
        </div>

        {/* 5 Advanced Suite Tabs */}
        <div
          className="mt-7 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:flex sm:flex-wrap"
          role="tablist"
          aria-label="Advanced cyber forensics tools"
        >
          {(
            [
              {
                id: 'emergency-draft',
                label: lang === 'en' ? '1930 Complaint Draft' : '1930 शिकायत ड्राफ्ट',
                icon: FileWarning,
              },
              {
                id: 'permissions',
                label: lang === 'en' ? 'App Permission Risk' : 'ऐप अनुमति जांच',
                icon: Smartphone,
              },
              {
                id: 'email-forensics',
                label: lang === 'en' ? 'Email Spoof Forensics' : 'ईमेल हेडर जांच',
                icon: Mail,
              },
              {
                id: 'crypto-lab',
                label: lang === 'en' ? 'AES-256 & JWT Lab' : 'क्रिप्टो और JWT लैब',
                icon: KeyRound,
              },
              {
                id: 'lockdown',
                label: lang === 'en' ? 'Account Lockdown' : 'अकाउंट लॉकडाउन',
                icon: Lock,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TOOL A: 1930 EMERGENCY COMPLAINT & BANK FREEZE GENERATOR */}
        {activeTab === 'emergency-draft' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-950">
                  {lang === 'en' ? 'Incident & Transaction Details' : 'धोखाधड़ी और लेनदेन का विवरण'}
                </h3>
                {emergencyOutput.minutesElapsed !== null && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${
                      emergencyOutput.urgencyLevel === 'golden_hour'
                        ? 'bg-rose-100 text-rose-900'
                        : emergencyOutput.urgencyLevel === 'urgent'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {emergencyOutput.urgencyLevel === 'golden_hour'
                      ? lang === 'en'
                        ? `GOLDEN HOUR (${emergencyOutput.minutesElapsed}m ago)`
                        : `गोल्डन ऑवर (${emergencyOutput.minutesElapsed} मिनट पहले)`
                      : lang === 'en'
                        ? `${emergencyOutput.minutesElapsed}m elapsed`
                        : `${emergencyOutput.minutesElapsed} मिनट बीते`}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Fraud Type' : 'धोखाधड़ी का प्रकार'}
                  </label>
                  <select
                    value={draftForm.category}
                    onChange={(e) =>
                      setDraftForm((f) => ({ ...f, category: e.target.value as FraudCategory }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                  >
                    <option value="upi_qr">{lang === 'en' ? 'UPI / Fake QR Collect Fraud' : 'UPI / नकली QR कोड ठगी'}</option>
                    <option value="kyc_phishing">{lang === 'en' ? 'Fake Bank KYC Phishing Link' : 'नकली बैंक KYC लिंक ठगी'}</option>
                    <option value="digital_arrest">{lang === 'en' ? 'Digital Arrest / Fake Police Call' : 'डिजिटल अरेस्ट / नकली पुलिस कॉल'}</option>
                    <option value="apk_malware">{lang === 'en' ? 'Malicious .APK / Screen Share Fraud' : 'खतरनाक .APK / AnyDesk ठगी'}</option>
                    <option value="card_fraud">{lang === 'en' ? 'Debit / Credit Card Fraud' : 'डेबिट / क्रेडिट कार्ड ठगी'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Your Name' : 'आपका नाम'}
                  </label>
                  <input
                    type="text"
                    value={draftForm.victimName}
                    onChange={(e) => setDraftForm((f) => ({ ...f, victimName: e.target.value }))}
                    placeholder="e.g. Arjun Kumar"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Registered Mobile' : 'रजिस्टर्ड मोबाइल'}
                  </label>
                  <input
                    type="text"
                    value={draftForm.phone}
                    onChange={(e) => setDraftForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="10-digit mobile"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Bank / UPI App' : 'बैंक / UPI ऐप'}
                  </label>
                  <input
                    type="text"
                    value={draftForm.bankName}
                    onChange={(e) => setDraftForm((f) => ({ ...f, bankName: e.target.value }))}
                    placeholder="e.g. SBI / PhonePe"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Amount Lost (₹)' : 'कटी हुई राशि (₹)'}
                  </label>
                  <input
                    type="text"
                    value={draftForm.amountInr}
                    onChange={(e) => setDraftForm((f) => ({ ...f, amountInr: e.target.value }))}
                    placeholder="5000"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? '12-Digit UTR / Transaction ID' : '12 अंकों का UTR / रेफरेंस'}
                  </label>
                  <input
                    type="text"
                    value={draftForm.utrOrRef}
                    onChange={(e) => setDraftForm((f) => ({ ...f, utrOrRef: e.target.value }))}
                    placeholder="e.g. 432198765432"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Incident Date & Time' : 'घटना की तारीख व समय'}
                  </label>
                  <input
                    type="datetime-local"
                    value={draftForm.incidentDateTime}
                    onChange={(e) =>
                      setDraftForm((f) => ({ ...f, incidentDateTime: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en'
                      ? 'Suspect Phone / UPI ID / Phishing Link'
                      : 'ठग का नंबर / UPI ID / लिंक'}
                  </label>
                  <input
                    type="text"
                    value={draftForm.fraudsterInfo}
                    onChange={(e) => setDraftForm((f) => ({ ...f, fraudsterInfo: e.target.value }))}
                    placeholder="e.g. refund-desk@okaxis or +91-98XXXXXXXX"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Right: Generated Official Ready-to-Use Templates */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex flex-wrap rounded-lg bg-slate-200/80 p-1">
                  {(
                    [
                      { id: 'call', en: '1930 Call Script', hi: '1930 कॉल स्क्रिप्ट' },
                      { id: 'portal', en: 'Portal Complaint', hi: 'पोर्टल शिकायत' },
                      { id: 'email', en: 'Bank Freeze Email', hi: 'बैंक फ्रीज़ ईमेल' },
                    ] as const
                  ).map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setActiveDraftDoc(doc.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        activeDraftDoc === doc.id
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {doc[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <pre className="mt-4 flex-1 overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 font-sans text-xs sm:text-sm leading-relaxed text-slate-800">
                {currentDraftText}
              </pre>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  {copiedDraft ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>
                    {copiedDraft
                      ? lang === 'en'
                        ? 'Copied'
                        : 'कॉपी हो गया'
                      : lang === 'en'
                        ? 'Copy Draft'
                        : 'ड्राफ्ट कॉपी करें'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDraftTxt}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{lang === 'en' ? 'Download All (.TXT)' : 'सभी डाउनलोड करें'}</span>
                </button>

                {activeDraftDoc === 'email' && (
                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      emergencyOutput.bankFreezeEmailSubject,
                    )}&body=${encodeURIComponent(emergencyOutput.bankFreezeEmailBody)}`}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{lang === 'en' ? 'Open Email App' : 'ईमेल ऐप खोलें'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL B: ANDROID PERMISSION & APK RISK AUDITOR */}
        {activeTab === 'permissions' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-950">
                  {lang === 'en' ? 'Select App Type & Requested Permissions' : 'ऐप का प्रकार और मांगी गई अनुमतियां चुनें'}
                </h3>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  [
                    {
                      id: 'invite_reader',
                      en: 'Wedding / eChallan APK',
                      hi: 'शादी कार्ड / चालान APK',
                      perms: ['REQUEST_INSTALL_PACKAGES', 'READ_SMS', 'BIND_ACCESSIBILITY_SERVICE'],
                    },
                    {
                      id: 'utility',
                      en: 'Torch / Cleaner Utility',
                      hi: 'टॉर्च / क्लीनर ऐप',
                      perms: ['READ_SMS', 'READ_CONTACTS', 'LOCATION'],
                    },
                    {
                      id: 'loan_cashback',
                      en: 'Instant Loan / Reward App',
                      hi: 'तुरंत लोन / कैशबैक ऐप',
                      perms: ['READ_CONTACTS', 'CAMERA_MIC', 'READ_SMS', 'LOCATION'],
                    },
                    {
                      id: 'remote_support',
                      en: 'Screen Share (Support Call)',
                      hi: 'स्क्रीन शेयर (सपोर्ट कॉल)',
                      perms: ['BIND_ACCESSIBILITY_SERVICE', 'SYSTEM_ALERT_WINDOW'],
                    },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAppCategory(preset.id);
                      setSelectedPerms([...preset.perms]);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      appCategory === preset.id
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset[lang]}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {ANDROID_PERMISSIONS.map((perm) => {
                  const checked = selectedPerms.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${
                        checked
                          ? 'border-sky-500 bg-white'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedPerms((prev) =>
                            e.target.checked
                              ? [...prev, perm.id]
                              : prev.filter((id) => id !== perm.id),
                          );
                        }}
                        className="mt-0.5 h-4 w-4 accent-sky-700 cursor-pointer shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{perm.label[lang]}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
                          {perm.description[lang]}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-950">
                  {lang === 'en' ? 'Privilege Abuse Analysis' : 'जोखिम और सुरक्षा विश्लेषण'}
                </h3>
                <span className="font-mono text-lg font-bold tabular-nums text-slate-950">
                  {permReport.riskScore}/100
                </span>
              </div>

              <div
                className={`mt-4 flex items-start gap-3 rounded-lg border p-4 text-xs sm:text-sm ${
                  permReport.riskLevel === 'danger'
                    ? 'border-rose-200 bg-rose-50 text-rose-950'
                    : permReport.riskLevel === 'caution'
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                }`}
              >
                {permReport.riskLevel === 'danger' ? (
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-rose-600 shrink-0" />
                ) : permReport.riskLevel === 'caution' ? (
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                ) : (
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                )}
                <p className="font-semibold leading-relaxed">{permReport.verdict[lang]}</p>
              </div>

              {permReport.toxicCombos.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-rose-900">
                    {lang === 'en' ? 'Toxic Permission Combinations:' : 'खतरनाक अनुमति संयोजन:'}
                  </p>
                  {permReport.toxicCombos.map((combo, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-950"
                    >
                      {combo[lang]}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-900">
                  {lang === 'en' ? 'How to Lock Down on Android:' : 'Android फोन में तुरंत सुरक्षा कैसे करें:'}
                </p>
                <ol className="mt-2.5 space-y-2 text-xs text-slate-700">
                  {permReport.revocationSteps[lang].map((step, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="font-mono font-bold text-sky-700">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TOOL C: EMAIL SPOOF & HEADER FORENSICS */}
        {activeTab === 'email-forensics' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-6">
              <h3 className="text-lg font-bold text-slate-950">
                {lang === 'en' ? 'Raw Email Header & Sender Inspector' : 'ईमेल हेडर और स्पूफ जांच'}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {lang === 'en'
                  ? 'In Gmail, click (⋮) > "Show original" and paste the header lines below to check SPF, DKIM, DMARC, and Reply-To mismatches.'
                  : 'Gmail में (⋮) > "Show original" खोलकर हेडर यहाँ पेस्ट करें और SPF, DKIM, DMARC व Reply-To धोखाधड़ी पकड़ें।'}
              </p>

              <textarea
                rows={8}
                value={emailHeaderInput}
                onChange={(e) => setEmailHeaderInput(e.target.value)}
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">{lang === 'en' ? 'Test Sample:' : 'उदाहरण:'}</span>
                <button
                  type="button"
                  onClick={() => setEmailHeaderInput(SAMPLE_HEADERS.spoofTax)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {lang === 'en' ? 'Spoofed Tax Refund' : 'नकली टैक्स रिफंड'}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailHeaderInput(SAMPLE_HEADERS.spoofReply)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {lang === 'en' ? 'Reply-To Hijack' : 'Reply-To जाल'}
                </button>
                <button
                  type="button"
                  onClick={() => setEmailHeaderInput(SAMPLE_HEADERS.cleanGov)}
                  className="rounded border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {lang === 'en' ? 'Authentic Gov Mail' : 'असली सरकारी ईमेल'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 lg:col-span-6">
              {emailReport ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-950">
                      {lang === 'en' ? 'Authentication & Routing Report' : 'सत्यापन और रूटिंग रिपोर्ट'}
                    </h3>
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {lang === 'en' ? 'Risk:' : 'जोखिम:'} {emailReport.riskScore}/100
                    </span>
                  </div>

                  {/* SPF / DKIM / DMARC Matrix */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { label: 'SPF', val: emailReport.spfStatus },
                        { label: 'DKIM', val: emailReport.dkimStatus },
                        { label: 'DMARC', val: emailReport.dmarcStatus },
                      ] as const
                    ).map((auth) => {
                      const isPass = auth.val === 'pass';
                      const isFail = auth.val === 'fail' || auth.val === 'softfail';
                      return (
                        <div
                          key={auth.label}
                          className={`rounded-lg border p-3 text-center ${
                            isPass
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : isFail
                                ? 'border-rose-200 bg-rose-50 text-rose-900'
                                : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <span className="block text-[11px] font-bold">{auth.label}</span>
                          <span className="mt-0.5 block font-mono text-xs font-semibold uppercase">
                            {auth.val}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Domain Chain */}
                  <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-3.5 text-xs sm:grid-cols-3">
                    <div>
                      <span className="text-slate-500">From Domain</span>
                      <p className="font-mono font-semibold text-slate-900 truncate">
                        {emailReport.fromDomain || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Return-Path</span>
                      <p className="font-mono font-semibold text-slate-900 truncate">
                        {emailReport.returnPathDomain || '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Reply-To</span>
                      <p className="font-mono font-semibold text-slate-900 truncate">
                        {emailReport.replyToDomain || '—'}
                      </p>
                    </div>
                  </div>

                  {emailReport.hopIps.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                      <span className="font-semibold text-slate-700">
                        {lang === 'en' ? 'Relay IP Trail Detected:' : 'मिले सर्वर IP पते:'}
                      </span>{' '}
                      <span className="font-mono text-sky-800">{emailReport.hopIps.join(' → ')}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {emailReport.findings.map((f, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3.5 text-xs ${
                          f.severity === 'danger'
                            ? 'border-rose-200 bg-rose-50 text-rose-950'
                            : f.severity === 'warning'
                              ? 'border-amber-200 bg-amber-50 text-amber-950'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        }`}
                      >
                        <p className="font-bold">{f.title[lang]}</p>
                        <p className="mt-1 leading-relaxed">{f.detail[lang]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TOOL D: LIVE WEB CRYPTO (AES-256-GCM, MULTI-HASH & JWT LAB) */}
        {activeTab === 'crypto-lab' && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {lang === 'en'
                    ? 'Web Crypto Security & COPA Forensics Lab'
                    : 'लाइव क्रिप्टोग्राफी और JWT जांच लैब'}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  {lang === 'en'
                    ? 'Powered by your browser’s hardware Web Crypto API (PBKDF2 + AES-256-GCM + SHA-256/512).'
                    : 'ब्राउज़र के असली Web Crypto API (AES-256-GCM, PBKDF2 और SHA-256/512) द्वारा संचालित।'}
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-200/80 p-1">
                {(
                  [
                    { id: 'aes', en: 'AES-256-GCM Vault', hi: 'AES-256 लॉक' },
                    { id: 'hash', en: 'Multi-Hash & Base64', hi: 'SHA हैश और Base64' },
                    { id: 'jwt', en: 'JWT Token Decoder', hi: 'JWT टोकन जांच' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setCryptoMode(mode.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${
                      cryptoMode === mode.id
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode[lang]}
                  </button>
                ))}
              </div>
            </div>

            {cryptoMode === 'aes' && (
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-6">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAesAction('encrypt');
                        setAesError(null);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                        aesAction === 'encrypt'
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      {lang === 'en' ? 'Encrypt Text' : 'टेक्स्ट लॉक करें'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAesAction('decrypt');
                        setAesError(null);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                        aesAction === 'decrypt'
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      {lang === 'en' ? 'Decrypt Payload' : 'अनलॉक करें'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      {lang === 'en' ? 'Secret Passphrase (PBKDF2-SHA256 100k)' : 'गुप्त पासफ़्रेज़'}
                    </label>
                    <input
                      type="text"
                      value={aesSecret}
                      onChange={(e) => setAesSecret(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      {aesAction === 'encrypt'
                        ? lang === 'en'
                          ? 'Plaintext Note'
                          : 'सामान्य टेक्स्ट'
                        : lang === 'en'
                          ? 'Base64 Cipher Payload'
                          : 'एन्क्रिप्टेड कोड'}
                    </label>
                    <textarea
                      rows={4}
                      value={aesInput}
                      onChange={(e) => setAesInput(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleRunAes()}
                    className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
                  >
                    {aesAction === 'encrypt'
                      ? lang === 'en'
                        ? 'Run AES-256-GCM Encryption'
                        : 'AES-256 से एन्क्रिप्ट करें'
                      : lang === 'en'
                        ? 'Run AES-256-GCM Decryption'
                        : 'डिक्रिप्ट करें'}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {lang === 'en' ? 'Cryptographic Output' : 'आउटपुट परिणाम'}
                    </span>
                    {aesOutput && aesAction === 'encrypt' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAesAction('decrypt');
                          setAesInput(aesOutput);
                          setAesOutput('');
                        }}
                        className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
                      >
                        {lang === 'en' ? 'Send to Decrypt →' : 'डिक्रिप्ट में टेस्ट करें →'}
                      </button>
                    )}
                  </div>

                  {aesError && (
                    <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                      {aesError}
                    </p>
                  )}

                  <pre className="mt-3 min-h-[140px] whitespace-pre-wrap break-all rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-sky-300">
                    {aesOutput || (lang === 'en' ? 'Output will appear here...' : 'आउटपुट यहाँ दिखेगा...')}
                  </pre>
                </div>
              </div>
            )}

            {cryptoMode === 'hash' && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Input Text (Digests update live)' : 'टेक्स्ट दर्ज करें (तुरंत हैश देखें)'}
                  </label>
                  <textarea
                    rows={2}
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs"
                  />
                </div>
                {hashResult && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[
                      { name: 'SHA-256 (Recommended)', value: hashResult.sha256 },
                      { name: 'SHA-512', value: hashResult.sha512 },
                      { name: 'SHA-384', value: hashResult.sha384 },
                      { name: 'Base64 Encoded', value: hashResult.base64 },
                    ].map((row) => (
                      <div key={row.name} className="rounded-lg border border-slate-200 bg-white p-3.5">
                        <span className="text-[11px] font-bold text-slate-600">{row.name}</span>
                        <p className="mt-1 font-mono text-xs text-slate-900 break-all select-all">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cryptoMode === 'jwt' && (
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'en' ? 'Paste JWT Token (Decoded locally)' : 'JWT टोकन पेस्ट करें'}
                  </label>
                  <textarea
                    rows={6}
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs"
                  />
                  {jwtError && <p className="mt-2 text-xs text-rose-700">{jwtError}</p>}
                </div>

                <div className="space-y-3 lg:col-span-7">
                  {jwtReport && (
                    <>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-md px-2.5 py-1 font-semibold ${
                            jwtReport.algNoneWarning
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {jwtReport.algNoneWarning ? 'Warning: Weak/Missing alg' : 'Algorithm Present'}
                        </span>
                        <span className="rounded-md bg-slate-200 px-2.5 py-1 font-mono font-semibold text-slate-800">
                          {jwtReport.expiryText ? `Exp: ${jwtReport.expiryText}` : 'No exp claim'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-900 p-3.5 text-white">
                          <span className="text-[11px] font-semibold text-sky-400">HEADER</span>
                          <pre className="mt-1.5 overflow-x-auto font-mono text-xs text-slate-100">
                            {jwtReport.headerJson}
                          </pre>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-900 p-3.5 text-white">
                          <span className="text-[11px] font-semibold text-emerald-400">PAYLOAD</span>
                          <pre className="mt-1.5 overflow-x-auto font-mono text-xs text-slate-100">
                            {jwtReport.payloadJson}
                          </pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL E: ACCOUNT LOCKDOWN WIZARD */}
        {activeTab === 'lockdown' && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {lang === 'en'
                    ? '2-Minute Digital Account Lockdown Wizard'
                    : '2-मिनट अकाउंट लॉकडाउन विज़ार्ड'}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  {lang === 'en'
                    ? 'Apply these exact privacy & 2FA settings on your daily apps. Your progress saves automatically.'
                    : 'नीचे दिए चरणों को अपने फोन में लागू करें। आपकी प्रगति अपने आप सेव रहती है।'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[11px] font-semibold text-slate-500">
                    {lang === 'en' ? 'Digital Armor' : 'सुरक्षा स्तर'}
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-950 tabular-nums">
                    {armorPct}%
                  </span>
                </div>
                <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-200"
                    style={{ width: `${armorPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', en: 'All Apps', hi: 'सभी ऐप्स' },
                  { id: 'whatsapp', en: 'WhatsApp', hi: 'WhatsApp' },
                  { id: 'upi', en: 'UPI & Banking', hi: 'UPI और बैंक' },
                  { id: 'google', en: 'Google / Gmail', hi: 'Gmail / Google' },
                  { id: 'telecom', en: 'SIM & TAFCOP', hi: 'SIM और TAFCOP' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setLockdownPlatform(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    lockdownPlatform === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat[lang]}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredLockdownSteps.map((step) => {
                const isDone = doneLockdownIds.includes(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() =>
                      setDoneLockdownIds((prev) =>
                        prev.includes(step.id)
                          ? prev.filter((id) => id !== step.id)
                          : [...prev, step.id],
                      )
                    }
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                      isDone
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-100/70'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        isDone
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{step.title[lang]}</p>
                      <p className="mt-1 font-mono text-[11px] text-sky-800">{step.path[lang]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
