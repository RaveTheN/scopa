import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { AISuggestionService } from './services/ai-suggestion.service';
import { GameStateService } from './services/game-state.service';
import { ProbabilityService } from './services/probability.service';
import { CardGridComponent } from './components/card-grid/card-grid.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { StatsPanelComponent } from './components/stats-panel/stats-panel.component';
import { HandSelectorComponent } from './components/hand-selector/hand-selector.component';
import { AISuggestionPanelComponent } from './components/ai-suggestion-panel/ai-suggestion-panel.component';
import { LogBarComponent } from './components/log-bar/log-bar.component';
import { CARD_BY_ID, CardState, GamePhase, GameState } from './models/card.model';
import { findCombinations } from './utils/combinations.util';

interface TableViewModel {
  cardStates: Record<string, CardState>;
  probabilities: Record<number, number>;
  selectableCardIds: Set<string>;
  phase: GamePhase;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    StatsPanelComponent,
    CardGridComponent,
    HandSelectorComponent,
    AISuggestionPanelComponent,
    LogBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly gamePhase = GamePhase;
  readonly phase$ = this.gameStateService.phase;

  readonly tableVm$ = combineLatest([
    this.gameStateService.state,
    this.probabilityService.probabilities$
  ]).pipe(
    map(([state, probabilities]): TableViewModel => {
      const probabilityRecord: Record<number, number> = {};
      for (let rank = 1; rank <= 10; rank += 1) {
        probabilityRecord[rank] = probabilities.get(rank) ?? 0;
      }

      return {
        cardStates: state.cardStates,
        probabilities: probabilityRecord,
        selectableCardIds: this.buildSelectableSet(state),
        phase: state.phase
      };
    })
  );

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly probabilityService: ProbabilityService,
    private readonly aiSuggestionService: AISuggestionService
  ) {
    void this.aiSuggestionService;
  }

  onTableCardClicked(cardId: string, phase: GamePhase): void {
    if (phase === GamePhase.CHOOSE_COMBINATION) {
      this.gameStateService.selectCombinationCard(cardId);
      return;
    }

    this.gameStateService.clickTableCard(cardId);
  }

  private buildSelectableSet(state: GameState): Set<string> {
    const selectable = new Set<string>();

    if (state.phase === GamePhase.INITIAL_FOUR) {
      for (const [cardId, cardState] of Object.entries(state.cardStates)) {
        if (cardState === CardState.UNKNOWN || cardState === CardState.ON_TABLE) {
          selectable.add(cardId);
        }
      }
      return selectable;
    }

    if (state.phase === GamePhase.PLAYING) {
      for (const [cardId, cardState] of Object.entries(state.cardStates)) {
        if (state.turn === 'ME' && cardState === CardState.IN_MY_HAND) {
          selectable.add(cardId);
        }

        if (state.turn === 'OPPONENT' && cardState === CardState.UNKNOWN) {
          selectable.add(cardId);
        }
      }
      return selectable;
    }

    if (!state.pendingPlayedCard) {
      return selectable;
    }

    const pendingCard = CARD_BY_ID[state.pendingPlayedCard];
    if (!pendingCard) {
      return selectable;
    }

    const tableCards = state.cardsOnTable
      .map((id) => CARD_BY_ID[id])
      .filter((card) => !!card);
    const validCombinations = findCombinations(pendingCard.rank, tableCards);

    for (const combination of validCombinations) {
      for (const card of combination) {
        selectable.add(card.id);
      }
    }

    for (const cardId of state.selectedCombination) {
      selectable.add(cardId);
    }

    return selectable;
  }
}
