import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { CARD_BY_ID, CardState, GamePhase, Suit } from '../../models/card.model';
import { GameStateService } from '../../services/game-state.service';

interface StatsViewModel {
  denariPlayed: number;
  coppePlayed: number;
  spadePlayed: number;
  bastoniPlayed: number;
  totalPlayed: number;
  remaining: number;
  myCaptured: number;
  opponentCaptured: number;
  phaseLabel: string;
}

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-panel.component.html',
  styleUrls: ['./stats-panel.component.scss']
})
export class StatsPanelComponent {
  readonly stats$ = this.gameStateService.state.pipe(
    map((state): StatsViewModel => {
      const playedIds = Object.entries(state.cardStates)
        .filter(([, cardState]) => cardState === CardState.PLAYED)
        .map(([cardId]) => cardId);

      const denariPlayed = playedIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Denari)
        .length;
      const coppePlayed = playedIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Coppe)
        .length;
      const spadePlayed = playedIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Spade)
        .length;
      const bastoniPlayed = playedIds
        .map((cardId) => CARD_BY_ID[cardId])
        .filter((card) => card?.suit === Suit.Bastoni)
        .length;

      const totalPlayed = playedIds.length;

      return {
        denariPlayed,
        coppePlayed,
        spadePlayed,
        bastoniPlayed,
        totalPlayed,
        remaining: 40 - totalPlayed,
        myCaptured: state.myCapturedCards.length,
        opponentCaptured: state.opponentCapturedCards.length,
        phaseLabel: this.toPhaseLabel(state.phase)
      };
    })
  );

  constructor(private readonly gameStateService: GameStateService) {}

  private toPhaseLabel(phase: GamePhase): string {
    if (phase === GamePhase.INITIAL_FOUR) {
      return 'Carte iniziali';
    }

    if (phase === GamePhase.PLAYING) {
      return 'In gioco';
    }

    return 'Scegli combinazione';
  }
}
