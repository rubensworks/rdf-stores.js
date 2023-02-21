import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';

/**
 * An RDF store index is a low-level index that can be used inside an RDF store.
 */
export interface IRdfStoreIndex<E> {
  /**
   * Add a quad to the index.
   * @param terms An array of encoded terms, ordered in the component order of this index.
   */
  add: (terms: EncodedQuadTerms<E>) => void;
  /**
   * Find all quads matching the given terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   */
  find: (terms: QuadPatternTerms) => IterableIterator<QuadTerms>;
  /**
   * Count the quads matching the given terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   */
  count: (terms: QuadPatternTerms) => number;
}
