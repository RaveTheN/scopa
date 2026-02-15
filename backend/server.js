const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const SYSTEM_PROMPT = `Sei un assistente strategico per Scopa classica italiana (mazzo 40 carte, 4 semi: Denari, Coppe, Spade, Bastoni).

REGOLE DI PRESA (TASSATIVE):
1. Si gioca UNA carta dalla mano.
2. Presa singola: se sul tavolo c'è una carta con lo STESSO valore, DEVI prenderla (obbligatoria, ha priorità sulla presa a somma).
3. Presa a somma: se NON c'è carta singola di pari valore, puoi prendere un insieme di carte la cui somma è UGUALE al valore della carta giocata.
4. Se non puoi fare nessuna presa, scarti la carta sul tavolo.
5. Scopa: se prendi TUTTE le carte dal tavolo, è una Scopa (1 punto extra).
6. NON ESISTE la regola del 15. NON ESISTE nessuna soglia o somma target diversa dal valore della carta giocata. Non menzionare mai il 15 o qualsiasi altro valore sopra il 10 o qualsiasi somma che faccia più di 10.

VALORI: Asso=1, 2-7=valore facciale, Donna=8, Cavallo=9, Re=10.

IMPORTANTE: ti vengono fornite le mosse legali già validate dal motore di gioco. Il campo "Mosse legali disponibili" elenca per ogni carta in mano le possibili prese. Devi SOLO scegliere tra quelle. Non ricalcolare le prese. Se una carta ha "scarto (nessuna presa possibile)" significa che giocandola non prendi niente.

OBIETTIVI STRATEGICI (in ordine di priorità):
1. Fare Scope (svuotare il tavolo)
2. Prendere il 7 di Denari (Settebello)
3. Massimizzare carte di Denari (>=6 su 10 = punto)
4. Massimizzare numero totale di carte (>=21 su 40 = punto)
5. Primiera: preferire 7 > 6 > Asso > 5 > 4 > 3 > 2 > figure
6. Quando scarti senza prendere: minimizza il rischio che l'avversario faccia Scopa al turno successivo. Evita di lasciare sul tavolo combinazioni facili. Scarta preferibilmente figure (valore alto, difficili da sommare per l'avversario) piuttosto che carte basse.
7. Usa le probabilità fornite per stimare cosa ha in mano l'avversario, ridurre il rischio di regalare scopa, aumentare il controllo sulle prese future.

FORMATO RISPOSTA: JSON rigoroso con questi campi:
- "best_card": stringa, DEVE essere una delle carte elencate nelle mosse legali (copiala esattamente).
- "confidence": stringa breve ("alta", "media", "bassa").
- "short_reason": stringa, massimo 2 frasi brevi che spiegano la scelta.
- "risk_notes": array di stringhe, massimo 2 voci brevi su rischi o avvertenze.

Non aggiungere testo fuori dal JSON. Non spiegare le regole. Non fare analisi lunghe. Solo il JSON.
Rispondi con un singolo oggetto JSON, senza markdown, senza backticks.
Se non puoi decidere, scegli comunque una best_card valida e confidence=bassa.`;

const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    best_card: { type: 'STRING' },
    confidence: { type: 'STRING' },
    short_reason: { type: 'STRING' },
    risk_notes: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    }
  },
  required: ['best_card', 'short_reason']
};

app.use(express.json({ limit: '1mb' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowAll = allowedOrigins.includes('*');
  const isAllowed = !!origin && (allowAll || allowedOrigins.includes(origin));

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.post('/api/openai/suggestion', async (req, res) => {
  try {
    const payload = req.body || {};
    const userPrompt = buildUserPrompt(payload);
    const provider = resolveProvider();
    if (!provider) {
      throw createError(500, 'Configura GEMINI_API_KEY o OPENAI_API_KEY sul backend.');
    }

    const suggestion = provider === 'gemini'
      ? await queryGemini(userPrompt, payload)
      : await queryOpenAi(userPrompt, payload);

    res.json({ suggestion });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Errore backend durante la chiamata AI.' });
  }
});

app.listen(port, () => {
  console.log(`Scopa backend in ascolto su http://localhost:${port}`);
});

function formatProbabilities(probabilitiesByRank) {
  const parts = [];

  for (let rank = 1; rank <= 10; rank += 1) {
    const value = Number(probabilitiesByRank?.[rank] || 0);
    parts.push(`${rank}: ${Math.round(value * 100)}%`);
  }

  return parts.join(' | ');
}

function normalizeLegalMoves(legalMoves) {
  if (!Array.isArray(legalMoves)) {
    return [];
  }

  return legalMoves
    .map((move) => ({
      card: typeof move?.card === 'string' ? move.card.trim() : '',
      captures: Array.isArray(move?.captures)
        ? move.captures
          .map((capture) => Array.isArray(capture) ? capture.filter((card) => typeof card === 'string' && card.trim()).map((card) => card.trim()) : [])
          .filter((capture) => capture.length > 0)
        : []
    }))
    .filter((move) => move.card.length > 0);
}

function formatLegalMoves(legalMoves) {
  const normalized = normalizeLegalMoves(legalMoves);
  if (normalized.length === 0) {
    return 'nessuna';
  }

  return normalized.map((move) => {
    if (move.captures.length === 0) {
      return `- ${move.card}: scarto (nessuna presa possibile)`;
    }

    const capturesLabel = move.captures
      .map((capture) => capture.join(' + '))
      .join(' | ');
    return `- ${move.card}: ${capturesLabel}`;
  }).join('\n');
}

function buildUserPrompt(payload) {
  const {
    myHand = [],
    cardsOnTable = [],
    playedCards = [],
    unknownCardsCount = 0,
    probabilitiesByRank = {},
    opponentCardCount = 0,
    legalMoves = []
  } = payload;

  return [
    `Carte nella mia mano: ${Array.isArray(myHand) && myHand.length ? myHand.join(', ') : 'nessuna'}`,
    `Carte sul tavolo: ${Array.isArray(cardsOnTable) && cardsOnTable.length ? cardsOnTable.join(', ') : 'nessuna'}`,
    `Carte gia giocate/uscite: ${Array.isArray(playedCards) && playedCards.length ? playedCards.join(', ') : 'nessuna'}`,
    `Carte sconosciute: ${Number(unknownCardsCount) || 0}`,
    `Probabilita per valore (%): ${formatProbabilities(probabilitiesByRank)}`,
    `Carte avversario: ${Number(opponentCardCount) || 0}`,
    'Mosse legali disponibili (gia validate dal motore di gioco):',
    formatLegalMoves(legalMoves),
    'Scegli la mossa migliore tra quelle elencate sopra e rispondi SOLO con il JSON richiesto.'
  ].join('\n');
}

function resolveProvider() {
  const explicitProvider = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (explicitProvider === 'gemini' || explicitProvider === 'openai') {
    return explicitProvider;
  }

  if ((process.env.GEMINI_API_KEY || '').trim()) {
    return 'gemini';
  }

  if ((process.env.OPENAI_API_KEY || '').trim()) {
    return 'openai';
  }

  return null;
}

function parseGeminiModelChain() {
  const primary = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim();
  const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.0-flash-lite,gemini-2.5-flash')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return [primary, ...fallbackModels].filter((model, index, all) => model && all.indexOf(model) === index);
}

function shouldFallbackGemini(statusCode) {
  return statusCode === 404 || statusCode === 429 || statusCode === 500 || statusCode === 503;
}

function buildGeminiRequestBody(systemPrompt, userPrompt, maxOutputTokens, structuredOutput) {
  const generationConfig = {
    temperature: 0.1,
    maxOutputTokens
  };

  if (structuredOutput) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = GEMINI_RESPONSE_SCHEMA;
  }

  return {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig
  };
}

function isStructuredOutputUnsupportedError(statusCode, errorText) {
  if (statusCode !== 400 || typeof errorText !== 'string') {
    return false;
  }

  const normalized = errorText.toLowerCase();
  return normalized.includes('responsemimetype') || normalized.includes('responseschema');
}

async function queryGemini(userPrompt, payload) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw createError(500, 'GEMINI_API_KEY non configurata sul backend.');
  }

  const modelChain = parseGeminiModelChain();
  const maxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 256);
  let lastError = null;

  for (let index = 0; index < modelChain.length; index += 1) {
    const model = modelChain[index];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildGeminiRequestBody(SYSTEM_PROMPT, userPrompt, maxOutputTokens, true))
    });

    if (!response.ok) {
      const firstErrorText = await response.text();
      const shouldRetryWithoutSchema = isStructuredOutputUnsupportedError(response.status, firstErrorText);

      if (shouldRetryWithoutSchema) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(buildGeminiRequestBody(SYSTEM_PROMPT, userPrompt, maxOutputTokens, false))
        });
      } else {
        const error = createError(response.status, `Errore Gemini (${model}): ${firstErrorText}`);
        if (index < modelChain.length - 1 && shouldFallbackGemini(response.status)) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    if (!response.ok) {
      const text = await response.text();
      const error = createError(response.status, `Errore Gemini (${model}): ${text}`);

      if (index < modelChain.length - 1 && shouldFallbackGemini(response.status)) {
        lastError = error;
        continue;
      }

      throw error;
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const rawSuggestion = parts
      .map((part) => part?.text || '')
      .join('\n')
      .trim();

    const suggestion = formatFinalSuggestion(rawSuggestion, payload?.legalMoves);
    if (suggestion) {
      return suggestion;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return 'Nessun suggerimento disponibile.';
}

function buildOpenAiRequestBody(model, systemPrompt, userPrompt, maxOutputTokens, forceJson) {
  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.1,
    max_tokens: maxOutputTokens
  };

  if (forceJson) {
    body.response_format = { type: 'json_object' };
  }

  return body;
}

function isJsonOutputUnsupportedError(statusCode, errorText) {
  if (statusCode !== 400 || typeof errorText !== 'string') {
    return false;
  }

  const normalized = errorText.toLowerCase();
  return normalized.includes('response_format');
}

async function queryOpenAi(userPrompt, payload) {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    throw createError(500, 'OPENAI_API_KEY non configurata sul backend.');
  }

  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
  const maxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 256);
  let response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildOpenAiRequestBody(model, SYSTEM_PROMPT, userPrompt, maxOutputTokens, true))
  });

  if (!response.ok) {
    const firstErrorText = await response.text();
    const shouldRetryWithoutJsonFormat = isJsonOutputUnsupportedError(response.status, firstErrorText);

    if (shouldRetryWithoutJsonFormat) {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildOpenAiRequestBody(model, SYSTEM_PROMPT, userPrompt, maxOutputTokens, false))
      });
    } else {
      throw createError(response.status, `Errore OpenAI: ${firstErrorText}`);
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw createError(response.status, `Errore OpenAI: ${text}`);
  }

  const data = await response.json();
  const rawSuggestion = data?.choices?.[0]?.message?.content?.trim() || '';
  return formatFinalSuggestion(rawSuggestion, payload?.legalMoves);
}

function safeParseJson(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function cleanLine(text, maxLength) {
  if (typeof text !== 'string') {
    return '';
  }

  const compact = text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .trim();

  if (!compact) {
    return '';
  }

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, Math.max(0, maxLength - 3))}...`;
}

function normalizeBestCard(candidate, legalMoves) {
  if (typeof candidate !== 'string') {
    return '';
  }

  const normalizedMoves = normalizeLegalMoves(legalMoves);
  if (normalizedMoves.length === 0) {
    return cleanLine(candidate, 64);
  }

  const wanted = candidate.trim().toLowerCase();
  const exact = normalizedMoves.find((move) => move.card.toLowerCase() === wanted);
  if (exact) {
    return exact.card;
  }

  const contained = normalizedMoves.find((move) => wanted.includes(move.card.toLowerCase()) || move.card.toLowerCase().includes(wanted));
  if (contained) {
    return contained.card;
  }

  return '';
}

function formatFinalSuggestion(rawSuggestion, legalMoves) {
  const parsed = safeParseJson(rawSuggestion);
  const normalizedMoves = normalizeLegalMoves(legalMoves);

  if (!parsed || typeof parsed !== 'object') {
    if (!rawSuggestion || !rawSuggestion.trim()) {
      return 'Nessun suggerimento disponibile.';
    }

    const fallbackCard = normalizedMoves[0]?.card || '';
    const fallbackReason = cleanLine(rawSuggestion, 240);
    if (!fallbackCard) {
      return fallbackReason;
    }

    return [
      `Carta consigliata: ${fallbackCard}`,
      `Motivo: ${fallbackReason}`
    ].join('\n');
  }

  const bestCard = normalizeBestCard(parsed.best_card, normalizedMoves) || normalizedMoves[0]?.card || 'N/D';
  const confidence = cleanLine(parsed.confidence || '', 24);
  const shortReason = cleanLine(parsed.short_reason || parsed.reason || '', 240);
  const riskNotes = Array.isArray(parsed.risk_notes)
    ? parsed.risk_notes
      .map((item) => cleanLine(item, 100))
      .filter(Boolean)
      .slice(0, 2)
    : [];

  const lines = [`Carta consigliata: ${bestCard}`];

  if (confidence) {
    lines.push(`Confidenza: ${confidence}`);
  }

  if (shortReason) {
    lines.push(`Motivo: ${shortReason}`);
  }

  if (riskNotes.length > 0) {
    lines.push(`Attenzione: ${riskNotes.join(' | ')}`);
  }

  return lines.join('\n');
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
