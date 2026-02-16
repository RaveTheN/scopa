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
import {
  OpenAIService,
  OpenAiLegalMove,
  OpenAiModelSelection,
  OpenAiOpponentModel,
  OpenAiQueryInput,
  OpenAiReasoningMode,
  OpenAiRequestSource,
  OpenAiRules
} from './openai.service';
import { LocalStorageService } from './local-storage.service';
import { ProbabilityService } from './probability.service';

@Injectable({
  providedIn: 'root'
})
export class AISuggestionService implements OnDestroy {
  private static readonly OPEN_AI_RULES: OpenAiRules = {
    mustCaptureIfPlayableCardCanCapture: true,
    mustPlayCapturingCardIfHaveOne: false,
    capturePriority: 'free',
    endOfHandLastTakerGetsTableRemainder: true,
    aceValue: 1
  };

  private readonly destroy$ = new Subject<void>();
  private readonly autoQueryStorageKey = 'ai_auto_query_enabled';
  private readonly modelSelectionStorageKey = 'ai_model_selection';
  private readonly reasoningModeStorageKey = 'ai_reasoning_mode';
  private readonly autoQueryEnabledSubject = new BehaviorSubject<boolean>(true);
  private readonly modelSelectionSubject = new BehaviorSubject<OpenAiModelSelection>('gpt-5-mini');
  private readonly reasoningModeSubject = new BehaviorSubject<OpenAiReasoningMode>('auto');
  readonly autoQueryEnabled$ = this.autoQueryEnabledSubject.asObservable();
  readonly modelSelection$ = this.modelSelectionSubject.asObservable();
  readonly reasoningMode$ = this.reasoningModeSubject.asObservable();

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
    const savedModelSelection = this.localStorageService.load<OpenAiModelSelection>(this.modelSelectionStorageKey);
    if (savedModelSelection === 'gpt-5-mini' || savedModelSelection === 'gpt-5.2') {
      this.modelSelectionSubject.next(savedModelSelection);
    }
    const savedReasoningMode = this.localStorageService.load<OpenAiReasoningMode>(this.reasoningModeStorageKey);
    if (savedReasoningMode === 'low' || savedReasoningMode === 'auto' || savedReasoningMode === 'medium') {
      this.reasoningModeSubject.next(savedReasoningMode);
    }

    combineLatest([
      this.gameStateService.state,
      this.probabilityService.probabilities$,
      this.autoQueryEnabledSubject,
      this.modelSelectionSubject,
      this.reasoningModeSubject
    ]).pipe(
      takeUntil(this.destroy$),
      tap(([state, probabilities]) => {
        this.latestState = state;
        this.latestProbabilities = probabilities;
      }),
      map(([state, probabilities, autoQueryEnabled, modelSelection, reasoningMode]) => ({
        state,
        probabilities,
        autoQueryEnabled,
        modelSelection,
        reasoningMode,
        key: this.buildTriggerKey(state, probabilities, autoQueryEnabled, modelSelection, reasoningMode)
      })),
      distinctUntilChanged((a, b) => a.key === b.key),
      filter(({ state, autoQueryEnabled }) =>
        autoQueryEnabled &&
        state.turn === 'ME' &&
        state.myHand.length > 0 &&
        state.phase === GamePhase.PLAYING
      ),
      debounceTime(1000),
      switchMap(({ state, probabilities }) => this.executeQuery(state, probabilities, 'auto'))
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

    this.executeQuery(state, this.latestProbabilities, 'manual').subscribe();
  }

  setAutoQueryEnabled(enabled: boolean): void {
    if (this.autoQueryEnabledSubject.value === enabled) {
      return;
    }

    this.autoQueryEnabledSubject.next(enabled);
    this.localStorageService.save(this.autoQueryStorageKey, enabled);
  }

  getModelSelection(): OpenAiModelSelection {
    return this.modelSelectionSubject.value;
  }

  setModelSelection(selection: OpenAiModelSelection): void {
    if (this.modelSelectionSubject.value === selection) {
      return;
    }

    this.modelSelectionSubject.next(selection);
    this.localStorageService.save(this.modelSelectionStorageKey, selection);
  }

  getReasoningMode(): OpenAiReasoningMode {
    return this.reasoningModeSubject.value;
  }

  setReasoningMode(mode: OpenAiReasoningMode): void {
    if (this.reasoningModeSubject.value === mode) {
      return;
    }

    this.reasoningModeSubject.next(mode);
    this.localStorageService.save(this.reasoningModeStorageKey, mode);
  }

  isApiConfigured(): boolean {
    const endpoint = environment.openaiProxyUrl.trim();
    return endpoint.length > 0 && endpoint !== 'YOUR_BACKEND_ENDPOINT_HERE';
  }

  private executeQuery(
    state: GameState,
    probabilities: Map<number, number>,
    requestSource: OpenAiRequestSource
  ): Observable<void> {
    if (!this.isApiConfigured()) {
      this.gameStateService.setAiLoading(false);
      this.gameStateService.setAiSuggestion('Configura endpoint backend OpenAI in environment.ts');
      return of(void 0);
    }

    if (!(state.turn === 'ME' && state.myHand.length > 0 && state.phase === GamePhase.PLAYING)) {
      this.gameStateService.setAiLoading(false);
      return of(void 0);
    }

    const input = this.buildQueryInput(state, probabilities, requestSource);

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

  private buildQueryInput(
    state: GameState,
    probabilities: Map<number, number>,
    requestSource: OpenAiRequestSource
  ): OpenAiQueryInput {
    const probabilitiesByRank: Record<number, number> = {};
    for (let rank = 1; rank <= 10; rank += 1) {
      probabilitiesByRank[rank] = this.roundTo6(probabilities.get(rank) ?? 0);
    }

    const playedCards = Object.entries(state.cardStates)
      .filter(([, cardState]) => cardState === CardState.PLAYED)
      .map(([cardId]) => this.cardLabel(cardId));

    const unseenCardIds = this.listUnseenCardIds(state);
    const unseenCardsCount = unseenCardIds.length;
    const deckCardsRemaining = this.computeDeckCardsRemaining(unseenCardsCount, state.opponentCardCount);
    const isEndgame = deckCardsRemaining === 0;
    const knownOpponentCardIds = isEndgame ? unseenCardIds : [];
    const knownOpponentCards = knownOpponentCardIds.map((cardId) => this.cardLabel(cardId));
    const opponentHandIsKnown = isEndgame && knownOpponentCards.length === state.opponentCardCount;
    const certainOpponentRanks = this.extractCertainOpponentRanks(probabilitiesByRank);
    const tableCards = state.cardsOnTable
      .map((cardId) => CARD_BY_ID[cardId])
      .filter((card): card is Card => !!card);
    const playsRemainingMe = state.myHand.length;
    const playsRemainingOpponent = state.opponentCardCount;
    const pliesToHandEnd = playsRemainingMe + playsRemainingOpponent;
    const opponentModel = this.buildOpponentModel(isEndgame, opponentHandIsKnown, pliesToHandEnd);
    const modelSelection = this.modelSelectionSubject.value;
    const reasoningMode = this.reasoningModeSubject.value;

    return {
      rules: AISuggestionService.OPEN_AI_RULES,
      myHand: state.myHand.map((cardId) => this.cardLabel(cardId)),
      cardsOnTable: state.cardsOnTable.map((cardId) => this.cardLabel(cardId)),
      playedCards,
      myCapturedCards: state.myCapturedCards.map((cardId) => this.cardLabel(cardId)),
      opponentCapturedCards: state.opponentCapturedCards.map((cardId) => this.cardLabel(cardId)),
      unseenCardsCount,
      deckCardsRemaining,
      isEndgame,
      opponentHandIsKnown,
      knownOpponentCards,
      lastCaptureBy: state.lastCaptureBy,
      probabilitiesByRank,
      certainOpponentRanks,
      opponentCardCount: state.opponentCardCount,
      playsRemainingMe,
      playsRemainingOpponent,
      pliesToHandEnd,
      requestSource,
      modelSelection,
      reasoningMode,
      opponentModel,
      legalMoves: state.myHand
        .map((cardId) => this.buildLegalMove(cardId, tableCards))
        .filter((move): move is OpenAiLegalMove => !!move)
    };
  }

  private buildTriggerKey(
    state: GameState,
    probabilities: Map<number, number>,
    autoQueryEnabled: boolean,
    modelSelection: OpenAiModelSelection,
    reasoningMode: OpenAiReasoningMode
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
      lastCaptureBy: state.lastCaptureBy,
      pendingPlayedCard: state.pendingPlayedCard,
      selectedCombination: state.selectedCombination,
      probabilityVector,
      autoQueryEnabled,
      modelSelection,
      reasoningMode
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

  private listUnseenCardIds(state: GameState): string[] {
    return Object.entries(state.cardStates)
      .filter(([, cardState]) => cardState === CardState.UNKNOWN)
      .map(([cardId]) => cardId);
  }

  private computeDeckCardsRemaining(unseenCardsCount: number, opponentCardCount: number): number {
    return Math.max(0, unseenCardsCount - Math.max(0, opponentCardCount));
  }

  private extractCertainOpponentRanks(probabilitiesByRank: Record<number, number>): number[] {
    const result: number[] = [];

    for (let rank = 1; rank <= 10; rank += 1) {
      const value = Number(probabilitiesByRank[rank] ?? 0);
      if (value >= 0.999999) {
        result.push(rank);
      }
    }

    return result;
  }

  private buildOpponentModel(
    isEndgame: boolean,
    opponentHandIsKnown: boolean,
    pliesToHandEnd: number
  ): OpenAiOpponentModel {
    const shortHorizonEndgame = pliesToHandEnd > 0 && pliesToHandEnd <= 6;

    return {
      assumePerfectEndgamePlay: isEndgame || shortHorizonEndgame,
      countsCardsAndInfersHands: isEndgame || opponentHandIsKnown || shortHorizonEndgame,
      playsToMaximizeOwnOutcome: true,
      evaluationMethod: 'maximin'
    };
  }
}
