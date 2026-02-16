import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { CARD_BY_ID, CardState, createCardId, GamePhase, Suit } from '../../models/card.model';
import { AISuggestionService } from '../../services/ai-suggestion.service';
import { GameStateService } from '../../services/game-state.service';
import { OpenAiModelSelection, OpenAiReasoningMode } from '../../services/openai.service';

interface StatsViewModel {
  denariPlayed: number;
  coppePlayed: number;
  spadePlayed: number;
  bastoniPlayed: number;
  remainingCards: number;
  myCaptured: number;
  opponentCaptured: number;
  setteOroStatus: string;
  showTableProbabilities: boolean;
  phaseLabel: string;
}

const SETTE_ORO_ID = createCardId(Suit.Denari, 7);

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.scss']
})
export class StatsPanelComponent {
  private readonly totalCards = 40;

  readonly autoQueryEnabled$ = this.aiSuggestionService.autoQueryEnabled$;
  readonly modelSelection$ = this.aiSuggestionService.modelSelection$;
  readonly reasoningMode$ = this.aiSuggestionService.reasoningMode$;
  readonly stats$ = this.gameStateService.state.pipe(
    map((state): StatsViewModel => {
      const knownCardIds = Object.entries(state.cardStates)
        .filter(([, cardState]) => cardState !== CardState.UNKNOWN)
        .map(([cardId]) => cardId);

      const denariPlayed = knownCardIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Denari)
        .length;
      const coppePlayed = knownCardIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Coppe)
        .length;
      const spadePlayed = knownCardIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Spade)
        .length;
      const bastoniPlayed = knownCardIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Bastoni)
        .length;

      const cardsOutsideDeck = knownCardIds.length + (knownCardIds.length > 0 ? state.opponentCardCount : 0);
      const remainingCards = this.clamp(this.totalCards - cardsOutsideDeck, 0, this.totalCards);
      const myHasSetteOro = state.myCapturedCards.includes(SETTE_ORO_ID);
      const opponentHasSetteOro = state.opponentCapturedCards.includes(SETTE_ORO_ID);

      let setteOroStatus = 'Non preso';
      if (myHasSetteOro && !opponentHasSetteOro) {
        setteOroStatus = 'Preso da te';
      } else if (!myHasSetteOro && opponentHasSetteOro) {
        setteOroStatus = 'Preso da avversario';
      } else if (myHasSetteOro && opponentHasSetteOro) {
        setteOroStatus = 'Incoerente';
      }

      return {
        denariPlayed,
        coppePlayed,
        spadePlayed,
        bastoniPlayed,
        remainingCards,
        myCaptured: state.myCapturedCards.length,
        opponentCaptured: state.opponentCapturedCards.length,
        setteOroStatus,
        showTableProbabilities: state.showTableProbabilities,
        phaseLabel: this.toPhaseLabel(state.phase)
      };
    })
  );

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly aiSuggestionService: AISuggestionService
  ) {}

  onAutoQueryToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.aiSuggestionService.setAutoQueryEnabled(!!target?.checked);
  }

  onShowProbabilitiesToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.gameStateService.setShowTableProbabilities(!!target?.checked);
  }

  onModelToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const nextModel: OpenAiModelSelection = target?.checked ? 'gpt-5.2' : 'gpt-5-mini';
    this.aiSuggestionService.setModelSelection(nextModel);
  }

  onReasoningAutoToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const checked = !!target?.checked;
    const currentMode = this.aiSuggestionService.getReasoningMode();

    if (checked) {
      this.aiSuggestionService.setReasoningMode('auto');
      return;
    }

    if (currentMode === 'auto') {
      this.aiSuggestionService.setReasoningMode('low');
    }
  }

  onReasoningMediumToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const checked = !!target?.checked;
    const currentMode = this.aiSuggestionService.getReasoningMode();

    if (checked) {
      if (currentMode !== 'medium') {
        const confirmed = window.confirm(
          'Passando a reasoning medium aumentano costi e tempi della risposta. Vuoi continuare?'
        );
        if (!confirmed) {
          return;
        }
      }

      this.aiSuggestionService.setReasoningMode('medium');
      return;
    }

    if (currentMode === 'medium') {
      this.aiSuggestionService.setReasoningMode('auto');
    }
  }

  private toPhaseLabel(phase: GamePhase): string {
    if (phase === GamePhase.INITIAL_FOUR) {
      return 'Carte iniziali';
    }

    if (phase === GamePhase.PLAYING) {
      return 'In gioco';
    }

    return 'Scegli combinazione';
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
