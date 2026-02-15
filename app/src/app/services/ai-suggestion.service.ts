import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
  catchError
} from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CARD_BY_ID,
  Card,
  CardState,
  GamePhase,
  GameState
} from '../models/card.model';
import { findCombinations } from '../utils/combinations.util';
import { GameStateService } from './game-state.service';
import { OpenAIService, OpenAiLegalMove, OpenAiQueryInput } from './openai.service';
import { LocalStorageService } from './local-storage.service';
import { ProbabilityService } from './probability.service';

@Injectable({
  providedIn: 'root'
})
export class AISuggestionService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly autoQueryStorageKey = 'ai_auto_query_enabled';
  private readonly autoQueryEnabledSubject = new BehaviorSubject<boolean>(true);
  readonly autoQueryEnabled$ = this.autoQueryEnabledSubject.asObservable();

  private latestState: GameState | null = null;
  private latestProbabilities = new Map<number, number>();

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly probabilityService: ProbabilityService,
    private readonly openAiService: OpenAIService,
    private readonly localStorageService: LocalStorageService
  ) {
    const saved = this.localStorageService.load<boolean>(this.autoQueryStorageKey);
    if (typeof saved === 'boolean') {
      this.autoQueryEnabledSubject.next(saved);
    }

    combineLatest([
      this.gameStateService.state,
      this.probabilityService.probabilities$,
      this.autoQueryEnabledSubject
    ]).pipe(
      takeUntil(this.destroy$),
      tap(([state, probabilities]) => {
        this.latestState = state;
        this.latestProbabilities = probabilities;
      }),
      map(([state, probabilities, autoQueryEnabled]) => ({
        state,
        probabilities,
        autoQueryEnabled,
        key: this.buildTriggerKey(state, probabilities, autoQueryEnabled)
      })),
      distinctUntilChanged((a, b) => a.key === b.key),
      filter(({ state, autoQueryEnabled }) =>
        autoQueryEnabled &&
        state.turn === 'ME' &&
        state.myHand.length > 0 &&
        state.phase === GamePhase.PLAYING
      ),
      debounceTime(1000),
      switchMap(({ state, probabilities }) => this.executeQuery(state, probabilities))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  manualQuery(): void {
    const state = this.latestState;
    if (!state) {
      return;
    }

    this.executeQuery(state, this.latestProbabilities).subscribe();
  }

  setAutoQueryEnabled(enabled: boolean): void {
    if (this.autoQueryEnabledSubject.value === enabled) {
      return;
    }

    this.autoQueryEnabledSubject.next(enabled);
    this.localStorageService.save(this.autoQueryStorageKey, enabled);
  }

  isApiConfigured(): boolean {
    const endpoint = environment.openaiProxyUrl.trim();
    return endpoint.length > 0 && endpoint !== 'YOUR_BACKEND_ENDPOINT_HERE';
  }

  private executeQuery(state: GameState, probabilities: Map<number, number>): Observable<void> {
    if (!this.isApiConfigured()) {
      this.gameStateService.setAiLoading(false);
      this.gameStateService.setAiSuggestion('Configura endpoint backend OpenAI in environment.ts');
      return of(void 0);
    }

    if (!(state.turn === 'ME' && state.myHand.length > 0 && state.phase === GamePhase.PLAYING)) {
      this.gameStateService.setAiLoading(false);
      return of(void 0);
    }

    const input = this.buildQueryInput(state, probabilities);

    this.gameStateService.setAiLoading(true);

    return this.openAiService.queryBestMove(input).pipe(
      tap((suggestion) => {
        this.gameStateService.setAiSuggestion(suggestion);
      }),
      catchError(() => {
        this.gameStateService.setAiSuggestion('Errore durante la richiesta a OpenAI.');
        return of('');
      }),
      finalize(() => {
        this.gameStateService.setAiLoading(false);
      }),
      map(() => void 0)
    );
  }

  private buildQueryInput(state: GameState, probabilities: Map<number, number>): OpenAiQueryInput {
    const probabilitiesByRank: Record<number, number> = {};
    for (let rank = 1; rank <= 10; rank += 1) {
      probabilitiesByRank[rank] = this.roundTo6(probabilities.get(rank) ?? 0);
    }

    const playedCards = Object.entries(state.cardStates)
      .filter(([, cardState]) => cardState === CardState.PLAYED)
      .map(([cardId]) => this.cardLabel(cardId));

    const unknownCardsCount = Object.values(state.cardStates).filter((cardState) => cardState === CardState.UNKNOWN).length;
    const tableCards = state.cardsOnTable
      .map((cardId) => CARD_BY_ID[cardId])
      .filter((card): card is Card => !!card);

    return {
      myHand: state.myHand.map((cardId) => this.cardLabel(cardId)),
      cardsOnTable: state.cardsOnTable.map((cardId) => this.cardLabel(cardId)),
      playedCards,
      unknownCardsCount,
      probabilitiesByRank,
      opponentCardCount: state.opponentCardCount,
      legalMoves: state.myHand
        .map((cardId) => this.buildLegalMove(cardId, tableCards))
        .filter((move): move is OpenAiLegalMove => !!move)
    };
  }

  private buildTriggerKey(
    state: GameState,
    probabilities: Map<number, number>,
    autoQueryEnabled: boolean
  ): string {
    const probabilityVector = Array.from(
      { length: 10 },
      (_, index) => this.roundTo6(probabilities.get(index + 1) ?? 0)
    );

    return JSON.stringify({
      cardStates: state.cardStates,
      phase: state.phase,
      turn: state.turn,
      myHand: state.myHand,
      cardsOnTable: state.cardsOnTable,
      opponentCardCount: state.opponentCardCount,
      pendingPlayedCard: state.pendingPlayedCard,
      selectedCombination: state.selectedCombination,
      probabilityVector,
      autoQueryEnabled
    });
  }

  private cardLabel(cardId: string): string {
    const card = CARD_BY_ID[cardId];
    if (!card) {
      return cardId;
    }

    return `${this.rankLabel(card.rank)} di ${card.suit}`;
  }

  private rankLabel(rank: number): string {
    if (rank === 1) {
      return 'Asso';
    }
    if (rank === 8) {
      return 'Donna';
    }
    if (rank === 9) {
      return 'Cavallo';
    }
    if (rank === 10) {
      return 'Re';
    }
    return rank.toString();
  }

  private buildLegalMove(cardId: string, tableCards: Card[]): OpenAiLegalMove | null {
    const playedCard = CARD_BY_ID[cardId];
    if (!playedCard) {
      return null;
    }

    const captures = findCombinations(playedCard.rank, tableCards)
      .map((combination) => combination.map((card) => this.cardLabel(card.id)));

    return {
      card: this.cardLabel(playedCard.id),
      captures
    };
  }

  private roundTo6(value: number): number {
    return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
  }
}
