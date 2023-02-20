import type { QuadTermName } from 'rdf-terms';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import type { QuadPatternTerms } from './PatternTerm';

export const QUAD_TERM_NAMES_INVERSE: Record<QuadTermName, number> =
  <any>Object.fromEntries(QUAD_TERM_NAMES.map((value, key) => [ value, key ]));

/**
 * Determine the best suitable order's index among the given orders for the given quad pattern.
 * @param componentOrders Possible orders of quad components.
 * @param quadPattern A quad pattern.
 */
export function getBestIndex(
  componentOrders: QuadTermName[][],
  quadPattern: QuadPatternTerms,
): number {
  if (componentOrders.length === 1 || quadPattern.every(term => term !== undefined)) {
    return 0;
  }

  // Determine the quad component names for which we require a defined lookup
  const definedQuadComponentNames: QuadTermName[] = [];
  for (let quadComponentId = 0; quadComponentId < QUAD_TERM_NAMES.length; quadComponentId++) {
    if (quadPattern[quadComponentId]) {
      definedQuadComponentNames.push(QUAD_TERM_NAMES[quadComponentId]);
    }
  }

  // Score indexes by how well they match to the index
  const scoredIndexes = componentOrders.map((componentOrder, index) => {
    const score = getComponentOrderScore(componentOrder, definedQuadComponentNames);
    return { score, index };
  });

  // Sort the indexes, and pick the first one
  return scoredIndexes.sort((scoredLeft, scoredRight) => scoredRight.score - scoredLeft.score)[0].index;
}

/**
 * Determine the score of the given partial component order in the given component order.
 * @param componentOrder A quad component order.
 * @param partialComponentOrder A partial quad component order that originates from a quad pattern.
 */
export function getComponentOrderScore(
  componentOrder: QuadTermName[],
  partialComponentOrder: QuadTermName[],
): number {
  return componentOrder
    .map((order, i) => partialComponentOrder.includes(order) ? componentOrder.length - i : 0)
    .reduce<number>((acc, add) => acc + add, 0);
}

/**
 * Order a quad pattern's terms based on the given component order.
 * @param desiredComponentOrder The desired order of components.
 * @param quadPattern A quad pattern.
 */
export function orderQuadComponents<T>(
  desiredComponentOrder: QuadTermName[],
  quadPattern: T[],
): T[] {
  return desiredComponentOrder.map(desiredComponent => {
    const desiredComponentIndex = QUAD_TERM_NAMES_INVERSE[desiredComponent];
    return quadPattern[desiredComponentIndex];
  });
}
