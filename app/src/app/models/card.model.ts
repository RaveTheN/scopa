export enum Suit {
  Denari = 'Denari',
  Coppe = 'Coppe',
  Spade = 'Spade',
  Bastoni = 'Bastoni'
}

export enum CardState {
  UNKNOWN = 'UNKNOWN',
  IN_MY_HAND = 'IN_MY_HAND',
  ON_TABLE = 'ON_TABLE',
  ON_TABLE_BLINKING = 'ON_TABLE_BLINKING',
  PLAYED = 'PLAYED',
  COMBINATION_CANDIDATE = 'COMBINATION_CANDIDATE'
}

export enum GamePhase {
  INITIAL_FOUR = 'INITIAL_FOUR',
  PLAYING = 'PLAYING',
  CHOOSE_COMBINATION = 'CHOOSE_COMBINATION'
}

export type Turn = 'ME' | 'OPPONENT' | null;

export interface Card {
  id: string;
  suit: Suit;
  rank: number;
}

export interface GameStateSnapshot {
  cardStates: Record<string, CardState>;
  phase: GamePhase;
  turn: Turn;
  myHand: string[];
  opponentCardCount: number;
  cardsOnTable: string[];
  initialFourCount: number;
  lastPlayLog: string;
  pendingPlayedCard: string | null;
  selectedCombination: string[];
}

export interface GameState extends GameStateSnapshot {
  history: GameStateSnapshot[];
  aiSuggestion: string;
  aiLoading: boolean;
}

export const SUITS: Suit[] = [Suit.Denari, Suit.Coppe, Suit.Spade, Suit.Bastoni];

export const RANKS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function createCardId(suit: Suit, rank: number): string {
  return `${suit.toLowerCase()}-${rank}`;
}

export const ALL_CARDS: Card[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    id: createCardId(suit, rank),
    suit,
    rank
  }))
);

export const CARD_BY_ID: Record<string, Card> = ALL_CARDS.reduce<Record<string, Card>>((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});
