# Backend sicuro AI (Gemini/OpenAI)

Questo backend espone `POST /api/openai/suggestion` e mantiene la API key solo lato server.
Puoi usare Gemini oppure OpenAI.

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
4. Imposta una delle due key:
   - `GEMINI_API_KEY` (consigliato, con `AI_PROVIDER=gemini`)
   - oppure `OPENAI_API_KEY` (con `AI_PROVIDER=openai`)
5. Se non imposti `AI_PROVIDER`, il backend usa Gemini se trova `GEMINI_API_KEY`, altrimenti OpenAI.
6. Opzionale (Gemini):
   - `GEMINI_MODEL=gemini-2.0-flash` (default consigliato: veloce e con free tier ampio)
   - `GEMINI_FALLBACK_MODELS=gemini-2.0-flash-lite,gemini-2.5-flash`
   - `AI_MAX_OUTPUT_TOKENS=256` (evita troncamento del JSON)

7. Avvia:

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

- `AI_PROVIDER=gemini`
- `GEMINI_API_KEY=...`
- `GEMINI_MODEL=gemini-2.0-flash`
- `GEMINI_FALLBACK_MODELS=gemini-2.0-flash-lite,gemini-2.5-flash`
- `AI_MAX_OUTPUT_TOKENS=256`
- `ALLOWED_ORIGINS=https://ravethen.github.io`

## Note comportamento AI

- Prompt vincolato a **Scopa classica** (no regola del 15).
- Il frontend invia anche le **mosse legali** calcolate dal motore, per ridurre errori di regole.
- L'output viene normalizzato in formato breve:
  - `Carta consigliata`
  - `Confidenza` (se disponibile)
  - `Motivo`
  - `Attenzione` (max 2 note)

## Sicurezza

- Non committare mai `.env`.
- Ruota la key se e stata condivisa in chat, log o commit.
