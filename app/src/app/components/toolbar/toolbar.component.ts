import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  readonly opponentCardCount$ = this.gameStateService.opponentCardCount;
  readonly turn$ = this.gameStateService.turn;
  readonly canUndo$ = this.gameStateService.state.pipe(map((state) => state.history.length > 0));

  constructor(private readonly gameStateService: GameStateService) {}

  cycleOpponentCards(current: number | null): void {
    if (current === null) {
      return;
    }

    const next = current === 3 ? 2 : current === 2 ? 1 : 3;
    this.gameStateService.setOpponentCardCount(next);
  }

  reset(): void {
    const confirmed = window.confirm('Confermi il reset della partita?');
    if (!confirmed) {
      return;
    }

    this.gameStateService.reset();
  }

  undo(): void {
    this.gameStateService.undo();
  }

  setTurn(turn: 'ME' | 'OPPONENT'): void {
    this.gameStateService.setTurn(turn);
  }
}
