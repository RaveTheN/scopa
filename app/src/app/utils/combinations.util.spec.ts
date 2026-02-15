import { Card, Suit, createCardId } from '../models/card.model';
import { findCombinations } from './combinations.util';

function buildTableCards(ranks: number[]): Card[] {
  const suits = [Suit.Denari, Suit.Coppe, Suit.Spade, Suit.Bastoni];
  return ranks.map((rank, index) => {
    const suit = suits[index % suits.length];
    return {
      id: createCardId(suit, rank),
      suit,
      rank
    };
  });
}

function canonicalRanks(combo: Card[]): string {
  return combo
    .map((card) => card.rank)
    .sort((a, b) => a - b)
    .join('+');
}

describe('findCombinations', () => {
  it('target 7 with [3,4,2,5] finds [3,4] and [2,5]', () => {
    const cards = buildTableCards([3, 4, 2, 5]);
    const result = findCombinations(7, cards).map(canonicalRanks);

    expect(result).toContain('3+4');
    expect(result).toContain('2+5');
    expect(result.length).toBe(2);
  });

  it('target 1 with [3,4,5] finds nothing', () => {
    const cards = buildTableCards([3, 4, 5]);
    const result = findCombinations(1, cards);

    expect(result.length).toBe(0);
  });

  it('target 5 with [5,3,2] forces exact [5] and excludes [3,2]', () => {
    const cards = buildTableCards([5, 3, 2]);
    const result = findCombinations(5, cards).map(canonicalRanks);

    expect(result).toEqual(['5']);
  });

  it('target 10 with [10] finds [10]', () => {
    const cards = buildTableCards([10]);
    const result = findCombinations(10, cards).map(canonicalRanks);

    expect(result).toEqual(['10']);
  });

  it('target 6 with [1,2,3] finds [1,2,3]', () => {
    const cards = buildTableCards([1, 2, 3]);
    const result = findCombinations(6, cards).map(canonicalRanks);

    expect(result).toEqual(['1+2+3']);
  });

  it('target 3 with [1,1,2,3] forces exact [3] and excludes sum variants', () => {
    const cards = buildTableCards([1, 1, 2, 3]);
    const result = findCombinations(3, cards).map(canonicalRanks);

    expect(result).toEqual(['3']);
  });

  it('target 7 with [4,3,7] forces exact [7] and excludes [4,3]', () => {
    const cards = buildTableCards([4, 3, 7]);
    const result = findCombinations(7, cards).map(canonicalRanks);

    expect(result).toEqual(['7']);
  });

  it('target 8 with [5,3,8,8] allows choosing one of exact cards only', () => {
    const cards = buildTableCards([5, 3, 8, 8]);
    const result = findCombinations(8, cards).map(canonicalRanks);

    expect(result).toEqual(['8', '8']);
  });
});
