import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Server-side k-Anonymity proxy for Have I Been Pwned password range lookup
  app.get('/api/pwned-prefix/:prefix', async (req, res) => {
    const prefix = (req.params.prefix || '').toUpperCase();
    if (!/^[0-9A-F]{5}$/.test(prefix)) {
      res.status(400).json({ error: 'Invalid hash prefix. Must be exactly 5 hexadecimal characters.' });
      return;
    }

    try {
      const upstream = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          'Add-Padding': 'true',
          'User-Agent': 'Cyber-Security-Awareness-App',
        },
      });
      if (!upstream.ok) {
        res.status(upstream.status).json({ error: 'Breach lookup service returned an error.' });
        return;
      }
      const text = await upstream.text();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach breach lookup service.';
      res.status(502).json({ error: msg });
    }
  });

  // Server-side Gemini AI Cyber Sahayak endpoint
  app.post('/api/cyber-assistant', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'AI Cyber Sahayak requires GEMINI_API_KEY configured in Settings > Secrets.',
      });
      return;
    }

    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const lang = req.body?.lang === 'hi' ? 'hi' : 'en';

    if (!query || query.length < 4) {
      res.status(400).json({ error: 'Please enter a message, link, or cyber safety question to analyze.' });
      return;
    }
    if (query.length > 2000) {
      res.status(400).json({ error: 'Input is too long. Please keep it under 2000 characters.' });
      return;
    }

    const systemInstruction =
      lang === 'hi'
        ? 'You are Cyber Sahayak, a helpful, calm Indian cyber security awareness educator. Analyze the user’s suspicious message, call scenario, or cyber safety question. Respond strictly in natural, clear Hindi (Devanagari script, simple everyday terms). Always identify scam patterns relevant to India (UPI/QR traps, KYC phishing, Digital Arrest, fake job/loan apps, .apk malware) and remind users to call 1930 or report on cybercrime.gov.in if financial loss or fraud occurred. Never ask for or collect passwords/OTPs.'
        : 'You are Cyber Sahayak, a helpful, calm Indian cyber security awareness educator. Analyze the user’s suspicious message, call scenario, or cyber safety question. Respond strictly in clear, simple English. Identify scam patterns relevant to India (UPI/QR traps, KYC phishing, Digital Arrest, fake job/loan apps, .apk malware) and remind users to call 1930 or report on cybercrime.gov.in if financial fraud occurred. Never ask for or collect passwords/OTPs.';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze this cyber security query or suspicious message:\n\n"""${query}"""`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: 'Must be exactly one of: safe, caution, high_risk',
              },
              scamType: {
                type: Type.STRING,
                description: 'Short category title, e.g., Fake KYC Phishing, Digital Arrest Scam, Safe Practice',
              },
              summary: {
                type: Type.STRING,
                description: 'Concise 2-3 sentence explanation in the requested language.',
              },
              redFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 4 key warning signs or observations.',
              },
              nextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Up to 4 clear, practical safety actions the user should take right now.',
              },
            },
            required: ['riskLevel', 'scamType', 'summary', 'redFlags', 'nextSteps'],
          },
        },
      });

      const rawText = (response.text || '').trim();
      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze with AI Cyber Sahayak.';
      res.status(502).json({ error: message });
    }
  });

  // Multi-turn Gemini Cyber Chat with optional Google Search or Google Maps Grounding
  app.post('/api/cyber-chat', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Cyber Security AI Chat requires GEMINI_API_KEY configured in Settings > Secrets.',
      });
      return;
    }

    interface ChatInputMessage {
      role: 'user' | 'model';
      text: string;
    }

    const rawMessages: unknown[] = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages: ChatInputMessage[] = rawMessages
      .filter(
        (m: unknown): m is ChatInputMessage =>
          typeof m === 'object' &&
          m !== null &&
          ((m as { role?: unknown }).role === 'user' || (m as { role?: unknown }).role === 'model') &&
          typeof (m as { text?: unknown }).text === 'string' &&
          (m as { text: string }).text.trim().length > 0,
      )
      .slice(-16)
      .map((m: ChatInputMessage) => ({
        role: m.role,
        text: m.text.trim().slice(0, 2000),
      }));

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      res.status(400).json({ error: 'Please enter a message to ask Cyber Security AI.' });
      return;
    }

    const lang = req.body?.lang === 'hi' ? 'hi' : 'en';
    const groundingMode: 'standard' | 'search' | 'maps' =
      req.body?.mode === 'search' ? 'search' : req.body?.mode === 'maps' ? 'maps' : 'standard';
    const speedMode: 'balanced' | 'fast' = req.body?.speed === 'fast' ? 'fast' : 'balanced';
    const rolePreset: 'educator' | 'investigator' | 'tutor' =
      req.body?.persona === 'investigator'
        ? 'investigator'
        : req.body?.persona === 'tutor'
          ? 'tutor'
          : 'educator';

    const rawLat = Number(req.body?.location?.latitude);
    const rawLng = Number(req.body?.location?.longitude);
    const hasValidLocation =
      Number.isFinite(rawLat) &&
      Number.isFinite(rawLng) &&
      rawLat >= -90 &&
      rawLat <= 90 &&
      rawLng >= -180 &&
      rawLng <= 180;

    const personaInstruction =
      rolePreset === 'investigator'
        ? 'Act as a Digital Scam Investigator helping citizens inspect suspicious messages, payment links, caller scripts, and fraud patterns step by step.'
        : rolePreset === 'tutor'
          ? 'Act as an ITI COPA Cyber Hygiene Tutor explaining concepts (2FA, HTTPS, hashing, UPI safety, cyber law basics) clearly for students.'
          : 'Act as Cyber Security Educator providing calm, practical guidance for safer everyday internet use in India.';

    const groundingNote =
      groundingMode === 'search'
        ? 'Use Google Search results to share accurate, up-to-date advisories, recent scam alerts, and verified official guidance.'
        : groundingMode === 'maps'
          ? 'Use Google Maps data to help locate nearby cyber crime police stations, official police stations, or Cyber Help centers with accurate place context.'
          : 'Give clear, structured steps without asking users for passwords, PINs, or OTPs.';

    const languageRule =
      lang === 'hi'
        ? 'Respond strictly in natural, simple Hindi (Devanagari script). Remind users about calling 1930 or reporting on cybercrime.gov.in when financial fraud is involved.'
        : 'Respond strictly in clear, approachable English. Remind users about calling 1930 or reporting on cybercrime.gov.in when financial fraud is involved.';

    const systemInstruction = `${personaInstruction} ${groundingNote} ${languageRule} Keep responses concise and well-structured using short bullet points where helpful.`;

    try {
      if (groundingMode === 'search') {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: messages.map((m: ChatInputMessage) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const webSources = chunks
          .filter((chunk) => Boolean(chunk.web?.uri))
          .map((chunk) => ({
            title: chunk.web?.title || chunk.web?.uri || 'Web Source',
            uri: chunk.web?.uri || '',
          }));

        res.json({
          reply: (response.text || '').trim(),
          modelUsed: 'gemini-4-hydrogen',
          webSources,
          mapSources: [],
        });
        return;
      }

      if (groundingMode === 'maps') {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: messages.map((m: ChatInputMessage) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          config: {
            systemInstruction,
            tools: [{ googleMaps: {} }],
            ...(hasValidLocation
              ? {
                  toolConfig: {
                    retrievalConfig: {
                      latLng: {
                        latitude: rawLat,
                        longitude: rawLng,
                      },
                    },
                  },
                }
              : {}),
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const mapSources = chunks
          .filter((chunk) => Boolean(chunk.maps?.uri || chunk.maps?.title))
          .map((chunk) => {
            const snippets =
              chunk.maps?.placeAnswerSources?.reviewSnippets
                ?.map((s) => ({
                  text: s.reviewId || '',
                  uri: s.googleMapsUri || '',
                  author: s.authorAttribution?.displayName || '',
                }))
                .filter((s) => Boolean(s.uri || s.text)) ?? [];
            return {
              title: chunk.maps?.title || 'Google Maps Location',
              uri: chunk.maps?.uri || '',
              placeId: chunk.maps?.placeId || '',
              snippets,
            };
          });

        res.json({
          reply: (response.text || '').trim(),
          modelUsed: 'gemini-4-hydrogen',
          webSources: [],
          mapSources,
        });
        return;
      }

      // Standard multi-turn chat via ai.chats.create
      const modelName = speedMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';
      const priorHistory = messages.slice(0, -1).map((m: ChatInputMessage) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
      const latestUserMessage = messages[messages.length - 1].text;

      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction },
        history: priorHistory,
      });

      const response = await chat.sendMessage({ message: latestUserMessage });
      res.json({
        reply: (response.text || '').trim(),
        modelUsed: modelName,
        webSources: [],
        mapSources: [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach Gemini AI service.';
      res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cyber Security server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
