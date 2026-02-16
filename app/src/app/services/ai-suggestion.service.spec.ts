import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ALL_CARDS, CardState, GamePhase, Suit, createCardId } from '../models/card.model';
import { AISuggestionService } from './ai-suggestion.service';
import { CardTrackerService } from './card-tracker.service';
import { GameStateService } from './game-state.service';
import { LocalStorageService } from './local-storage.service';
import { OpenAIService, OpenAiQueryInput } from './openai.service';
import { ProbabilityService } from './probability.service';

class ProbabilityServiceStub {
  readonly probabilities$ = new BehaviorSubject<Map<number, number>>(
    new Map<number, number>(
      Array.from({ length: 10 }, (_, index) => [index + 1, 0])
    )
  );
}

class OpenAIServiceStub {
  lastInput: OpenAiQueryInput | null = null;

  queryBestMove(input: OpenAiQueryInput): Observable<string> {
    this.lastInput = input;
    return of('Carta consigliata: Asso di Denari');
  }
}

describe('AISuggestionService', () => {
  let service: AISuggestionService;
  let gameStateService: GameStateService;
  let openAiService: OpenAIServiceStub;

  beforeEach(() => {
    localStorage.removeItem('scopa_ng_state');

    TestBed.configureTestingModule({
      providers: [
        AISuggestionService,
        GameStateService,
        CardTrackerService,
        LocalStorageService,
        { provide: ProbabilityService, useClass: ProbabilityServiceStub },
        { provide: OpenAIService, useClass: OpenAIServiceStub }
      ]
    });

    service = TestBed.inject(AISuggestionService);
    gameStateService = TestBed.inject(GameStateService);
    openAiService = TestBed.inject(OpenAIService) as unknown as OpenAIServiceStub;
    gameStateService.reset();
    service.setAutoQueryEnabled(false);
  });

  afterEach(() => {
    localStorage.removeItem('scopa_ng_state');
  });

  it('includes deterministic opponent hand and endgame metadata when deck is empty', () => {
    const myHand = [
      createCardId(Suit.Denari, 1),
      createCardId(Suit.Coppe, 2),
      createCardId(Suit.Spade, 3)
    ];
    const cardsOnTable = [createCardId(Suit.Bastoni, 4)];
    const opponentKnownCards = [
      createCardId(Suit.Denari, 10),
      createCardId(Suit.Coppe, 10),
      createCardId(Suit.Spade, 10)
    ];

    (gameStateService as any).applyMutation((draft: any) => {
      for (const card of ALL_CARDS) {
        draft.cardStates[card.id] = CardState.PLAYED;
      }

      for (const cardId of myHand) {
        draft.cardStates[cardId] = CardState.IN_MY_HAND;
      }

      for (const cardId of cardsOnTable) {
        draft.cardStates[cardId] = CardState.ON_TABLE;
      }

      for (const cardId of opponentKnownCards) {
        draft.cardStates[cardId] = CardState.UNKNOWN;
      }

      draft.phase = GamePhase.PLAYING;
      draft.turn = 'ME';
      draft.lastCaptureBy = 'ME';
      draft.myHand = [...myHand];
      draft.cardsOnTable = [...cardsOnTable];
      draft.opponentCardCount = opponentKnownCards.length;
      draft.pendingPlayedCard = null;
      draft.selectedCombination = [];
      return true;
    });

    service.manualQuery();

    expect(openAiService.lastInput).not.toBeNull();
    expect(openAiService.lastInput?.isEndgame).toBeTrue();
    expect(openAiService.lastInput?.deckCardsRemaining).toBe(0);
    expect(openAiService.lastInput?.unseenCardsCount).toBe(3);
    expect(openAiService.lastInput?.opponentHandIsKnown).toBeTrue();
    expect(openAiService.lastInput?.knownOpponentCards.length).toBe(3);
    expect(openAiService.lastInput?.lastCaptureBy).toBe('ME');
    expect(openAiService.lastInput?.playsRemainingMe).toBe(3);
    expect(openAiService.lastInput?.playsRemainingOpponent).toBe(3);
    expect(openAiService.lastInput?.pliesToHandEnd).toBe(6);
    expect(openAiService.lastInput?.requestSource).toBe('manual');
    expect(openAiService.lastInput?.modelSelection).toBe('gpt-5-mini');
    expect(openAiService.lastInput?.reasoningMode).toBe('auto');
    expect(openAiService.lastInput?.rules.capturePriority).toBe('free');
    expect(openAiService.lastInput?.rules.mustPlayCapturingCardIfHaveOne).toBeFalse();
    expect(openAiService.lastInput?.opponentModel?.evaluationMethod).toBe('maximin');
    expect(openAiService.lastInput?.opponentModel?.assumePerfectEndgamePlay).toBeTrue();
    expect(openAiService.lastInput?.opponentModel?.countsCardsAndInfersHands).toBeTrue();
  });
});
