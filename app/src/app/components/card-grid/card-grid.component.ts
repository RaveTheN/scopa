import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Card,
  CardState,
  GamePhase,
  RANKS,
  SUITS,
  Suit,
  createCardId
} from '../../models/card.model';
import { CardCellComponent } from '../card-cell/card-cell.component';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, CardCellComponent],
  templateUrl: './card-grid.component.html',
  styleUrls: ['./card-grid.component.scss']
})
export class CardGridComponent {
  @Input() mode: 'table' | 'hand' = 'table';
  @Input() cardStates: Record<string, CardState> = {};
  @Input() probabilities: Record<number, number> = {};
  @Input() showTableProbabilities = true;
  @Input() selectableCardIds: Set<string> = new Set<string>();
  @Input() phase: GamePhase = GamePhase.INITIAL_FOUR;

  @Output() cardClicked = new EventEmitter<string>();

  readonly suits: Suit[] = SUITS;
  readonly ranks: number[] = RANKS;

  protected readonly cardState = CardState;
  protected readonly gamePhase = GamePhase;

  trackByRank(_: number, rank: number): number {
    return rank;
  }

  trackBySuit(_: number, suit: Suit): Suit {
    return suit;
  }

  getCard(suit: Suit, rank: number): Card {
    return {
      id: createCardId(suit, rank),
      suit,
      rank
    };
  }

  getState(cardId: string): CardState {
    return this.cardStates[cardId] ?? CardState.UNKNOWN;
  }

  getProbability(rank: number): number | null {
    if (this.mode !== 'table') {
      return null;
    }

    if (!this.showTableProbabilities) {
      return null;
    }

    return this.probabilities[rank] ?? 0;
  }

  isSelectable(cardId: string): boolean {
    return this.selectableCardIds.has(cardId);
  }

  onCardClick(cardId: string): void {
    this.cardClicked.emit(cardId);
  }
}
