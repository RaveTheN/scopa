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
