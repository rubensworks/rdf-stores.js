import type { QuadPatternTerms, QuadTerms } from '../PatternTerm';

/**
 * An RDF store index is a low-level index that can be used inside an RDF store.
 */
export interface IRdfStoreIndex<E> {
  /**
   * Add a quad to the index.
   * @param terms An array of terms, ordered in the component order of this index.
   */
  add: (terms: QuadTerms) => void;
  /**
   * Find all quads matching the given terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param terms An array of pattern terms, ordered in the component order of this index.
   */
  find: (terms: QuadPatternTerms) => QuadTerms[];
}
