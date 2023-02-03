import type * as RDF from '@rdfjs/types';
import type { QuadTermName } from 'rdf-terms';
import type { QuadPatternTerms, QuadTerms } from '../PatternTerm';

/**
 * An RDF store index is a low-level index that can be used inside an RDF store.
 */
export interface IRdfStoreIndex<E, Q extends RDF.BaseQuad = RDF.Quad> {
  /**
   * The order in which quad components are stored.
   */
  readonly componentOrder: QuadTermName[];

  /**
   * Add a quad to the index.
   * @param terms An array of terms, ordered in the component order of this index.
   */
  add: (terms: QuadTerms) => void;
  /**
   * Find all quads matching the given terms.
   * @param terms An array of pattern terms, ordered in the component order of this index.
   */
  find: (terms: QuadPatternTerms) => Q[];
}
