import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';

/**
 * An RDF store index is a low-level index that can be used inside an RDF store.
 * It maps quads to values of a certain type V.
 */
export interface IRdfStoreIndex<E, V> {
  /**
   * A record indicating supported features of this index.
   */
  features: {
    /**
     * If true, this index supports passing quad patterns with quoted quad patterns in the `find` method.
     * If false, such quoted quad patterns can not be passed, and must be replaced by `undefined`
     * and filtered by the upper store afterwards.
     */
    quotedTripleFiltering?: boolean;
  };
  /**
   * Set the value for a key (an encoded quad) in the index.
   * @param key An array of encoded terms, ordered in the component order of this index.
   * @param value The value to set for the given key.
   * @return boolean If the mapping was not yet present in the index.
   */
  set: (key: EncodedQuadTerms<E>, value: V) => boolean;
  /**
   * Remove a key from the index.
   * @param key An array of encoded terms, ordered in the component order of this index.
   * @return boolean If the quad was present in the index.
   */
  remove: (key: EncodedQuadTerms<E>) => boolean;
  /**
   * Get the value for the given key (a non-encoded quad).
   * @param key The non-encoded quad terms.
   * @return V The stored value, or undefined if no mapping is present.
   */
  get: (key: QuadTerms) => V | undefined;
  /**
   * Get the value for the given key (an encoded quad).
   * @param key An array of encoded terms, ordered in the component order of this index.
   * @return V The stored value, or undefined if no mapping is present.
   */
  getEncoded: (key: EncodedQuadTerms<E>) => V | undefined;
  /**
   * Find all keys matching the given key terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   */
  find: (terms: QuadPatternTerms) => IterableIterator<QuadTerms>;
  /**
   * Find all encoded keys matching the given key terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param ids An iterable of encoded pattern terms, ordered in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   */
  findEncoded: (ids: EncodedQuadTerms<E | undefined>, terms: QuadPatternTerms) => IterableIterator<EncodedQuadTerms<E>>;
  /**
   * Count the keys matching the given terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   */
  count: (terms: QuadPatternTerms) => number;
}
