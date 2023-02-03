import type * as RDF from '@rdfjs/types';
import type { QuadTermName } from 'rdf-terms';
import type { QuadPatternTerms } from '../PatternTerm';

/**
 * An RDF store index is a low-level index that can be used inside an RDF store.
 */
export interface IRdfStoreIndex<E, Q extends RDF.BaseQuad = RDF.Quad> {
  /**
   * The order in which quad components are stored.
   */
  readonly componentOrder: QuadTermName[];

  /**
   * Find all quads matching the given terms.
   * @param terms An array of terms, ordered in the component order of this index.
   */
  find: (terms: QuadPatternTerms) => Q[];
  /**
   * Add a quad to the index.
   * @param quad An RDF quad.
   */
  add: (quad: Q) => void;
}
