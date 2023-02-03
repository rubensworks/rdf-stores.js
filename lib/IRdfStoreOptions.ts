import type * as RDF from '@rdfjs/types';
import type { QuadTermName } from 'rdf-terms';
import type { ITermDictionary } from './dictionary/ITermDictionary';
import type { IRdfStoreIndex } from './index/IRdfStoreIndex';

/**
 * Options for constructing an RDF store.
 */
export interface IRdfStoreOptions<E, Q extends RDF.BaseQuad = RDF.Quad> {
  /**
   * The quad component order combinations of indexes that must be created.
   * For example, creating a store with only an SPOG index requires passing:
   * [[ 'subject', 'predicate', 'object', 'graph' ]]
   * For example, creating a store with SPOG and GOPS index requires passing:
   * [[ 'subject', 'predicate', 'object', 'graph' ], [ 'graph', 'object', 'predicate', 'subject' ]]
   */
  indexCombinations: QuadTermName[][];
  /**
   * Callback for creating an index.
   * @param options The store options.
   */
  indexConstructor: (options: IRdfStoreOptions<E, Q>) => IRdfStoreIndex<E>;
  /**
   * The dictionary for encoding and decoding RDF terms.
   */
  dictionary: ITermDictionary<E>;
  /**
   * The data factory for constructing terms and quads.
   */
  dataFactory: RDF.DataFactory<Q>;
}
