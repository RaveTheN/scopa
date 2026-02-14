import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { CardState, GamePhase } from '../../models/card.model';
import { GameStateService } from '../../services/game-state.service';
import { CardGridComponent } from '../card-grid/card-grid.component';

interface HandViewModel {
  cardStates: Record<string, CardState>;
  myHandCount: number;
  selectableCardIds: Set<string>;
}

@Component({
  selector: 'app-hand-selector',
  standalone: true,
  imports: [CommonModule, CardGridComponent],
  templateUrl: './hand-selector.component.html',
  styleUrls: ['./hand-selector.component.scss']
})
export class HandSelectorComponent {
  readonly emptyProbabilities: Record<number, number> = {};
  readonly initialPhase = GamePhase.INITIAL_FOUR;

  readonly vm$ = this.gameStateService.state.pipe(
    map((state): HandViewModel => {
      const selectableCardIds = new Set<string>();

      for (const [cardId, cardState] of Object.entries(state.cardStates)) {
        if (cardState === CardState.UNKNOWN || cardState === CardState.IN_MY_HAND) {
          selectableCardIds.add(cardId);
        }
      }

      return {
        cardStates: state.cardStates,
        myHandCount: state.myHand.length,
        selectableCardIds
      };
    })
  );

  readonly phase$ = this.gameStateService.phase;

  constructor(private readonly gameStateService: GameStateService) {}

  onCardClicked(cardId: string): void {
    this.gameStateService.clickHandCard(cardId);
  }
}
