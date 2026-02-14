import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CardState, Suit, createCardId } from '../models/card.model';
import { CardTrackerService } from './card-tracker.service';
import { GameStateService } from './game-state.service';
import { LocalStorageService } from './local-storage.service';
import { ProbabilityService } from './probability.service';

function combinations(n: number, k: number): number {
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

describe('ProbabilityService', () => {
  let gameStateService: GameStateService;
  let probabilityService: ProbabilityService;

  beforeEach(() => {
    localStorage.removeItem('scopa_ng_state');

    TestBed.configureTestingModule({
      providers: [
        GameStateService,
        CardTrackerService,
        LocalStorageService,
        ProbabilityService
      ]
    });

    gameStateService = TestBed.inject(GameStateService);
    probabilityService = TestBed.inject(ProbabilityService);
    gameStateService.reset();
  });

  afterEach(() => {
    localStorage.removeItem('scopa_ng_state');
  });

  it('all 40 cards unknown with opponent having 3 gives probability greater than 0 for any rank', async () => {
    const probabilities = await firstValueFrom(probabilityService.probabilities$);

    for (let rank = 1; rank <= 10; rank += 1) {
      expect((probabilities.get(rank) ?? 0) > 0).toBeTrue();
    }
  });

  it('a rank with all 4 cards played gives probability 0 for that rank', async () => {
    const ids = [Suit.Denari, Suit.Coppe, Suit.Spade, Suit.Bastoni].map((suit) => createCardId(suit, 5));

    (gameStateService as any).applyMutation((draft: any) => {
      for (const id of ids) {
        draft.cardStates[id] = CardState.PLAYED;
      }
      return true;
    });

    const probabilities = await firstValueFrom(probabilityService.probabilities$);
    expect(probabilities.get(5)).toBe(0);
  });

  it('cards IN_MY_HAND are excluded from unknown pool so rank 5 unknown count becomes 2', async () => {
    gameStateService.clickHandCard(createCardId(Suit.Denari, 5));
    gameStateService.clickHandCard(createCardId(Suit.Coppe, 5));

    const probabilities = await firstValueFrom(probabilityService.probabilities$);

    const expected = 1 - combinations(38 - 2, 3) / combinations(38, 3);
    expect((probabilities.get(5) ?? 0)).toBeCloseTo(expected, 10);
  });

  it('opponent has 0 cards gives all probabilities 0', async () => {
    gameStateService.setOpponentCardCount(0);

    const probabilities = await firstValueFrom(probabilityService.probabilities$);

    for (let rank = 1; rank <= 10; rank += 1) {
      expect(probabilities.get(rank)).toBe(0);
    }
  });
});
