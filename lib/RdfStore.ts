import type { EventEmitter } from 'events';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import { TermDictionaryNumber } from './dictionary/TermDictionaryNumber';
import type { IRdfStoreIndex } from './index/IRdfStoreIndex';
import { RdfStoreIndexNestedMap } from './index/RdfStoreIndexNestedMap';
import type { IRdfStoreOptions } from './IRdfStoreOptions';
import { getBestIndex, orderQuadComponents } from './OrderUtils';
import type { QuadPatternTerms } from './PatternTerm';

const streamifyArray = require('streamify-array');

/**
 * An RDF store allows quads to be stored and fetched, based on one or more customizable indexes.
 */
export class RdfStore<E, Q extends RDF.BaseQuad = RDF.Quad>
implements RDF.Source<Q>, RDF.Sink<RDF.Stream<Q>, EventEmitter> {
  public static readonly DEFAULT_INDEX_COMBINATIONS: QuadTermName[][] = [
    [ 'graph', 'subject', 'predicate', 'object' ],
    [ 'graph', 'predicate', 'object', 'subject' ],
    [ 'graph', 'object', 'subject', 'predicate' ],
  ];

  private readonly indexes: IRdfStoreIndex<E, Q>[];

  public constructor(options: IRdfStoreOptions<E, Q>) {
    this.indexes = RdfStore.constructIndexes(options);
  }

  public static createDefault(): RdfStore<number> {
    return new RdfStore<number>({
      indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
      indexConstructor: (subOptions, componentOrder) => new RdfStoreIndexNestedMap(subOptions, componentOrder),
      dictionary: new TermDictionaryNumber(),
      dataFactory: new DataFactory(),
    });
  }

  public static constructIndexes<E, Q extends RDF.BaseQuad = RDF.Quad>(
    options: IRdfStoreOptions<E, Q>,
  ): IRdfStoreIndex<E, Q>[] {
    const indexes: IRdfStoreIndex<E, Q>[] = [];
    if (options.indexCombinations.length === 0) {
      throw new Error('At least one index combination is required');
    }
    for (const combination of options.indexCombinations) {
      if (!RdfStore.isCombinationValid(combination)) {
        throw new Error(`Invalid index combination: ${combination}`);
      }
      indexes.push(options.indexConstructor(options, combination));
    }
    return indexes;
  }

  public static isCombinationValid(combination: QuadTermName[]): boolean {
    for (const quadTermName of QUAD_TERM_NAMES) {
      if (!combination.includes(quadTermName)) {
        return false;
      }
    }
    return combination.length === 4;
  }

  /**
   * Add a quad to the store.
   * @param quad An RDF quad.
   */
  public addQuad(quad: Q): void {
    for (const index of this.indexes) {
      index.add(orderQuadComponents(index.componentOrder, [ quad.subject, quad.predicate, quad.object, quad.graph ]));
    }
  }

  /**
   * Import the given stream of quads into the store.
   * @param stream A stream of RDF quads.
   */
  public import(stream: RDF.Stream<Q>): EventEmitter {
    stream.on('data', (quad: Q) => this.addQuad(quad));
    return stream;
  }

  /**
   * Returns a stream that processes all quads matching the pattern.
   * @param subject The optional subject.
   * @param predicate The optional predicate.
   * @param object The optional object.
   * @param graph The optional graph.
   */
  public match(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): RDF.Stream<Q> {
    const quadComponents: QuadPatternTerms = <QuadPatternTerms>
      [ subject || undefined, predicate || undefined, object || undefined, graph || undefined ]
        .map(term => {
          if (term && (term.termType === 'Variable' || term.termType === 'Quad')) {
            return;
          }
          return term;
        });
    const index = this.indexes[getBestIndex(this.indexes.map(indexThis => indexThis.componentOrder), quadComponents)];
    return streamifyArray(index.find(orderQuadComponents(index.componentOrder, quadComponents)));
  }
}
