import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  Send,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import type { Lang } from '../data/cyberData';

interface CyberChatPanelProps {
  lang: Lang;
}

interface WebSource {
  title: string;
  uri: string;
}

interface MapSource {
  title: string;
  uri: string;
  placeId?: string;
  snippets?: { text: string; uri: string; author: string }[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modeUsed?: 'standard' | 'search' | 'maps';
  modelUsed?: string;
  webSources?: WebSource[];
  mapSources?: MapSource[];
}

export function CyberChatPanel({ lang }: CyberChatPanelProps) {
  const [persona, setPersona] = useState<'educator' | 'investigator' | 'tutor'>('educator');
  const [groundingMode, setGroundingMode] = useState<'standard' | 'search' | 'maps'>('standard');
  const [speedMode, setSpeedMode] = useState<'balanced' | 'fast'>('balanced');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      text:
        lang === 'hi'
          ? 'नमस्ते! मैं Cyber Security AI हूँ। आप मुझसे संदिग्ध SMS, UPI ठगी, 2FA सेटिंग्स, ताज़ा साइबर अलर्ट (Google Search), या नजदीकी साइबर पुलिस स्टेशन (Google Maps) के बारे में पूछ सकते हैं।'
          : 'Hello! I am Cyber Security AI. Ask follow-up questions about suspicious messages, UPI safety, latest Indian scam alerts (Google Search Grounding), or nearby cyber crime cells (Google Maps Grounding).',
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoNote(
        lang === 'en' ? 'Geolocation unsupported.' : 'लोकेशन उपलब्ध नहीं है।',
      );
      return;
    }
    setGeoNote(lang === 'en' ? 'Getting location...' : 'लोकेशन ली जा रही है...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGeoNote(
          lang === 'en'
            ? `GPS attached (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`
            : `GPS जुड़ा (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
        );
      },
      () => {
        setGeoNote(
          lang === 'en' ? 'Permission denied.' : 'अनुमति नहीं मिली।',
        );
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };
    const nextHistory = [...messages.filter((m) => m.id !== 'welcome-1'), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/cyber-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          mode: groundingMode,
          speed: speedMode,
          persona,
          lang,
          ...(groundingMode === 'maps' && userCoords ? { location: userCoords } : {}),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Chat request failed.');
      }

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply || '',
        modeUsed: groundingMode,
        modelUsed: data.modelUsed,
        webSources: Array.isArray(data.webSources) ? data.webSources : [],
        mapSources: Array.isArray(data.mapSources) ? data.mapSources : [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Unable to reach Cyber Security AI.'
            : 'AI चैट से संपर्क नहीं हो सका।',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'model',
        text:
          lang === 'hi'
            ? 'नई चैट शुरू की गई है। अपना साइबर सुरक्षा प्रश्न पूछें।'
            : 'Started a fresh conversation. Ask your cyber safety question below.',
      },
    ]);
    setError(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Top Configuration Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            {lang === 'en' ? 'Grounding:' : 'मोड:'}
          </span>
          {(
            [
              { id: 'standard', en: 'Multi-Turn Chat', hi: 'सामान्य चैट', icon: MessageSquare },
              { id: 'search', en: 'Google Search Data', hi: 'Google Search डेटा', icon: Globe },
              { id: 'maps', en: 'Google Maps Data', hi: 'Google Maps डेटा', icon: MapPin },
            ] as const
          ).map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setGroundingMode(m.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  groundingMode === m.id
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{m[lang]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Assistant role"
            value={persona}
            onChange={(e) => setPersona(e.target.value as 'educator' | 'investigator' | 'tutor')}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-sky-600 focus:outline-none"
          >
            <option value="educator">
              {lang === 'en' ? 'Role: Cyber Educator' : 'भूमिका: सुरक्षा शिक्षक'}
            </option>
            <option value="investigator">
              {lang === 'en' ? 'Role: Scam Investigator' : 'भूमिका: ठगी जांचकर्ता'}
            </option>
            <option value="tutor">
              {lang === 'en' ? 'Role: ITI COPA Tutor' : 'भूमिका: COPA छात्र गाइड'}
            </option>
          </select>

          {groundingMode === 'standard' && (
            <select
              aria-label="Model speed"
              value={speedMode}
              onChange={(e) => setSpeedMode(e.target.value as 'balanced' | 'fast')}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="balanced">
                {lang === 'en' ? 'Balanced (Gemini 4 Hydrogen)' : 'संतुलित (Gemini 4 Hydrogen)'}
              </option>
              <option value="fast">
                {lang === 'en' ? 'Fast (Gemini 3.1 Flash Lite)' : 'तेज़ (Flash Lite)'}
              </option>
            </select>
          )}

          {groundingMode === 'maps' && (
            <button
              type="button"
              onClick={handleLocate}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 cursor-pointer whitespace-nowrap"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>{geoNote || (lang === 'en' ? 'Attach GPS' : 'GPS जोड़ें')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            title={lang === 'en' ? 'Clear chat' : 'चैट साफ करें'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Suggested Prompts tailored to active mode */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{lang === 'en' ? 'Try asking:' : 'उदाहरण प्रश्न:'}</span>
        {(groundingMode === 'search'
          ? [
              lang === 'en'
                ? 'Latest RBI & CERT-In UPI digital arrest scam alerts in India'
                : 'भारत में डिजिटल अरेस्ट और UPI ठगी के ताज़ा सरकारी अलर्ट',
              lang === 'en'
                ? 'How to block stolen SIM or phone on Sanchar Saathi Chakshu?'
                : 'संचार साथी चक्षु पोर्टल पर फर्जी कॉल या खोया फोन कैसे ब्लॉक करें?',
            ]
          : groundingMode === 'maps'
            ? [
                lang === 'en'
                  ? 'Cyber crime police station near North Delhi / Dheerpur'
                  : 'उत्तरी दिल्ली / धीरपुर के पास साइबर क्राइम पुलिस स्टेशन',
                lang === 'en'
                  ? 'Official National Cyber Crime reporting centers in New Delhi'
                  : 'नई दिल्ली में आधिकारिक साइबर क्राइम सहायता केंद्र',
              ]
            : [
                lang === 'en'
                  ? 'Someone sent a Wedding_Card.apk on WhatsApp, what should I do?'
                  : 'WhatsApp पर शादी के कार्ड की .apk फाइल आई है, क्या करूँ?',
                lang === 'en'
                  ? 'Teach me 3 signs of a fake UPI QR code'
                  : 'नकली UPI QR कोड पहचानने के 3 आसान नियम बताएं',
              ]
        ).map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void handleSend(prompt)}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="mt-4 h-[340px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-800'
              }`}
            >
              {msg.role === 'model' && (
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-sky-700">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Cyber Security AI</span>
                  {msg.modelUsed && (
                    <span className="font-mono text-[10px] text-slate-400">· {msg.modelUsed}</span>
                  )}
                </div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Google Search Grounding Sources */}
              {msg.webSources && msg.webSources.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <p className="text-[11px] font-semibold text-slate-600">
                    {lang === 'en' ? 'Verified Web Sources (Google Search):' : 'Google Search स्रोत:'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {msg.webSources.map((src, idx) => (
                      <a
                        key={`${src.uri}-${idx}`}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-800 hover:bg-sky-100"
                      >
                        <span className="max-w-[200px] truncate">{src.title}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Maps Grounding Sources & Review Snippets */}
              {msg.mapSources && msg.mapSources.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <p className="text-[11px] font-semibold text-slate-600">
                    {lang === 'en' ? 'Google Maps Places & Reviews:' : 'Google Maps स्थान लिंक:'}
                  </p>
                  <div className="mt-1.5 space-y-1.5">
                    {msg.mapSources.map((src, idx) => (
                      <div key={`${src.uri}-${idx}`} className="text-xs">
                        {src.uri ? (
                          <a
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline"
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{src.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="font-semibold text-slate-800">{src.title}</span>
                        )}
                        {src.snippets && src.snippets.length > 0 && (
                          <div className="ml-4 mt-0.5 flex flex-wrap gap-2">
                            {src.snippets.map((sn, sIdx) =>
                              sn.uri ? (
                                <a
                                  key={sIdx}
                                  href={sn.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-slate-600 underline hover:text-sky-700"
                                >
                                  {sn.author || 'Place review'}
                                </a>
                              ) : null,
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-700" />
            <span>
              {lang === 'en'
                ? 'Thinking and verifying cyber safety guidance...'
                : 'जानकारी जांची और तैयार की जा रही है...'}
            </span>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-900">
          <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === 'en'
              ? 'Ask a follow-up question, check a scam message, or search alerts...'
              : 'अपना प्रश्न लिखें या फॉलो-अप सवाल पूछें (OTP/पिन न डालें)...'
          }
          className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-45 cursor-pointer whitespace-nowrap"
        >
          <Send className="h-4 w-4" />
          <span>{lang === 'en' ? 'Send' : 'भेजें'}</span>
        </button>
      </form>
    </div>
  );
}
