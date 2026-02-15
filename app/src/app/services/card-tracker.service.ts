import { Injectable } from '@angular/core';
import {
  CARD_BY_ID,
  Card,
  CardState,
  GamePhase,
  GameStateSnapshot,
  Turn
} from '../models/card.model';
import { findCombinations } from '../utils/combinations.util';

export interface TrackerResult {
  error: string | null;
  shouldToggleTurn: boolean;
  shouldDecrementOpponent: boolean;
  didMutate: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CardTrackerService {
  handleTableCardClick(snapshot: GameStateSnapshot, cardId: string): TrackerResult {
    const card = CARD_BY_ID[cardId];
    if (!card) {
      return this.errorResult('Carta non valida');
    }

    if (snapshot.phase === GamePhase.INITIAL_FOUR) {
      const didMutate = this.handleInitialFour(snapshot, cardId);
      return this.okResult(didMutate);
    }

    if (snapshot.phase !== GamePhase.PLAYING) {
      return this.errorResult('Seleziona una combinazione valida');
    }

    if (snapshot.turn === null) {
      return this.errorResult('Seleziona chi gioca per primo');
    }

    const cardState = snapshot.cardStates[cardId];
    if (snapshot.turn === 'ME') {
      if (cardState !== CardState.IN_MY_HAND) {
        return this.errorResult('Questa carta non e nella tua mano');
      }
    } else if (cardState !== CardState.UNKNOWN) {
      return this.errorResult('Carta non selezionabile per l\'avversario');
    }

    return this.handlePlay(snapshot, card);
  }

  handleCombinationSelection(snapshot: GameStateSnapshot, cardId: string): TrackerResult {
    if (snapshot.phase !== GamePhase.CHOOSE_COMBINATION || !snapshot.pendingPlayedCard) {
      return this.errorResult('Nessuna combinazione da selezionare');
    }

    const state = snapshot.cardStates[cardId];
    if (state !== CardState.ON_TABLE && state !== CardState.COMBINATION_CANDIDATE) {
      return this.errorResult('Carta non selezionabile per la combinazione');
    }

    if (state === CardState.ON_TABLE) {
      snapshot.cardStates[cardId] = CardState.COMBINATION_CANDIDATE;
      if (!snapshot.selectedCombination.includes(cardId)) {
        snapshot.selectedCombination = [...snapshot.selectedCombination, cardId];
      }
    } else {
      snapshot.cardStates[cardId] = CardState.ON_TABLE;
      snapshot.selectedCombination = snapshot.selectedCombination.filter((id) => id !== cardId);
    }

    const pending = CARD_BY_ID[snapshot.pendingPlayedCard];
    if (!pending) {
      return this.errorResult('Carta giocata in attesa non valida');
    }

    const selectedCards = snapshot.selectedCombination
      .map((id) => CARD_BY_ID[id])
      .filter((card): card is Card => !!card);
    const selectedSum = selectedCards.reduce((acc, card) => acc + card.rank, 0);

    const tableCards = snapshot.cardsOnTable
      .map((id) => CARD_BY_ID[id])
      .filter((tableCard): tableCard is Card => !!tableCard);
    const validCombinations = findCombinations(pending.rank, tableCards);

    const isValidSelection = this.matchesAnyCombination(snapshot.selectedCombination, validCombinations);

    if (selectedSum !== pending.rank || !isValidSelection) {
      return this.okResult(true);
    }

    for (const selectedId of snapshot.selectedCombination) {
      snapshot.cardStates[selectedId] = CardState.PLAYED;
    }

    snapshot.cardStates[snapshot.pendingPlayedCard] = CardState.PLAYED;
    snapshot.cardsOnTable = snapshot.cardsOnTable.filter((id) => !snapshot.selectedCombination.includes(id));
    this.recordCapture(
      snapshot,
      snapshot.turn === 'ME',
      snapshot.pendingPlayedCard,
      snapshot.selectedCombination
    );

    const actor = this.actorLabel(snapshot.turn);
    const selectedLabel = snapshot.selectedCombination
      .map((id) => CARD_BY_ID[id])
      .filter((card): card is Card => !!card)
      .map((card) => this.cardLabel(card))
      .join(', ');
    snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(pending)}, prende ${selectedLabel}`;

    if (snapshot.myHand.includes(snapshot.pendingPlayedCard)) {
      snapshot.myHand = snapshot.myHand.filter((id) => id !== snapshot.pendingPlayedCard);
    }

    snapshot.pendingPlayedCard = null;
    snapshot.selectedCombination = [];
    snapshot.phase = GamePhase.PLAYING;

    return {
      error: null,
      shouldToggleTurn: true,
      shouldDecrementOpponent: false,
      didMutate: true
    };
  }

  private handleInitialFour(snapshot: GameStateSnapshot, cardId: string): boolean {
    const current = snapshot.cardStates[cardId];

    if (current === CardState.UNKNOWN) {
      snapshot.cardStates[cardId] = CardState.ON_TABLE;
      if (!snapshot.cardsOnTable.includes(cardId)) {
        snapshot.cardsOnTable = [...snapshot.cardsOnTable, cardId];
      }
      snapshot.initialFourCount += 1;
      snapshot.phase = snapshot.initialFourCount >= 4 ? GamePhase.PLAYING : GamePhase.INITIAL_FOUR;
      return true;
    }

    if (current === CardState.ON_TABLE) {
      snapshot.cardStates[cardId] = CardState.UNKNOWN;
      snapshot.cardsOnTable = snapshot.cardsOnTable.filter((id) => id !== cardId);
      snapshot.initialFourCount = Math.max(0, snapshot.initialFourCount - 1);
      snapshot.phase = snapshot.initialFourCount >= 4 ? GamePhase.PLAYING : GamePhase.INITIAL_FOUR;
      return true;
    }

    return false;
  }

  private handlePlay(snapshot: GameStateSnapshot, playedCard: Card): TrackerResult {
    const actor = this.actorLabel(snapshot.turn);
    const isMyPlay = snapshot.turn === 'ME';

    const tableCards = snapshot.cardsOnTable
      .map((id) => CARD_BY_ID[id])
      .filter((card): card is Card => !!card);

    const combinations = findCombinations(playedCard.rank, tableCards);

    if (combinations.length === 0) {
      snapshot.cardStates[playedCard.id] = CardState.ON_TABLE;
      if (!snapshot.cardsOnTable.includes(playedCard.id)) {
        snapshot.cardsOnTable = [...snapshot.cardsOnTable, playedCard.id];
      }
      if (isMyPlay) {
        snapshot.myHand = snapshot.myHand.filter((id) => id !== playedCard.id);
      }

      snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(playedCard)}, nessuna presa`;
      return {
        error: null,
        shouldToggleTurn: true,
        shouldDecrementOpponent: snapshot.turn === 'OPPONENT',
        didMutate: true
      };
    }

    if (combinations.length === 1) {
      const combo = combinations[0];
      const comboIds = combo.map((card) => card.id);

      for (const comboId of comboIds) {
        snapshot.cardStates[comboId] = CardState.PLAYED;
      }
      snapshot.cardStates[playedCard.id] = CardState.PLAYED;
      snapshot.cardsOnTable = snapshot.cardsOnTable.filter((id) => !comboIds.includes(id));
      this.recordCapture(snapshot, isMyPlay, playedCard.id, comboIds);

      if (isMyPlay) {
        snapshot.myHand = snapshot.myHand.filter((id) => id !== playedCard.id);
      }

      const capturedLabel = combo.map((card) => this.cardLabel(card)).join(', ');
      snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(playedCard)}, prende ${capturedLabel}`;
      return {
        error: null,
        shouldToggleTurn: true,
        shouldDecrementOpponent: snapshot.turn === 'OPPONENT',
        didMutate: true
      };
    }

    snapshot.phase = GamePhase.CHOOSE_COMBINATION;
    snapshot.cardStates[playedCard.id] = CardState.ON_TABLE_BLINKING;
    snapshot.pendingPlayedCard = playedCard.id;
    snapshot.selectedCombination = [];
    snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(playedCard)}, selezionare combinazione`;

    return {
      error: null,
      shouldToggleTurn: false,
      shouldDecrementOpponent: snapshot.turn === 'OPPONENT',
      didMutate: true
    };
  }

  private matchesAnyCombination(selectedIds: string[], combinations: Card[][]): boolean {
    if (selectedIds.length === 0) {
      return false;
    }

    const selectedKey = [...selectedIds].sort().join('|');

    return combinations.some((combination) => {
      const comboKey = combination
        .map((card) => card.id)
        .sort()
        .join('|');
      return comboKey === selectedKey;
    });
  }

  private actorLabel(turn: Turn): string {
    return turn === 'ME' ? 'Tu' : 'Avversario';
  }

  private recordCapture(
    snapshot: GameStateSnapshot,
    isMyPlay: boolean,
    playedCardId: string,
    capturedIds: string[]
  ): void {
    const target = isMyPlay ? snapshot.myCapturedCards : snapshot.opponentCapturedCards;
    const merged = [...target, playedCardId, ...capturedIds];
    const unique = [...new Set(merged)];

    if (isMyPlay) {
      snapshot.myCapturedCards = unique;
      return;
    }

    snapshot.opponentCapturedCards = unique;
  }

  private cardLabel(card: Card): string {
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

  private errorResult(message: string): TrackerResult {
    return {
      error: message,
      shouldToggleTurn: false,
      shouldDecrementOpponent: false,
      didMutate: false
    };
  }

  private okResult(didMutate: boolean): TrackerResult {
    return {
      error: null,
      shouldToggleTurn: false,
      shouldDecrementOpponent: false,
      didMutate
    };
  }
}
