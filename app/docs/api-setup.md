# Setup AI sicuro (Gemini/OpenAI)

## Principio

La API key **non** deve stare nel frontend Angular.
Con GitHub Pages (statico), la key va custodita in un backend separato.

## 1) Crea la key del provider

Opzione Gemini (consigliata se hai gia la key):

1. Vai su https://aistudio.google.com/apikey
2. Crea una nuova key Gemini.

Opzione OpenAI:

1. Vai su https://platform.openai.com/api-keys
2. Crea una nuova key.

## 2) Configura il backend

Usa i file in `backend/`:

1. `cd backend`
2. `npm install`
3. copia `.env.example` in `.env`
4. imposta nel `.env`:
   - `AI_PROVIDER=gemini` e `GEMINI_API_KEY=...`
   - oppure `AI_PROVIDER=openai` e `OPENAI_API_KEY=...`
   - opzionale OpenAI:
     - `OPENAI_MODEL=gpt-5-mini` (consigliato)
     - `OPENAI_REASONING_EFFORT=auto` (switch low/medium automatico; `medium` su click "Chiedi suggerimento" e in endgame)
     - `AI_MAX_OUTPUT_TOKENS=384`
   - opzionale Gemini:
     - `GEMINI_MODEL=gemini-2.0-flash` (consigliato)
     - `GEMINI_FALLBACK_MODELS=gemini-2.0-flash-lite,gemini-2.5-flash`
     - `AI_MAX_OUTPUT_TOKENS=256`
5. `npm start`

Endpoint disponibile: `POST /api/openai/suggestion`

## 3) Collega il frontend

- In sviluppo: `app/proxy.conf.json` inoltra `/api/openai/*` verso `http://localhost:8787`
- In produzione: imposta `app/src/environments/environment.prod.ts` con URL completo del backend:

```ts
openaiProxyUrl: 'https://TUO-BACKEND/api/openai/suggestion'
```

## 4) Sicurezza

- Non committare mai `.env` o key reali.
- Se una key e stata condivisa in chat/commit/log, revocala e rigenerala subito.

## Ottimizzazioni gia supportate

- Prompt rigido su Scopa classica (esclude la regola del 15).
- Invio al backend delle mosse legali gia calcolate dal motore.
- Risposta AI sintetica con `Carta consigliata` in prima riga.
- Fallback modello Gemini automatico quando il primario e in quota/errore.
