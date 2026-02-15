import { TestBed } from '@angular/core/testing';
import { CardState, GamePhase, Suit, createCardId } from '../models/card.model';
import { CardTrackerService } from './card-tracker.service';
import { GameStateService } from './game-state.service';
import { LocalStorageService } from './local-storage.service';

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    localStorage.removeItem('scopa_ng_state');

    TestBed.configureTestingModule({
      providers: [
        GameStateService,
        CardTrackerService,
        LocalStorageService
      ]
    });

    service = TestBed.inject(GameStateService);
    service.reset();
  });

  afterEach(() => {
    localStorage.removeItem('scopa_ng_state');
  });

  it('initial state has 40 UNKNOWN cards and phase INITIAL_FOUR and turn null', () => {
    const state = service.getCurrentState();
    const unknownCount = Object.values(state.cardStates).filter((cardState) => cardState === CardState.UNKNOWN).length;

    expect(unknownCount).toBe(40);
    expect(state.phase).toBe(GamePhase.INITIAL_FOUR);
    expect(state.turn).toBeNull();
  });

  it('clicking 4 cards transitions phase to PLAYING', () => {
    service.clickTableCard(createCardId(Suit.Denari, 1));
    service.clickTableCard(createCardId(Suit.Coppe, 2));
    service.clickTableCard(createCardId(Suit.Spade, 3));
    service.clickTableCard(createCardId(Suit.Bastoni, 4));

    expect(service.getCurrentState().phase).toBe(GamePhase.PLAYING);
  });

  it('clicking 3 cards does NOT transition', () => {
    service.clickTableCard(createCardId(Suit.Denari, 1));
    service.clickTableCard(createCardId(Suit.Coppe, 2));
    service.clickTableCard(createCardId(Suit.Spade, 3));

    expect(service.getCurrentState().phase).toBe(GamePhase.INITIAL_FOUR);
  });

  it('undo restores previous state', () => {
    const cardId = createCardId(Suit.Denari, 1);

    service.clickTableCard(cardId);
    expect(service.getCurrentState().cardStates[cardId]).toBe(CardState.ON_TABLE);

    service.undo();

    const state = service.getCurrentState();
    expect(state.cardStates[cardId]).toBe(CardState.UNKNOWN);
    expect(state.initialFourCount).toBe(0);
  });

  it('undo when history empty does nothing', () => {
    const before = service.getCurrentState();
    service.undo();
    const after = service.getCurrentState();

    expect(after.phase).toBe(before.phase);
    expect(after.turn).toBe(before.turn);
    expect(after.history.length).toBe(0);
  });

  it('setTurn only works when turn is null', () => {
    service.setTurn('ME');
    expect(service.getCurrentState().turn).toBe('ME');

    service.setTurn('OPPONENT');
    expect(service.getCurrentState().turn).toBe('ME');
  });

  it('toggleTurn switches ME to OPPONENT and OPPONENT to ME', () => {
    service.setTurn('ME');
    service.toggleTurn();
    expect(service.getCurrentState().turn).toBe('OPPONENT');

    service.toggleTurn();
    expect(service.getCurrentState().turn).toBe('ME');
  });

  it('setTurn to OPPONENT refills opponent cards to 3 when count is 0', () => {
    service.setOpponentCardCount(0);
    service.setTurn('OPPONENT');

    const state = service.getCurrentState();
    expect(state.turn).toBe('OPPONENT');
    expect(state.opponentCardCount).toBe(3);
  });

  it('toggleTurn to OPPONENT refills opponent cards to 3 when count is 0', () => {
    service.setTurn('ME');
    service.setOpponentCardCount(0);
    service.toggleTurn();

    const state = service.getCurrentState();
    expect(state.turn).toBe('OPPONENT');
    expect(state.opponentCardCount).toBe(3);
  });

  it('toggleTurn to ME keeps opponent card count unchanged', () => {
    service.setTurn('OPPONENT');
    service.setOpponentCardCount(0);
    service.toggleTurn();

    const state = service.getCurrentState();
    expect(state.turn).toBe('ME');
    expect(state.opponentCardCount).toBe(0);
  });
});
