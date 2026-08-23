import type * as RDF from '@rdfjs/types';
import type { QuadTermName } from 'rdf-terms';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import type { ITermDictionary } from './dictionary/ITermDictionary';
import type { EncodedQuadTerms, PatternTerm, QuadPatternTerms } from './PatternTerm';

// eslint-disable-next-line ts/no-unsafe-assignment
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
  // Manually unrolled (component orders always have length 4) to avoid the closure allocation of Array#map.
  return [
    quadPattern[QUAD_TERM_NAMES_INVERSE[desiredComponentOrder[0]]],
    quadPattern[QUAD_TERM_NAMES_INVERSE[desiredComponentOrder[1]]],
    quadPattern[QUAD_TERM_NAMES_INVERSE[desiredComponentOrder[2]]],
    quadPattern[QUAD_TERM_NAMES_INVERSE[desiredComponentOrder[3]]],
  ];
}

/**
 * Order a quad pattern's terms based on the given precomputed component order permutation.
 * The permutation must be an array of four indexes into the SPOG-ordered input array,
 * as produced by {@link getComponentOrderPermutation}.
 * @param permutation A precomputed component order permutation.
 * @param quadPattern A quad pattern.
 */
export function orderQuadComponentsPermutation<T>(
  permutation: number[],
  quadPattern: T[],
): [T, T, T, T] {
  return [
    quadPattern[permutation[0]],
    quadPattern[permutation[1]],
    quadPattern[permutation[2]],
    quadPattern[permutation[3]],
  ];
}

/**
 * Precompute the permutation of SPOG indexes corresponding to the given component order.
 * @param componentOrder A quad component order.
 */
export function getComponentOrderPermutation(componentOrder: QuadTermName[]): number[] {
  return [
    QUAD_TERM_NAMES_INVERSE[componentOrder[0]],
    QUAD_TERM_NAMES_INVERSE[componentOrder[1]],
    QUAD_TERM_NAMES_INVERSE[componentOrder[2]],
    QUAD_TERM_NAMES_INVERSE[componentOrder[3]],
  ];
}

/**
 * Precompute, for every possible combination of defined quad pattern components,
 * the index of the best suitable component order.
 *
 * The returned array is indexed by a bitmask in which bit `i` is set
 * when `QUAD_TERM_NAMES[i]` is defined within the quad pattern.
 * This allows {@link getBestIndex} to be replaced by a single array lookup at query time.
 * The produced values are identical to what {@link getBestIndex} returns for such patterns.
 *
 * @param componentOrders Possible orders of quad components.
 */
export function getBestIndexLookupTable(componentOrders: QuadTermName[][]): Uint8Array {
  const table = new Uint8Array(16);
  if (componentOrders.length === 1) {
    return table;
  }
  for (let mask = 0; mask < 16; mask++) {
    // Fully defined patterns can be answered by any index.
    if (mask === 0b1111) {
      continue;
    }

    // Determine the quad component names for which we require a defined lookup
    const definedQuadComponentNames: QuadTermName[] = [];
    for (let quadComponentId = 0; quadComponentId < QUAD_TERM_NAMES.length; quadComponentId++) {
      if ((mask & (1 << quadComponentId)) !== 0) {
        definedQuadComponentNames.push(QUAD_TERM_NAMES[quadComponentId]);
      }
    }

    // Pick the highest-scoring component order, preferring earlier ones on ties (like the sort in getBestIndex)
    let bestScore = -1;
    for (let orderId = 0; orderId < componentOrders.length; orderId++) {
      const score = getComponentOrderScore(componentOrders[orderId], definedQuadComponentNames);
      if (score > bestScore) {
        bestScore = score;
        table[mask] = orderId;
      }
    }
  }
  return table;
}

/**
 * Encode the given array of quad terms.
 * @param terms Non-encoded quad terms.
 * @param dictionary A dictionary
 * @return array An array of encoded terms.
 * The array will be undefined if at least one of the patterns does not occur within the dictionary.
 */
export function encodeOptionalTerms<TE>(
  terms: QuadPatternTerms,
  dictionary: ITermDictionary<TE>,
): (TE | undefined)[] | undefined {
  // This is written as an explicit loop rather than an Array#map with a sentinel value,
  // because it is on the hot path of every lookup: it avoids a closure allocation,
  // keeps the produced array monomorphic, and returns as soon as a term turns out to be absent.
  const encodedTerms: (TE | undefined)[] = [];
  for (const term of terms) {
    if (term === undefined) {
      encodedTerms.push(undefined);
    } else if (term.termType === 'Quad' && quadHasVariables(term)) {
      encodedTerms.push(undefined);
    } else {
      const encodedTerm = dictionary.encodeOptional(term);
      if (encodedTerm === undefined) {
        return undefined;
      }
      encodedTerms.push(encodedTerm);
    }
  }
  return encodedTerms;
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
  // The four components are converted one by one rather than through an Array#map over a
  // temporary array, because this runs for every single lookup.
  let requireQuotedTripleFiltering = false;
  const quadPatternTerms = <QuadPatternTerms> [ undefined, undefined, undefined, undefined ];
  for (let i = 0; i < 4; i++) {
    const term: RDF.Term | null | undefined =
      i === 0 ? subject : (i === 1 ? predicate : (i === 2 ? object : graph));
    if (term === undefined || term === null || term.termType === 'Variable') {
      continue;
    }
    if (term.termType === 'Quad' && !quotedPatterns) {
      requireQuotedTripleFiltering = true;
      continue;
    }
    quadPatternTerms[i] = <PatternTerm> term;
  }

  return [ quadPatternTerms, requireQuotedTripleFiltering ];
}

/**
 * Check if the given quad contains variables, even in deeply nested quoted triples.
 * @param currentTerm The quad pattern term.
 */
export function quadHasVariables(currentTerm: RDF.Quad): boolean {
  // Manually unrolled to avoid an array iterator allocation on this hot, recursive path.
  return termHasVariables(currentTerm.subject) ||
    termHasVariables(currentTerm.predicate) ||
    termHasVariables(currentTerm.object) ||
    termHasVariables(currentTerm.graph);
}

/**
 * Check if the given term is a variable, or a quad containing variables.
 * @param term A term.
 */
function termHasVariables(term: RDF.Term): boolean {
  return term.termType === 'Variable' || (term.termType === 'Quad' && quadHasVariables(<RDF.Quad> term));
}

/**
 * Create a boolean array indicating which terms are quoted triple patterns.
 * @param terms An array of terms.
 */
export function arePatternsQuoted(terms: QuadPatternTerms): boolean[] {
  return [
    isPatternQuoted(terms[0]),
    isPatternQuoted(terms[1]),
    isPatternQuoted(terms[2]),
    isPatternQuoted(terms[3]),
  ];
}

/**
 * Check if the given term is a quoted triple pattern.
 * @param term A pattern term.
 */
export function isPatternQuoted(term: PatternTerm): boolean {
  return term !== undefined && term.termType === 'Quad' && quadHasVariables(term);
}

/**
 * Compute the deepest level to navigate to, based on matchTerms and filterTerms.
 * @param matchTerms An array of booleans indicating which terms to collect.
 * @param filterTerms An optional array of filter terms.
 */
export function computeEndDepth<TE>(matchTerms: boolean[], filterTerms?: (TE | undefined)[]): number {
  let endDepth = matchTerms.length;
  if (filterTerms) {
    for (let i = filterTerms.length - 1; i >= 0; i--) {
      if (filterTerms[i] !== undefined) {
        if (i + 1 > endDepth) {
          endDepth = i + 1;
        }
        break;
      }
    }
  }
  return endDepth;
}

/**
 * Encode filter terms and extend the matchTerms path if needed.
 *
 * Reorders the filters from SPOG order to the index's component order, encodes each defined
 * filter term using the dictionary, and pads `matchTerms` with `false` entries when filters
 * reach deeper into the index than the current path.
 *
 * @param filters An array of quad components (SPOG order) to filter on.
 * @param matchTerms The current index-path boolean array (mutated copy is returned).
 * @param componentOrder The index's component order.
 * @param dictionary The term dictionary used for encoding.
 * @returns An object with the encoded filter array and the (possibly extended) matchTerms,
 *          or `null` when a filter term is absent from the dictionary (meaning no results exist).
 */
export function encodeAndExtendFilters<TE>(
  filters: (RDF.Term | undefined)[],
  matchTerms: boolean[],
  componentOrder: QuadTermName[],
  dictionary: ITermDictionary<TE>,
): { filterTermsEncoded: EncodedQuadTerms<TE | undefined>; matchTerms: boolean[] } | null {
  // Reorder filters from SPOG order to the index's component order
  const filtersOrdered = orderQuadComponents(componentOrder, filters);
  const encoded: (TE | undefined)[] = [];
  let lastFilterDepth = -1;
  for (let filterI = 0; filterI < filtersOrdered.length; filterI++) {
    const term = filtersOrdered[filterI];
    if (term) {
      const encodedTerm = dictionary.encodeOptional(term);
      if (encodedTerm === undefined) {
        // Filter term not in dictionary → no results
        return null;
      }
      encoded.push(encodedTerm);
      lastFilterDepth = filterI;
    } else {
      encoded.push(undefined);
    }
  }
  const filterTermsEncoded = <EncodedQuadTerms<TE | undefined>> encoded;

  // Extend matchTerms with false entries to cover filter depths beyond the current matchTerms
  if (lastFilterDepth >= matchTerms.length) {
    const extendedMatchTerms = [ ...matchTerms ];
    while (extendedMatchTerms.length <= lastFilterDepth) {
      extendedMatchTerms.push(false);
    }
    matchTerms = extendedMatchTerms;
  }

  return { filterTermsEncoded, matchTerms };
}
