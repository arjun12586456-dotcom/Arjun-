import type { Lang } from '../data/cyberData';

// ---------------------------------------------------------------------------
// 1. Emergency 1930 Complaint, Bank Freeze & Golden Hour Generator
// ---------------------------------------------------------------------------

export type FraudCategory =
  | 'upi_qr'
  | 'kyc_phishing'
  | 'digital_arrest'
  | 'apk_malware'
  | 'card_fraud';

export interface EmergencyDraftInput {
  category: FraudCategory;
  victimName: string;
  phone: string;
  bankName: string;
  amountInr: string;
  utrOrRef: string;
  fraudsterInfo: string;
  incidentDateTime: string;
  briefNote: string;
}

export interface EmergencyDraftOutput {
  minutesElapsed: number | null;
  urgencyLevel: 'golden_hour' | 'urgent' | 'standard';
  callScript1930: string;
  portalComplaint: string;
  bankFreezeEmailSubject: string;
  bankFreezeEmailBody: string;
}

const FRAUD_LABELS: Record<FraudCategory, { en: string; hi: string }> = {
  upi_qr: { en: 'Unauthorized UPI / QR Collect Fraud', hi: 'अनधिकृत UPI / QR कोड धोखाधड़ी' },
  kyc_phishing: { en: 'Fake KYC / Phishing Link Financial Fraud', hi: 'नकली KYC / फ़िशिंग लिंक धोखाधड़ी' },
  digital_arrest: { en: 'Digital Arrest / Impersonation Extortion Fraud', hi: 'डिजिटल अरेस्ट / नकली अधिकारी धमकी ठगी' },
  apk_malware: { en: 'Malicious .APK / Remote Access (AnyDesk) Fraud', hi: 'खतरनाक .APK ऐप / स्क्रीन शेयरिंग ठगी' },
  card_fraud: { en: 'Unauthorized Debit / Credit Card Transaction', hi: 'अनधिकृत डेबिट / क्रेडिट कार्ड लेनदेन' },
};

export function generateEmergencyDrafts(
  input: EmergencyDraftInput,
  lang: Lang,
): EmergencyDraftOutput {
  let minutesElapsed: number | null = null;
  let urgencyLevel: 'golden_hour' | 'urgent' | 'standard' = 'golden_hour';

  if (input.incidentDateTime) {
    const parsed = new Date(input.incidentDateTime);
    if (!Number.isNaN(parsed.getTime())) {
      minutesElapsed = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 60000));
      if (minutesElapsed <= 120) urgencyLevel = 'golden_hour';
      else if (minutesElapsed <= 1440) urgencyLevel = 'urgent';
      else urgencyLevel = 'standard';
    }
  }

  const label = FRAUD_LABELS[input.category][lang];
  const name = input.victimName.trim() || (lang === 'en' ? '[Your Full Name]' : '[आपका पूरा नाम]');
  const phone = input.phone.trim() || (lang === 'en' ? '[Your Registered Mobile]' : '[आपका रजिस्टर्ड मोबाइल]');
  const bank = input.bankName.trim() || (lang === 'en' ? '[Your Bank / UPI App]' : '[बैंक / UPI ऐप का नाम]');
  const amount = input.amountInr.trim() || '0';
  const utr = input.utrOrRef.trim() || (lang === 'en' ? '[12-digit UTR / Ref No.]' : '[12 अंकों का UTR / रेफरेंस नंबर]');
  const suspect = input.fraudsterInfo.trim() || (lang === 'en' ? '[Suspect Number / UPI ID / URL]' : '[ठग का नंबर / UPI ID / लिंक]');
  const timeStr = input.incidentDateTime
    ? new Date(input.incidentDateTime).toLocaleString(lang === 'hi' ? 'en-IN' : 'en-IN')
    : lang === 'en'
      ? '[Date & Time of Transaction]'
      : '[लेनदेन की तारीख और समय]';
  const note = input.briefNote.trim() || (lang === 'en' ? 'Money was debited via social engineering/deception without authorized consent.' : 'बिना वास्तविक सहमति के धोखाधड़ी से खाते से पैसे काटे गए।');

  if (lang === 'hi') {
    return {
      minutesElapsed,
      urgencyLevel,
      callScript1930: [
        `नमस्ते, मुझे अभी हुई वित्तीय साइबर धोखाधड़ी की रिपोर्ट दर्ज करानी है (${label})।`,
        `1. मेरा नाम: ${name} | मोबाइल नंबर: ${phone}`,
        `2. बैंक / पेमेंट ऐप: ${bank}`,
        `3. कटी हुई राशि: ₹${amount}`,
        `4. ट्रांजेक्शन UTR / रेफरेंस नंबर: ${utr}`,
        `5. लेनदेन का समय: ${timeStr}`,
        `6. संदिग्ध का विवरण (नंबर/UPI ID/लिंक): ${suspect}`,
        `कृपया ट्रांजेक्शन पर तुरंत होल्ड / फ्रीज़ (Lien Mark) लगाने की कार्रवाई करें।`,
      ].join('\n'),
      portalComplaint: [
        `विषय: वित्तीय साइबर धोखाधड़ी की शिकायत — ${label}`,
        ``,
        `महोदय/महोदया,`,
        `मैं ${name} (मोबाइल: ${phone}) सूचित करता/करती हूँ कि दिनांक ${timeStr} को मेरे ${bank} खाते/UPI से ₹${amount} की अनधिकृत निकासी/धोखाधड़ी हुई है।`,
        ``,
        `लेनदेन विवरण:`,
        `- धोखाधड़ी का प्रकार: ${label}`,
        `- राशि: ₹${amount}`,
        `- UTR / रेफरेंस नंबर: ${utr}`,
        `- संदिग्ध फोन / UPI ID / वेबसाइट: ${suspect}`,
        `- घटना का संक्षिप्त विवरण: ${note}`,
        ``,
        `अनुरोध है कि प्राप्तकर्ता बैंक खाते में इस राशि को तुरंत फ्रीज़ किया जाए और आवश्यक कानूनी कार्रवाई की जाए।`,
      ].join('\n'),
      bankFreezeEmailSubject: `URGENT: Unauthorized Cyber Fraud Transaction ₹${amount} - UTR ${utr} (Request Immediate Lien/Freeze)`,
      bankFreezeEmailBody: [
        `To The Nodal Officer / Fraud Risk Management Team, ${bank}`,
        ``,
        `मैं ${name} (मोबाइल: ${phone}) अपने खाते में हुई ताज़ा साइबर ठगी (${label}) की तुरंत सूचना दे रहा/रही हूँ।`,
        `• कटी राशि: ₹${amount}`,
        `• UTR / Transaction ID: ${utr}`,
        `• समय: ${timeStr}`,
        `• संदिग्ध UPI ID / विवरण: ${suspect}`,
        ``,
        `कृपया NPCI / लाभार्थी बैंक को तुरंत सूचित कर राशि पर होल्ड (Freeze) लगाएं और मेरा डेबिट कार्ड / नेटबैंकिंग सुरक्षित करें। मैं 1930 व cybercrime.gov.in पर भी शिकायत दर्ज कर रहा/रही हूँ।`,
      ].join('\n'),
    };
  }

  return {
    minutesElapsed,
    urgencyLevel,
    callScript1930: [
      `Hello Officer, I am calling to report an urgent financial cyber fraud (${label}).`,
      `1. Victim Name: ${name} | Registered Mobile: ${phone}`,
      `2. Bank / Payment App: ${bank}`,
      `3. Fraudulent Amount Debited: INR ₹${amount}`,
      `4. 12-Digit UTR / Transaction Ref: ${utr}`,
      `5. Date & Time of Debit: ${timeStr}`,
      `6. Suspect Contact / UPI VPA / Link: ${suspect}`,
      `Please initiate an immediate lien/freeze on the beneficiary money trail and share my Acknowledgement Number.`,
    ].join('\n'),
    portalComplaint: [
      `Subject: Urgent Financial Cyber Fraud Complaint — ${label}`,
      ``,
      `Respected Cyber Crime Officer,`,
      `I, ${name} (Mobile: ${phone}), wish to report an unauthorized financial fraud involving ₹${amount} from my ${bank} account on ${timeStr}.`,
      ``,
      `Incident & Transaction Details:`,
      `- Fraud Category: ${label}`,
      `- Amount Lost: INR ₹${amount}`,
      `- Transaction UTR / Ref No.: ${utr}`,
      `- Suspect Phone / VPA / Phishing URL: ${suspect}`,
      `- Summary of Incident: ${note}`,
      ``,
      `I have not shared my PIN/OTP willingly for a legitimate purchase and request urgent tracking and freezing of the disputed funds.`,
    ].join('\n'),
    bankFreezeEmailSubject: `URGENT: Cyber Fraud Dispute ₹${amount} | UTR ${utr} | Immediate Fund Freeze & Account Protection`,
    bankFreezeEmailBody: [
      `To The Fraud Dispute Desk / Nodal Officer (${bank}),`,
      ``,
      `I am reporting an urgent cyber fraud transaction (${label}) from my account linked to ${phone}:`,
      `- Disputed Amount: INR ₹${amount}`,
      `- UTR / Reference Number: ${utr}`,
      `- Date & Time: ${timeStr}`,
      `- Suspect Payee / Source: ${suspect}`,
      `- Notes: ${note}`,
      ``,
      `As per RBI Zero/Limited Liability & 1930 Golden Hour protocols, please mark a hold/dispute on this transaction immediately, escalate to the beneficiary bank to freeze the funds, and issue a complaint docket number. I am simultaneously registering the incident on National Cyber Helpline 1930 and cybercrime.gov.in.`,
    ].join('\n'),
  };
}

// ---------------------------------------------------------------------------
// 2. Android App Permission Risk & Toxic Combination Auditor
// ---------------------------------------------------------------------------

export type AppCategoryId = 'utility' | 'invite_reader' | 'loan_cashback' | 'remote_support' | 'banking';

export interface PermissionItem {
  id: string;
  label: { en: string; hi: string };
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: { en: string; hi: string };
}

export const ANDROID_PERMISSIONS: PermissionItem[] = [
  {
    id: 'BIND_ACCESSIBILITY_SERVICE',
    label: { en: 'Accessibility Service (Full Screen Control)', hi: 'Accessibility अनुमति (पूरा स्क्रीन नियंत्रण)' },
    severity: 'critical',
    description: {
      en: 'Lets an app read everything on your screen and tap buttons automatically—used by banking trojans.',
      hi: 'यह अनुमति ऐप को आपकी स्क्रीन पढ़ने और बिना पूछे बटन दबाने की ताकत देती है (बैंकिंग मैलवेयर खतरा)।',
    },
  },
  {
    id: 'REQUEST_INSTALL_PACKAGES',
    label: { en: 'Install Unknown Apps (.APK)', hi: 'अज्ञात ऐप्स इंस्टॉल करना (.APK)' },
    severity: 'critical',
    description: {
      en: 'Allows silently downloading and prompting additional spyware APKs outside Play Store.',
      hi: 'Play Store के बाहर से खतरनाक .apk ऐप्स इंस्टॉल करने की अनुमति देता है।',
    },
  },
  {
    id: 'READ_SMS',
    label: { en: 'Read / Forward SMS & OTPs', hi: 'SMS और बैंक OTP पढ़ना' },
    severity: 'high',
    description: {
      en: 'Exposes bank alerts, 2FA verification OTPs, and private SMS threads.',
      hi: 'बैंक अलर्ट और 6-अंकों वाले OTP को चुराने का सबसे बड़ा रास्ता।',
    },
  },
  {
    id: 'SYSTEM_ALERT_WINDOW',
    label: { en: 'Display Over Other Apps (Overlay)', hi: 'अन्य ऐप्स के ऊपर स्क्रीन दिखाना (Overlay)' },
    severity: 'high',
    description: {
      en: 'Can draw invisible/fake PIN screens over real banking and UPI apps.',
      hi: 'असली बैंक ऐप के ऊपर नकली पिन स्क्रीन दिखाकर पिन चुरा सकता है।',
    },
  },
  {
    id: 'READ_CONTACTS',
    label: { en: 'Read Full Contacts List', hi: 'पूरी कॉन्टैक्ट लिस्ट पढ़ना' },
    severity: 'medium',
    description: {
      en: 'Frequently abused by predatory instant-loan apps to harass family & colleagues.',
      hi: 'फर्जी लोन ऐप्स परिवार और दोस्तों को परेशान करने के लिए कॉन्टैक्ट्स चुराते हैं।',
    },
  },
  {
    id: 'CALL_PHONE',
    label: { en: 'Direct Call / USSD Call Forwarding', hi: 'कॉल और कॉल-फॉरवर्डिंग नियंत्रण' },
    severity: 'high',
    description: {
      en: 'Can trigger *21* / *401# USSD call forwarding codes to hijack OTP voice calls.',
      hi: 'चुपचाप *401# या *21* कॉल फॉरवर्डिंग चालू करके OTP कॉल चुरा सकता है।',
    },
  },
  {
    id: 'CAMERA_MIC',
    label: { en: 'Camera & Background Microphone', hi: 'कैमरा और माइक्रोफोन एक्सेस' },
    severity: 'medium',
    description: {
      en: 'Unnecessary for calculators, wallpapers, or PDF wedding cards.',
      hi: 'टॉर्च, वॉलपेपर या शादी कार्ड जैसी फाइलों को कैमरा/माइक की जरूरत नहीं होती।',
    },
  },
  {
    id: 'LOCATION',
    label: { en: 'Precise GPS Location', hi: 'सटीक GPS लोकेशन' },
    severity: 'low',
    description: {
      en: 'Only needed for maps, delivery, or cab apps—keep "While using app" only.',
      hi: 'केवल मैप या डिलीवरी ऐप्स के लिए जरूरी; बाकी में बंद रखें।',
    },
  },
];

export interface PermissionAuditReport {
  riskScore: number;
  riskLevel: 'safe' | 'caution' | 'danger';
  verdict: { en: string; hi: string };
  toxicCombos: { en: string; hi: string }[];
  revocationSteps: { en: string[]; hi: string[] };
}

export function evaluateAppPermissions(
  category: AppCategoryId,
  selectedIds: string[],
): PermissionAuditReport {
  const set = new Set(selectedIds);
  let score = 0;

  for (const perm of ANDROID_PERMISSIONS) {
    if (!set.has(perm.id)) continue;
    if (perm.severity === 'critical') score += 34;
    else if (perm.severity === 'high') score += 22;
    else if (perm.severity === 'medium') score += 12;
    else score += 5;
  }

  const toxicCombos: { en: string; hi: string }[] = [];

  if (set.has('BIND_ACCESSIBILITY_SERVICE') && (set.has('READ_SMS') || set.has('SYSTEM_ALERT_WINDOW'))) {
    score += 25;
    toxicCombos.push({
      en: 'Toxic Combo Detected: Accessibility + SMS/Overlay allows full banking trojan takeover and automated UPI theft.',
      hi: 'गंभीर खतरा कॉम्बो: Accessibility + SMS/Overlay से ठग आपके फोन पर अपने आप UPI पेमेंट चला सकता है!',
    });
  }

  if (set.has('READ_CONTACTS') && set.has('CAMERA_MIC') && category === 'loan_cashback') {
    score += 20;
    toxicCombos.push({
      en: 'Loan App Extortion Pattern: Contacts + Camera/Gallery access is the #1 sign of illegal predatory loan blackmail apps.',
      hi: 'फर्जी लोन ऐप पैटर्न: कॉन्टैक्ट + कैमरा एक्सेस अवैध लोन ऐप्स द्वारा ब्लैकमेल करने का मुख्य तरीका है।',
    });
  }

  if (category === 'invite_reader' && selectedIds.length > 0) {
    score += 25;
    toxicCombos.push({
      en: 'Disguised Payload Warning: A genuine wedding card or challan receipt is a PDF/image and NEVER requests app permissions.',
      hi: 'नकली फाइल चेतावनी: शादी का कार्ड या ई-चालान हमेशा PDF/फोटो होता है—उसे किसी ऐप अनुमति की जरूरत नहीं होती।',
    });
  }

  if (category === 'utility' && (set.has('READ_SMS') || set.has('READ_CONTACTS') || set.has('CALL_PHONE'))) {
    score += 20;
    toxicCombos.push({
      en: 'Excessive Privilege Mismatch: A basic utility (flashlight/cleaner/PDF tool) has zero reason to read SMS, Contacts, or Calls.',
      hi: 'अनावश्यक अनुमति: टॉर्च या सामान्य ऐप को SMS, कॉन्टैक्ट या कॉल कंट्रोल की कोई जरूरत नहीं होती।',
    });
  }

  if (set.has('CALL_PHONE') && set.has('READ_SMS')) {
    score += 15;
    toxicCombos.push({
      en: 'OTP Hijack Risk: Combined Call + SMS permissions allow intercepting both SMS OTPs and automated USSD call forwarding.',
      hi: 'OTP हाईजैक खतरा: Call + SMS अनुमति से ठग आपके कॉल व SMS दोनों के OTP मोड़ सकते हैं।',
    });
  }

  score = Math.min(100, score);
  const riskLevel: 'safe' | 'caution' | 'danger' =
    score >= 55 ? 'danger' : score >= 25 ? 'caution' : 'safe';

  const verdict =
    riskLevel === 'danger'
      ? {
          en: 'CRITICAL RISK — Do not grant these permissions. Uninstall the app or revoke permissions immediately.',
          hi: 'गंभीर खतरा — ऐसी अनुमतियां बिल्कुल न दें। इस ऐप को तुरंत अनइंस्टॉल करें या अनुमति बंद करें।',
        }
      : riskLevel === 'caution'
        ? {
            en: 'MODERATE CAUTION — Review why this app requests sensitive data and restrict permissions to "While using app" or Deny.',
            hi: 'सावधानी जरूरी — जांचें कि इस ऐप को इन अनुमतियों की जरूरत क्यों है और अनावश्यक एक्सेस बंद करें।',
          }
        : {
            en: 'LOW RISK — Minimal permission footprint selected. Always verify app publisher on Google Play Store.',
            hi: 'कम जोखिम — चुनी गई अनुमतियां सीमित हैं। हमेशा केवल आधिकारिक Play Store से ही ऐप लें।',
          };

  return {
    riskScore: score,
    riskLevel,
    verdict,
    toxicCombos,
    revocationSteps: {
      en: [
        'Open Phone Settings > Apps > Special App Access > Turn OFF "Install Unknown Apps" for WhatsApp, Telegram & Chrome.',
        'Go to Settings > Accessibility > Installed Services and disable any unfamiliar app immediately.',
        'Open Settings > Privacy > Permission Manager > Check SMS, Call Logs & Contacts and set suspicious apps to "Don’t Allow".',
        'Run Google Play Protect scan inside Google Play Store > Profile > Play Protect > Scan.',
      ],
      hi: [
        'फोन की Settings > Apps > Special App Access में जाएं और WhatsApp, Telegram व Chrome के लिए "Install Unknown Apps" बंद करें।',
        'Settings > Accessibility में जाकर किसी भी अनजान ऐप की स्क्रीन कंट्रोल सेवा तुरंत OFF करें।',
        'Settings > Privacy > Permission Manager में जाकर SMS, Contacts और Call एक्सेस संदिग्ध ऐप्स से हटा दें।',
        'Google Play Store खोलें > प्रोफाइल आइकन > Play Protect > Scan पर क्लिक करके फोन की जांच करें।',
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 3. Email Header, Authentication (SPF/DKIM/DMARC) & Spoof Forensics
// ---------------------------------------------------------------------------

export interface EmailForensicReport {
  riskScore: number;
  riskLevel: 'safe' | 'caution' | 'danger';
  fromAddress: string | null;
  fromDomain: string | null;
  returnPathDomain: string | null;
  replyToDomain: string | null;
  spfStatus: string;
  dkimStatus: string;
  dmarcStatus: string;
  hopIps: string[];
  findings: { severity: 'ok' | 'warning' | 'danger'; title: { en: string; hi: string }; detail: { en: string; hi: string } }[];
}

function extractDomainFromEmail(str: string): { email: string | null; domain: string | null } {
  const match = str.match(/[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (!match) return { email: null, domain: null };
  return { email: match[0].toLowerCase(), domain: match[1].toLowerCase() };
}

function extractAuthResult(text: string, protocol: 'spf' | 'dkim' | 'dmarc'): string {
  const regex = new RegExp(`${protocol}\\s*=\\s*([a-zA-Z0-9_-]+)`, 'i');
  const m = text.match(regex);
  return m ? m[1].toLowerCase() : 'not_found';
}

export function parseEmailForensics(rawHeadersOrQuick: string): EmailForensicReport {
  const raw = rawHeadersOrQuick.trim();
  const lines = raw.split(/\r?\n/);

  const findHeader = (prefix: string): string => {
    const regex = new RegExp(`^${prefix}\\s*:(.*)$`, 'i');
    for (const line of lines) {
      const m = line.match(regex);
      if (m) return m[1].trim();
    }
    return '';
  };

  const fromLine = findHeader('From') || raw;
  const returnPathLine = findHeader('Return-Path');
  const replyToLine = findHeader('Reply-To');

  const fromParsed = extractDomainFromEmail(fromLine);
  const rpParsed = extractDomainFromEmail(returnPathLine);
  const rtParsed = extractDomainFromEmail(replyToLine);

  const spfStatus = extractAuthResult(raw, 'spf');
  const dkimStatus = extractAuthResult(raw, 'dkim');
  const dmarcStatus = extractAuthResult(raw, 'dmarc');

  // Extract IPv4 hop addresses from Received lines
  const hopIps: string[] = [];
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  for (const line of lines) {
    if (/^received\s*:/i.test(line)) {
      const matches = line.match(ipRegex) || [];
      for (const ip of matches) {
        if (!hopIps.includes(ip) && !ip.startsWith('127.') && !ip.startsWith('10.') && !ip.startsWith('192.168.')) {
          hopIps.push(ip);
        }
      }
    }
  }

  let riskScore = 0;
  const findings: EmailForensicReport['findings'] = [];

  // Authentication checks
  if (spfStatus === 'fail' || spfStatus === 'softfail' || dkimStatus === 'fail' || dmarcStatus === 'fail') {
    riskScore += 45;
    findings.push({
      severity: 'danger',
      title: { en: 'Email Authentication Failed (SPF/DKIM/DMARC)', hi: 'ईमेल सुरक्षा जांच विफल (SPF/DKIM/DMARC)' },
      detail: {
        en: `Header reports SPF=${spfStatus}, DKIM=${dkimStatus}, DMARC=${dmarcStatus}. The sender server is not authorized for the claimed domain.`,
        hi: `हेडर में SPF=${spfStatus}, DKIM=${dkimStatus}, DMARC=${dmarcStatus} मिला। यह ईमेल असली सर्वर से नहीं भेजा गया हो सकता।`,
      },
    });
  } else if (spfStatus === 'pass' && dkimStatus === 'pass' && dmarcStatus === 'pass') {
    findings.push({
      severity: 'ok',
      title: { en: 'SPF, DKIM & DMARC Verified', hi: 'SPF, DKIM और DMARC पास' },
      detail: {
        en: 'Cryptographic domain signatures and authorized mail server checks passed.',
        hi: 'डोमेन का डिजिटल हस्ताक्षर और मेल सर्वर सत्यापन सही पाया गया।',
      },
    });
  } else {
    riskScore += 12;
    findings.push({
      severity: 'warning',
      title: { en: 'Incomplete Authentication Headers', hi: 'अधूरे सुरक्षा हेडर' },
      detail: {
        en: 'Paste full "Show Original" email headers to inspect SPF, DKIM, and DMARC status.',
        hi: 'पूरी जांच के लिए Gmail/Outlook से "Show Original" का पूरा हेडर पेस्ट करें।',
      },
    });
  }

  // From vs Reply-To / Return-Path Mismatch
  if (fromParsed.domain && rtParsed.domain && fromParsed.domain !== rtParsed.domain) {
    riskScore += 30;
    findings.push({
      severity: 'danger',
      title: { en: 'Reply-To Domain Mismatch Trap', hi: 'Reply-To डोमेन अलग है (ठगी संकेत)' },
      detail: {
        en: `Visible From domain (${fromParsed.domain}) differs from Reply-To (${rtParsed.domain}). Replies go to the attacker!`,
        hi: `दिखने वाला डोमेन (${fromParsed.domain}) और जवाब जाने वाला डोमेन (${rtParsed.domain}) अलग-अलग हैं!`,
      },
    });
  }

  if (fromParsed.domain && rpParsed.domain && !rpParsed.domain.endsWith(fromParsed.domain) && !fromParsed.domain.endsWith(rpParsed.domain)) {
    riskScore += 20;
    findings.push({
      severity: 'warning',
      title: { en: 'Return-Path Differs from Sender Domain', hi: 'Return-Path और Sender डोमेन अलग हैं' },
      detail: {
        en: `From: ${fromParsed.domain} vs Return-Path: ${rpParsed.domain}. Verify carefully before trusting.`,
        hi: `From (${fromParsed.domain}) और Return-Path (${rpParsed.domain}) मेल नहीं खाते। सावधानी बरतें।`,
      },
    });
  }

  // Brand impersonation via free webmail or risky TLD
  const freeMailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me'];
  if (
    fromParsed.domain &&
    freeMailDomains.includes(fromParsed.domain) &&
    /(sbi|hdfc|icici|rbi|income.?tax|gov|police|customs|support|kyc)/i.test(fromLine)
  ) {
    riskScore += 40;
    findings.push({
      severity: 'danger',
      title: { en: 'Official Name Spoofed Using Free Email', hi: 'फ्री ईमेल से सरकारी/बैंक नाम की नकल' },
      detail: {
        en: `Display name mentions a bank or government authority, yet sender uses ${fromParsed.domain}.`,
        hi: `नाम में बैंक या सरकारी विभाग लिखा है, लेकिन ईमेल सामान्य ${fromParsed.domain} पते से आया है।`,
      },
    });
  }

  if (fromParsed.domain && (fromParsed.domain.includes('xn--') || /\.(xyz|top|click|tk|ml|work|buzz)$/i.test(fromParsed.domain))) {
    riskScore += 35;
    findings.push({
      severity: 'danger',
      title: { en: 'Punycode / High-Risk TLD Domain', hi: 'संदिग्ध Punycode या अनजान डोमेन एक्सटेंशन' },
      detail: {
        en: `Domain "${fromParsed.domain}" uses Punycode (xn--) or a high-abuse extension.`,
        hi: `डोमेन "${fromParsed.domain}" में संदिग्ध अक्षर या जोखिम भरा एक्सटेंशन इस्तेमाल हुआ है।`,
      },
    });
  }

  riskScore = Math.min(100, riskScore);
  const riskLevel: 'safe' | 'caution' | 'danger' =
    riskScore >= 45 ? 'danger' : riskScore >= 18 ? 'caution' : 'safe';

  return {
    riskScore,
    riskLevel,
    fromAddress: fromParsed.email,
    fromDomain: fromParsed.domain,
    returnPathDomain: rpParsed.domain,
    replyToDomain: rtParsed.domain,
    spfStatus,
    dkimStatus,
    dmarcStatus,
    hopIps: hopIps.slice(0, 6),
    findings,
  };
}

// ---------------------------------------------------------------------------
// 4. Web Crypto AES-256-GCM + Multi-Hash + Safe Local JWT Inspector
// ---------------------------------------------------------------------------

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export interface MultiHashOutput {
  sha1: string;
  sha256: string;
  sha384: string;
  sha512: string;
  base64: string;
}

export async function computeAllDigests(text: string): Promise<MultiHashOutput> {
  const data = new TextEncoder().encode(text);
  const [h1, h256, h384, h512] = await Promise.all([
    crypto.subtle.digest('SHA-1', data),
    crypto.subtle.digest('SHA-256', data),
    crypto.subtle.digest('SHA-384', data),
    crypto.subtle.digest('SHA-512', data),
  ]);

  return {
    sha1: bytesToHex(h1),
    sha256: bytesToHex(h256),
    sha384: bytesToHex(h384),
    sha512: bytesToHex(h512),
    base64: bytesToBase64(data),
  };
}

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const rawKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptAesGcm(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  const cipherBytes = new Uint8Array(ciphertext);
  const combined = new Uint8Array(salt.length + iv.length + cipherBytes.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(cipherBytes, salt.length + iv.length);
  return bytesToBase64(combined);
}

export async function decryptAesGcm(payloadBase64: string, passphrase: string): Promise<string> {
  const combined = base64ToBytes(payloadBase64);
  if (combined.length < 29) {
    throw new Error('Encrypted payload is too short or invalid.');
  }
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const cipherBytes = combined.slice(28);
  const key = await deriveAesKey(passphrase, salt);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
  return new TextDecoder().decode(plainBuf);
}

export interface DecodedJwtReport {
  validFormat: boolean;
  headerJson: string;
  payloadJson: string;
  algNoneWarning: boolean;
  expiredStatus: 'expired' | 'active' | 'no_exp';
  expiryText: string | null;
}

function decodeBase64UrlSegment(seg: string): string {
  const padded = seg.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((seg.length + 3) % 4);
  return new TextDecoder().decode(base64ToBytes(padded));
}

export function decodeJwtLocally(token: string): DecodedJwtReport {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. A JWT must have 3 dot-separated Base64URL parts.');
  }

  const headerObj = JSON.parse(decodeBase64UrlSegment(parts[0])) as Record<string, unknown>;
  const payloadObj = JSON.parse(decodeBase64UrlSegment(parts[1])) as Record<string, unknown>;

  const alg = String(headerObj.alg || '').toLowerCase();
  const algNoneWarning = alg === 'none' || alg === '';

  let expiredStatus: 'expired' | 'active' | 'no_exp' = 'no_exp';
  let expiryText: string | null = null;
  if (typeof payloadObj.exp === 'number') {
    const expMs = payloadObj.exp * 1000;
    expiryText = new Date(expMs).toLocaleString('en-IN');
    expiredStatus = Date.now() > expMs ? 'expired' : 'active';
  }

  return {
    validFormat: true,
    headerJson: JSON.stringify(headerObj, null, 2),
    payloadJson: JSON.stringify(payloadObj, null, 2),
    algNoneWarning,
    expiredStatus,
    expiryText,
  };
}
