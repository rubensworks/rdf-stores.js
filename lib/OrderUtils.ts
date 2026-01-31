import type * as RDF from '@rdfjs/types';
import type { QuadTermName } from 'rdf-terms';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import type { ITermDictionary } from './dictionary/ITermDictionary';
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
 * Determine the best suitable order's index among the given orders for the given terms.
 * @param componentOrders Possible orders of quad components.
 * @param terms The quad term names to lookup.
 */
export function getBestIndexTerms(
  componentOrders: QuadTermName[][],
  terms: QuadTermName[],
): number {
  if (componentOrders.length === 1) {
    return 0;
  }

  // Score indexes by how well they match to the index
  const scoredIndexes = componentOrders.map((componentOrder, index) => {
    const score = getComponentOrderScore(componentOrder, terms);
    return { score, index };
  });

  // Sort the indexes, and pick the first one
  return scoredIndexes.sort((scoredLeft, scoredRight) => scoredRight.score - scoredLeft.score)[0].index;
}

/**
 * Construct the path to follow within the given index's component order for the given terms.
 * This returns a boolean[] indicating the path of terms to match within the index.
 * @param componentOrder The index's component order.
 * @param terms The terms to find.
 */
export function getIndexMatchTermsPath(
  componentOrder: QuadTermName[],
  terms: QuadTermName[],
): boolean[] {
  const matchTerms: boolean[] = [];
  let termsI = 0;
  for (let i = 0; i < componentOrder.length; i += 1) {
    if (componentOrder[i] === terms[termsI]) {
      termsI++;
      matchTerms[i] = true;
      if (termsI === terms.length) {
        // Break early to produce shorter optimized paths.
        break;
      }
    } else {
      matchTerms[i] = false;
    }
  }
  return matchTerms;
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

/**
 * Encode the given array of quad terms.
 * @param terms Non-encoded quad terms.
 * @param dictionary A dictionary
 * @return array An array of encoded terms.
 * The array will be undefined if at least one of the patterns does not occur within the dictionary.
 */
export function encodeOptionalTerms<E>(
  terms: QuadPatternTerms,
  dictionary: ITermDictionary<E>,
): (E | undefined)[] | undefined {
  const encodedTerms = terms.map(term => {
    if (term) {
      if (term.termType === 'Quad' && quadHasVariables(term)) {
        return;
      }
      const encodedTerm = dictionary.encodeOptional(term);
      if (encodedTerm === undefined) {
        return 'none';
      }
      return encodedTerm;
    }
    return term;
  });

  if (encodedTerms.includes('none')) {
    return undefined;
  }

  return <(E | undefined)[]> encodedTerms;
}

/**
 * Convert a quad patter to a `QuadPatternTerms` type.
 * @param subject The subject.
 * @param predicate The predicate.
 * @param object The object.
 * @param graph The graph.
 * @param quotedPatterns If the index supports quoted triple filtering.
 * @return Tuple A tuple of QuadPatternTerms
 *               and a boolean indicating if post-filtering will be needed on quoted triples.
 *               This boolean can only be true if `quotedPatterns` is false, and a quoted triple pattern was present.
 */
export function quadToPattern(
  subject: RDF.Term | null | undefined,
  predicate: RDF.Term | null | undefined,
  object: RDF.Term | null | undefined,
  graph: RDF.Term | null | undefined,
  quotedPatterns: boolean,
): [ QuadPatternTerms, boolean ] {
  let requireQuotedTripleFiltering = false;
  const quadPatternTerms = <QuadPatternTerms>
    [ subject || undefined, predicate || undefined, object || undefined, graph || undefined ]
      .map(term => {
        if (term) {
          if (term.termType === 'Variable') {
            return;
          }
          if (term.termType === 'Quad') {
            if (quotedPatterns) {
              return term;
            }
            requireQuotedTripleFiltering = true;
            return;
          }
        }
        return term;
      });

  return [ quadPatternTerms, requireQuotedTripleFiltering ];
}

/**
 * Check if the given quad contains variables, even in deeply nested quoted triples.
 * @param currentTerm The quad pattern term.
 */
export function quadHasVariables(currentTerm: RDF.Quad): boolean {
  for (const component of QUAD_TERM_NAMES) {
    const subTerm = currentTerm[component];
    if (subTerm.termType === 'Variable' || (subTerm.termType === 'Quad' && quadHasVariables(subTerm))) {
      return true;
    }
  }
  return false;
}

/**
 * Create a boolean array indicating which terms are quoted triple patterns.
 * @param terms An array of terms.
 */
export function arePatternsQuoted(terms: QuadPatternTerms): boolean[] {
  return terms.map(term => term?.termType === 'Quad' && quadHasVariables(term));
}
