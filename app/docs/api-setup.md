# Setup API OpenAI

## 1) Crea una API key
1. Vai su https://platform.openai.com/api-keys
2. Esegui login con il tuo account OpenAI.
3. Crea una nuova chiave API.

## 2) Inserisci la chiave nel progetto
Apri `app/src/environments/environment.ts` e sostituisci:

```ts
openaiApiKey: 'YOUR_API_KEY_HERE'
```

con la tua chiave reale.

Se vuoi usare anche build production, aggiorna anche `app/src/environments/environment.prod.ts`.

## 3) Sicurezza
- Non committare mai API key reali su Git.
- Aggiungi `app/src/environments/environment.ts` al `.gitignore` o usa secret management esterno.
- Considera un backend/proxy sicuro per evitare di esporre chiavi nel frontend.
