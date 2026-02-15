# Backend sicuro AI (OpenAI)

Questo backend espone `POST /api/openai/suggestion` e mantiene la API key solo lato server.

## Setup locale

1. Vai nella cartella backend:

```bash
cd backend
```

2. Installa dipendenze:

```bash
npm install
```

3. Crea `.env` partendo da `.env.example`.
4. Imposta:
   - `OPENAI_API_KEY=...`
   - opzionale `OPENAI_MODEL=gpt-4o-mini`
   - opzionale `AI_MAX_OUTPUT_TOKENS=384` (piu spazio per motivazione strategica)
   - opzionale `OPENAI_REASONING_EFFORT=minimal` (consigliato con modelli reasoning, es. `gpt-5-mini`)

5. Avvia:

```bash
npm start
```

Server disponibile su `http://localhost:8787`.

## Frontend Angular

Il frontend usa `app/proxy.conf.json` per proxare `/api/openai/*` verso `http://localhost:8787` in sviluppo.

## Produzione

GitHub Pages non esegue backend.
Devi deployare questo servizio su una piattaforma server/serverless (Render, Railway, Fly.io, Cloud Run, ecc.) e impostare in `app/src/environments/environment.prod.ts`:

```ts
openaiProxyUrl: 'https://TUO-BACKEND/api/openai/suggestion'
```

Variabili consigliate su Render:

- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o-mini`
- `AI_MAX_OUTPUT_TOKENS=384`
- `OPENAI_REASONING_EFFORT=minimal`
- `ALLOWED_ORIGINS=https://ravethen.github.io`

## Modello fine-tuned (opzionale)

Se crei un fine-tuning su OpenAI, puoi usarlo senza modifiche al codice:

- `OPENAI_MODEL=ft:...` (ID del modello fine-tuned)

## Conversione log in JSONL (fine-tuning)

E disponibile uno script CLI per convertire i log partita nel formato `JSONL` compatibile con SFT OpenAI.

Comando base:

```bash
npm run convert-logs -- --input ../logs/state.json --output ../data/scopa-train.jsonl
```

Con split train/validation:

```bash
npm run convert-logs -- --input ../logs/states.json --output ../data/scopa-train.jsonl --validation-output ../data/scopa-valid.jsonl --validation-ratio 0.1 --seed 42
```

Formati input supportati:

- oggetto `GameState` (come `scopa_ng_state` del localStorage)
- array di stati partita
- wrapper con chiavi tipo `games`, `matches`, `sessions`, `state`, `scopa_ng_state`
- export localStorage in forma array di entry (`key`/`value`)

## Note comportamento AI

- Prompt vincolato a **Scopa classica** (no regola del 15).
- Il frontend invia anche le **mosse legali** calcolate dal motore, per ridurre errori di regole.
- L'output viene normalizzato in formato breve:
  - `Carta consigliata`
  - `Confidenza` (se disponibile)
  - `Motivo`
  - `Attenzione` (max 3 note)
  - `Prossimo turno` (se disponibile)

## Sicurezza

- Non committare mai `.env`.
- Ruota la key se e stata condivisa in chat, log o commit.
