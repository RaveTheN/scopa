import { Injectable, OnDestroy } from '@angular/core';
import {
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
  CardState,
  GamePhase,
  GameState
} from '../models/card.model';
import { GameStateService } from './game-state.service';
import { OpenAIService, OpenAiQueryInput } from './openai.service';
import { ProbabilityService } from './probability.service';

@Injectable({
  providedIn: 'root'
})
export class AISuggestionService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private latestState: GameState | null = null;
  private latestProbabilities = new Map<number, number>();

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly probabilityService: ProbabilityService,
    private readonly openAiService: OpenAIService
  ) {
    combineLatest([
      this.gameStateService.state,
      this.probabilityService.probabilities$
    ]).pipe(
      takeUntil(this.destroy$),
      tap(([state, probabilities]) => {
        this.latestState = state;
        this.latestProbabilities = probabilities;
      }),
      map(([state, probabilities]) => ({
        state,
        probabilities,
        key: this.buildTriggerKey(state, probabilities)
      })),
      distinctUntilChanged((a, b) => a.key === b.key),
      filter(({ state }) =>
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

  isApiConfigured(): boolean {
    const key = environment.openaiApiKey.trim();
    return key.length > 0 && key !== 'YOUR_API_KEY_HERE';
  }

  private executeQuery(state: GameState, probabilities: Map<number, number>): Observable<void> {
    if (!this.isApiConfigured()) {
      this.gameStateService.setAiLoading(false);
      this.gameStateService.setAiSuggestion('Configura la API key di OpenAI in environment.ts');
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
      probabilitiesByRank[rank] = probabilities.get(rank) ?? 0;
    }

    const playedStates = new Set<CardState>([
      CardState.PLAYED,
      CardState.ON_TABLE,
      CardState.ON_TABLE_BLINKING,
      CardState.COMBINATION_CANDIDATE
    ]);

    const playedCards = Object.entries(state.cardStates)
      .filter(([, cardState]) => playedStates.has(cardState))
      .map(([cardId]) => this.cardLabel(cardId));

    const unknownCardsCount = Object.values(state.cardStates).filter((cardState) => cardState === CardState.UNKNOWN).length;

    return {
      myHand: state.myHand.map((cardId) => this.cardLabel(cardId)),
      cardsOnTable: state.cardsOnTable.map((cardId) => this.cardLabel(cardId)),
      playedCards,
      unknownCardsCount,
      probabilitiesByRank,
      opponentCardCount: state.opponentCardCount
    };
  }

  private buildTriggerKey(state: GameState, probabilities: Map<number, number>): string {
    const probabilityVector = Array.from({ length: 10 }, (_, index) => probabilities.get(index + 1) ?? 0);

    return JSON.stringify({
      cardStates: state.cardStates,
      phase: state.phase,
      turn: state.turn,
      myHand: state.myHand,
      cardsOnTable: state.cardsOnTable,
      opponentCardCount: state.opponentCardCount,
      pendingPlayedCard: state.pendingPlayedCard,
      selectedCombination: state.selectedCombination,
      probabilityVector
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
}
