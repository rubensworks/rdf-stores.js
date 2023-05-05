import type { EventEmitter } from 'events';
import type * as RDF from '@rdfjs/types';
import type { AsyncIterator } from 'asynciterator';
import { wrap } from 'asynciterator';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import { matchPattern, QUAD_TERM_NAMES } from 'rdf-terms';
import { DatasetCoreWrapper } from './dataset/DatasetCoreWrapper';
import type { ITermDictionary } from './dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from './dictionary/TermDictionaryNumberRecordFullTerms';
import type { IRdfStoreIndex } from './index/IRdfStoreIndex';
import { RdfStoreIndexNestedRecord } from './index/RdfStoreIndexNestedRecord';
import type { IRdfStoreOptions } from './IRdfStoreOptions';
import { getBestIndex, orderQuadComponents } from './OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms } from './PatternTerm';

/**
 * An RDF store allows quads to be stored and fetched, based on one or more customizable indexes.
 */
export class RdfStore<E = any, Q extends RDF.BaseQuad = RDF.Quad> implements RDF.Store<Q> {
  public static readonly DEFAULT_INDEX_COMBINATIONS: QuadTermName[][] = [
    [ 'graph', 'subject', 'predicate', 'object' ],
    [ 'graph', 'predicate', 'object', 'subject' ],
    [ 'graph', 'object', 'subject', 'predicate' ],
  ];

  public readonly options: IRdfStoreOptions<E, Q>;
  public readonly dataFactory: RDF.DataFactory<Q>;
  public readonly dictionary: ITermDictionary<E>;
  public readonly indexesWrapped: IRdfStoreIndexWrapped<E>[];
  private readonly indexesWrappedComponentOrders: QuadTermName[][];

  private _size = 0;

  public constructor(options: IRdfStoreOptions<E, Q>) {
    this.options = options;
    this.dataFactory = options.dataFactory;
    this.dictionary = options.dictionary;
    this.indexesWrapped = RdfStore.constructIndexesWrapped(options);
    this.indexesWrappedComponentOrders = this.indexesWrapped.map(indexThis => indexThis.componentOrder);
  }

  /**
   * Create an RDF store with default settings.
   * Concretely, this store stores triples in GSPO, GPOS, and GOSP order,
   * and makes use of in-memory number dictionary encoding.
   */
  public static createDefault(): RdfStore<number> {
    return new RdfStore<number>({
      indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
      indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
      dictionary: new TermDictionaryNumberRecordFullTerms(),
      dataFactory: new DataFactory(),
    });
  }

  /**
   * Internal helper to create index objects.
   * @param options The RDF store options object.
   */
  public static constructIndexesWrapped<E, Q extends RDF.BaseQuad = RDF.Quad>(
    options: IRdfStoreOptions<E, Q>,
  ): IRdfStoreIndexWrapped<E>[] {
    const indexes: IRdfStoreIndexWrapped<E>[] = [];
    if (options.indexCombinations.length === 0) {
      throw new Error('At least one index combination is required');
    }
    for (const componentOrder of options.indexCombinations) {
      if (!RdfStore.isCombinationValid(componentOrder)) {
        throw new Error(`Invalid index combination: ${componentOrder}`);
      }
      indexes.push({
        index: options.indexConstructor(options),
        componentOrder,
        componentOrderInverse: <any>Object.fromEntries(componentOrder.map((value, key) => [ value, key ])),
      });
    }
    return indexes;
  }

  /**
   * Check if a given quad term order is valid.
   * @param combination A quad term order.
   */
  public static isCombinationValid(combination: QuadTermName[]): boolean {
    for (const quadTermName of QUAD_TERM_NAMES) {
      if (!combination.includes(quadTermName)) {
        return false;
      }
    }
    return combination.length === 4;
  }

  /**
   * The number of quads in this store.
   */
  public get size(): number {
    return this._size;
  }

  /**
   * Add a quad to the store.
   * @param quad An RDF quad.
   * @return boolean If the quad was not yet present in the index.
   */
  public addQuad(quad: Q): boolean {
    const quadEncoded = [
      this.dictionary.encode(quad.subject),
      this.dictionary.encode(quad.predicate),
      this.dictionary.encode(quad.object),
      this.dictionary.encode(quad.graph),
    ];
    let newQuad = false;
    for (const indexWrapped of this.indexesWrapped) {
      // Before sending the quad to the index, make sure its components are ordered corresponding to the index's order.
      newQuad = indexWrapped.index
        .set(<EncodedQuadTerms<E>>orderQuadComponents(indexWrapped.componentOrder, quadEncoded), true);
    }
    if (newQuad) {
      this._size++;
      return true;
    }
    return false;
  }

  /**
   * Remove a quad from the store.
   * @param quad An RDF quad.
   * @return boolean If the quad was present in the index.
   */
  public removeQuad(quad: Q): boolean {
    const quadEncoded = [
      this.dictionary.encodeOptional(quad.subject),
      this.dictionary.encodeOptional(quad.predicate),
      this.dictionary.encodeOptional(quad.object),
      this.dictionary.encodeOptional(quad.graph),
    ];

    // We can quickly return false if the quad is not present in the dictionary
    // eslint-disable-next-line unicorn/no-useless-undefined
    if (quadEncoded.includes(undefined)) {
      return false;
    }

    let wasPresent = false;
    for (const indexWrapped of this.indexesWrapped) {
      // Before sending the quad to the index, make sure its components are ordered corresponding to the index's order.
      wasPresent = indexWrapped.index
        .remove(<EncodedQuadTerms<E>>orderQuadComponents(indexWrapped.componentOrder, quadEncoded));
      if (!wasPresent) {
        break;
      }
    }
    if (wasPresent) {
      this._size--;
      return true;
    }
    return false;
  }

  /**
   * Removes all streamed quads.
   * @param stream A stream of quads
   */
  public remove(stream: RDF.Stream<Q>): EventEmitter {
    stream.on('data', quad => this.removeQuad(quad));
    return stream;
  }

  /**
   * All quads matching the pattern will be removed.
   * @param subject The optional subject.
   * @param predicate The optional predicate.
   * @param object The optional object.
   * @param graph The optional graph.
   */
  public removeMatches(
    subject?: RDF.Term | null | undefined,
    predicate?: RDF.Term | null | undefined,
    object?: RDF.Term | null | undefined,
    graph?: RDF.Term | null | undefined,
  ): EventEmitter {
    return this.remove(this.match(subject, predicate, object, graph));
  }

  /**
   * Deletes the given named graph.
   * @param graph The graph term or string to match.
   */
  public deleteGraph(graph: string | Q['graph']): EventEmitter {
    if (typeof graph === 'string') {
      graph = this.dataFactory.namedNode(graph);
    }
    return this.removeMatches(undefined, undefined, undefined, graph);
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
   * Returns a generator producing all quads matching the pattern.
   * @param subject The optional subject.
   * @param predicate The optional predicate.
   * @param object The optional object.
   * @param graph The optional graph.
   */
  public * readQuads(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): IterableIterator<Q> {
    let requireQuotedTripleFiltering = false;

    // Construct a quad pattern array
    const quadComponents: QuadPatternTerms = <QuadPatternTerms>
      [ subject || undefined, predicate || undefined, object || undefined, graph || undefined ]
        .map(term => {
          if (term) {
            if (term.termType === 'Variable') {
              return;
            }
            if (term.termType === 'Quad') {
              requireQuotedTripleFiltering = true;
              return;
            }
          }
          return term;
        });

    // Determine the best index for this pattern
    const indexWrapped = this.indexesWrapped[getBestIndex(this.indexesWrappedComponentOrders, quadComponents)];

    // Re-order the quad pattern based on this best index's component order
    const quadComponentsOrdered = <QuadPatternTerms> orderQuadComponents(indexWrapped.componentOrder, quadComponents);

    // Call the best index's find method.
    // eslint-disable-next-line unicorn/no-array-callback-reference
    for (const decomposedQuad of indexWrapped.index.find(quadComponentsOrdered)) {
      // De-order the resulting quad components into the normal SPOG order for quad creation.
      const quad = this.dataFactory.quad(
        decomposedQuad[indexWrapped.componentOrderInverse.subject],
        decomposedQuad[indexWrapped.componentOrderInverse.predicate],
        decomposedQuad[indexWrapped.componentOrderInverse.object],
        decomposedQuad[indexWrapped.componentOrderInverse.graph],
      );
      if (requireQuotedTripleFiltering) {
        if (matchPattern(quad, subject!, predicate!, object!, graph!)) {
          yield quad;
        }
      } else {
        yield quad;
      }
    }
  }

  /**
   * Returns an array containing all quads matching the pattern.
   * @param subject The optional subject.
   * @param predicate The optional predicate.
   * @param object The optional object.
   * @param graph The optional graph.
   */
  public getQuads(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): Q[] {
    return [ ...this.readQuads(subject, predicate, object, graph) ];
  }

  /**
   * Returns a stream that produces all quads matching the pattern.
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
  ): RDF.Stream<Q> & AsyncIterator<Q> {
    return wrap(this.readQuads(subject, predicate, object, graph));
  }

  /**
   * Returns the exact cardinality of the quads matching the pattern.
   * @param subject The optional subject.
   * @param predicate The optional predicate.
   * @param object The optional object.
   * @param graph The optional graph.
   */
  public countQuads(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): number {
    // Construct a quad pattern array
    const quadComponents: QuadPatternTerms = <QuadPatternTerms>
      [ subject || undefined, predicate || undefined, object || undefined, graph || undefined ]
        .map(term => {
          if (term && (term.termType === 'Variable' || term.termType === 'Quad')) {
            return;
          }
          return term;
        });

    // Optimize all-variables pattern
    if (quadComponents.every(quadComponent => quadComponent === undefined)) {
      return this.size;
    }

    // Determine the best index for this pattern
    const indexWrapped = this.indexesWrapped[getBestIndex(this.indexesWrappedComponentOrders, quadComponents)];

    // Re-order the quad pattern based on this best index's component order
    const quadComponentsOrdered = <QuadPatternTerms> orderQuadComponents(indexWrapped.componentOrder, quadComponents);

    // Call the best index's count method.
    return indexWrapped.index.count(quadComponentsOrdered);
  }

  /**
   * Wrap this store inside a DatasetCore interface.
   * Any mutations in either this store or the wrapper will propagate to each other.
   */
  public asDataset(): DatasetCoreWrapper<E, Q> {
    return new DatasetCoreWrapper(this);
  }
}

export interface IRdfStoreIndexWrapped<E> {
  componentOrder: QuadTermName[];
  componentOrderInverse: Record<QuadTermName, number>;
  index: IRdfStoreIndex<E, boolean>;
}
