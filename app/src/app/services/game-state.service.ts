import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  ALL_CARDS,
  CARD_BY_ID,
  CardState,
  GamePhase,
  GameState,
  GameStateSnapshot,
  Turn
} from '../models/card.model';
import { CardTrackerService } from './card-tracker.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly storageKey = 'state';
  private readonly stateSubject = new BehaviorSubject<GameState>(this.createInitialState());

  readonly state: Observable<GameState> = this.stateSubject.asObservable();
  readonly cardStates = this.state.pipe(map((state) => state.cardStates));
  readonly phase = this.state.pipe(map((state) => state.phase));
  readonly turn = this.state.pipe(map((state) => state.turn));
  readonly showTableProbabilities = this.state.pipe(map((state) => state.showTableProbabilities));
  readonly myHand = this.state.pipe(map((state) => state.myHand));
  readonly opponentCardCount = this.state.pipe(map((state) => state.opponentCardCount));
  readonly cardsOnTable = this.state.pipe(map((state) => state.cardsOnTable));
  readonly myCapturedCards = this.state.pipe(map((state) => state.myCapturedCards));
  readonly opponentCapturedCards = this.state.pipe(map((state) => state.opponentCapturedCards));
  readonly lastPlayLog = this.state.pipe(map((state) => state.lastPlayLog));
  readonly aiSuggestion = this.state.pipe(map((state) => state.aiSuggestion));
  readonly aiLoading = this.state.pipe(map((state) => state.aiLoading));

  constructor(
    private readonly cardTracker: CardTrackerService,
    private readonly localStorageService: LocalStorageService
  ) {
    this.stateSubject.next(this.restoreState());
  }

  getCurrentState(): GameState {
    return this.stateSubject.value;
  }

  reset(): void {
    const next = this.createInitialState();
    this.commit(next);
  }

  undo(): void {
    const current = this.stateSubject.value;
    if (current.history.length === 0) {
      return;
    }

    const previous = current.history[current.history.length - 1];
    const restored = this.cloneSnapshot(previous);

    const next: GameState = {
      ...restored,
      history: current.history.slice(0, -1).map((snapshot) => this.cloneSnapshot(snapshot)),
      aiSuggestion: current.aiSuggestion,
      aiLoading: current.aiLoading
    };

    this.commit(next);
  }

  setTurn(turn: Exclude<Turn, null>): void {
    this.applyMutation((draft) => {
      if (draft.turn !== null) {
        return false;
      }

      this.setTurnWithOpponentRefill(draft, turn);
      return true;
    });
  }

  toggleTurn(): void {
    this.applyMutation((draft) => {
      if (draft.turn === null) {
        return false;
      }

      const nextTurn = draft.turn === 'ME' ? 'OPPONENT' : 'ME';
      this.setTurnWithOpponentRefill(draft, nextTurn);
      return true;
    });
  }

  clickTableCard(cardId: string): string | null {
    let error: string | null = null;

    this.applyMutation((draft) => {
      const result = this.cardTracker.handleTableCardClick(draft, cardId);
      if (result.error) {
        error = result.error;
        return false;
      }

      if (!result.didMutate) {
        return false;
      }

      if (result.shouldDecrementOpponent) {
        draft.opponentCardCount = Math.max(0, draft.opponentCardCount - 1);
      }

      if (result.shouldToggleTurn) {
        const nextTurn = draft.turn === 'ME' ? 'OPPONENT' : 'ME';
        this.setTurnWithOpponentRefill(draft, nextTurn);
      }

      return true;
    });

    return error;
  }

  clickHandCard(cardId: string): void {
    this.applyMutation((draft) => {
      const current = draft.cardStates[cardId];
      if (!current) {
        return false;
      }

      if (current === CardState.PLAYED || current === CardState.ON_TABLE || current === CardState.ON_TABLE_BLINKING || current === CardState.COMBINATION_CANDIDATE) {
        return false;
      }

      if (current === CardState.IN_MY_HAND) {
        draft.cardStates[cardId] = CardState.UNKNOWN;
        draft.myHand = draft.myHand.filter((id) => id !== cardId);
        return true;
      }

      if (current === CardState.UNKNOWN && draft.myHand.length < 3) {
        draft.cardStates[cardId] = CardState.IN_MY_HAND;
        draft.myHand = [...draft.myHand, cardId];

        if (draft.opponentCardCount === 0) {
          draft.opponentCardCount = 3;
        }

        return true;
      }

      return false;
    });
  }

  selectCombinationCard(cardId: string): string | null {
    let error: string | null = null;

    this.applyMutation((draft) => {
      const result = this.cardTracker.handleCombinationSelection(draft, cardId);
      if (result.error) {
        error = result.error;
        return false;
      }

      if (!result.didMutate) {
        return false;
      }

      if (result.shouldToggleTurn) {
        const nextTurn = draft.turn === 'ME' ? 'OPPONENT' : 'ME';
        this.setTurnWithOpponentRefill(draft, nextTurn);
      }

      return true;
    });

    return error;
  }

  setOpponentCardCount(value: number): void {
    const nextValue = this.clamp(Math.round(value), 0, 3);

    this.applyMutation((draft) => {
      if (draft.opponentCardCount === nextValue) {
        return false;
      }

      draft.opponentCardCount = nextValue;
      return true;
    });
  }

  decrementOpponentCards(): void {
    this.applyMutation((draft) => {
      const next = Math.max(0, draft.opponentCardCount - 1);
      if (next === draft.opponentCardCount) {
        return false;
      }

      draft.opponentCardCount = next;
      return true;
    });
  }

  setShowTableProbabilities(show: boolean): void {
    this.applyMutation((draft) => {
      if (draft.showTableProbabilities === show) {
        return false;
      }

      draft.showTableProbabilities = show;
      return true;
    });
  }

  setAiSuggestion(suggestion: string): void {
    this.applyMutation((draft) => {
      if (draft.aiSuggestion === suggestion) {
        return false;
      }

      draft.aiSuggestion = suggestion;
      return true;
    });
  }

  setAiLoading(loading: boolean): void {
    this.applyMutation((draft) => {
      if (draft.aiLoading === loading) {
        return false;
      }

      draft.aiLoading = loading;
      return true;
    });
  }

  private applyMutation(mutator: (draft: GameState) => boolean): void {
    const current = this.stateSubject.value;
    const draft = this.cloneState(current);
    const didMutate = mutator(draft);

    if (!didMutate) {
      return;
    }

    draft.history.push(this.cloneSnapshot(this.toSnapshot(current)));
    this.commit(draft);
  }

  private commit(state: GameState): void {
    this.stateSubject.next(state);
    this.localStorageService.save(this.storageKey, state);
  }

  private restoreState(): GameState {
    const loaded = this.localStorageService.load<Partial<GameState>>(this.storageKey);
    if (!loaded) {
      return this.createInitialState();
    }

    return this.normalizeState(loaded);
  }

  private normalizeState(raw: Partial<GameState>): GameState {
    const snapshot = this.normalizeSnapshot(raw);
    const historyRaw = Array.isArray(raw.history) ? raw.history : [];
    const history = historyRaw.map((item) => this.normalizeSnapshot(item));

    return {
      ...snapshot,
      history,
      aiSuggestion: typeof raw.aiSuggestion === 'string' ? raw.aiSuggestion : '',
      aiLoading: typeof raw.aiLoading === 'boolean' ? raw.aiLoading : false
    };
  }

  private normalizeSnapshot(raw: Partial<GameStateSnapshot>): GameStateSnapshot {
    const initial = this.createInitialSnapshot();
    const cardStates: Record<string, CardState> = {};
    const validStates = new Set(Object.values(CardState));

    for (const card of ALL_CARDS) {
      const value = raw.cardStates?.[card.id];
      cardStates[card.id] = validStates.has(value as CardState)
        ? (value as CardState)
        : CardState.UNKNOWN;
    }

    const phaseValues = new Set(Object.values(GamePhase));
    const phase = phaseValues.has(raw.phase as GamePhase)
      ? (raw.phase as GamePhase)
      : GamePhase.INITIAL_FOUR;

    const turn = raw.turn === 'ME' || raw.turn === 'OPPONENT' ? raw.turn : null;
    const lastCaptureBy = raw.lastCaptureBy === 'ME' || raw.lastCaptureBy === 'OPPONENT'
      ? raw.lastCaptureBy
      : null;

    const myHand = this.uniqueIds(Array.isArray(raw.myHand) ? raw.myHand : []).filter((id) => id in CARD_BY_ID).slice(0, 3);
    const cardsOnTable = this.uniqueIds(Array.isArray(raw.cardsOnTable) ? raw.cardsOnTable : []).filter((id) => id in CARD_BY_ID);
    const myCapturedCards = this.uniqueIds(Array.isArray(raw.myCapturedCards) ? raw.myCapturedCards : []).filter((id) => id in CARD_BY_ID);
    const opponentCapturedCards = this.uniqueIds(Array.isArray(raw.opponentCapturedCards) ? raw.opponentCapturedCards : []).filter((id) => id in CARD_BY_ID);
    const selectedCombination = this.uniqueIds(Array.isArray(raw.selectedCombination) ? raw.selectedCombination : []).filter((id) => id in CARD_BY_ID);

    for (const id of myHand) {
      if (cardStates[id] === CardState.UNKNOWN) {
        cardStates[id] = CardState.IN_MY_HAND;
      }
    }

    for (const id of cardsOnTable) {
      if (cardStates[id] === CardState.UNKNOWN) {
        cardStates[id] = CardState.ON_TABLE;
      }
    }

    const pendingPlayedCard = typeof raw.pendingPlayedCard === 'string' && raw.pendingPlayedCard in CARD_BY_ID
      ? raw.pendingPlayedCard
      : null;

    if (pendingPlayedCard && cardStates[pendingPlayedCard] === CardState.UNKNOWN) {
      cardStates[pendingPlayedCard] = CardState.ON_TABLE_BLINKING;
    }

    for (const id of selectedCombination) {
      if (cardStates[id] === CardState.ON_TABLE) {
        cardStates[id] = CardState.COMBINATION_CANDIDATE;
      }
    }

    return {
      ...initial,
      cardStates,
      phase,
      turn,
      lastCaptureBy,
      showTableProbabilities: typeof raw.showTableProbabilities === 'boolean'
        ? raw.showTableProbabilities
        : true,
      myHand,
      opponentCardCount: this.clamp(
        typeof raw.opponentCardCount === 'number' ? Math.round(raw.opponentCardCount) : 3,
        0,
        3
      ),
      cardsOnTable,
      myCapturedCards,
      opponentCapturedCards,
      initialFourCount: this.clamp(
        typeof raw.initialFourCount === 'number' ? Math.round(raw.initialFourCount) : cardsOnTable.length,
        0,
        4
      ),
      lastPlayLog: typeof raw.lastPlayLog === 'string' ? raw.lastPlayLog : '',
      pendingPlayedCard,
      selectedCombination
    };
  }

  private createInitialState(): GameState {
    return {
      ...this.createInitialSnapshot(),
      history: [],
      aiSuggestion: '',
      aiLoading: false
    };
  }

  private createInitialSnapshot(): GameStateSnapshot {
    const cardStates: Record<string, CardState> = {};

    for (const card of ALL_CARDS) {
      cardStates[card.id] = CardState.UNKNOWN;
    }

    return {
      cardStates,
      phase: GamePhase.INITIAL_FOUR,
      turn: null,
      lastCaptureBy: null,
      showTableProbabilities: true,
      myHand: [],
      opponentCardCount: 3,
      cardsOnTable: [],
      myCapturedCards: [],
      opponentCapturedCards: [],
      initialFourCount: 0,
      lastPlayLog: '',
      pendingPlayedCard: null,
      selectedCombination: []
    };
  }

  private toSnapshot(state: GameState): GameStateSnapshot {
    return {
      cardStates: { ...state.cardStates },
      phase: state.phase,
      turn: state.turn,
      lastCaptureBy: state.lastCaptureBy,
      showTableProbabilities: state.showTableProbabilities,
      myHand: [...state.myHand],
      opponentCardCount: state.opponentCardCount,
      cardsOnTable: [...state.cardsOnTable],
      myCapturedCards: [...state.myCapturedCards],
      opponentCapturedCards: [...state.opponentCapturedCards],
      initialFourCount: state.initialFourCount,
      lastPlayLog: state.lastPlayLog,
      pendingPlayedCard: state.pendingPlayedCard,
      selectedCombination: [...state.selectedCombination]
    };
  }

  private cloneSnapshot(snapshot: GameStateSnapshot): GameStateSnapshot {
    return {
      cardStates: { ...snapshot.cardStates },
      phase: snapshot.phase,
      turn: snapshot.turn,
      lastCaptureBy: snapshot.lastCaptureBy,
      showTableProbabilities: snapshot.showTableProbabilities,
      myHand: [...snapshot.myHand],
      opponentCardCount: snapshot.opponentCardCount,
      cardsOnTable: [...snapshot.cardsOnTable],
      myCapturedCards: [...snapshot.myCapturedCards],
      opponentCapturedCards: [...snapshot.opponentCapturedCards],
      initialFourCount: snapshot.initialFourCount,
      lastPlayLog: snapshot.lastPlayLog,
      pendingPlayedCard: snapshot.pendingPlayedCard,
      selectedCombination: [...snapshot.selectedCombination]
    };
  }

  private cloneState(state: GameState): GameState {
    return {
      ...this.cloneSnapshot(state),
      history: state.history.map((snapshot) => this.cloneSnapshot(snapshot)),
      aiSuggestion: state.aiSuggestion,
      aiLoading: state.aiLoading
    };
  }

  private uniqueIds(ids: string[]): string[] {
    return [...new Set(ids)];
  }

  private setTurnWithOpponentRefill(draft: GameState, turn: Exclude<Turn, null>): void {
    const previousTurn = draft.turn;
    draft.turn = turn;

    const isHandRefillTurnChange = previousTurn === 'ME' && turn === 'OPPONENT';
    if (isHandRefillTurnChange && draft.opponentCardCount === 0) {
      draft.opponentCardCount = 3;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

