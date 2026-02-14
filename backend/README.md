# Backend sicuro OpenAI

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

3. Crea `.env` partendo da `.env.example` e imposta `OPENAI_API_KEY`.

4. Avvia:

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

## Sicurezza

- Non committare mai `.env`.
- Ruota la key se e stata condivisa in chat, log o commit.