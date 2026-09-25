import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { TermOrder } from '../TermOrder';

/**
 * An RDF store index is a low-level index that can be used inside an RDF store.
 * It maps quads to values of a certain type V.
 */
export interface IRdfStoreIndex<TE, TV> {
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
  set: (key: EncodedQuadTerms<TE>, value: TV) => boolean;
  /**
   * Remove a key from the index.
   * @param key An array of encoded terms, ordered in the component order of this index.
   * @return boolean If the quad was present in the index.
   */
  remove: (key: EncodedQuadTerms<TE>) => boolean;
  /**
   * Get the value for the given key (a non-encoded quad).
   * @param key The non-encoded quad terms.
   * @return V The stored value, or undefined if no mapping is present.
   */
  get: (key: QuadTerms) => TV | undefined;
  /**
   * Get the value for the given key (an encoded quad).
   * @param key An array of encoded terms, ordered in the component order of this index.
   * @return V The stored value, or undefined if no mapping is present.
   */
  getEncoded: (key: EncodedQuadTerms<TE>) => TV | undefined;
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
  findEncoded: (ids: EncodedQuadTerms<TE | undefined>, terms: QuadPatternTerms) =>
  IterableIterator<EncodedQuadTerms<TE>>;
  /**
   * Returns a generator producing arrays of terms that exist in the index.
   * Each returned array corresponds to the terms specified by given quad term names.
   * Distinct-ness is only guaranteed if there are only true match term values.
   *
   * For example, when requesting the terms `[ true, true ]`,
   * a produced array could be `[ 'ex:s', 'ex:p' ]`,
   *
   * @param matchTerms An array of booleans indicating which terms to match. Length may be shorter than 4.
   * @param filterTerms An iterable of encoded pattern terms to filter by, ordered in the component order of this index.
   */
  findTerms: (matchTerms: boolean[], filterTerms?: EncodedQuadTerms<TE | undefined>) => IterableIterator<TE[]>;
  /**
   * Count the keys matching the given terms.
   * Quads are represented as an array of terms, in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   */
  count: (terms: QuadPatternTerms) => number;
  /**
   * Present on indexes that always keep their quads sorted on this term order.
   * Scans of such an index produce results in index order, and support skipping ahead.
   */
  termOrder?: TermOrder;
  /**
   * Add many quads at once, which may be much cheaper than setting them one by one.
   * This adds to the quads that are already present,
   * and can not result in duplicates.
   * `keys` is not modified, and is not retained after this returns.
   * @param keys Encoded quads in the component order of this index, four entries per quad.
   * @param count The number of quads in `keys`.
   * @return number The number of quads that were not yet present.
   */
  setAll?: (keys: Int32Array, count: number) => number;
  /**
   * Count the terms that exist in the index.
   * Each returned array corresponds to the terms specified by given quad term names.
   * This corresponds to the semantics of {@link #findTerms}, and returns counts instead of terms.
   * @param terms An array of booleans indicating which terms to match. Length may be shorter than 4.
   * @param filterTerms An iterable of encoded pattern terms to filter by, ordered in the component order of this index.
   */
  countTerms: (matchTerms: boolean[], filterTerms?: EncodedQuadTerms<TE | undefined>) => number;
}
