import { Card } from '../models/card.model';

export function findCombinations(targetSum: number, tableCards: Card[]): Card[][] {
  if (targetSum <= 0 || tableCards.length === 0) {
    return [];
  }

  // Scopa rule: if cards with exact same rank exist on table, capture must be among those.
  const exactMatches = tableCards.filter((card) => card.rank === targetSum);
  if (exactMatches.length > 0) {
    return exactMatches.map((card) => [card]);
  }

  const combinations: Card[][] = [];
  const n = tableCards.length;
  const maxMask = 1 << n;

  for (let mask = 1; mask < maxMask; mask += 1) {
    let sum = 0;
    const subset: Card[] = [];

    for (let i = 0; i < n; i += 1) {
      if ((mask & (1 << i)) === 0) {
        continue;
      }

      const card = tableCards[i];
      subset.push(card);
      sum += card.rank;
    }

    if (sum === targetSum) {
      combinations.push(subset);
    }
  }

  return combinations;
}
