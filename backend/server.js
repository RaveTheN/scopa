const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const OPENAI_PRICING_USD_PER_1M = Object.freeze({
  'gpt-4.1-mini': Object.freeze({
    input: 0.40,
    cachedInput: 0.04,
    output: 1.60
  }),
  'gpt-5-mini': Object.freeze({
    input: 0.25,
    cachedInput: 0.025,
    output: 2.0
  }),
  'gpt-5.2': Object.freeze({
    input: 1.75,
    cachedInput: 0.175,
    output: 14.0
  }),
  'gpt-5.2-pro': Object.freeze({
    input: 21.0,
    output: 168.0
  })
});
const SYSTEM_PROMPT = `Sei un assistente strategico per Scopa classica italiana (mazzo 40 carte, 4 semi: Denari, Coppe, Spade, Bastoni).

REGOLE (TASSATIVE):
1. Si gioca UNA carta dalla mano.
2. mustCaptureIfPlayableCardCanCapture=true: dopo aver giocato UNA carta dalla mano, se quella carta ha almeno una presa legale devi effettuare una presa.
3. mustPlayCapturingCardIfHaveOne=false: non sei obbligato a giocare una carta che prende; puoi giocare anche una carta che non prende.
4. Se sul tavolo ci sono due o piu carte con lo stesso valore della carta giocata, devi prenderne UNA di quelle (a scelta), mai una somma alternativa.
5. Presa a somma: solo se NON c'e nessuna carta singola di pari valore, puoi prendere un insieme di carte la cui somma e UGUALE al valore della carta giocata.
6. Se la carta giocata non ha prese legali, la carta resta sul tavolo come scarto.
7. Scopa: se prendi TUTTE le carte dal tavolo fai una Scopa (1 punto extra).
8. NON ESISTE la regola del 15. NON ESISTE nessuna soglia o somma target diversa dal valore della carta giocata o superiore al 10.
9. A fine mano, se il mazzo è vuoto, l'ultiomo giocatore che ha fatto una presa prende tutte le carte residue sul tavolo (se endOfHandLastTakerGetsTableRemainder=true).
10. Non è possibile fare Scope con la carta giocata se quella carta è l'ultima rimasta in mano (deve restare almeno una carta in mano dopo aver giocato per poter fare Scopa).

MANO FINALE (TASSATIVE):
1. Quando "Fine partita (mazzo vuoto)" = vero, le "Carte certe avversario" sono la mano reale dell'avversario (probabilita 100%).
2. I "Valori certi in mano avversario (prob=1)" indicano almeno una carta certamente in mano avversaria per quei valori.
3. endOfHandLastTakerGetsTableRemainder=true: a fine mano, dopo l'ultima carta giocata, tutte le carte residue sul tavolo vanno all'ultimo giocatore che ha fatto una presa ("Ultima presa di").
4. Se "Ultima presa di" e "nessuno", non assegnare carte residue del tavolo.

VALORI: aceValue=1. Asso=1, 2-7=valore facciale, Donna=8, Cavallo=9, Re=10.

IMPORTANTE:
- Ti vengono fornite le mosse legali gia validate dal motore di gioco.
- Devi scegliere SOLO tra le mosse legali.
- Non ricalcolare regole o combinazioni oltre quanto dato in input.

OBIETTIVI STRATEGICI (in ordine):
1. Fare Scope.
2. Prendere il 7 di Denari (Settebello).
3. Massimizzare carte di Denari.
4. Massimizzare numero totale di carte.
5. Primiera: 7 > 6 > Asso > 5 > 4 > 3 > 2 > figure.
6. Evitare di regalare Scopa al turno successivo.
7. Usare le probabilita avversarie per pianificare difesa e controllo.

PROFONDITA DI RAGIONAMENTO:
- Valuta sempre la mossa corrente + risposta avversaria piu probabile + tua replica successiva + possibilità scopa per l'avversario con le carte rimaste.
- Bilancia attacco (punti immediati) e difesa (riduzione rischio al turno dopo).
- Se ci sono almeno 2 mosse legali, confronta esplicitamente la migliore con almeno una alternativa.
- Se "Fine partita (mazzo vuoto)" = vero && la mano avversaria è nota, pianifica la linea completa fino all'ultima carta.
- Se il payload indica avversario che conta le carte / gioco ottimo, assumi best response avversaria e valuta in ottica maximin (caso peggiore per me).

FORMATO RISPOSTA: JSON rigoroso con questi campi:
- "best_card": stringa, DEVE essere una delle carte elencate nelle mosse legali (copiala esattamente).
- "confidence": stringa breve ("alta", "media", "bassa").
- "short_reason": 3-5 frasi concise ma concrete; includi vantaggio immediato, rischio difensivo e piano a due mosse.
- "risk_notes": array di 1-3 stringhe brevi su rischi reali.
- "next_turn_outlook": stringa breve (1-2 frasi) su cosa potrebbe fare l'avversario e contromisura.

Note: "Assumi che l'avversario sappia (o deduca con conteggio carte) cosa mi resta in mano, soprattutto a fine mano. Scegli la mia mossa che massimizza il risultato nel caso peggiore (miglior risposta dell'avversario)."

Non aggiungere testo fuori dal JSON.
Rispondi con un singolo oggetto JSON, senza markdown, senza backticks.
Se non puoi decidere, scegli comunque una best_card valida e confidence=bassa.`;

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
    const result = await queryOpenAi(userPrompt, payload);

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Errore backend durante la chiamata AI.' });
  }
});

app.listen(port, () => {
  console.log(`Scopa backend in ascolto su http://localhost:${port}`);
});

function toSafeInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
}

function normalizeModelKey(model) {
  return String(model || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
}

function resolvePricingForModel(model) {
  const normalized = normalizeModelKey(model);
  if (!normalized) {
    return null;
  }

  for (const [baseModel, pricing] of Object.entries(OPENAI_PRICING_USD_PER_1M)) {
    if (normalized === baseModel || normalized.startsWith(`${baseModel}-`)) {
      return { baseModel, ...pricing };
    }
  }

  return null;
}

function buildUsageSnapshot(usage) {
  if (!usage || typeof usage !== 'object') {
    return null;
  }

  return {
    promptTokens: toSafeInteger(usage.prompt_tokens),
    completionTokens: toSafeInteger(usage.completion_tokens),
    totalTokens: toSafeInteger(usage.total_tokens),
    reasoningTokens: toSafeInteger(usage?.completion_tokens_details?.reasoning_tokens),
    cachedPromptTokens: toSafeInteger(usage?.prompt_tokens_details?.cached_tokens)
  };
}

function roundTo(value, digits = 9) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function estimateOpenAiCostUsd(model, usageSnapshot) {
  if (!usageSnapshot) {
    return null;
  }

  const pricing = resolvePricingForModel(model);
  if (!pricing) {
    return null;
  }

  const promptTokens = Math.max(0, usageSnapshot.promptTokens);
  const completionTokens = Math.max(0, usageSnapshot.completionTokens);
  const cachedPromptTokens = Math.min(
    Math.max(0, usageSnapshot.cachedPromptTokens),
    promptTokens
  );
  const uncachedPromptTokens = Math.max(0, promptTokens - cachedPromptTokens);
  const cachedInputPrice = typeof pricing.cachedInput === 'number'
    ? pricing.cachedInput
    : pricing.input;

  const inputCostUsd = (uncachedPromptTokens * pricing.input) / 1_000_000;
  const cachedInputCostUsd = (cachedPromptTokens * cachedInputPrice) / 1_000_000;
  const outputCostUsd = (completionTokens * pricing.output) / 1_000_000;
  const totalCostUsd = inputCostUsd + cachedInputCostUsd + outputCostUsd;

  return {
    model: normalizeModelKey(model),
    pricingModel: pricing.baseModel,
    inputCostUsd: roundTo(inputCostUsd),
    cachedInputCostUsd: roundTo(cachedInputCostUsd),
    outputCostUsd: roundTo(outputCostUsd),
    totalCostUsd: roundTo(totalCostUsd),
    promptTokens,
    completionTokens,
    cachedPromptTokens,
    reasoningTokens: usageSnapshot.reasoningTokens
  };
}

function logCostEstimate(costEstimate) {
  if (!costEstimate) {
    return;
  }

  console.log(
    [
      `[openai-cost] model=${costEstimate.model}`,
      `pricing=${costEstimate.pricingModel}`,
      `prompt=${costEstimate.promptTokens}`,
      `cached_prompt=${costEstimate.cachedPromptTokens}`,
      `completion=${costEstimate.completionTokens}`,
      `reasoning=${costEstimate.reasoningTokens}`,
      `usd_total=${costEstimate.totalCostUsd.toFixed(6)}`,
      `usd_input=${costEstimate.inputCostUsd.toFixed(6)}`,
      `usd_cached_input=${costEstimate.cachedInputCostUsd.toFixed(6)}`,
      `usd_output=${costEstimate.outputCostUsd.toFixed(6)}`
    ].join(' ')
  );
}

function formatProbabilities(probabilitiesByRank) {
  const parts = [];

  for (let rank = 1; rank <= 10; rank += 1) {
    const value = Number(probabilitiesByRank?.[rank] || 0);
    parts.push(`${rank}: ${value.toFixed(6)}`);
  }

  return parts.join(' | ');
}

function formatTopProbabilities(probabilitiesByRank, limit = 3) {
  const ordered = [];

  for (let rank = 1; rank <= 10; rank += 1) {
    ordered.push({
      rank,
      value: Number(probabilitiesByRank?.[rank] || 0)
    });
  }

  ordered.sort((a, b) => {
    if (b.value !== a.value) {
      return b.value - a.value;
    }
    return a.rank - b.rank;
  });

  return ordered
    .slice(0, limit)
    .map((item) => `${item.rank} (${item.value.toFixed(6)})`)
    .join(' | ');
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

function formatCardList(cards, maxItems = 18) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return 'nessuna';
  }

  const compact = cards
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());

  if (compact.length === 0) {
    return 'nessuna';
  }

  if (compact.length <= maxItems) {
    return compact.join(', ');
  }

  const shown = compact.slice(0, maxItems).join(', ');
  return `${shown} ... (+${compact.length - maxItems})`;
}

function formatBoolean(value) {
  return value ? 'si' : 'no';
}

function normalizeRequestSource(value) {
  const normalized = typeof value === 'string'
    ? value.trim().toLowerCase()
    : '';

  return normalized === 'manual' ? 'manual' : 'auto';
}

function normalizeModelSelection(value) {
  const normalized = typeof value === 'string'
    ? value.trim().toLowerCase()
    : '';

  if (normalized === 'gpt-4.1-mini') {
    return 'gpt-4.1-mini';
  }

  if (normalized === 'gpt-5-mini') {
    return 'gpt-5-mini';
  }

  if (normalized === 'gpt-5.2') {
    return 'gpt-5.2';
  }

  return null;
}

function normalizeReasoningMode(value) {
  const normalized = typeof value === 'string'
    ? value.trim().toLowerCase()
    : '';

  if (normalized === 'low' || normalized === 'auto' || normalized === 'medium') {
    return normalized;
  }

  return null;
}

function normalizeRules(rules) {
  const source = rules && typeof rules === 'object' ? rules : {};
  const capturePriority = typeof source.capturePriority === 'string'
    ? source.capturePriority.trim().toLowerCase()
    : '';

  return {
    mustCaptureIfPlayableCardCanCapture: source.mustCaptureIfPlayableCardCanCapture !== false,
    mustPlayCapturingCardIfHaveOne: source.mustPlayCapturingCardIfHaveOne === true,
    capturePriority: capturePriority || 'free',
    endOfHandLastTakerGetsTableRemainder: source.endOfHandLastTakerGetsTableRemainder !== false,
    aceValue: Number(source.aceValue) === 1 ? 1 : 1
  };
}

function normalizeOpponentModel(opponentModel, isEndgame, opponentHandIsKnown, pliesToHandEnd) {
  const source = opponentModel && typeof opponentModel === 'object' ? opponentModel : {};
  const normalizedPlies = Math.max(0, Number(pliesToHandEnd) || 0);
  const shortHorizonEndgame = normalizedPlies > 0 && normalizedPlies <= 6;

  return {
    assumePerfectEndgamePlay: source.assumePerfectEndgamePlay === undefined
      ? (Boolean(isEndgame) || shortHorizonEndgame)
      : Boolean(source.assumePerfectEndgamePlay),
    countsCardsAndInfersHands: source.countsCardsAndInfersHands === undefined
      ? (Boolean(isEndgame) || Boolean(opponentHandIsKnown) || shortHorizonEndgame)
      : Boolean(source.countsCardsAndInfersHands),
    playsToMaximizeOwnOutcome: source.playsToMaximizeOwnOutcome === undefined
      ? true
      : Boolean(source.playsToMaximizeOwnOutcome),
    evaluationMethod: typeof source.evaluationMethod === 'string' && source.evaluationMethod.trim()
      ? source.evaluationMethod.trim().toLowerCase()
      : 'maximin'
  };
}

function shouldUseMediumReasoning(payload) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const requestSource = normalizeRequestSource(payload.requestSource);
  const isEndgame = payload.isEndgame === true;
  const opponentHandIsKnown = payload.opponentHandIsKnown === true;
  const pliesToHandEnd = Math.max(0, Number(payload.pliesToHandEnd) || 0);
  const opponentModel = normalizeOpponentModel(
    payload.opponentModel,
    isEndgame,
    opponentHandIsKnown,
    pliesToHandEnd
  );

  return requestSource === 'manual'
    || isEndgame
    || opponentHandIsKnown
    || (pliesToHandEnd > 0 && pliesToHandEnd <= 6)
    || opponentModel.assumePerfectEndgamePlay;
}

function buildUserPrompt(payload) {
  const legacyUnknownCardsCount = payload?.unknownCardsCount;

  const {
    myHand = [],
    cardsOnTable = [],
    playedCards = [],
    myCapturedCards = [],
    opponentCapturedCards = [],
    rules = {},
    unseenCardsCount = null,
    deckCardsRemaining = 0,
    isEndgame = false,
    opponentHandIsKnown = false,
    knownOpponentCards = [],
    lastCaptureBy = null,
    probabilitiesByRank = {},
    certainOpponentRanks = [],
    opponentCardCount = 0,
    playsRemainingMe = 0,
    playsRemainingOpponent = 0,
    pliesToHandEnd = 0,
    requestSource = 'auto',
    modelSelection = null,
    reasoningMode = null,
    opponentModel = {},
    legalMoves = []
  } = payload;

  const normalizedLastCaptureBy = lastCaptureBy === 'ME'
    ? 'tu'
    : lastCaptureBy === 'OPPONENT'
      ? 'avversario'
      : 'nessuno';
  const normalizedOpponentModel = normalizeOpponentModel(
    opponentModel,
    isEndgame,
    opponentHandIsKnown,
    pliesToHandEnd
  );
  const normalizedRules = normalizeRules(rules);
  const normalizedRequestSource = normalizeRequestSource(requestSource);
  const normalizedModelSelection = normalizeModelSelection(modelSelection);
  const normalizedReasoningMode = normalizeReasoningMode(reasoningMode);
  const mustUseMaximin = normalizedOpponentModel.evaluationMethod === 'maximin';
  const normalizedUnseenCardsCount = Number(
    unseenCardsCount !== null && unseenCardsCount !== undefined
      ? unseenCardsCount
      : legacyUnknownCardsCount
  ) || 0;

  return [
    `Carte nella mia mano: ${Array.isArray(myHand) && myHand.length ? myHand.join(', ') : 'nessuna'}`,
    `Carte sul tavolo: ${Array.isArray(cardsOnTable) && cardsOnTable.length ? cardsOnTable.join(', ') : 'nessuna'}`,
    `Carte gia giocate/uscite: ${Array.isArray(playedCards) && playedCards.length ? playedCards.join(', ') : 'nessuna'}`,
    `Carte prese da me: ${formatCardList(myCapturedCards)}`,
    `Carte prese avversario: ${formatCardList(opponentCapturedCards)}`,
    `Conteggio prese (io/avversario): ${Array.isArray(myCapturedCards) ? myCapturedCards.length : 0}/${Array.isArray(opponentCapturedCards) ? opponentCapturedCards.length : 0}`,
    `Regole attive - mustCaptureIfPlayableCardCanCapture: ${formatBoolean(normalizedRules.mustCaptureIfPlayableCardCanCapture)}`,
    `Regole attive - mustPlayCapturingCardIfHaveOne: ${formatBoolean(normalizedRules.mustPlayCapturingCardIfHaveOne)}`,
    `Regole attive - capturePriority: ${normalizedRules.capturePriority}`,
    `Regole attive - endOfHandLastTakerGetsTableRemainder: ${formatBoolean(normalizedRules.endOfHandLastTakerGetsTableRemainder)}`,
    `Regole attive - aceValue: ${normalizedRules.aceValue}`,
    `Carte non viste (unseen): ${normalizedUnseenCardsCount}`,
    `Carte residue nel mazzo: ${Math.max(0, Number(deckCardsRemaining) || 0)}`,
    `Fine partita (mazzo vuoto): ${isEndgame ? 'si' : 'no'}`,
    `Mano avversario completamente nota: ${opponentHandIsKnown ? 'si' : 'no'}`,
    `Carte certe avversario: ${formatCardList(knownOpponentCards)}`,
    `Ultima presa di: ${normalizedLastCaptureBy}`,
    `Probabilita per valore (0..1, 6 decimali): ${formatProbabilities(probabilitiesByRank)}`,
    `Valori certi in mano avversario (prob=1): ${Array.isArray(certainOpponentRanks) && certainOpponentRanks.length ? certainOpponentRanks.join(', ') : 'nessuno'}`,
    `Top valori probabili avversario: ${formatTopProbabilities(probabilitiesByRank, 3)}`,
    `Carte avversario: ${Number(opponentCardCount) || 0}`,
    `Carte residue in mano (io/avversario): ${Math.max(0, Number(playsRemainingMe) || 0)}/${Math.max(0, Number(playsRemainingOpponent) || 0)}`,
    `Mosse residue totali fino a fine mano: ${Math.max(0, Number(pliesToHandEnd) || 0)}`,
    `Origine richiesta suggerimento: ${normalizedRequestSource === 'manual' ? 'manuale (click utente)' : 'automatica'}`,
    `Selettore modello: ${normalizedModelSelection || 'default-backend'}`,
    `Selettore reasoning: ${normalizedReasoningMode || 'default-backend'}`,
    `Modello avversario - perfect endgame: ${formatBoolean(normalizedOpponentModel.assumePerfectEndgamePlay)}`,
    `Modello avversario - conta carte/inferisce mano: ${formatBoolean(normalizedOpponentModel.countsCardsAndInfersHands)}`,
    `Modello avversario - massimizza outcome proprio: ${formatBoolean(normalizedOpponentModel.playsToMaximizeOwnOutcome)}`,
    `Metodo valutazione richiesto: ${normalizedOpponentModel.evaluationMethod}`,
    mustUseMaximin
      ? 'Vincolo tattico: scegli la mossa con criterio maximin, cioe la piu robusta contro la miglior risposta avversaria.'
      : 'Vincolo tattico: considera comunque la miglior risposta avversaria prima di decidere.',
    'Mosse legali disponibili (gia validate dal motore di gioco):',
    formatLegalMoves(legalMoves),
    'Scegli la mossa migliore tra quelle elencate sopra e rispondi SOLO con il JSON richiesto.'
  ].join('\n');
}

function resolveOpenAiTokenParameter(model) {
  const normalized = (model || '').trim().toLowerCase();
  if (normalized.startsWith('gpt-5')) {
    return 'max_completion_tokens';
  }

  return 'max_tokens';
}

function resolveOpenAiTemperature(model) {
  const normalized = (model || '').trim().toLowerCase();
  if (normalized.startsWith('gpt-5')) {
    return null;
  }

  return 0.3;
}

function resolveOpenAiReasoningEffort(model, payload) {
  const requestedMode = normalizeReasoningMode(payload?.reasoningMode);
  if (requestedMode) {
    const normalizedModel = (model || '').trim().toLowerCase();
    if (!normalizedModel.startsWith('gpt-5')) {
      return null;
    }

    if (requestedMode === 'low') {
      return 'low';
    }
    if (requestedMode === 'medium') {
      return 'medium';
    }

    return shouldUseMediumReasoning(payload) ? 'medium' : 'low';
  }

  const configured = (process.env.OPENAI_REASONING_EFFORT || '').trim().toLowerCase();
  if (configured && configured !== 'auto') {
    return configured;
  }

  const normalized = (model || '').trim().toLowerCase();
  if (normalized.startsWith('gpt-5')) {
    return shouldUseMediumReasoning(payload) ? 'medium' : 'low';
  }

  return null;
}

function buildOpenAiRequestBody(
  model,
  systemPrompt,
  userPrompt,
  maxOutputTokens,
  forceJson,
  tokenParameter,
  temperature,
  reasoningEffort
) {
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
    ]
  };

  if (typeof temperature === 'number') {
    body.temperature = temperature;
  }

  if (typeof reasoningEffort === 'string' && reasoningEffort.trim()) {
    body.reasoning_effort = reasoningEffort.trim();
  }

  if (tokenParameter === 'max_completion_tokens') {
    body.max_completion_tokens = maxOutputTokens;
  } else {
    body.max_tokens = maxOutputTokens;
  }

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

function isTokenParameterUnsupportedError(statusCode, errorText) {
  if (statusCode !== 400 || typeof errorText !== 'string') {
    return false;
  }

  const normalized = errorText.toLowerCase();
  return normalized.includes('unsupported parameter')
    && (normalized.includes('max_tokens') || normalized.includes('max_completion_tokens'));
}

function isTemperatureUnsupportedError(statusCode, errorText) {
  if (statusCode !== 400 || typeof errorText !== 'string') {
    return false;
  }

  const normalized = errorText.toLowerCase();
  return normalized.includes('temperature')
    && (normalized.includes('unsupported') || normalized.includes('only the default'));
}

function isReasoningEffortUnsupportedError(statusCode, errorText) {
  if (statusCode !== 400 || typeof errorText !== 'string') {
    return false;
  }

  const normalized = errorText.toLowerCase();
  return normalized.includes('reasoning_effort')
    && (normalized.includes('unsupported') || normalized.includes('invalid'));
}

function resolveTokenParameterFromError(errorText, currentTokenParameter) {
  if (typeof errorText !== 'string') {
    return currentTokenParameter;
  }

  const normalized = errorText.toLowerCase();
  if (normalized.includes('max_completion_tokens')) {
    return 'max_completion_tokens';
  }

  if (normalized.includes('max_tokens')) {
    return 'max_tokens';
  }

  return currentTokenParameter === 'max_tokens'
    ? 'max_completion_tokens'
    : 'max_tokens';
}

function resolveEffectiveMaxTokens(baseMaxTokens, model, reasoningEffort) {
  const normalized = (model || '').trim().toLowerCase();

  if (!normalized.startsWith('gpt-5')) {
    return baseMaxTokens;
  }

  const effort = (reasoningEffort || '').trim().toLowerCase();
  if (effort === 'medium' || effort === 'high') {
    return normalized.startsWith('gpt-5.2')
      ? baseMaxTokens * 4
      : baseMaxTokens * 3;
  }

  return baseMaxTokens * 2;
}

async function queryOpenAi(userPrompt, payload) {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    throw createError(500, 'OPENAI_API_KEY non configurata sul backend.');
  }

  const configuredModel = (process.env.OPENAI_MODEL || 'gpt-5.2').trim();
  const requestedModel = normalizeModelSelection(payload?.modelSelection);
  const model = requestedModel || configuredModel;
  const baseMaxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 384);
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  let tokenParameter = resolveOpenAiTokenParameter(model);
  let temperature = resolveOpenAiTemperature(model);
  let reasoningEffort = resolveOpenAiReasoningEffort(model, payload);
  const maxOutputTokens = resolveEffectiveMaxTokens(baseMaxOutputTokens, model, reasoningEffort);
  const fetchCompletion = (forceJson) => fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      buildOpenAiRequestBody(
        model,
        SYSTEM_PROMPT,
        userPrompt,
        maxOutputTokens,
        forceJson,
        tokenParameter,
        temperature,
        reasoningEffort
      )
    )
  });

  let response = await fetchCompletion(true);

  if (!response.ok) {
    let firstErrorText = await response.text();

    if (isTokenParameterUnsupportedError(response.status, firstErrorText)) {
      tokenParameter = resolveTokenParameterFromError(firstErrorText, tokenParameter);
      response = await fetchCompletion(true);
      if (!response.ok) {
        firstErrorText = await response.text();
      }
    }

    if (!response.ok && isTemperatureUnsupportedError(response.status, firstErrorText)) {
      temperature = null;
      response = await fetchCompletion(true);
      if (!response.ok) {
        firstErrorText = await response.text();
      }
    }

    if (!response.ok && isReasoningEffortUnsupportedError(response.status, firstErrorText)) {
      reasoningEffort = null;
      response = await fetchCompletion(true);
      if (!response.ok) {
        firstErrorText = await response.text();
      }
    }

    const shouldRetryWithoutJsonFormat = isJsonOutputUnsupportedError(response.status, firstErrorText);

    if (response.ok) {
      // no-op, proceed below
    } else if (shouldRetryWithoutJsonFormat) {
      response = await fetchCompletion(false);
    } else {
      throw createError(response.status, `Errore OpenAI: ${firstErrorText}`);
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw createError(response.status, `Errore OpenAI: ${text}`);
  }

  const data = await response.json();
  const rawSuggestion = extractOpenAiText(data);
  if (!rawSuggestion || !rawSuggestion.trim()) {
    throw createError(502, summarizeEmptyOpenAiResponse(data));
  }

  const usageSnapshot = buildUsageSnapshot(data?.usage);
  const costEstimate = estimateOpenAiCostUsd(model, usageSnapshot);
  logCostEstimate(costEstimate);

  return {
    suggestion: formatFinalSuggestion(rawSuggestion, payload?.legalMoves),
    usage: usageSnapshot || undefined,
    estimatedCostUsd: costEstimate?.totalCostUsd ?? null,
    estimatedCostBreakdownUsd: costEstimate
      ? {
        input: costEstimate.inputCostUsd,
        cachedInput: costEstimate.cachedInputCostUsd,
        output: costEstimate.outputCostUsd
      }
      : undefined
  };
}

function extractOpenAiText(data) {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const message = data?.choices?.[0]?.message;
  if (message) {
    if (typeof message.content === 'string') {
      return message.content.trim();
    }

    if (message.content && typeof message.content === 'object' && !Array.isArray(message.content)) {
      if (typeof message.content.text === 'string' && message.content.text.trim()) {
        return message.content.text.trim();
      }

      if (typeof message.content.content === 'string' && message.content.content.trim()) {
        return message.content.content.trim();
      }

      if (Array.isArray(message.content.parts)) {
        const partChunks = [];
        for (const part of message.content.parts) {
          if (typeof part === 'string' && part.trim()) {
            partChunks.push(part.trim());
            continue;
          }

          if (typeof part?.text === 'string' && part.text.trim()) {
            partChunks.push(part.text.trim());
            continue;
          }

          if (typeof part?.content === 'string' && part.content.trim()) {
            partChunks.push(part.content.trim());
          }
        }

        if (partChunks.length > 0) {
          return partChunks.join('\n');
        }
      }
    }

    if (Array.isArray(message.content)) {
      const chunks = [];
      for (const part of message.content) {
        if (typeof part === 'string') {
          if (part.trim()) {
            chunks.push(part.trim());
          }
          continue;
        }

        if (typeof part?.text === 'string' && part.text.trim()) {
          chunks.push(part.text.trim());
          continue;
        }

        if (typeof part?.content === 'string' && part.content.trim()) {
          chunks.push(part.content.trim());
        }
      }

      if (chunks.length > 0) {
        return chunks.join('\n');
      }
    }

    if (typeof message.refusal === 'string' && message.refusal.trim()) {
      return message.refusal.trim();
    }
  }

  if (typeof data?.choices?.[0]?.text === 'string') {
    return data.choices[0].text.trim();
  }

  if (typeof data?.output_text === 'string') {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.output)) {
    const chunks = [];
    for (const item of data.output) {
      if (!Array.isArray(item?.content)) {
        continue;
      }

      for (const part of item.content) {
        if (typeof part?.text === 'string' && part.text.trim()) {
          chunks.push(part.text.trim());
          continue;
        }
        if (typeof part?.content === 'string' && part.content.trim()) {
          chunks.push(part.content.trim());
        }
      }
    }

    if (chunks.length > 0) {
      return chunks.join('\n');
    }
  }

  return '';
}

function summarizeEmptyOpenAiResponse(data) {
  const choice = data?.choices?.[0] || {};
  const finishReason = choice?.finish_reason || 'n/d';
  const completionTokens = data?.usage?.completion_tokens ?? 'n/d';
  const promptTokens = data?.usage?.prompt_tokens ?? 'n/d';
  const totalTokens = data?.usage?.total_tokens ?? 'n/d';
  const reasoningTokens = data?.usage?.completion_tokens_details?.reasoning_tokens ?? 'n/d';

  const messageKeys = choice?.message && typeof choice.message === 'object'
    ? Object.keys(choice.message).join(', ')
    : 'n/d';

  return [
    'Risposta vuota dal modello OpenAI.',
    `finish_reason=${finishReason}.`,
    `usage(prompt=${promptTokens}, completion=${completionTokens}, total=${totalTokens}, reasoning=${reasoningTokens}).`,
    `message_keys=${messageKeys}.`,
    'Con modelli reasoning (es. gpt-5-mini) i token possono essere consumati nel reasoning interno.',
    'Imposta OPENAI_REASONING_EFFORT=low (oppure medium in endgame) e riduci la lunghezza del prompt; aumentare solo i token spesso non basta.'
  ].join(' ');
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

function stripFormattingArtifacts(text) {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/here is the json requested:?/gi, '')
    .replace(/ecco il json richiesto:?/gi, '')
    .trim();
}

function cleanLine(text, maxLength) {
  if (typeof text !== 'string') {
    return '';
  }

  const compact = stripFormattingArtifacts(text)
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

function cleanBlock(text, maxLength) {
  if (typeof text !== 'string') {
    return '';
  }

  const normalized = stripFormattingArtifacts(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!normalized) {
    return '';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
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
  const sanitizedRawSuggestion = stripFormattingArtifacts(rawSuggestion);
  const parsed = safeParseJson(sanitizedRawSuggestion);
  const normalizedMoves = normalizeLegalMoves(legalMoves);
  const fieldMaxLength = 500;

  if (!parsed || typeof parsed !== 'object') {
    if (!sanitizedRawSuggestion || !sanitizedRawSuggestion.trim()) {
      throw createError(502, 'Risposta vuota dal modello OpenAI.');
    }

    const invalidPayload = cleanBlock(sanitizedRawSuggestion, 700) || 'Risposta non strutturata dal modello.';
    throw createError(502, `Risposta AI non valida (JSON mancante): ${invalidPayload}`);
  }

  const bestCard = normalizeBestCard(parsed.best_card, normalizedMoves);
  if (!bestCard) {
    const provided = cleanLine(parsed.best_card || '', 80);
    const reason = provided
      ? `best_card non valida: "${provided}".`
      : 'best_card mancante o non valida.';
    throw createError(502, `Risposta AI non valida: ${reason}`);
  }

  const confidence = cleanLine(parsed.confidence || '', fieldMaxLength);
  const shortReason = cleanBlock(parsed.short_reason || parsed.reason || '', fieldMaxLength);
  const alternativeRejected = cleanBlock(
    parsed.alternative_rejected || parsed.counterfactual || parsed.why_not || '',
    fieldMaxLength
  );
  const riskNotes = Array.isArray(parsed.risk_notes)
    ? parsed.risk_notes
      .map((item) => cleanLine(item, fieldMaxLength))
      .filter(Boolean)
      .slice(0, 3)
    : [];
  const nextTurnOutlook = cleanLine(
    parsed.next_turn_outlook || parsed.next_turn_plan || '',
    fieldMaxLength
  );

  const lines = [`Carta consigliata: ${bestCard}`];

  if (confidence) {
    lines.push(`Confidenza: ${confidence}`);
  }

  if (shortReason) {
    lines.push(`Motivo: ${shortReason}`);
  }

  if (alternativeRejected) {
    lines.push(`Alternativa scartata: ${alternativeRejected}`);
  }

  if (riskNotes.length > 0) {
    lines.push(`Attenzione: ${riskNotes.join(' | ')}`);
  }

  if (nextTurnOutlook) {
    lines.push(`Prossimo turno: ${nextTurnOutlook}`);
  }

  return lines.join('\n');
}

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
