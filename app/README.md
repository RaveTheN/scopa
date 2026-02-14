# Scopa

Tracker Scopa con suggerimento AI (Angular standalone).

## Avvio sviluppo

```bash
npm install
npm start
```

`npm start` usa `proxy.conf.json`.

Per i suggerimenti AI serve anche il backend:

```bash
cd ../backend
npm install
npm start
```

## Build

```bash
npm run build
```

Output in `app/dist/scopa`.

## GitHub Pages (repo root)

GitHub Pages serve `index.html` dalla root del repository.
Dopo la build, copia i file di `app/dist/scopa` nella root del repo per sostituire il vecchio `index.html`.

Esempio (PowerShell da root repo):

```powershell
Copy-Item -Path .\app\dist\scopa\* -Destination . -Recurse -Force
```

## Test

```bash
npm test
```

## API AI (Gemini/OpenAI)

Vedi `app/docs/api-setup.md`.
