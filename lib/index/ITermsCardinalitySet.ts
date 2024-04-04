/**
 * A Terms Cardinality Set is a low-level index that can be used inside an RDF store.
 * It keeps a distinct list of terms in either subject, predicate, object or graph position with their cardinality.
 */
export interface ITermsCardinalitySet<E> {
  /**
   * Add an encoded key
   * @param key An array of encoded terms, ordered in the component order of this index.
   * @param value The value to set for the given key.
   * @return number Amount of entities now in the set
   */
  add: (key: E) => number;
  /**
   * Remove a term from the index
   * @param key An encoded term.
   * @return number Amount of entities now in the set
   */
  remove: (key: E) => number;
  /**
   * Gets a distinct array of terms.
   * @return E[]
   */
  getTerms: () => E[];

  /**
   * Count the distinct terms in this set
   * Quads are represented as an array of terms, in the component order of this index.
   * @return number
   */
  count: (term: E) => number;
}
