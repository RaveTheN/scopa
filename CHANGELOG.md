# Changelog

Questo file riassume l'evoluzione del progetto Scopa dal primo commit disponibile fino ad oggi.
Le voci sono ordinate cronologicamente e includono hash commit per tracciabilita.

## [Unreleased] - 2026-02-15

### Modifiche AI backend
- Riscritto il `SYSTEM_PROMPT` con regole tassative di Scopa classica (no regola del 15) e output JSON obbligatorio.
- Aggiunti i vincoli:
  - risposta come singolo oggetto JSON (senza markdown/backticks),
  - scelta obbligatoria di `best_card` valida con `confidence=bassa` in caso di incertezza.
- Aggiornato `buildUserPrompt` con reminder finale: scegliere solo tra mosse legali e rispondere solo in JSON.
- Aggiornati default modello Gemini:
  - primario `gemini-2.0-flash`,
  - fallback `gemini-2.0-flash-lite,gemini-2.5-flash`.
- Portato `AI_MAX_OUTPUT_TOKENS` da `180` a `256` per ridurre troncamenti JSON.

### Configurazione e documentazione
- Aggiornato `backend/.env.example` con nuovi default consigliati Gemini e `AI_MAX_OUTPUT_TOKENS=256`.
- Aggiornati `backend/README.md` e `app/docs/api-setup.md` con i nuovi modelli consigliati e parametri.

## [2026-02-15]

### Correzioni gameplay
- `f009e4e` Fix conter mano avversario.
- `ba48e11` Fix counter mano avversario.

### Miglioramenti AI e robustezza output
- `238d808` `feat(ai): enforce strict scopa-classic JSON output and switch Gemini defaults to 2.0 flash`
  - vincoli forti su regole Scopa classica,
  - risposta AI normalizzata per UI (`Carta consigliata`, `Confidenza`, `Motivo`, `Attenzione`),
  - invio mosse legali dal frontend al backend,
  - fallback multi-modello Gemini,
  - miglioramenti docs backend/frontend.

## [2026-02-14]

### UI e statistiche
- `57305d7` Rimozione statistiche dettagliate per seme dal rendering.

### Upgrade/asset frontend
- `af16d9f` Aggiunti runtime JavaScript e stylesheet per layout applicazione e loading indicators (merge fast-forward da `Angular-upgrade`).

### Routing e deploy
- `b2e0988` Aggiornato `base href` in `angular.json` e `index.html` per routing corretto.
- `6d2f6ac` Aggiornato `openaiProxyUrl` in `environment.prod.ts` con endpoint corretto.
- `a3a9dd0` Correzione artefatti `dist` (fix build/output principale).

### Refactor struttura codice
- `2d8207b` Refactor per migliorare leggibilita e manutenibilita.
- `5ee4c22` Ulteriore refactor per leggibilita e manutenibilita.

### Documentazione backend/AI
- `b37b596` Aggiornati README e documentazione backend per configurazione provider AI (Gemini/OpenAI).

---

## Note sorgente cronologia

Cronologia ricostruita dai log locali del branch `main` (`.git/logs/refs/heads/main`) e include i commit disponibili in questa repository locale.
