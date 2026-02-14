import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { CARD_BY_ID, CardState, RANKS } from '../models/card.model';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class ProbabilityService {
  readonly probabilities$: Observable<Map<number, number>>;

  constructor(private readonly gameStateService: GameStateService) {
    this.probabilities$ = combineLatest([
      this.gameStateService.cardStates,
      this.gameStateService.opponentCardCount
    ]).pipe(
      map(([cardStates, opponentCardCount]) => this.computeProbabilities(cardStates, opponentCardCount)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private computeProbabilities(
    cardStates: Record<string, CardState>,
    opponentCardCount: number
  ): Map<number, number> {
    const unknownByRank = new Map<number, number>();
    for (const rank of RANKS) {
      unknownByRank.set(rank, 0);
    }

    let totalUnknown = 0;

    for (const [cardId, state] of Object.entries(cardStates)) {
      if (state !== CardState.UNKNOWN) {
        continue;
      }

      const card = CARD_BY_ID[cardId];
      if (!card) {
        continue;
      }

      totalUnknown += 1;
      unknownByRank.set(card.rank, (unknownByRank.get(card.rank) ?? 0) + 1);
    }

    const result = new Map<number, number>();

    if (opponentCardCount <= 0 || totalUnknown <= 0) {
      for (const rank of RANKS) {
        result.set(rank, 0);
      }
      return result;
    }

    const drawSize = Math.min(opponentCardCount, totalUnknown);

    for (const rank of RANKS) {
      const unknownOfRank = unknownByRank.get(rank) ?? 0;
      if (unknownOfRank <= 0) {
        result.set(rank, 0);
        continue;
      }

      const denominator = this.combinations(totalUnknown, drawSize);
      const numerator = this.combinations(totalUnknown - unknownOfRank, drawSize);

      if (denominator <= 0) {
        result.set(rank, 0);
        continue;
      }

      result.set(rank, 1 - (numerator / denominator));
    }

    return result;
  }

  private combinations(n: number, k: number): number {
    if (k < 0 || k > n) {
      return 0;
    }

    if (k === 0 || k === n) {
      return 1;
    }

    const kk = Math.min(k, n - k);
    let result = 1;

    for (let i = 1; i <= kk; i += 1) {
      result = (result * (n - kk + i)) / i;
    }

    return result;
  }
}
