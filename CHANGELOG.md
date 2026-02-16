# Changelog

Tutte le modifiche rilevanti a questo progetto sono documentate in questo file.

## [Unreleased]

## [2026-02-16]

### Added
- Stima costo per chiamata OpenAI lato backend con breakdown (`input`, `cachedInput`, `output`) e log server `[openai-cost]`.
- Nuovi campi nella risposta API `POST /api/openai/suggestion`: `usage`, `estimatedCostUsd`, `estimatedCostBreakdownUsd`.
- Supporto payload per selezione runtime di modello e reasoning:
  - `modelSelection`: `gpt-5-mini` | `gpt-5.2`
  - `reasoningMode`: `low` | `auto` | `medium`
- Nuovi toggle in UI (spostati nel pannello statistiche) per:
  - switch modello (`GPT-5.2` ON, `gpt-5-mini` OFF)
  - reasoning auto
  - reasoning medium

### Changed
- Default frontend impostati a:
  - modello `gpt-5-mini`
  - reasoning `auto`
- Aggiunta conferma utente quando si attiva `reasoning=medium` (avviso costi/tempi).
- Strategia reasoning backend aggiornata:
  - `low`: sempre `low`
  - `auto`: `low` di default, `medium` su richiesta manuale/endgame
  - `medium`: sempre `medium`
- `SYSTEM_PROMPT` allineato alle regole richieste:
  - `mustCaptureIfPlayableCardCanCapture=true`
  - `mustPlayCapturingCardIfHaveOne=false`
  - `capturePriority=free`
  - `endOfHandLastTakerGetsTableRemainder=true`
  - `aceValue=1`
- Limiti di troncamento dei campi testuali risposta portati a 500 caratteri.
- `unknownCardsCount` rinominato concettualmente in `unseenCardsCount` nel payload frontend.

### Fixed
- Logica combinazioni aggiornata per rispettare `capturePriority=free` (nessuna priorità forzata su presa singola).
- Aggiornati test TypeScript/unitari collegati ai nuovi campi payload e al comportamento aggiornato.

### Notes
- Compatibilità retro mantenuta lato backend: se arriva ancora `unknownCardsCount`, viene comunque gestito.
