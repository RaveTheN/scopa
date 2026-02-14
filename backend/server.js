const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

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
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_API_KEY non configurata sul backend.' });
    return;
  }

  const {
    myHand = [],
    cardsOnTable = [],
    playedCards = [],
    unknownCardsCount = 0,
    probabilitiesByRank = {},
    opponentCardCount = 0
  } = req.body || {};

  const userPrompt = [
    `Carte nella mia mano: ${Array.isArray(myHand) && myHand.length ? myHand.join(', ') : 'nessuna'}`,
    `Carte sul tavolo: ${Array.isArray(cardsOnTable) && cardsOnTable.length ? cardsOnTable.join(', ') : 'nessuna'}`,
    `Carte gia giocate/uscite: ${Array.isArray(playedCards) && playedCards.length ? playedCards.join(', ') : 'nessuna'}`,
    `Carte sconosciute: ${Number(unknownCardsCount) || 0}`,
    `Probabilita per valore (%): ${formatProbabilities(probabilitiesByRank)}`,
    `Carte avversario: ${Number(opponentCardCount) || 0}`
  ].join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di Scopa (carte siciliane). Analizza la situazione e suggerisci la migliore carta da giocare dalla mia mano, spiegando il ragionamento strategico.'
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
      res.status(response.status).json({ error: `Errore OpenAI: ${text}` });
      return;
    }

    const data = await response.json();
    const suggestion = data?.choices?.[0]?.message?.content?.trim() || 'Nessun suggerimento disponibile.';
    res.json({ suggestion });
  } catch {
    res.status(500).json({ error: 'Errore backend durante la chiamata OpenAI.' });
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