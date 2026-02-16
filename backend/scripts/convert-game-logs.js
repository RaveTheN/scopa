#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const CARD_STATE = {
  UNKNOWN: 'UNKNOWN',
  IN_MY_HAND: 'IN_MY_HAND',
  ON_TABLE: 'ON_TABLE',
  ON_TABLE_BLINKING: 'ON_TABLE_BLINKING',
  PLAYED: 'PLAYED',
  COMBINATION_CANDIDATE: 'COMBINATION_CANDIDATE'
};

const GAME_PHASE = {
  INITIAL_FOUR: 'INITIAL_FOUR',
  PLAYING: 'PLAYING',
  CHOOSE_COMBINATION: 'CHOOSE_COMBINATION'
};

const SUITS = ['Denari', 'Coppe', 'Spade', 'Bastoni'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ALL_CARDS = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    id: `${suit.toLowerCase()}-${rank}`,
    suit,
    rank
  }))
);

const CARD_BY_ID = ALL_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

const PLAYED_STATES = new Set([
  CARD_STATE.PLAYED,
  CARD_STATE.ON_TABLE,
  CARD_STATE.ON_TABLE_BLINKING,
  CARD_STATE.COMBINATION_CANDIDATE
]);

function usage() {
  console.log([
    'Usage:',
    '  node scripts/convert-game-logs.js --input <file.json|file.jsonl> --output <train.jsonl> [--validation-output <valid.jsonl>] [--validation-ratio <0..1>] [--seed <int>]',
    '',
    'Supported input formats:',
    '  - Full game state object (same shape of localStorage scopa_ng_state)',
    '  - Array of game states',
    '  - Wrapper object with keys like games/matches/sessions/state/scopa_ng_state',
    '  - Array of localStorage entries [{ "key": "scopa_ng_state", "value": "{...}" }]',
    '',
    'Examples:',
    '  node scripts/convert-game-logs.js --input ..\\logs\\state.json --output ..\\data\\scopa-train.jsonl',
    '  node scripts/convert-game-logs.js --input ..\\logs\\states.json --output ..\\data\\scopa-train.jsonl --validation-output ..\\data\\scopa-valid.jsonl --validation-ratio 0.1 --seed 42'
  ].join('\n'));
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }

    if (!token.startsWith('--')) {
      throw new Error(`Argomento non valido: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[i + 1];
    if (typeof value === 'undefined' || value.startsWith('--')) {
      throw new Error(`Valore mancante per --${key}`);
    }
    args[key] = value;
    i += 1;
  }

  return args;
}

function parseJsonOrThrow(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} non e un JSON valido: ${error.message}`);
  }
}

function parseJsonMaybe(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function readInputFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    throw new Error('File input vuoto.');
  }

  if (raw.startsWith('{') || raw.startsWith('[')) {
    return parseJsonOrThrow(raw, 'Input');
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => parseJsonOrThrow(line, `Riga JSONL ${index + 1}`));
}

function looksLikeGameState(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Array.isArray(value.history) &&
    typeof value.cardStates === 'object' &&
    !!value.cardStates &&
    Array.isArray(value.myHand) &&
    Array.isArray(value.cardsOnTable)
  );
}

function extractGameStates(root) {
  const results = [];
  const seen = new WeakSet();

  function visit(value) {
    const parsed = parseJsonMaybe(value);

    if (!parsed || typeof parsed !== 'object') {
      return;
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        visit(item);
      }
      return;
    }

    if (seen.has(parsed)) {
      return;
    }
    seen.add(parsed);

    if (looksLikeGameState(parsed)) {
      results.push(parsed);
      return;
    }

    if ('scopa_ng_state' in parsed) {
      visit(parsed.scopa_ng_state);
    }

    if ('state' in parsed) {
      visit(parsed.state);
    }

    if (Array.isArray(parsed.games)) {
      visit(parsed.games);
    }
    if (Array.isArray(parsed.matches)) {
      visit(parsed.matches);
    }
    if (Array.isArray(parsed.sessions)) {
      visit(parsed.sessions);
    }

    if (typeof parsed.key === 'string' && /scopa_ng_state$/i.test(parsed.key) && 'value' in parsed) {
      visit(parsed.value);
    }

    if (Array.isArray(parsed.localStorage)) {
      visit(parsed.localStorage);
    }

    if (Array.isArray(parsed.entries)) {
      visit(parsed.entries);
    }

    for (const [key, child] of Object.entries(parsed)) {
      const lower = key.toLowerCase();
      if (lower === 'history' || lower === 'cardstates') {
        continue;
      }

      if (
        lower.includes('state') ||
        lower.includes('game') ||
        lower.includes('match') ||
        lower.includes('session') ||
        lower.includes('log')
      ) {
        visit(child);
      }
    }
  }

  visit(root);
  return results;
}

function uniqueCardIds(ids, maxLength = Number.MAX_SAFE_INTEGER) {
  const result = [];
  const seen = new Set();

  for (const id of Array.isArray(ids) ? ids : []) {
    if (typeof id !== 'string') {
      continue;
    }
    if (!(id in CARD_BY_ID)) {
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
    if (result.length >= maxLength) {
      break;
    }
  }

  return result;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSnapshot(raw) {
  const cardStates = {};
  const validStates = new Set(Object.values(CARD_STATE));
  for (const card of ALL_CARDS) {
    const value = raw?.cardStates?.[card.id];
    cardStates[card.id] = validStates.has(value) ? value : CARD_STATE.UNKNOWN;
  }

  const phase = Object.values(GAME_PHASE).includes(raw?.phase) ? raw.phase : GAME_PHASE.INITIAL_FOUR;
  const turn = raw?.turn === 'ME' || raw?.turn === 'OPPONENT' ? raw.turn : null;

  const myHand = uniqueCardIds(raw?.myHand, 3);
  const cardsOnTable = uniqueCardIds(raw?.cardsOnTable);
  const selectedCombination = uniqueCardIds(raw?.selectedCombination);
  const pendingPlayedCard = typeof raw?.pendingPlayedCard === 'string' && raw.pendingPlayedCard in CARD_BY_ID
    ? raw.pendingPlayedCard
    : null;

  return {
    cardStates,
    phase,
    turn,
    myHand,
    opponentCardCount: clamp(Number.isFinite(raw?.opponentCardCount) ? Math.round(raw.opponentCardCount) : 3, 0, 3),
    cardsOnTable,
    initialFourCount: clamp(Number.isFinite(raw?.initialFourCount) ? Math.round(raw.initialFourCount) : cardsOnTable.length, 0, 4),
    lastPlayLog: typeof raw?.lastPlayLog === 'string' ? raw.lastPlayLog : '',
    pendingPlayedCard,
    selectedCombination
  };
}

function normalizeState(rawState) {
  const history = Array.isArray(rawState?.history)
    ? rawState.history.map((snapshot) => normalizeSnapshot(snapshot))
    : [];

  const current = normalizeSnapshot(rawState);
  return { history, current };
}

function rankLabel(rank) {
  if (rank === 1) {
    return 'Asso';
  }
  if (rank === 8) {
    return 'Donna';
  }
  if (rank === 9) {
    return 'Cavallo';
  }
  if (rank === 10) {
    return 'Re';
  }
  return String(rank);
}

function cardLabel(cardId) {
  const card = CARD_BY_ID[cardId];
  if (!card) {
    return cardId;
  }
  return `${rankLabel(card.rank)} di ${card.suit}`;
}

function findCombinations(targetSum, tableCards) {
  if (targetSum <= 0 || tableCards.length === 0) {
    return [];
  }

  const combinations = [];
  const n = tableCards.length;
  const maxMask = 1 << n;

  for (let mask = 1; mask < maxMask; mask += 1) {
    let sum = 0;
    const subset = [];

    for (let i = 0; i < n; i += 1) {
      if ((mask & (1 << i)) === 0) {
        continue;
      }
      const card = tableCards[i];
      subset.push(card);
      sum += card.rank;
    }

    if (sum === targetSum) {
      combinations.push(subset);
    }
  }

  return combinations;
}

function combinations(n, k) {
  if (k < 0 || k > n) {
    return 0;
  }
  if (k === 0 || k === n) {
    return 1;
  }

  const kk = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= kk; i += 1) {
    result = (result * (n - kk + i)) / i;
  }

  return result;
}

function computeProbabilitiesByRank(cardStates, opponentCardCount) {
  const unknownByRank = new Map();
  for (const rank of RANKS) {
    unknownByRank.set(rank, 0);
  }

  let totalUnknown = 0;
  for (const [cardId, state] of Object.entries(cardStates)) {
    if (state !== CARD_STATE.UNKNOWN) {
      continue;
    }
    const card = CARD_BY_ID[cardId];
    if (!card) {
      continue;
    }
    totalUnknown += 1;
    unknownByRank.set(card.rank, (unknownByRank.get(card.rank) || 0) + 1);
  }

  const result = {};
  if (opponentCardCount <= 0 || totalUnknown <= 0) {
    for (const rank of RANKS) {
      result[rank] = 0;
    }
    return result;
  }

  const drawSize = Math.min(opponentCardCount, totalUnknown);
  const denominator = combinations(totalUnknown, drawSize);

  for (const rank of RANKS) {
    const unknownOfRank = unknownByRank.get(rank) || 0;
    if (unknownOfRank <= 0 || denominator <= 0) {
      result[rank] = 0;
      continue;
    }

    const numerator = combinations(totalUnknown - unknownOfRank, drawSize);
    result[rank] = 1 - (numerator / denominator);
  }

  return result;
}

function buildLegalMoves(snapshot) {
  const tableCards = snapshot.cardsOnTable
    .map((id) => CARD_BY_ID[id])
    .filter(Boolean);

  return snapshot.myHand
    .map((cardId) => {
      const playedCard = CARD_BY_ID[cardId];
      if (!playedCard) {
        return null;
      }

      const captures = findCombinations(playedCard.rank, tableCards)
        .map((combination) => combination.map((card) => cardLabel(card.id)));

      return {
        card: cardLabel(playedCard.id),
        captures
      };
    })
    .filter(Boolean);
}

function buildPayload(snapshot) {
  const probabilitiesByRank = computeProbabilitiesByRank(snapshot.cardStates, snapshot.opponentCardCount);
  const playedCards = Object.entries(snapshot.cardStates)
    .filter(([, state]) => PLAYED_STATES.has(state))
    .map(([cardId]) => cardLabel(cardId));

  const unseenCardsCount = Object.values(snapshot.cardStates)
    .filter((state) => state === CARD_STATE.UNKNOWN)
    .length;

  return {
    myHand: snapshot.myHand.map((cardId) => cardLabel(cardId)),
    cardsOnTable: snapshot.cardsOnTable.map((cardId) => cardLabel(cardId)),
    playedCards,
    unseenCardsCount,
    probabilitiesByRank,
    opponentCardCount: snapshot.opponentCardCount,
    legalMoves: buildLegalMoves(snapshot)
  };
}

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
          .map((capture) => Array.isArray(capture)
            ? capture.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
            : [])
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

  return normalized
    .map((move) => {
      if (move.captures.length === 0) {
        return `- ${move.card}: scarto (nessuna presa possibile)`;
      }
      const capturesLabel = move.captures
        .map((capture) => capture.join(' + '))
        .join(' | ');
      return `- ${move.card}: ${capturesLabel}`;
    })
    .join('\n');
}

function buildUserPrompt(payload) {
  return [
    `Carte nella mia mano: ${Array.isArray(payload.myHand) && payload.myHand.length ? payload.myHand.join(', ') : 'nessuna'}`,
    `Carte sul tavolo: ${Array.isArray(payload.cardsOnTable) && payload.cardsOnTable.length ? payload.cardsOnTable.join(', ') : 'nessuna'}`,
    `Carte gia giocate/uscite: ${Array.isArray(payload.playedCards) && payload.playedCards.length ? payload.playedCards.join(', ') : 'nessuna'}`,
    `Carte non viste (unseen): ${Number(payload.unseenCardsCount) || 0}`,
    `Probabilita per valore (%): ${formatProbabilities(payload.probabilitiesByRank)}`,
    `Carte avversario: ${Number(payload.opponentCardCount) || 0}`,
    'Mosse legali disponibili (gia validate dal motore di gioco):',
    formatLegalMoves(payload.legalMoves),
    'Scegli la mossa migliore tra quelle elencate sopra e rispondi SOLO con il JSON richiesto.'
  ].join('\n');
}

function parsePlayedCardFromLog(logLine) {
  if (typeof logLine !== 'string') {
    return '';
  }

  const match = logLine.trim().match(/^tu\s+gioca\s+(.+?)(?:,|$)/i);
  if (!match) {
    return '';
  }
  return match[1].trim();
}

function normalizePlayedCard(candidate, legalMoves) {
  if (!candidate) {
    return '';
  }
  const wanted = candidate.trim().toLowerCase();
  const normalized = normalizeLegalMoves(legalMoves);

  const exact = normalized.find((move) => move.card.toLowerCase() === wanted);
  if (exact) {
    return exact.card;
  }

  const contained = normalized.find((move) =>
    wanted.includes(move.card.toLowerCase()) ||
    move.card.toLowerCase().includes(wanted)
  );
  if (contained) {
    return contained.card;
  }

  return '';
}

function buildAssistantMessage(bestCard, logLine, legalMovesCount) {
  const normalizedLog = String(logLine || '').toLowerCase();
  let shortReason = 'Mossa osservata in una partita reale.';
  if (normalizedLog.includes('nessuna presa')) {
    shortReason = 'Scarto osservato in una partita reale.';
  } else if (normalizedLog.includes('prende')) {
    shortReason = 'Presa osservata in una partita reale.';
  }

  const confidence = legalMovesCount <= 1 ? 'alta' : 'media';

  return JSON.stringify({
    best_card: bestCard,
    confidence,
    short_reason: shortReason,
    risk_notes: []
  });
}

function defaultSystemPrompt() {
  return [
    'Sei un assistente strategico per Scopa classica italiana (mazzo 40 carte, 4 semi: Denari, Coppe, Spade, Bastoni).',
    '',
    'REGOLE DI PRESA (TASSATIVE):',
    "1. mustCaptureIfPlayableCardCanCapture=true: dopo aver giocato una carta, se quella carta ha almeno una presa legale devi effettuare una presa.",
    "2. mustPlayCapturingCardIfHaveOne=false: non sei obbligato a giocare una carta che prende; puoi giocare anche una carta che non prende.",
    "3. capturePriority=free: se la carta giocata ha piu prese legali (carta singola uguale e/o combinazioni a somma), puoi scegliere liberamente quale presa fare.",
    "4. Se non puoi fare nessuna presa con la carta giocata, scarti la carta sul tavolo.",
    "5. Scopa: se prendi TUTTE le carte dal tavolo, e una Scopa (1 punto extra).",
    '6. NON ESISTE la regola del 15. NON ESISTE nessuna soglia o somma target diversa dal valore della carta giocata.',
    '',
    'VALORI: Asso=1, 2-7=valore facciale, Donna=8, Cavallo=9, Re=10.',
    '',
    'IMPORTANTE: ti vengono fornite le mosse legali gia validate dal motore di gioco. Il campo "Mosse legali disponibili" elenca per ogni carta in mano le possibili prese. Devi SOLO scegliere tra quelle. Non ricalcolare le prese. Se una carta ha "scarto (nessuna presa possibile)" significa che giocandola non prendi niente.',
    '',
    'OBIETTIVI STRATEGICI (in ordine di priorita):',
    '1. Fare Scope (svuotare il tavolo)',
    '2. Prendere il 7 di Denari (Settebello)',
    '3. Massimizzare carte di Denari (>=6 su 10 = punto)',
    '4. Massimizzare numero totale di carte (>=21 su 40 = punto)',
    '5. Primiera: preferire 7 > 6 > Asso > 5 > 4 > 3 > 2 > figure',
    "6. Quando scarti senza prendere: minimizza il rischio che l'avversario faccia Scopa al turno successivo. Evita di lasciare sul tavolo combinazioni facili. Scarta preferibilmente figure (valore alto, difficili da sommare per l'avversario) piuttosto che carte basse.",
    "7. Usa le probabilita fornite per stimare cosa ha in mano l'avversario, ridurre il rischio di regalare scopa, aumentare il controllo sulle prese future.",
    '',
    'FORMATO RISPOSTA: JSON rigoroso con questi campi:',
    '- "best_card": stringa, DEVE essere una delle carte elencate nelle mosse legali (copiala esattamente).',
    '- "confidence": stringa breve ("alta", "media", "bassa").',
    '- "short_reason": stringa, massimo 2 frasi brevi che spiegano la scelta.',
    '- "risk_notes": array di stringhe, massimo 2 voci brevi su rischi o avvertenze.',
    '',
    'Non aggiungere testo fuori dal JSON. Non spiegare le regole. Non fare analisi lunghe. Solo il JSON.',
    'Rispondi con un singolo oggetto JSON, senza markdown, senza backticks.',
    'Se non puoi decidere, scegli comunque una best_card valida e confidence=bassa.'
  ].join('\n');
}

function loadSystemPrompt() {
  return defaultSystemPrompt();
}

function shouldUseTransition(prev, next) {
  if (!prev || !next) {
    return false;
  }

  if (prev.phase !== GAME_PHASE.PLAYING) {
    return false;
  }
  if (prev.turn !== 'ME') {
    return false;
  }
  if (!Array.isArray(prev.myHand) || prev.myHand.length === 0) {
    return false;
  }

  const nextLog = typeof next.lastPlayLog === 'string' ? next.lastPlayLog.trim() : '';
  if (!nextLog || nextLog === prev.lastPlayLog) {
    return false;
  }
  if (!/^tu\s+gioca\s+/i.test(nextLog)) {
    return false;
  }

  return true;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(array, seed) {
  const random = mulberry32(seed);
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function writeJsonl(filePath, rows) {
  const content = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, rows.length > 0 ? `${content}\n` : '', 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const inputPath = args.input;
  const outputPath = args.output;
  const validationOutputPath = args['validation-output'];

  if (!inputPath || !outputPath) {
    usage();
    throw new Error('Parametri obbligatori mancanti: --input e --output.');
  }

  const ratioArg = args['validation-ratio'];
  const validationRatio = ratioArg == null ? (validationOutputPath ? 0.1 : 0) : Number(ratioArg);
  if (!Number.isFinite(validationRatio) || validationRatio < 0 || validationRatio >= 1) {
    throw new Error('validation-ratio deve essere un numero tra 0 (incluso) e 1 (escluso).');
  }
  if (validationRatio > 0 && !validationOutputPath) {
    throw new Error('Se imposti --validation-ratio > 0 devi specificare anche --validation-output.');
  }

  const seed = args.seed == null ? 42 : Number(args.seed);
  if (!Number.isInteger(seed)) {
    throw new Error('seed deve essere un intero.');
  }

  const resolvedInput = path.resolve(process.cwd(), inputPath);
  const resolvedOutput = path.resolve(process.cwd(), outputPath);
  const resolvedValidationOutput = validationOutputPath
    ? path.resolve(process.cwd(), validationOutputPath)
    : null;

  const inputRoot = readInputFile(resolvedInput);
  const statesRaw = extractGameStates(inputRoot);

  if (statesRaw.length === 0) {
    throw new Error('Nessuno stato partita trovato nel file input.');
  }

  const systemPrompt = loadSystemPrompt();
  const examples = [];
  const stats = {
    transitionsSeen: 0,
    transitionsCandidate: 0,
    skippedNoCardInLog: 0,
    skippedCardNotInLegalMoves: 0
  };

  for (let stateIndex = 0; stateIndex < statesRaw.length; stateIndex += 1) {
    const normalized = normalizeState(statesRaw[stateIndex]);
    const sequence = [...normalized.history, normalized.current];

    for (let i = 0; i < sequence.length - 1; i += 1) {
      stats.transitionsSeen += 1;
      const prev = sequence[i];
      const next = sequence[i + 1];

      if (!shouldUseTransition(prev, next)) {
        continue;
      }

      stats.transitionsCandidate += 1;
      const playedCardFromLog = parsePlayedCardFromLog(next.lastPlayLog);
      if (!playedCardFromLog) {
        stats.skippedNoCardInLog += 1;
        continue;
      }

      const payload = buildPayload(prev);
      const bestCard = normalizePlayedCard(playedCardFromLog, payload.legalMoves);
      if (!bestCard) {
        stats.skippedCardNotInLegalMoves += 1;
        continue;
      }

      const example = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildUserPrompt(payload) },
          {
            role: 'assistant',
            content: buildAssistantMessage(bestCard, next.lastPlayLog, payload.legalMoves.length)
          }
        ]
      };

      examples.push(example);
    }
  }

  if (examples.length === 0) {
    throw new Error('Nessun esempio utile estratto. Verifica che i log contengano mosse "Tu gioca ...".');
  }

  let trainRows = examples;
  let validRows = [];

  if (resolvedValidationOutput && validationRatio > 0) {
    trainRows = [...examples];
    shuffleInPlace(trainRows, seed);
    const validCount = Math.max(1, Math.floor(trainRows.length * validationRatio));
    validRows = trainRows.slice(0, validCount);
    trainRows = trainRows.slice(validCount);
  }

  writeJsonl(resolvedOutput, trainRows);
  if (resolvedValidationOutput) {
    writeJsonl(resolvedValidationOutput, validRows);
  }

  console.log(`Stati partita trovati: ${statesRaw.length}`);
  console.log(`Transizioni analizzate: ${stats.transitionsSeen}`);
  console.log(`Transizioni candidate (Tu in PLAYING): ${stats.transitionsCandidate}`);
  console.log(`Esempi estratti: ${examples.length}`);
  if (stats.skippedNoCardInLog > 0) {
    console.log(`Scartati (carta non riconosciuta nel log): ${stats.skippedNoCardInLog}`);
  }
  if (stats.skippedCardNotInLegalMoves > 0) {
    console.log(`Scartati (carta fuori mosse legali): ${stats.skippedCardNotInLegalMoves}`);
  }

  console.log(`Train JSONL: ${resolvedOutput}`);
  if (resolvedValidationOutput) {
    console.log(`Validation JSONL: ${resolvedValidationOutput}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`Errore: ${error.message}`);
  process.exitCode = 1;
}
