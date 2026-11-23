export type Lang = 'en' | 'hi';

export interface BilingualText {
  en: string;
  hi: string;
}

export interface ThreatItem {
  id: string;
  category: 'phishing' | 'payments' | 'passwords' | 'devices';
  categoryLabel: BilingualText;
  title: BilingualText;
  summary: BilingualText;
  warningSigns: { en: string[]; hi: string[] };
  protectionSteps: { en: string[]; hi: string[] };
  riskLevel: BilingualText;
}

export interface ScamScenario {
  id: string;
  channel: BilingualText;
  title: BilingualText;
  messagePreview: BilingualText;
  question: BilingualText;
  options: {
    id: string;
    label: BilingualText;
    isSafe: boolean;
    feedback: BilingualText;
  }[];
  redFlags: { en: string[]; hi: string[] };
}

export interface ChecklistItem {
  id: string;
  category: 'accounts' | 'payments' | 'browsing' | 'devices';
  categoryLabel: BilingualText;
  title: BilingualText;
  detail: BilingualText;
}

export interface QuizQuestion {
  id: number;
  topic: BilingualText;
  question: BilingualText;
  options: { en: string; hi: string }[];
  correctIndex: number;
  explanation: BilingualText;
}

export const STUDENT_PROJECT_INFO = {
  projectTitle: 'Cyber Security',
  tagline: {
    en: 'Stay Alert · Stay Safe · Stay Secure',
    hi: 'सतर्क रहें · सुरक्षित रहें · साइबर सुरक्षित रहें',
  },
  studentName: 'Arjun Kumar',
  trade: 'COPA – Computer Operator and Programming Assistant',
  itiName: 'Sir C. V. Raman, Dheerpur',
  email: 'arjun12586456@gmail.com',
  contact: '9015658690',
};

export const UI_COPY = {
  nav: {
    guide: { en: 'How to Use', hi: 'कैसे उपयोग करें' },
    tools: { en: 'Safety Tools', hi: 'सुरक्षा टूल्स' },
    directory: { en: 'Directory', hi: 'हेल्पलाइन सूची' },
    quiz: { en: 'Cyber Quiz', hi: 'साइबर क्विज़' },
    emergency: { en: 'Report Fraud', hi: 'शिकायत दर्ज करें' },
    cta: { en: 'Helpline 1930', hi: 'हेल्पलाइन 1930' },
  },
  hero: {
    kicker: {
      en: 'Stay Alert · Stay Safe · Stay Secure',
      hi: 'सतर्क रहें · सुरक्षित रहें · डिजिटल सुरक्षा अपनाएं',
    },
    title: {
      en: 'Practical cyber security tools for safer everyday internet use',
      hi: 'सुरक्षित इंटरनेट उपयोग के लिए व्यावहारिक साइबर सुरक्षा टूल्स',
    },
    subtitle: {
      en: 'Cyber Security is a bilingual awareness platform helping citizens test password strength and data leaks, decode UPI QR codes, inspect phishing links, consult AI Cyber Sahayak, verify file safety, and act fast during cyber emergencies.',
      hi: 'Cyber Security एक द्विभाषी जागरूकता मंच है जो पासवर्ड और डेटा-लीक जांचने, UPI QR कोड डिकोड करने, संदिग्ध लिंक पहचानने, AI साइबर सहायक से सलाह लेने, फाइल सुरक्षा जांचने और साइबर आपातकाल में तुरंत कदम उठाने में मदद करता है।',
    },
    primaryBtn: { en: 'Open Safety Tools', hi: 'सुरक्षा टूल्स खोलें' },
    secondaryBtn: { en: 'How to Use Guide', hi: 'इस्तेमाल करने की गाइड' },
    missionHeading: { en: 'Project Mission', hi: 'परियोजना का उद्देश्य' },
    missionBody: {
      en: 'Explain common cyber threats in simple language, encourage strong unique passwords with two-factor authentication, teach users to verify suspicious requests, and share official India cybercrime reporting channels.',
      hi: 'आम भाषा में साइबर खतरों को समझाना, मजबूत पासवर्ड और टू-फैक्टर ऑथेंटिकेशन को बढ़ावा देना, संदिग्ध लिंक की जांच सिखाना और भारत के आधिकारिक साइबर क्राइम हेल्पलाइन की जानकारी देना।',
    },
  },
  workbench: {
    heading: { en: 'Advanced Cyber Safety Tools', hi: 'एडवांस साइबर सुरक्षा टूल्स' },
    subheading: {
      en: 'Browser-first security utilities plus AI Cyber Sahayak for real-time scam guidance.',
      hi: 'ब्राउज़र-आधारित सुरक्षा टूल्स और तुरंत ठगी पहचान के लिए AI साइबर सहायक।',
    },
    tabs: {
      password: { en: 'Password & Breach', hi: 'पासवर्ड और लीक जांच' },
      phishing: { en: 'Link, SMS & UPI QR', hi: 'लिंक, SMS और QR' },
      assistant: { en: 'AI Cyber Sahayak', hi: 'AI साइबर सहायक' },
      files: { en: 'File & Photo Privacy', hi: 'फाइल और फोटो सुरक्षा' },
      scam: { en: 'Scam Simulator', hi: 'धोखाधड़ी सिम्युलेटर' },
      audit: { en: 'Security Audit', hi: 'सुरक्षा ऑडिट' },
    },
  },
};

export const THREAT_GUIDE_ITEMS: ThreatItem[] = [
  {
    id: 'phishing-links',
    category: 'phishing',
    categoryLabel: { en: 'Phishing & Links', hi: 'फ़िशिंग और संदिग्ध लिंक' },
    title: {
      en: 'Phishing Messages & Lookalike Links',
      hi: 'फ़िशिंग संदेश और नकली वेबसाइट लिंक',
    },
    summary: {
      en: 'Attackers send urgent SMS, WhatsApp, or email messages pretending to be your bank, electricity board, or courier service to trick you into clicking fake login links.',
      hi: 'ठग बैंक, बिजली विभाग या कूरियर कंपनी का नाम लेकर जरूरी संदेश भेजते हैं और नकली लिंक पर क्लिक करवाकर आपकी लॉगिन जानकारी चुराते हैं।',
    },
    warningSigns: {
      en: [
        'Misspelled domain names like sbi-kyc-update.xyz instead of onlinesbi.sbi',
        'Urgent threats claiming your account or SIM will be blocked in 2 hours',
        'Shortened links (bit.ly, tinyurl) asking for banking or Aadhaar KYC details',
      ],
      hi: [
        'असली वेबसाइट से मिलती-जुलती गलत स्पेलिंग (जैसे sbi-kyc-update.xyz)',
        '2 घंटे में खाता, सिम या बिजली कनेक्शन बंद होने की धमकी',
        'अज्ञात छोटे लिंक (bit.ly) पर क्लिक करके KYC अपडेट करने की मांग',
      ],
    },
    protectionSteps: {
      en: [
        'Always open official bank apps or type official website URLs manually',
        'Inspect the exact domain name before the first single slash (/)',
        'Enable spam protection in SMS and email clients',
      ],
      hi: [
        'हमेशा आधिकारिक बैंक ऐप खोलें या स्वयं सही वेबसाइट पता टाइप करें',
        'लिंक में पहले स्लैश (/) से ठीक पहले वाले मुख्य डोमेन नाम को ध्यान से पढ़ें',
        'किसी भी संदिग्ध लिंक पर बैंक लॉगिन, पिन या कार्ड नंबर कभी न भरें',
      ],
    },
    riskLevel: { en: 'High Risk', hi: 'उच्च जोखिम' },
  },
  {
    id: 'upi-otp-scams',
    category: 'payments',
    categoryLabel: { en: 'UPI & Banking Fraud', hi: 'UPI और बैंकिंग धोखाधड़ी' },
    title: {
      en: 'OTP, UPI PIN & Collect Request Traps',
      hi: 'OTP, UPI पिन और नकली पेमेंट रिक्वेस्ट ठगी',
    },
    summary: {
      en: 'Fraudsters trick victims into entering their UPI PIN or scanning a QR code under the false excuse of receiving a cashback, refund, or OLX payment.',
      hi: 'ठग कैशबैक, रिफंड या सामान खरीदने के बहाने आपसे QR कोड स्कैन करवाते हैं या UPI पिन डालने को कहते हैं, जिससे पैसे मिलने की जगह कट जाते हैं।',
    },
    warningSigns: {
      en: [
        'Someone insists you enter your UPI PIN or scan a QR code to RECEIVE money',
        'Caller asks for a 6-digit OTP to "cancel a wrong transaction"',
        'Requests to install remote screen-sharing apps like AnyDesk or QuickSupport',
      ],
      hi: [
        'पैसे प्राप्त करने के लिए QR कोड स्कैन करने या UPI पिन डालने को कहना',
        'गलत ट्रांजेक्शन रद्द करने के नाम पर 6 अंकों का OTP पूछना',
        'मदद के नाम पर AnyDesk या TeamViewer जैसे स्क्रीन-शेयरिंग ऐप डाउनलोड करवाना',
      ],
    },
    protectionSteps: {
      en: [
        'Remember: UPI PIN is ONLY required to SEND money, never to receive money',
        'Read the UPI app prompt carefully—check if it says "Pay" or "Receive"',
        'Never share OTPs with bank staff, customer care, or relatives over phone',
      ],
      hi: [
        'याद रखें: पैसे प्राप्त करने के लिए कभी भी UPI पिन या QR स्कैन की जरूरत नहीं होती',
        'पिन डालने से पहले स्क्रीन पर देखें कि "Pay" लिखा है या नहीं',
        'कस्टमर केयर या बैंक अधिकारी बनकर फोन करने वाले को भी OTP न बताएं',
      ],
    },
    riskLevel: { en: 'Critical Risk', hi: 'गंभीर जोखिम' },
  },
  {
    id: 'weak-passwords',
    category: 'passwords',
    categoryLabel: { en: 'Password Security', hi: 'पासवर्ड सुरक्षा' },
    title: {
      en: 'Weak, Predictable & Reused Passwords',
      hi: 'कमजोर और बार-बार दोहराए गए पासवर्ड',
    },
    summary: {
      en: 'Using birthdates, mobile numbers, or the same password across multiple apps lets attackers break into all your accounts if just one website suffers a data leak.',
      hi: 'जन्मतिथि, मोबाइल नंबर या एक ही पासवर्ड हर जगह इस्तेमाल करने से एक वेबसाइट के लीक होते ही आपके सभी जरूरी खाते खतरे में पड़ जाते हैं।',
    },
    warningSigns: {
      en: [
        'Passwords shorter than 10 characters or containing your name/phone number',
        'Using identical credentials for email, banking, and social media',
        'Lack of Two-Factor Authentication (2FA) on primary email and UPI accounts',
      ],
      hi: [
        '10 अक्षरों से छोटा पासवर्ड या नाम/मोबाइल नंबर का उपयोग',
        'ईमेल, बैंकिंग और सोशल मीडिया सभी के लिए एक ही पासवर्ड रखना',
        'मुख्य ईमेल और सोशल मीडिया खातों पर टू-फैक्टर ऑथेंटिकेशन (2FA) बंद होना',
      ],
    },
    protectionSteps: {
      en: [
        'Use a unique passphrase of at least 12–16 characters for every important account',
        'Combine uppercase, lowercase, numbers, and symbols',
        'Turn on App-based 2FA or biometric lock on all financial and email apps',
      ],
      hi: [
        'हर महत्वपूर्ण खाते के लिए कम से कम 12–16 अक्षरों का अलग पासवर्ड बनाएं',
        'बड़े-छोटे अक्षर, अंक और विशेष चिह्न (@, #, $) मिलाकर उपयोग करें',
        'ईमेल और बैंकिंग ऐप्स में टू-फैक्टर ऑथेंटिकेशन (2FA) जरूर चालू करें',
      ],
    },
    riskLevel: { en: 'High Risk', hi: 'उच्च जोखिम' },
  },
  {
    id: 'fake-websites-apk',
    category: 'devices',
    categoryLabel: { en: 'Fake Websites & APKs', hi: 'नकली वेबसाइट और APK फाइलें' },
    title: {
      en: 'Fraudulent Shopping Pages & Malicious APK Files',
      hi: 'नकली शॉपिंग पेज और खतरनाक APK ऐप्स',
    },
    summary: {
      en: 'Fake e-commerce sites advertise unbelievable discounts while malicious .APK files sent on WhatsApp ("Wedding Card" or "Traffic Challan") steal SMS OTPs silently.',
      hi: 'नकली शॉपिंग वेबसाइट भारी छूट का लालच देती हैं और WhatsApp पर भेजी गई नकली .APK फाइलें (जैसे शादी का कार्ड या ई-चालान) आपके फोन के SMS और OTP चुरा लेती हैं।',
    },
    warningSigns: {
      en: [
        'WhatsApp files ending in .apk disguised as wedding invitations or challans',
        'Websites lacking HTTPS padlock or showing unbelievable 90% festive discounts',
        'Customer care phone numbers found on unverified Google search ads',
      ],
      hi: [
        'WhatsApp पर शादी के कार्ड या ट्रैफिक चालान के नाम से आई .apk फाइल',
        'बिना HTTPS ताले वाली वेबसाइट और 90% छूट जैसे अविश्वसनीय ऑफर',
        'सर्च इंजन के विज्ञापनों में मिलने वाले फर्जी कस्टमर केयर नंबर',
      ],
    },
    protectionSteps: {
      en: [
        'Install apps strictly from Google Play Store or Apple App Store',
        'Disable "Install Unknown Apps" permission in Android settings',
        'Find customer support numbers only inside official apps or official websites',
      ],
      hi: [
        'ऐप्स केवल Google Play Store या Apple App Store से ही डाउनलोड करें',
        'WhatsApp से आई किसी भी .apk फाइल को कभी इंस्टॉल न करें',
        'कस्टमर केयर नंबर हमेशा कंपनी की आधिकारिक वेबसाइट या ऐप से ही लें',
      ],
    },
    riskLevel: { en: 'High Risk', hi: 'उच्च जोखिम' },
  },
];

export const SCAM_SCENARIOS: ScamScenario[] = [
  {
    id: 'qr-receive',
    channel: { en: 'OLX / Marketplace Call', hi: 'ऑनलाइन खरीद-बिक्री कॉल' },
    title: {
      en: 'Buyer sends a QR Code to "pay" you ₹8,500',
      hi: 'खरीदार आपको ₹8,500 भेजने के लिए QR कोड भेजता है',
    },
    messagePreview: {
      en: '"Sir, I am sending ₹8,500 advance for your bicycle. Scan this QR code and enter your UPI PIN so the money enters your bank account immediately."',
      hi: '"सर, मैं आपकी साइकिल के लिए ₹8,500 एडवांस भेज रहा हूँ। कृपया यह QR कोड स्कैन करें और अपना UPI पिन डालें ताकि पैसे तुरंत आपके खाते में आ जाएं।"',
    },
    question: {
      en: 'What should you do when someone asks you to scan a QR code or enter your UPI PIN to receive money?',
      hi: 'जब कोई पैसे भेजने के नाम पर आपसे QR कोड स्कैन करने या UPI पिन डालने को कहे तो क्या करें?',
    },
    options: [
      {
        id: 'scan',
        label: {
          en: 'Scan the QR code and enter PIN to claim ₹8,500',
          hi: '₹8,500 पाने के लिए QR स्कैन करके पिन डाल दें',
        },
        isSafe: false,
        feedback: {
          en: 'Trap triggered! Scanning a QR code and entering your UPI PIN authorizes a DEBIT (payment out of your account), never a credit.',
          hi: 'सावधान! यह ठगी का जाल है। QR कोड स्कैन करके UPI पिन डालने से पैसे खाते में आते नहीं, बल्कि आपके खाते से कट जाते हैं।',
        },
      },
      {
        id: 'refuse',
        label: {
          en: 'Refuse immediately — receiving money never needs a UPI PIN',
          hi: 'तुरंत मना करें — पैसे पाने के लिए कभी पिन की जरूरत नहीं होती',
        },
        isSafe: true,
        feedback: {
          en: 'Correct! In UPI, you only share your UPI ID or your own QR code to receive money. You NEVER scan someone else’s code or enter your PIN.',
          hi: 'बिल्कुल सही! पैसे प्राप्त करने के लिए केवल अपनी UPI ID या अपना QR कोड देना होता है। कभी किसी का QR स्कैन न करें और न ही पिन डालें।',
        },
      },
    ],
    redFlags: {
      en: [
        'Asking the receiver to enter UPI PIN or scan a QR code',
        'Creating hurry ("Army officer / out of station, pay now")',
        'Sending a fake ₹1 test payment first to build trust',
      ],
      hi: [
        'पैसे लेने वाले व्यक्ति से UPI पिन या QR कोड स्कैन मांगना',
        'जल्दबाजी दिखाना और भरोसे के लिए पहले ₹1 भेजना',
        'UPI ऐप में "Pay" स्क्रीन दिखना',
      ],
    },
  },
  {
    id: 'kyc-sms',
    channel: { en: 'SMS Phishing Alert', hi: 'SMS फ़िशिंग अलर्ट' },
    title: {
      en: 'Urgent Bank KYC Block Warning via SMS',
      hi: 'बैंक KYC बंद होने की नकली चेतावनी वाला SMS',
    },
    messagePreview: {
      en: '"Dear Customer, your SBI YONO account will be suspended tonight due to pending PAN KYC. Update immediately at http://sbi-pan-kyc88.xyz/verify"',
      hi: '"प्रिय ग्राहक, आपका SBI YONO खाता पैन KYC के कारण आज रात बंद हो जाएगा। तुरंत इस लिंक पर अपडेट करें: http://sbi-pan-kyc88.xyz/verify"',
    },
    question: {
      en: 'How should you respond to this urgent SMS?',
      hi: 'इस जरूरी दिखने वाले SMS पर आपकी प्रतिक्रिया क्या होनी चाहिए?',
    },
    options: [
      {
        id: 'click',
        label: {
          en: 'Open the link quickly before the account gets blocked',
          hi: 'खाता बंद होने से पहले तुरंत लिंक खोलकर जानकारी भर दें',
        },
        isSafe: false,
        feedback: {
          en: 'Unsafe! Look at the URL: http:// (not HTTPS) and sbi-pan-kyc88.xyz. This is a fake phishing page designed to steal your netbanking password and OTP.',
          hi: 'असुरक्षित! लिंक देखें: http://sbi-pan-kyc88.xyz एक नकली वेबसाइट है। यह आपका पासवर्ड और OTP चुराने के लिए बनाई गई है।',
        },
      },
      {
        id: 'verify',
        label: {
          en: 'Ignore the link and check directly inside the official bank app or branch',
          hi: 'लिंक को अनदेखा करें और सीधे आधिकारिक बैंक ऐप या शाखा से जांच करें',
        },
        isSafe: true,
        feedback: {
          en: 'Great judgment! Real banks never ask you to update PAN/KYC through random .xyz links sent via personal mobile numbers.',
          hi: 'सही निर्णय! असली बैंक कभी भी .xyz जैसे अनजान लिंक भेजकर KYC अपडेट करने को नहीं कहते।',
        },
      },
    ],
    redFlags: {
      en: [
        'Unofficial domain ending in .xyz instead of .sbi or .co.in',
        'Uses HTTP instead of secure HTTPS',
        'Creates artificial panic ("suspended tonight")',
      ],
      hi: [
        '.sbi की जगह .xyz जैसा अनजान डोमेन नाम',
        'सुरक्षित HTTPS के बिना सामान्य HTTP लिंक',
        'डर और जल्दबाजी पैदा करने वाली भाषा ("आज रात बंद हो जाएगा")',
      ],
    },
  },
  {
    id: 'whatsapp-apk',
    channel: { en: 'WhatsApp Attachment', hi: 'WhatsApp फाइल संदेश' },
    title: {
      en: 'Unknown number sends "RTO_eChallan.apk" or "Wedding_Card.apk"',
      hi: 'अनजान नंबर से आई "RTO_eChallan.apk" या शादी के कार्ड की फाइल',
    },
    messagePreview: {
      en: '"Your vehicle has a pending traffic challan of ₹2,000. Download and open RTO_Challan_Notice.apk (4.2 MB) to view vehicle photo and fine receipt."',
      hi: '"आपके वाहन का ₹2,000 का ट्रैफिक चालान बकाया है। फोटो और रसीद देखने के लिए RTO_Challan_Notice.apk (4.2 MB) डाउनलोड करके खोलें।"',
    },
    question: {
      en: 'Is it safe to download and install this .apk file?',
      hi: 'क्या इस .apk फाइल को डाउनलोड और इंस्टॉल करना सुरक्षित है?',
    },
    options: [
      {
        id: 'install',
        label: {
          en: 'Install the file to check the challan photo',
          hi: 'चालान की फोटो देखने के लिए फाइल इंस्टॉल कर लें',
        },
        isSafe: false,
        feedback: {
          en: 'Dangerous! .apk files are Android application installers, NOT photos or PDFs. Installing it gives hackers access to read your SMS OTPs and banking notifications.',
          hi: 'खतरनाक! .apk फाइल कोई फोटो या PDF नहीं, बल्कि एक ऐप होता है। इसे इंस्टॉल करते ही ठग आपके फोन के सारे SMS और बैंक OTP पढ़ सकते हैं।',
        },
      },
      {
        id: 'delete',
        label: {
          en: 'Never install .apk files from WhatsApp — check echallan.parivahan.gov.in directly',
          hi: 'WhatsApp की .apk फाइल कभी न खोलें — सीधे echallan.parivahan.gov.in पर जांचें',
        },
        isSafe: true,
        feedback: {
          en: 'Smart move! Genuine government challans and wedding invites are checked on official .gov.in portals or sent as safe PDF/images, never .apk installers.',
          hi: 'बहुत बढ़िया! असली ई-चालान हमेशा सरकारी पोर्टल (.gov.in) पर देखा जाता है। कभी भी WhatsApp से आई .apk फाइल इंस्टॉल न करें।',
        },
      },
    ],
    redFlags: {
      en: [
        'File extension is .apk instead of .pdf or .jpg',
        'Sent from an unverified personal 10-digit WhatsApp number',
        'Triggers Android "Allow installing unknown apps" warning',
      ],
      hi: [
        '.pdf या .jpg की जगह .apk फाइल एक्सटेंशन',
        'किसी अनजान व्यक्तिगत नंबर से भेजा गया संदेश',
        'फोन में "Unknown Apps" की अनुमति मांगना',
      ],
    },
  },
  {
    id: 'screen-share',
    channel: { en: 'Fake Customer Support', hi: 'नकली कस्टमर केयर कॉल' },
    title: {
      en: 'Support caller asks you to install AnyDesk / TeamViewer for a refund',
      hi: 'रिफंड के नाम पर AnyDesk / QuickSupport ऐप डाउनलोड करवाना',
    },
    messagePreview: {
      en: '"Your ₹1,499 refund is stuck. Download QuickSupport from Play Store and read out the 9-digit screen code so our technician can credit the money."',
      hi: '"आपका ₹1,499 का रिफंड अटका हुआ है। Play Store से QuickSupport डाउनलोड करें और 9 अंकों का कोड बताएं ताकि हम पैसे भेज सकें।"',
    },
    question: {
      en: 'Should you share a screen-sharing code with customer care?',
      hi: 'क्या आपको कस्टमर केयर वाले को स्क्रीन-शेयरिंग कोड बताना चाहिए?',
    },
    options: [
      {
        id: 'share',
        label: {
          en: 'Download the app and share the 9-digit code',
          hi: 'ऐप डाउनलोड करके 9 अंकों का कोड बता दें',
        },
        isSafe: false,
        feedback: {
          en: 'Severe risk! Remote access apps let the scammer see your entire phone screen, steal OTPs, and even control your banking apps remotely.',
          hi: 'बड़ा खतरा! स्क्रीन-शेयरिंग कोड देने से ठग आपके फोन की पूरी स्क्रीन देख सकता है और आपके बैंक ऐप से पैसे निकाल सकता है।',
        },
      },
      {
        id: 'hangup',
        label: {
          en: 'Disconnect the call immediately and use official in-app support only',
          hi: 'तुरंत कॉल काटें और केवल आधिकारिक ऐप के अंदर सहायता विकल्प चुनें',
        },
        isSafe: true,
        feedback: {
          en: 'Spot on! No legitimate bank, courier, or e-commerce company ever asks for remote access to your phone to process a refund.',
          hi: 'सही कदम! कोई भी असली बैंक या कंपनी रिफंड देने के लिए कभी भी आपके फोन की स्क्रीन शेयर करने को नहीं कहती।',
        },
      },
    ],
    redFlags: {
      en: [
        'Asking to install AnyDesk, TeamViewer, or RustDesk',
        'Requesting a 9-digit remote access code',
        'Phone number picked from an online search ad rather than the official app',
      ],
      hi: [
        'AnyDesk, TeamViewer या QuickSupport इंस्टॉल करने का दबाव',
        '9 अंकों का स्क्रीन कोड मांगना',
        'आधिकारिक ऐप के बजाय विज्ञापन वाले नंबर से कॉल आना',
      ],
    },
  },
];

export const SAFETY_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'chk-1',
    category: 'accounts',
    categoryLabel: { en: 'Accounts & Passwords', hi: 'खाते और पासवर्ड' },
    title: {
      en: 'Use unique 12+ character passwords for email and banking',
      hi: 'ईमेल और बैंकिंग के लिए कम से कम 12 अक्षरों का अलग पासवर्ड रखें',
    },
    detail: {
      en: 'Never reuse your main email password on shopping or gaming websites.',
      hi: 'अपने मुख्य ईमेल का पासवर्ड किसी अन्य वेबसाइट या ऐप में न दोहराएं।',
    },
  },
  {
    id: 'chk-2',
    category: 'accounts',
    categoryLabel: { en: 'Accounts & Passwords', hi: 'खाते और पासवर्ड' },
    title: {
      en: 'Enable Two-Factor Authentication (2FA) on Gmail, WhatsApp & banking',
      hi: 'Gmail, WhatsApp और बैंकिंग पर टू-फैक्टर ऑथेंटिकेशन (2FA) चालू करें',
    },
    detail: {
      en: 'In WhatsApp, turn on Two-Step Verification PIN so no one can hijack your number.',
      hi: 'WhatsApp सेटिंग्स में Two-Step Verification पिन जरूर सेट करें।',
    },
  },
  {
    id: 'chk-3',
    category: 'payments',
    categoryLabel: { en: 'Payments & UPI', hi: 'पेमेंट और UPI' },
    title: {
      en: 'Keep separate daily transaction limits on UPI & debit cards',
      hi: 'UPI और डेबिट कार्ड पर दैनिक लेनदेन की सीमा (Limit) कम सेट रखें',
    },
    detail: {
      en: 'Disable international transactions on cards unless traveling abroad.',
      hi: 'जरूरत न होने पर कार्ड में इंटरनेशनल और ऑनलाइन टैप-एंड-पे बंद रखें।',
    },
  },
  {
    id: 'chk-4',
    category: 'payments',
    categoryLabel: { en: 'Payments & UPI', hi: 'पेमेंट और UPI' },
    title: {
      en: 'Never enter UPI PIN or share OTP to receive refunds or prizes',
      hi: 'पैसे या रिफंड पाने के लिए कभी भी UPI पिन न डालें और न OTP बताएं',
    },
    detail: {
      en: 'Always verify whether a UPI prompt says "Pay" or "Collect Request".',
      hi: 'पिन डालने से पहले स्क्रीन पर "Pay" या "Collect" जरूर जांचें।',
    },
  },
  {
    id: 'chk-5',
    category: 'browsing',
    categoryLabel: { en: 'Links & Browsing', hi: 'लिंक और ब्राउज़िंग' },
    title: {
      en: 'Verify HTTPS padlock and exact domain spelling before logging in',
      hi: 'लॉगिन से पहले HTTPS ताला और वेबसाइट के डोमेन की सही स्पेलिंग जांचें',
    },
    detail: {
      en: 'Do not log into bank sites clicked from forwarded SMS or WhatsApp links.',
      hi: 'SMS या WhatsApp में आए लिंक से कभी बैंक लॉगिन न करें।',
    },
  },
  {
    id: 'chk-6',
    category: 'browsing',
    categoryLabel: { en: 'Links & Browsing', hi: 'लिंक और ब्राउज़िंग' },
    title: {
      en: 'Avoid banking or password entry over free public Wi-Fi',
      hi: 'फ्री पब्लिक Wi-Fi पर नेटबैंकिंग या पासवर्ड का इस्तेमाल न करें',
    },
    detail: {
      en: 'Switch to personal mobile data when making digital payments outside.',
      hi: 'बाहर ऑनलाइन पेमेंट करते समय हमेशा अपने मोबाइल डेटा का उपयोग करें।',
    },
  },
  {
    id: 'chk-7',
    category: 'devices',
    categoryLabel: { en: 'Devices & Apps', hi: 'डिवाइस और ऐप्स' },
    title: {
      en: 'Keep Android/iOS, browsers, and antivirus software updated',
      hi: 'अपने फोन का OS, ब्राउज़र और ऐप्स को हमेशा अपडेट रखें',
    },
    detail: {
      en: 'Security patches close critical flaws exploited by spyware.',
      hi: 'नए अपडेट फोन की सुरक्षा कमियों को ठीक करते हैं।',
    },
  },
  {
    id: 'chk-8',
    category: 'devices',
    categoryLabel: { en: 'Devices & Apps', hi: 'डिवाइस और ऐप्स' },
    title: {
      en: 'Block unknown .APK files and unnecessary app permissions',
      hi: 'अनजान .APK फाइलें इंस्टॉल न करें और अनावश्यक ऐप अनुमतियां बंद करें',
    },
    detail: {
      en: 'Review which apps have SMS, Accessibility, and Location permissions.',
      hi: 'जांचें कि किन ऐप्स के पास SMS और स्क्रीन एक्सेस की अनुमति है।',
    },
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: { en: 'UPI Safety', hi: 'UPI सुरक्षा' },
    question: {
      en: 'Someone wants to send you ₹2,000 via UPI. What do you need to enter on your phone?',
      hi: 'कोई व्यक्ति आपको UPI से ₹2,000 भेजना चाहता है। आपको अपने फोन में क्या डालना होगा?',
    },
    options: [
      { en: 'Your 4 or 6-digit UPI PIN', hi: 'अपना 4 या 6 अंकों का UPI पिन' },
      { en: 'Your ATM card CVV number', hi: 'अपने ATM कार्ड का CVV नंबर' },
      { en: 'Nothing — you do not enter a PIN to receive money', hi: 'कुछ भी नहीं — पैसे पाने के लिए पिन नहीं डालना होता' },
      { en: 'A screen-sharing code on AnyDesk', hi: 'AnyDesk पर स्क्रीन शेयरिंग कोड' },
    ],
    correctIndex: 2,
    explanation: {
      en: 'You never enter a UPI PIN, OTP, or CVV to receive money. A UPI PIN is strictly required only when sending money out of your account.',
      hi: 'पैसे प्राप्त करने के लिए कभी भी UPI पिन, OTP या CVV डालने की जरूरत नहीं होती। पिन केवल पैसे भेजने के लिए होता है।',
    },
  },
  {
    id: 2,
    topic: { en: 'India Helpline', hi: 'राष्ट्रीय हेल्पलाइन' },
    question: {
      en: 'What is the official National Cyber Crime Helpline number in India for reporting financial fraud?',
      hi: 'भारत में वित्तीय साइबर धोखाधड़ी की तुरंत शिकायत करने के लिए आधिकारिक हेल्पलाइन नंबर क्या है?',
    },
    options: [
      { en: '1930', hi: '1930' },
      { en: '1080', hi: '1080' },
      { en: '1400', hi: '1400' },
      { en: '1888', hi: '1888' },
    ],
    correctIndex: 0,
    explanation: {
      en: 'Call 1930 immediately (within the Golden Hour) and file a complaint at cybercrime.gov.in to help freeze the fraudulent money trail.',
      hi: 'वित्तीय धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें और cybercrime.gov.in पर रिपोर्ट दर्ज कराएं ताकि पैसे को फ्रीज किया जा सके।',
    },
  },
  {
    id: 3,
    topic: { en: 'Phishing Links', hi: 'फ़िशिंग लिंक' },
    question: {
      en: 'Which of these URLs is the safest indicator of an authentic government portal in India?',
      hi: 'इनमें से कौन-सा वेबसाइट पता भारत के असली सरकारी पोर्टल का सही संकेत है?',
    },
    options: [
      { en: 'http://gov-india-kyc.xyz', hi: 'http://gov-india-kyc.xyz' },
      { en: 'https://cybercrime.gov.in', hi: 'https://cybercrime.gov.in' },
      { en: 'https://cybercrime-india.top/login', hi: 'https://cybercrime-india.top/login' },
      { en: 'http://192.168.45.12/gov', hi: 'http://192.168.45.12/gov' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Official Indian government sites use HTTPS and end with .gov.in or .nic.in. Domains like .xyz, .top, or raw IP addresses are common phishing red flags.',
      hi: 'भारत की आधिकारिक सरकारी वेबसाइटें HTTPS के साथ .gov.in या .nic.in पर समाप्त होती हैं। .xyz या .top जैसे लिंक फर्जी हो सकते हैं।',
    },
  },
  {
    id: 4,
    topic: { en: 'Password Security', hi: 'पासवर्ड सुरक्षा' },
    question: {
      en: 'Which of the following is the strongest password practice?',
      hi: 'इनमें से सबसे सुरक्षित पासवर्ड बनाने का सही तरीका कौन-सा है?',
    },
    options: [
      { en: 'Your date of birth and first name (e.g. Arjun1999)', hi: 'अपना नाम और जन्म वर्ष (जैसे Arjun1999)' },
      { en: '1234567890 so it is easy to remember', hi: '1234567890 ताकि याद रखना आसान हो' },
      { en: 'A unique 14-character mix of upper/lowercase letters, numbers, and symbols', hi: 'हर खाते के लिए 14 अक्षरों का अलग और जटिल पासवर्ड (अक्षर, अंक और चिह्न)' },
      { en: 'Using the same strong password on every website', hi: 'हर वेबसाइट पर एक ही मजबूत पासवर्ड इस्तेमाल करना' },
    ],
    correctIndex: 2,
    explanation: {
      en: 'Every important account needs its own unique, long password (12+ characters) mixing letters, numbers, and symbols so one breach never compromises other accounts.',
      hi: 'हर जरूरी खाते का पासवर्ड अलग और कम से कम 12–14 अक्षरों का होना चाहिए जिसमें बड़े-छोटे अक्षर, अंक और चिह्न शामिल हों।',
    },
  },
  {
    id: 5,
    topic: { en: 'Malicious Files', hi: 'खतरनाक फाइलें' },
    question: {
      en: 'You receive a WhatsApp message from an unknown number with a file named "Marriage_Invitation.apk". What should you do?',
      hi: 'WhatsApp पर अनजान नंबर से "Marriage_Invitation.apk" नाम की फाइल आती है। आपको क्या करना चाहिए?',
    },
    options: [
      { en: 'Download and install it to see whose wedding it is', hi: 'किसकी शादी है यह देखने के लिए फाइल इंस्टॉल करें' },
      { en: 'Forward it to family members to ask them', hi: 'परिवार के ग्रुप में फॉरवर्ड करके पूछें' },
      { en: 'Delete it without opening and block the sender', hi: 'बिना खोले डिलीट करें और भेजने वाले को ब्लॉक करें' },
      { en: 'Disable your phone lock and open it', hi: 'फोन का लॉक हटाकर फाइल खोलें' },
    ],
    correctIndex: 2,
    explanation: {
      en: 'Wedding invitations are photos or PDFs, never .apk Android installer files. Malware .apk files silently steal SMS OTPs and banking credentials.',
      hi: 'शादी का कार्ड कभी .apk फाइल में नहीं आता। यह एक खतरनाक ऐप होता है जो आपके फोन से बैंक OTP और निजी डेटा चुरा सकता है।',
    },
  },
  {
    id: 6,
    topic: { en: '2FA Protection', hi: 'टू-फैक्टर सुरक्षा' },
    question: {
      en: 'What does Two-Factor Authentication (2FA) add to your account?',
      hi: 'टू-फैक्टर ऑथेंटिकेशन (2FA) आपके खाते में क्या अतिरिक्त सुरक्षा जोड़ता है?',
    },
    options: [
      { en: 'It makes your internet speed twice as fast', hi: 'यह इंटरनेट की स्पीड दोगुनी कर देता है' },
      { en: 'It requires a second verification step (OTP / authenticator code) beyond your password', hi: 'यह पासवर्ड के अलावा एक और सत्यापन (OTP या ऐप कोड) मांगता है' },
      { en: 'It removes the need for a password completely', hi: 'यह पासवर्ड की जरूरत खत्म कर देता है' },
      { en: 'It shares your login with customer support', hi: 'यह आपका लॉगिन कस्टमर सपोर्ट से जोड़ता है' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Even if a hacker steals your password, 2FA stops them from logging in because they do not have your second verification code.',
      hi: 'यदि किसी के पास आपका पासवर्ड आ भी जाए, तो भी 2FA कोड के बिना वह आपके खाते में लॉगिन नहीं कर पाएगा।',
    },
  },
  {
    id: 7,
    topic: { en: 'Public Wi-Fi', hi: 'पब्लिक Wi-Fi' },
    question: {
      en: 'Which activity should you AVOID while connected to free, unencrypted public Wi-Fi at a railway station or cafe?',
      hi: 'रेलवे स्टेशन या कैफे के फ्री पब्लिक Wi-Fi पर आपको इनमें से क्या करने से बचना चाहिए?',
    },
    options: [
      { en: 'Checking train arrival schedules', hi: 'ट्रेन का समय देखना' },
      { en: 'Reading public news articles', hi: 'सार्वजनिक समाचार पढ़ना' },
      { en: 'Logging into netbanking or entering credit card details', hi: 'नेटबैंकिंग लॉगिन करना या क्रेडिट कार्ड की जानकारी डालना' },
      { en: 'Checking the weather forecast', hi: 'मौसम की जानकारी देखना' },
    ],
    correctIndex: 2,
    explanation: {
      en: 'Public Wi-Fi networks can be monitored by attackers on the same network. Always switch to mobile data for banking or sensitive logins.',
      hi: 'पब्लिक Wi-Fi पर डेटा चोरी होने का खतरा रहता है। बैंकिंग या ऑनलाइन पेमेंट के लिए हमेशा अपने मोबाइल डेटा का इस्तेमाल करें।',
    },
  },
  {
    id: 8,
    topic: { en: 'Remote Access Scams', hi: 'स्क्रीन शेयरिंग ठगी' },
    question: {
      en: 'A caller claiming to be from your telecom provider asks you to install TeamViewer/AnyDesk to "activate 5G SIM". This is:',
      hi: 'टेलीकॉम कंपनी के नाम पर एक कॉलर 5G सिम चालू करने के लिए AnyDesk या TeamViewer इंस्टॉल करने को कहता है। यह क्या है?',
    },
    options: [
      { en: 'A standard telecom verification step', hi: 'एक सामान्य टेलीकॉम प्रक्रिया' },
      { en: 'A remote-access scam to take control of your device and steal banking money', hi: 'आपके फोन का कंट्रोल लेकर बैंक से पैसे चुराने की ठगी' },
      { en: 'Required for improving mobile signal', hi: 'मोबाइल नेटवर्क सुधारने के लिए जरूरी' },
      { en: 'A free antivirus installation', hi: 'फ्री एंटीवायरस इंस्टॉलेशन' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'No bank, SIM provider, or government office uses remote screen-sharing apps to upgrade services or issue refunds.',
      hi: 'कोई भी बैंक या टेलीकॉम कंपनी कभी भी सेवा चालू करने के लिए स्क्रीन-शेयरिंग ऐप इंस्टॉल करने को नहीं कहती।',
    },
  },
];

export interface ToolGuidanceStep {
  stepNumber: string;
  toolId: 'password' | 'phishing' | 'assistant' | 'files' | 'scam' | 'audit';
  title: BilingualText;
  whenToUse: BilingualText;
  steps: { en: string[]; hi: string[] };
}

export const TOOL_GUIDANCE_ITEMS: ToolGuidanceStep[] = [
  {
    stepNumber: '01',
    toolId: 'password',
    title: {
      en: 'Password Strength & Breach Check',
      hi: 'पासवर्ड और डेटा-लीक जांच',
    },
    whenToUse: {
      en: 'Before setting a new password or checking if an old password was leaked online.',
      hi: 'नया पासवर्ड रखने से पहले या यह जांचने के लिए कि पुराना पासवर्ड लीक तो नहीं हुआ।',
    },
    steps: {
      en: [
        'Type a sample password (avoid entering your live banking PIN) to inspect its entropy and crack time.',
        'Click "Check Data Breach" — only the first 5 characters of its SHA-1 hash are checked safely.',
        'Use the Generator slider (14–16 chars) to create a unique password and copy it.',
      ],
      hi: [
        'अपना पासवर्ड या सैंपल पासवर्ड लिखकर उसकी मजबूती और टूटने का समय देखें।',
        '"डेटा लीक जांचें" पर क्लिक करें — केवल SHA-1 हैश के पहले 5 अक्षरों से सुरक्षित जांच होती है।',
        'जनरेटर स्लाइडर (14–16 अक्षर) से नया मजबूत पासवर्ड बनाकर कॉपी करें।',
      ],
    },
  },
  {
    stepNumber: '02',
    toolId: 'phishing',
    title: {
      en: 'Link, SMS & UPI QR Code Decoder',
      hi: 'लिंक, SMS और UPI QR कोड जांच',
    },
    whenToUse: {
      en: 'Whenever you receive an unknown SMS link, KYC warning, or a payment QR code.',
      hi: 'जब कोई अनजान SMS लिंक, KYC चेतावनी या पैसे लेने/भेजने का QR कोड मिले।',
    },
    steps: {
      en: [
        'Switch between "Check URL", "Check SMS / WhatsApp", or "UPI QR Decoder".',
        'Paste a link/message OR upload a QR code screenshot to reveal the real owner domain or UPI receiver.',
        'Look at the highlighted "Real Owner Domain" or UPI ID before clicking or scanning in any payment app.',
      ],
      hi: [
        '"वेब लिंक", "SMS / WhatsApp" या "UPI QR डिकोडर" टैब चुनें।',
        'संदिग्ध लिंक/संदेश पेस्ट करें या QR कोड की फोटो अपलोड करें।',
        'असली मुख्य डोमेन या UPI ID और अमाउंट की जांच किए बिना कभी भुगतान न करें।',
      ],
    },
  },
  {
    stepNumber: '03',
    toolId: 'assistant',
    title: {
      en: 'AI Cyber Sahayak (Smart Scam Helper)',
      hi: 'AI साइबर सहायक (तुरंत मदद)',
    },
    whenToUse: {
      en: 'When you receive a confusing call, "Digital Arrest" threat, fake job offer, or scam message.',
      hi: 'जब कोई अजीब कॉल, "डिजिटल अरेस्ट" धमकी, नकली नौकरी या संदिग्ध संदेश आए।',
    },
    steps: {
      en: [
        'Describe the situation or paste the message text (never type OTPs, PINs, or passwords).',
        'Click "Analyze with AI Sahayak" to get a structured Risk Level and scam breakdown.',
        'Follow the recommended Next Steps immediately, including calling 1930 if money was lost.',
      ],
      hi: [
        'पूरी स्थिति लिखें या संदेश पेस्ट करें (कृपया अपना OTP, पिन या पासवर्ड कभी न लिखें)।',
        '"AI सहायक से जांचें" पर क्लिक करके जोखिम स्तर और ठगी का प्रकार जानें।',
        'दिए गए सुरक्षा कदमों का पालन करें और नुकसान होने पर तुरंत 1930 पर कॉल करें।',
      ],
    },
  },
  {
    stepNumber: '04',
    toolId: 'files',
    title: {
      en: 'File SHA-256 & Photo Privacy Cleaner',
      hi: 'फाइल सुरक्षा और फोटो प्राइवेसी टूल',
    },
    whenToUse: {
      en: 'Before opening downloaded files or before posting personal photos online.',
      hi: 'कोई डाउनलोड की गई फाइल खोलने से पहले या सोशल मीडिया पर फोटो डालने से पहले।',
    },
    steps: {
      en: [
        'Select any file to calculate its SHA-256 fingerprint and check for hidden .apk/.exe risks.',
        'Upload a photo in the Privacy Cleaner to remove hidden GPS location and camera details.',
        'Download the cleaned photo before sharing it on social media or public groups.',
      ],
      hi: [
        'किसी फाइल का SHA-256 कोड और .apk / .exe जोखिम जांचने के लिए फाइल चुनें।',
        'फोटो से GPS लोकेशन और कैमरा जानकारी हटाने के लिए फोटो अपलोड करें।',
        'साफ़ की गई नई फोटो को डाउनलोड करके सुरक्षित रूप से शेयर करें।',
      ],
    },
  },
];

export interface DirectoryEntry {
  id: string;
  category: 'government' | 'banks' | 'upi';
  name: BilingualText;
  number: string;
  website: string;
  purpose: BilingualText;
}

export const OFFICIAL_DIRECTORY_ITEMS: DirectoryEntry[] = [
  {
    id: 'dir-1930',
    category: 'government',
    name: { en: 'National Cyber Crime Helpline', hi: 'राष्ट्रीय साइबर क्राइम हेल्पलाइन' },
    number: '1930',
    website: 'https://cybercrime.gov.in',
    purpose: {
      en: '24×7 Golden Hour reporting for online financial, UPI & banking fraud across India.',
      hi: 'ऑनलाइन बैंकिंग, UPI और वित्तीय धोखाधड़ी की 24×7 तुरंत शिकायत के लिए।',
    },
  },
  {
    id: 'dir-chakshu',
    category: 'government',
    name: { en: 'Sanchar Saathi (Chakshu & Lost Phone)', hi: 'संचार साथी (चक्षु और फोन ब्लॉक)' },
    number: '1944 / Online',
    website: 'https://sancharsaathi.gov.in',
    purpose: {
      en: 'Report suspected fraud calls/SMS/WhatsApp and block stolen or lost mobile phones via IMEI.',
      hi: 'संदिग्ध फ्रॉड कॉल/SMS की रिपोर्ट करने और चोरी हुए फोन को IMEI से ब्लॉक करने के लिए।',
    },
  },
  {
    id: 'dir-112',
    category: 'government',
    name: { en: 'Emergency Police / Women & Child Safety', hi: 'आपातकालीन पुलिस सहायता' },
    number: '112',
    website: 'https://cybercrime.gov.in',
    purpose: {
      en: 'Immediate police assistance for cyber blackmail, extortion, or physical threat emergencies.',
      hi: 'ब्लैकमेलिंग, धमकी या तुरंत पुलिस सहायता की आवश्यकता होने पर।',
    },
  },
  {
    id: 'dir-sbi',
    category: 'banks',
    name: { en: 'State Bank of India (SBI)', hi: 'भारतीय स्टेट बैंक (SBI)' },
    number: '1800 1234 / 1800 2100',
    website: 'https://sbi.co.in',
    purpose: {
      en: 'Official toll-free support to block ATM cards, YONO, or report unauthorized transactions.',
      hi: 'ATM कार्ड, YONO ब्लॉक करने और अनधिकृत लेनदेन की रिपोर्ट करने के लिए।',
    },
  },
  {
    id: 'dir-hdfc',
    category: 'banks',
    name: { en: 'HDFC Bank', hi: 'HDFC बैंक' },
    number: '1800 1600 / 1800 2600',
    website: 'https://www.hdfcbank.com',
    purpose: {
      en: 'Official HDFC customer care and immediate card/netbanking fraud hotlisting.',
      hi: 'HDFC कार्ड या नेटबैंकिंग धोखाधड़ी पर तुरंत खाता ब्लॉक करने के लिए।',
    },
  },
  {
    id: 'dir-icici',
    category: 'banks',
    name: { en: 'ICICI Bank', hi: 'ICICI बैंक' },
    number: '1800 1080',
    website: 'https://www.icicibank.com',
    purpose: {
      en: 'Official ICICI 24×7 helpline for reporting suspicious UPI or card debits.',
      hi: 'संदिग्ध UPI या कार्ड लेनदेन की तुरंत सूचना देने के लिए।',
    },
  },
  {
    id: 'dir-pnb',
    category: 'banks',
    name: { en: 'Punjab National Bank (PNB)', hi: 'पंजाब नेशनल बैंक (PNB)' },
    number: '1800 1800 / 1800 2021',
    website: 'https://www.pnbindia.in',
    purpose: {
      en: 'Official PNB customer service for debit card blocking and fraud escalation.',
      hi: 'डेबिट कार्ड बंद कराने और साइबर शिकायत दर्ज कराने के लिए।',
    },
  },
  {
    id: 'dir-npci',
    category: 'upi',
    name: { en: 'NPCI UPI Dispute Portal', hi: 'NPCI UPI शिकायत पोर्टल' },
    number: 'In-App / Portal',
    website: 'https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism',
    purpose: {
      en: 'Official NPCI channel for unresolved UPI transaction disputes across PhonePe, GPay, Paytm & BHIM.',
      hi: 'PhonePe, GPay, Paytm और BHIM पर अटके या संदिग्ध UPI लेनदेन की शिकायत के लिए।',
    },
  },
];

