import type { BilingualText } from '../data/cyberData';

export interface PasswordAnalysis {
  length: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasCommonPattern: boolean;
  entropyBits: number;
  score: 0 | 1 | 2 | 3 | 4;
  label: BilingualText;
  crackTime: BilingualText;
  tips: BilingualText[];
}

const COMMON_PASSWORDS = [
  '123456',
  '12345678',
  '123456789',
  'password',
  'qwerty',
  'admin',
  'welcome',
  'india123',
  'iloveyou',
  'abc123',
  'letmein',
  'pass123',
  '000000',
  '111111',
];

export function analyzePassword(pwd: string): PasswordAnalysis {
  const length = pwd.length;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

  const lower = pwd.toLowerCase();
  const hasSequential =
    /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|asdf|zxcv)/i.test(pwd);
  const hasRepeated = /(.)\1{2,}/.test(pwd);
  const isCommonWord = COMMON_PASSWORDS.some((w) => lower.includes(w));
  const hasCommonPattern = length > 0 && (hasSequential || hasRepeated || isCommonWord);

  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasNumber) pool += 10;
  if (hasSymbol) pool += 32;

  let rawEntropy = pool > 0 ? Math.round(length * Math.log2(pool)) : 0;
  if (hasCommonPattern) {
    rawEntropy = Math.max(8, Math.round(rawEntropy * 0.45));
  }

  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (length === 0) {
    score = 0;
  } else if (rawEntropy < 32 || length < 8 || isCommonWord) {
    score = 1;
  } else if (rawEntropy < 52 || length < 10) {
    score = 2;
  } else if (rawEntropy < 72 || !(hasUpper && hasLower && hasNumber)) {
    score = 3;
  } else {
    score = 4;
  }

  const labelMap: Record<0 | 1 | 2 | 3 | 4, BilingualText> = {
    0: { en: 'Enter a password', hi: 'पासवर्ड दर्ज करें' },
    1: { en: 'Weak — Easily Cracked', hi: 'कमजोर — आसानी से टूट सकता है' },
    2: { en: 'Moderate — Needs Strengthening', hi: 'मध्यम — और मजबूत बनाएं' },
    3: { en: 'Strong — Good Protection', hi: 'मजबूत — अच्छी सुरक्षा' },
    4: { en: 'Very Strong — High Security', hi: 'अत्यंत मजबूत — उच्च सुरक्षा' },
  };

  let crackTime: BilingualText = { en: '—', hi: '—' };
  if (length > 0) {
    if (rawEntropy < 28) {
      crackTime = { en: 'Under 1 second', hi: '1 सेकंड से कम' };
    } else if (rawEntropy < 38) {
      crackTime = { en: 'A few minutes', hi: 'कुछ मिनट' };
    } else if (rawEntropy < 50) {
      crackTime = { en: 'Several hours to days', hi: 'कुछ घंटे से दिन' };
    } else if (rawEntropy < 64) {
      crackTime = { en: 'Months to a few years', hi: 'महीनों से कुछ वर्ष' };
    } else if (rawEntropy < 80) {
      crackTime = { en: 'Decades to centuries', hi: 'दशकों से सदियाँ' };
    } else {
      crackTime = { en: 'Millions of years', hi: 'लाखों वर्ष' };
    }
  }

  const tips: BilingualText[] = [];
  if (length > 0 && length < 12) {
    tips.push({
      en: 'Increase length to at least 12–16 characters.',
      hi: 'पासवर्ड की लंबाई कम से कम 12–16 अक्षर रखें।',
    });
  }
  if (length > 0 && !hasUpper) {
    tips.push({
      en: 'Add uppercase letters (A–Z).',
      hi: 'बड़े अक्षर (A–Z) शामिल करें।',
    });
  }
  if (length > 0 && !hasNumber) {
    tips.push({
      en: 'Include numbers (0–9) in non-predictable positions.',
      hi: 'अंक (0–9) को बीच में मिलाकर उपयोग करें।',
    });
  }
  if (length > 0 && !hasSymbol) {
    tips.push({
      en: 'Add special characters like @, #, $, %, or !',
      hi: 'विशेष चिह्न जैसे @, #, $, % या ! जोड़ें।',
    });
  }
  if (hasCommonPattern) {
    tips.push({
      en: 'Avoid common words, keyboard patterns (qwerty), or sequences (1234).',
      hi: 'सामान्य शब्द, कीबोर्ड पैटर्न (qwerty) या क्रम (1234) से बचें।',
    });
  }

  return {
    length,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    hasCommonPattern,
    entropyBits: rawEntropy,
    score,
    label: labelMap[score],
    crackTime,
    tips,
  };
}

export function generateSecurePassword(options: {
  length: number;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz';
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numChars = '23456789';
  const symChars = '@#$%&*!?+-';

  const pools: string[] = [lowerChars];
  if (options.upper) pools.push(upperChars);
  if (options.numbers) pools.push(numChars);
  if (options.symbols) pools.push(symChars);

  const combined = pools.join('');
  const arr = new Uint32Array(options.length);
  crypto.getRandomValues(arr);

  const chars: string[] = [];
  // Ensure at least one character from each enabled pool
  pools.forEach((pool, idx) => {
    if (idx < options.length) {
      chars.push(pool[arr[idx] % pool.length]);
    }
  });

  for (let i = chars.length; i < options.length; i++) {
    chars.push(combined[arr[i] % combined.length]);
  }

  // Fisher-Yates shuffle using secure random values
  const shuffleArr = new Uint32Array(chars.length);
  crypto.getRandomValues(shuffleArr);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleArr[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export interface UrlAnatomy {
  protocol: string;
  subdomain: string;
  rootDomain: string;
  path: string;
}

export interface PhishingFinding {
  severity: 'safe' | 'warning' | 'danger';
  title: BilingualText;
  detail: BilingualText;
}

export interface PhishingReport {
  riskLevel: 'safe' | 'caution' | 'danger';
  riskScore: number;
  verdict: BilingualText;
  findings: PhishingFinding[];
  urlAnatomy: UrlAnatomy | null;
}

const SHORTENER_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'rb.gy',
  'cutt.ly',
  'is.gd',
  'goo.gl',
  'shorturl.at',
];

const HIGH_RISK_TLDS = ['.xyz', '.top', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.loan', '.work'];

const TRUSTED_BRAND_OFFICIAL: Record<string, string[]> = {
  sbi: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com'],
  hdfc: ['hdfcbank.com'],
  icici: ['icicibank.com'],
  axis: ['axisbank.com'],
  paytm: ['paytm.com'],
  phonepe: ['phonepe.com'],
  uidai: ['uidai.gov.in'],
  aadhaar: ['uidai.gov.in'],
  parivahan: ['parivahan.gov.in'],
  cybercrime: ['cybercrime.gov.in'],
  amazon: ['amazon.in', 'amazon.com'],
  flipkart: ['flipkart.com'],
  irctc: ['irctc.co.in'],
};

function extractRootDomain(hostname: string): { subdomain: string; rootDomain: string } {
  const parts = hostname.toLowerCase().split('.').filter(Boolean);
  if (parts.length <= 2) {
    return { subdomain: '', rootDomain: parts.join('.') };
  }
  const lastTwo = parts.slice(-2).join('.');
  const isCountrySecondLevel = ['co.in', 'gov.in', 'nic.in', 'org.in', 'ac.in', 'co.uk'].includes(lastTwo);
  const rootCount = isCountrySecondLevel && parts.length >= 3 ? 3 : 2;
  const rootDomain = parts.slice(-rootCount).join('.');
  const subdomain = parts.slice(0, parts.length - rootCount).join('.');
  return { subdomain, rootDomain };
}

export function inspectPhishingInput(rawInput: string, mode: 'url' | 'message'): PhishingReport {
  const trimmed = rawInput.trim();
  const findings: PhishingFinding[] = [];
  let riskScore = 0;
  let urlAnatomy: UrlAnatomy | null = null;

  let targetUrlStr = '';
  if (mode === 'url') {
    targetUrlStr = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  } else {
    const urlMatch = trimmed.match(/(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
    if (urlMatch) {
      targetUrlStr = /^https?:\/\//i.test(urlMatch[0]) ? urlMatch[0] : `https://${urlMatch[0]}`;
    }
  }

  if (targetUrlStr) {
    try {
      const parsed = new URL(targetUrlStr);
      const hostname = parsed.hostname.toLowerCase();
      const { subdomain, rootDomain } = extractRootDomain(hostname);
      urlAnatomy = {
        protocol: parsed.protocol.replace(':', ''),
        subdomain,
        rootDomain,
        path: parsed.pathname + parsed.search,
      };

      // 1. Check explicit HTTP (if user typed http://)
      if (trimmed.toLowerCase().startsWith('http://')) {
        riskScore += 25;
        findings.push({
          severity: 'warning',
          title: { en: 'Unencrypted HTTP Link', hi: 'असुरक्षित HTTP लिंक' },
          detail: {
            en: 'This link uses HTTP instead of HTTPS. Banking and login portals must always use encrypted HTTPS.',
            hi: 'यह लिंक HTTPS के बजाय सामान्य HTTP उपयोग कर रहा है। असली बैंक या सरकारी साइट हमेशा HTTPS होती है।',
          },
        });
      }

      // 2. Raw IP address
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
        riskScore += 45;
        findings.push({
          severity: 'danger',
          title: { en: 'Raw IP Address Instead of Domain', hi: 'डोमेन की जगह सीधे IP एड्रेस का उपयोग' },
          detail: {
            en: 'Legitimate companies use verified domain names, not raw numeric IP addresses.',
            hi: 'असली कंपनियां नंबर वाले IP एड्रेस के बजाय आधिकारिक डोमेन नाम इस्तेमाल करती हैं।',
          },
        });
      }

      // 3. @ Symbol credential redirection
      if (trimmed.includes('@') && mode === 'url') {
        riskScore += 45;
        findings.push({
          severity: 'danger',
          title: { en: 'Deceptive "@" Symbol in URL', hi: 'URL में भ्रामक "@" चिह्न' },
          detail: {
            en: 'Browsers ignore everything before the "@" sign and redirect you to the domain after it.',
            hi: 'लिंक में "@" से पहले का हिस्सा दिखावा होता है और ब्राउज़र आपको "@" के बाद वाली नकली साइट पर ले जाता है।',
          },
        });
      }

      // 4. URL Shortener
      if (SHORTENER_DOMAINS.some((s) => rootDomain === s || hostname === s)) {
        riskScore += 30;
        findings.push({
          severity: 'warning',
          title: { en: 'Shortened / Masked Destination Link', hi: 'छोटा (Shortened) और छुपा हुआ लिंक' },
          detail: {
            en: 'Shortened URLs hide the actual destination website. Avoid entering passwords or OTPs after clicking one.',
            hi: 'छोटे किए गए लिंक असली वेबसाइट का पता छुपाते हैं। ऐसे लिंक से कभी बैंकिंग लॉगिन न करें।',
          },
        });
      }

      // 5. High-risk TLD
      if (HIGH_RISK_TLDS.some((tld) => rootDomain.endsWith(tld))) {
        riskScore += 30;
        findings.push({
          severity: 'warning',
          title: { en: 'High-Risk Domain Extension', hi: 'संदिग्ध डोमेन एक्सटेंशन' },
          detail: {
            en: `The domain ends with a low-cost extension (${rootDomain.slice(rootDomain.lastIndexOf('.'))}) frequently abused in scam campaigns.`,
            hi: `यह डोमेन (${rootDomain.slice(rootDomain.lastIndexOf('.'))}) अक्सर फर्जी और ठगी वाली वेबसाइटों में इस्तेमाल किया जाता है।`,
          },
        });
      }

      // 6. Excessive subdomains
      if (subdomain.split('.').filter(Boolean).length >= 2) {
        riskScore += 20;
        findings.push({
          severity: 'warning',
          title: { en: 'Multiple Subdomains Used to Disguise Host', hi: 'असली पता छुपाने के लिए कई सब-डोमेन' },
          detail: {
            en: `The actual owner of this link is "${rootDomain}", not the words written at the start.`,
            hi: `इस लिंक का असली मालिक "${rootDomain}" है, न कि शुरुआत में लिखा गया ब्रांड नाम।`,
          },
        });
      }

      // 7. Brand spoofing check
      for (const [brand, officialDomains] of Object.entries(TRUSTED_BRAND_OFFICIAL)) {
        if (hostname.includes(brand) && !officialDomains.includes(rootDomain)) {
          riskScore += 45;
          findings.push({
            severity: 'danger',
            title: {
              en: `Possible "${brand.toUpperCase()}" Brand Impersonation`,
              hi: `"${brand.toUpperCase()}" नाम का नकली उपयोग (ब्रांड स्पूफिंग)`,
            },
            detail: {
              en: `The link mentions "${brand}" but the real domain is "${rootDomain}", not an official domain (${officialDomains.join(', ')}).`,
              hi: `लिंक में "${brand}" लिखा है, लेकिन असली डोमेन "${rootDomain}" है जो आधिकारिक नहीं है।`,
            },
          });
          break;
        }
      }

      // 8. APK download link
      if (parsed.pathname.toLowerCase().endsWith('.apk')) {
        riskScore += 50;
        findings.push({
          severity: 'danger',
          title: { en: 'Direct .APK Android App Download', hi: 'सीधे .APK ऐप डाउनलोड लिंक' },
          detail: {
            en: 'Installing .APK files outside the official Play Store is a major malware and OTP-theft vector.',
            hi: 'Play Store के बाहर से .APK फाइल डाउनलोड करना फोन में वायरस और OTP चोरी का बड़ा कारण है।',
          },
        });
      }

      // 9. Official .gov.in positive check
      if (rootDomain.endsWith('.gov.in') || rootDomain.endsWith('.nic.in')) {
        findings.push({
          severity: 'safe',
          title: { en: 'Verified Indian Government Domain Suffix', hi: 'आधिकारिक भारतीय सरकारी डोमेन (.gov.in / .nic.in)' },
          detail: {
            en: `The root domain "${rootDomain}" ends with an official government extension, and uses ${parsed.protocol.toUpperCase()}.`,
            hi: `मुख्य डोमेन "${rootDomain}" एक आधिकारिक भारतीय सरकारी डोमेन पर समाप्त होता है।`,
          },
        });
      }
    } catch {
      if (mode === 'url') {
        riskScore += 20;
        findings.push({
          severity: 'warning',
          title: { en: 'Malformed Web Address', hi: 'अमान्य या अधूरा वेब पता' },
          detail: {
            en: 'Please enter a complete URL such as https://example.com to inspect its domain structure.',
            hi: 'सही जांच के लिए पूरा वेब लिंक दर्ज करें (जैसे https://example.com)।',
          },
        });
      }
    }
  }

  // Message text heuristic analysis
  if (mode === 'message') {
    const lowerMsg = trimmed.toLowerCase();

    const urgencyHits = [
      'urgent',
      'immediately',
      'suspended',
      'blocked',
      'within 2 hours',
      'tonight',
      'expire',
      'तुरंत',
      'खाता बंद',
      'बंद हो जाएगा',
      'बिजली कट',
      'अंतिम चेतावनी',
    ].filter((kw) => lowerMsg.includes(kw));

    if (urgencyHits.length > 0) {
      riskScore += 30;
      findings.push({
        severity: 'danger',
        title: { en: 'Artificial Urgency / Fear Trigger', hi: 'डर और जल्दबाजी पैदा करने वाली भाषा' },
        detail: {
          en: `Detected pressure phrases (${urgencyHits.slice(0, 3).join(', ')}). Scammers create panic so you click without verifying.`,
          hi: `संदेश में दबाव बनाने वाले शब्द (${urgencyHits.slice(0, 3).join(', ')}) मिले हैं ताकि आप बिना सोचे लिंक पर क्लिक करें।`,
        },
      });
    }

    const credentialBait = [
      'kyc',
      'pan card',
      'otp',
      'upi pin',
      'cvv',
      'lottery',
      'prize',
      'winner',
      'cashback',
      'refund',
      'anydesk',
      'teamviewer',
      'quicksupport',
      '.apk',
      'challan',
      'केवाईसी',
      'ओटीपी',
      'लॉटरी',
      'इनाम',
      'कैशबैक',
      'चालान',
    ].filter((kw) => lowerMsg.includes(kw));

    if (credentialBait.length > 0) {
      riskScore += 35;
      findings.push({
        severity: 'danger',
        title: { en: 'Sensitive Data, Prize, or Remote-App Bait', hi: 'KYC, इनाम या संवेदनशील जानकारी का लालच' },
        detail: {
          en: `Detected high-risk keywords (${credentialBait.slice(0, 4).join(', ')}). Never share OTP, KYC, or install .apk/remote apps from messages.`,
          hi: `संदेश में जोखिम भरे शब्द (${credentialBait.slice(0, 4).join(', ')}) मिले हैं। किसी भी संदेश के जरिए OTP या ऐप डाउनलोड न करें।`,
        },
      });
    }
  }

  const clampedScore = Math.min(100, riskScore);
  let riskLevel: 'safe' | 'caution' | 'danger' = 'safe';
  let verdict: BilingualText = {
    en: 'No obvious phishing indicators detected — still verify the sender independently.',
    hi: 'कोई स्पष्ट फ़िशिंग संकेत नहीं मिला — फिर भी भेजने वाले की पुष्टि अवश्य करें।',
  };

  if (clampedScore >= 45) {
    riskLevel = 'danger';
    verdict = {
      en: 'High Risk — Likely Phishing or Scam. Do NOT click, login, or share details.',
      hi: 'उच्च जोखिम — यह फ़िशिंग या ठगी हो सकती है। क्लिक न करें और कोई जानकारी न दें।',
    };
  } else if (clampedScore >= 20) {
    riskLevel = 'caution';
    verdict = {
      en: 'Suspicious Signals Found — Verify via official app or website before taking action.',
      hi: 'संदिग्ध संकेत मिले — आगे बढ़ने से पहले आधिकारिक ऐप या वेबसाइट से जांच करें।',
    };
  }

  if (findings.length === 0) {
    findings.push({
      severity: 'safe',
      title: { en: 'Clean Structure Check', hi: 'प्रारंभिक जांच सुरक्षित प्रतीत होती है' },
      detail: {
        en: 'No deceptive domains, raw IPs, or urgency scam keywords were flagged in this input.',
        hi: 'इस इनपुट में कोई नकली डोमेन, IP एड्रेस या ठगी वाले कीवर्ड नहीं मिले।',
      },
    });
  }

  return {
    riskLevel,
    riskScore: clampedScore,
    verdict,
    findings,
    urlAnatomy,
  };
}

export async function checkPasswordBreach(password: string): Promise<{ count: number; status: 'clean' | 'pwned' }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const response = await fetch(`/api/pwned-prefix/${prefix}`);
  if (!response.ok) {
    throw new Error('Breach lookup service is currently unavailable.');
  }

  const bodyText = await response.text();
  const lines = bodyText.split(/\r?\n/);
  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(':');
    if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
      const count = parseInt((countStr || '0').trim(), 10) || 1;
      return { count, status: 'pwned' };
    }
  }
  return { count: 0, status: 'clean' };
}

export interface UpiDecodedInfo {
  valid: boolean;
  raw: string;
  vpa: string;
  payeeName: string;
  amount: string;
  currency: string;
  note: string;
  merchantCode: string;
  warnings: BilingualText[];
}

export function parseUpiPaymentUri(rawText: string): UpiDecodedInfo {
  const trimmed = rawText.trim();
  const warnings: BilingualText[] = [];

  if (!/^upi:\/\/pay/i.test(trimmed)) {
    return {
      valid: false,
      raw: trimmed,
      vpa: '',
      payeeName: '',
      amount: '',
      currency: 'INR',
      note: '',
      merchantCode: '',
      warnings: [
        {
          en: 'This QR or link does not start with "upi://pay". Be careful if it opens an unknown website or .apk download instead of a payment screen.',
          hi: 'यह लिंक "upi://pay" से शुरू नहीं होता। यदि कोई QR कोड आपको वेबसाइट या ऐप डाउनलोड पर ले जाए तो सावधान रहें।',
        },
      ],
    };
  }

  try {
    const queryStr = trimmed.includes('?') ? trimmed.split('?')[1] : '';
    const params = new URLSearchParams(queryStr);
    const vpa = params.get('pa') || '';
    const payeeName = params.get('pn') || '';
    const amount = params.get('am') || '';
    const currency = params.get('cu') || 'INR';
    const note = params.get('tn') || '';
    const merchantCode = params.get('mc') || '';

    warnings.push({
      en: 'Golden UPI Rule: Scanning a QR code and entering your UPI PIN ALWAYS sends money FROM your account. Never scan a QR to receive money or refunds.',
      hi: 'UPI का सुनहरा नियम: QR कोड स्कैन करके पिन डालने से पैसे हमेशा आपके खाते से कटते हैं, कभी आते नहीं।',
    });

    if (amount) {
      warnings.push({
        en: `Pre-filled amount detected (₹${amount}). Scammers often lock high amounts inside refund QR codes.`,
        hi: `इस QR कोड में पहले से ₹${amount} की राशि तय है। ठग अक्सर रिफंड के नाम पर मोटी रकम लॉक कर देते हैं।`,
      });
    }

    if (vpa && !merchantCode && /refund|cashback|olx|prize|lottery|help|support/i.test(`${payeeName} ${note} ${vpa}`)) {
      warnings.push({
        en: 'Suspicious keywords ("refund / prize / support") found in an unverified personal UPI ID.',
        hi: 'व्यक्तिगत UPI ID में "refund / prize / support" जैसे संदिग्ध शब्द मिले हैं। यह ठगी हो सकती है।',
      });
    }

    return {
      valid: Boolean(vpa),
      raw: trimmed,
      vpa,
      payeeName,
      amount,
      currency,
      note,
      merchantCode,
      warnings,
    };
  } catch {
    return {
      valid: false,
      raw: trimmed,
      vpa: '',
      payeeName: '',
      amount: '',
      currency: 'INR',
      note: '',
      merchantCode: '',
      warnings: [
        {
          en: 'Unable to parse UPI parameters cleanly.',
          hi: 'UPI विवरण पढ़ा नहीं जा सका।',
        },
      ],
    };
  }
}

export interface FileSafetyResult {
  fileName: string;
  sizeBytes: number;
  sha256: string;
  extension: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  verdict: BilingualText;
}

export async function inspectFileLocally(file: File): Promise<FileSafetyResult> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const sha256 = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const lowerName = file.name.toLowerCase();
  const parts = lowerName.split('.');
  const extension = parts.length > 1 ? `.${parts[parts.length - 1]}` : 'none';
  const hasDoubleExt =
    parts.length >= 3 &&
    ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(parts[parts.length - 2]) &&
    ['exe', 'apk', 'bat', 'cmd', 'scr', 'vbs', 'js', 'msi'].includes(parts[parts.length - 1]);

  if (['.apk', '.exe', '.bat', '.cmd', '.scr', '.vbs', '.msi'].includes(extension) || hasDoubleExt) {
    return {
      fileName: file.name,
      sizeBytes: file.size,
      sha256,
      extension,
      riskLevel: 'danger',
      verdict: {
        en: hasDoubleExt
          ? 'High Risk: Disguised double-extension executable detected! Do not open or install.'
          : `High Risk: "${extension}" is an executable/installer file. Never install files received via WhatsApp or SMS.`,
        hi: hasDoubleExt
          ? 'उच्च जोखिम: दोहरे एक्सटेंशन वाली संदिग्ध फाइल मिली! इसे बिल्कुल न खोलें।'
          : `उच्च जोखिम: "${extension}" एक ऐप/इंस्टॉलर फाइल है। WhatsApp या SMS से आई ऐसी फाइल कभी इंस्टॉल न करें।`,
      },
    };
  }

  if (['.zip', '.rar', '.7z', '.html', '.htm'].includes(extension)) {
    return {
      fileName: file.name,
      sizeBytes: file.size,
      sha256,
      extension,
      riskLevel: 'caution',
      verdict: {
        en: `Caution: "${extension}" archives or HTML files can hide malicious scripts or fake login pages. Verify sender before opening.`,
        hi: `सावधानी: "${extension}" फाइलों के अंदर संदिग्ध लिंक या नकली पेज छुपे हो सकते हैं।`,
      },
    };
  }

  return {
    fileName: file.name,
    sizeBytes: file.size,
    sha256,
    extension,
    riskLevel: 'safe',
    verdict: {
      en: 'Standard document/media extension. SHA-256 fingerprint calculated locally.',
      hi: 'सामान्य दस्तावेज़/मीडिया फाइल प्रकार। SHA-256 कोड सफलतापूर्वक जांच लिया गया है।',
    },
  };
}

export async function stripImageExifMetadata(file: File): Promise<{
  cleanUrl: string;
  cleanBlobSize: number;
  originalSize: number;
  width: number;
  height: number;
  cleanFileName: string;
}> {
  return new Promise((resolve, reject) => {
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(imgUrl);
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(imgUrl);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not export cleaned image.'));
              return;
            }
            const cleanUrl = URL.createObjectURL(blob);
            resolve({
              cleanUrl,
              cleanBlobSize: blob.size,
              originalSize: file.size,
              width: img.naturalWidth,
              height: img.naturalHeight,
              cleanFileName: `safe_${baseName}.${ext}`,
            });
          },
          mime,
          0.92,
        );
      } catch (err) {
        URL.revokeObjectURL(imgUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      reject(new Error('Unable to load image file. Please choose a valid JPG, PNG, or WebP photo.'));
    };
    img.src = imgUrl;
  });
}

export function downloadCertificatePng(participantName: string, score: number, total: number, lang: 'en' | 'hi') {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 990;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background & crisp frame
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(58, 58, canvas.width - 116, canvas.height - 116);

  // Inner accent border
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 4;
  ctx.strokeRect(82, 82, canvas.width - 164, canvas.height - 164);

  // Header
  ctx.fillStyle = '#0284C7';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CYBER SECURITY AWARENESS INITIATIVE', canvas.width / 2, 165);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(
    lang === 'en' ? 'Certificate of Cyber Awareness' : 'साइबर जागरूकता प्रमाणपत्र',
    canvas.width / 2,
    245,
  );

  ctx.fillStyle = '#475569';
  ctx.font = '24px sans-serif';
  ctx.fillText(
    lang === 'en' ? 'This certifies that' : 'यह प्रमाणित किया जाता है कि',
    canvas.width / 2,
    330,
  );

  // Participant Name
  ctx.fillStyle = '#0369A1';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(participantName.trim() || 'Cyber Security Learner', canvas.width / 2, 415);

  // Underline
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, 438);
  ctx.lineTo(1060, 438);
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = '25px sans-serif';
  ctx.fillText(
    lang === 'en'
      ? `has successfully completed the Cyber Security Awareness Assessment`
      : `ने Cyber Security जागरूकता मूल्यांकन सफलतापूर्वक पूरा किया है`,
    canvas.width / 2,
    505,
  );

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 30px monospace';
  ctx.fillText(`SCORE: ${score} / ${total}`, canvas.width / 2, 575);

  ctx.fillStyle = '#475569';
  ctx.font = '21px sans-serif';
  ctx.fillText(
    'Stay Alert · Stay Safe · Stay Secure | Helpline: 1930 | cybercrime.gov.in',
    canvas.width / 2,
    655,
  );

  // Footer details
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`Date: ${today}`, 140, 815);
  ctx.fillStyle = '#64748B';
  ctx.font = '18px sans-serif';
  ctx.fillText('Issued via Cyber Security Platform', 140, 848);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Arjun Kumar · ITI COPA', 1260, 815);
  ctx.fillStyle = '#64748B';
  ctx.font = '18px sans-serif';
  ctx.fillText('Sir C. V. Raman ITI, Dheerpur', 1260, 848);

  const link = document.createElement('a');
  link.download = `Cyber_Security_Certificate_${participantName.trim().replace(/\s+/g, '_') || 'Learner'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function downloadSafetyPosterPng(lang: 'en' | 'hi') {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 1200, 1600);

  ctx.fillStyle = '#0284C7';
  ctx.fillRect(0, 0, 1200, 260);

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 58px sans-serif';
  ctx.fillText(lang === 'en' ? 'CYBER SECURITY ALERT' : 'साइबर सुरक्षा चेतावनी', 600, 115);

  ctx.font = 'bold 34px monospace';
  ctx.fillStyle = '#E0F2FE';
  ctx.fillText('HELPLINE: 1930  |  CYBERCRIME.GOV.IN', 600, 195);

  const rules =
    lang === 'en'
      ? [
          ['01. NEVER SHARE OTP OR UPI PIN', 'Banks or police never ask for OTP, PIN, or CVV over call.'],
          ['02. QR CODE IS ONLY FOR SENDING', 'Never scan a QR code or enter UPI PIN to receive money.'],
          ['03. CHECK DOMAIN BEFORE CLICKING', 'Verify official .gov.in or bank URLs; avoid .xyz/.apk links.'],
          ['04. NO SCREEN SHARING APPS', 'Never install AnyDesk or TeamViewer for refunds or KYC.'],
          ['05. ACT IN THE GOLDEN HOUR', 'Call 1930 immediately and report at cybercrime.gov.in.'],
        ]
      : [
          ['01. OTP या UPI पिन कभी न बताएं', 'कोई भी बैंक या अधिकारी फोन पर OTP, पिन या CVV नहीं मांगता।'],
          ['02. पैसे पाने के लिए QR स्कैन न करें', 'QR स्कैन करने और पिन डालने से पैसे कटते हैं, आते नहीं।'],
          ['03. लिंक का असली डोमेन जांचें', '.gov.in या आधिकारिक ऐप का उपयोग करें; .apk फाइल न खोलें।'],
          ['04. स्क्रीन-शेयरिंग ऐप से बचें', 'रिफंड या KYC के नाम पर AnyDesk / TeamViewer न डालें।'],
          ['05. तुरंत 1930 पर कॉल करें', 'ठगी होने पर पहले घंटे में 1930 और cybercrime.gov.in पर रिपोर्ट करें।'],
        ];

  let y = 370;
  for (const [heading, body] of rules) {
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(80, y - 55, 1040, 175);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, y - 55, 1040, 175);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(heading, 120, y);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '24px sans-serif';
    ctx.fillText(body, 120, y + 55);
    y += 215;
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '22px sans-serif';
  ctx.fillText(
    'Cyber Security Awareness Initiative · Arjun Kumar (COPA, Sir C. V. Raman ITI, Dheerpur)',
    600,
    1510,
  );

  const link = document.createElement('a');
  link.download = `Cyber_Security_1930_Poster_${lang.toUpperCase()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

