import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
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
export class AppComponent implements AfterViewInit, OnDestroy {
  readonly gamePhase = GamePhase;
  readonly phase$ = this.gameStateService.phase;
  private aiPanelInitTimer: ReturnType<typeof setTimeout> | null = null;

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

  ngAfterViewInit(): void {
    this.aiPanelInitTimer = setTimeout(() => this.initAiPanelAutoHeight(), 0);
  }

  ngOnDestroy(): void {
    if (this.aiPanelInitTimer) {
      clearTimeout(this.aiPanelInitTimer);
      this.aiPanelInitTimer = null;
    }
  }

  onTableCardClicked(cardId: string, phase: GamePhase): void {
    if (phase === GamePhase.CHOOSE_COMBINATION) {
      this.gameStateService.selectCombinationCard(cardId);
      return;
    }

    this.gameStateService.clickTableCard(cardId);
  }

  private initAiPanelAutoHeight(attempt = 0): void {
    const panel = this.getAiPanelElement();
    if (!panel) {
      if (attempt < 40) {
        this.aiPanelInitTimer = setTimeout(() => this.initAiPanelAutoHeight(attempt + 1), 100);
      }
      return;
    }

    this.updateAiTextHeight();
    this.aiPanelInitTimer = null;
  }

  private getAiPanelElement(): HTMLElement | null {
    return document.querySelector('.ai-panel');
  }

  private updateAiTextHeight(): void {
    const panel = this.getAiPanelElement();
    if (!panel) {
      return;
    }

    const text = panel.querySelector('.ai-text');
    if (!(text instanceof HTMLElement)) {
      return;
    }

    const style = window.getComputedStyle(panel);
    const paddingTop = Number.parseFloat(style.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
    const gap = Number.parseFloat(style.rowGap || style.gap || '0') || 0;

    const children = Array.from(panel.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement
    );

    const visibleChildren = children.filter((child) => this.isVisibleElement(child));
    if (visibleChildren.length === 0) {
      return;
    }

    const occupiedHeight = visibleChildren
      .filter((child) => child !== text)
      .reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);

    const innerPanelHeight = panel.getBoundingClientRect().height - paddingTop - paddingBottom;
    const gapsHeight = gap * Math.max(0, visibleChildren.length - 1);
    const residualHeight = Math.floor(innerPanelHeight - occupiedHeight - gapsHeight);
    const safeHeight = Math.max(80, residualHeight);

    text.style.height = `${safeHeight}px`;
  }

  private isVisibleElement(element: HTMLElement): boolean {
    if (element === document.body) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
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
