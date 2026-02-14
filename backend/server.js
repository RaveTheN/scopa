const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const SYSTEM_PROMPT = 'Sei un esperto di Scopa (carte siciliane). Analizza la situazione e suggerisci la migliore carta da giocare dalla mia mano, spiegando il ragionamento strategico.';

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
    const userPrompt = buildUserPrompt(req.body || {});
    const provider = resolveProvider();
    if (!provider) {
      throw createError(500, 'Configura GEMINI_API_KEY o OPENAI_API_KEY sul backend.');
    }

    const suggestion = provider === 'gemini'
      ? await queryGemini(userPrompt)
      : await queryOpenAi(userPrompt);

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

function buildUserPrompt(payload) {
  const {
    myHand = [],
    cardsOnTable = [],
    playedCards = [],
    unknownCardsCount = 0,
    probabilitiesByRank = {},
    opponentCardCount = 0
  } = payload;

  return [
    `Carte nella mia mano: ${Array.isArray(myHand) && myHand.length ? myHand.join(', ') : 'nessuna'}`,
    `Carte sul tavolo: ${Array.isArray(cardsOnTable) && cardsOnTable.length ? cardsOnTable.join(', ') : 'nessuna'}`,
    `Carte gia giocate/uscite: ${Array.isArray(playedCards) && playedCards.length ? playedCards.join(', ') : 'nessuna'}`,
    `Carte sconosciute: ${Number(unknownCardsCount) || 0}`,
    `Probabilita per valore (%): ${formatProbabilities(probabilitiesByRank)}`,
    `Carte avversario: ${Number(opponentCardCount) || 0}`
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

async function queryGemini(userPrompt) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw createError(500, 'GEMINI_API_KEY non configurata sul backend.');
  }

  const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw createError(response.status, `Errore Gemini: ${text}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const suggestion = parts
    .map((part) => part?.text || '')
    .join('\n')
    .trim();

  return suggestion || 'Nessun suggerimento disponibile.';
}

async function queryOpenAi(userPrompt) {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    throw createError(500, 'OPENAI_API_KEY non configurata sul backend.');
  }

  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw createError(response.status, `Errore OpenAI: ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'Nessun suggerimento disponibile.';
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
