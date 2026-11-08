import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuotedIndexed } from '../../lib/dictionary/TermDictionaryQuotedIndexed';
import { deriveSortedOrder } from '../../lib/index/deriveSortedOrder';
import { TermOrder } from '../../lib/TermOrder';

const DF = new DataFactory();

describe('deriveSortedOrder', () => {
  let dictionary: ITermDictionary<number>;
  let order: TermOrder;

  beforeEach(() => {
    dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
    order = new TermOrder(dictionary);
  });

  // Unique quads in SPOG order, over the given graphs, including quoted triples as objects.
  function quads(graphs: RDF.Quad_Graph[]): number[][] {
    const result = new Map<string, number[]>();
    let seed = 7;
    const next = (bound: number): number => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % bound;
    };
    for (let i = 0; i < 500; i++) {
      const object = next(5) === 0 ?
        DF.quad(DF.namedNode(`ex:s${next(4)}`), DF.namedNode('ex:p'), DF.literal(`${next(4)}`)) :
        DF.literal(`${next(30)}`);
      const quad = [
        dictionary.encode(DF.namedNode(`ex:s${next(40)}`)),
        dictionary.encode(DF.namedNode(`ex:p${next(6)}`)),
        dictionary.encode(object),
        dictionary.encode(graphs[next(graphs.length)]),
      ];
      result.set(quad.join(' '), quad);
    }
    return [ ...result.values() ];
  }

  function inOrder(spogQuads: number[][], componentOrder: QuadTermName[]): number[][] {
    const positions = componentOrder.map(name => [ 'subject', 'predicate', 'object', 'graph' ].indexOf(name));
    return spogQuads
      .map(quad => positions.map(position => quad[position]))
      .sort((left, right) => {
        for (let i = 0; i < 4; i++) {
          if (left[i] !== right[i]) {
            return order.label(left[i]) - order.label(right[i]);
          }
        }
        return 0;
      });
  }

  function derive(spogQuads: number[][], from: QuadTermName[], to: QuadTermName[]): number[][] | undefined {
    const sorted = Int32Array.from(inOrder(spogQuads, from).flat());
    const derived = deriveSortedOrder(sorted, spogQuads.length, from, to, order.rankTables(), order.size);
    if (!derived) {
      return undefined;
    }
    return Array.from({ length: spogQuads.length }, (value, i) => [ ...derived.subarray(i * 4, (i * 4) + 4) ]);
  }

  function prepare(graphs: RDF.Quad_Graph[]): number[][] {
    const spogQuads = quads(graphs);
    const encodings = spogQuads.flat();
    order.addAll(encodings, encodings.length);
    order.makeUniform();
    return spogQuads;
  }

  it.each([
    [[ 'graph', 'subject', 'object', 'predicate' ], [ 'graph', 'predicate', 'subject', 'object' ]],
    [[ 'graph', 'predicate', 'subject', 'object' ], [ 'graph', 'object', 'predicate', 'subject' ]],
    [[ 'subject', 'predicate', 'object', 'graph' ], [ 'object', 'subject', 'predicate', 'graph' ]],
    [[ 'subject', 'predicate', 'object', 'graph' ], [ 'subject', 'predicate', 'graph', 'object' ]],
  ])('derives %j into %j for a single graph', (from: any, to: any) => {
    const spogQuads = prepare([ DF.defaultGraph() ]);
    expect(derive(spogQuads, from, to)).toEqual(inOrder(spogQuads, to));
  });

  it.each([
    [[ 'graph', 'subject', 'object', 'predicate' ], [ 'graph', 'predicate', 'subject', 'object' ]],
    [[ 'graph', 'predicate', 'subject', 'object' ], [ 'graph', 'object', 'predicate', 'subject' ]],
  ])('derives %j into %j for several graphs', (from: any, to: any) => {
    const spogQuads = prepare([ DF.defaultGraph(), DF.namedNode('ex:g1'), DF.namedNode('ex:g2') ]);
    expect(derive(spogQuads, from, to)).toEqual(inOrder(spogQuads, to));
  });

  it('derives nothing from no quads', () => {
    prepare([ DF.defaultGraph() ]);
    expect(deriveSortedOrder(
      new Int32Array(0),
      0,
      [ 'graph', 'subject', 'object', 'predicate' ],
      [ 'graph', 'predicate', 'subject', 'object' ],
      order.rankTables(),
      order.size,
    )).toEqual(new Int32Array(0));
  });

  it('can not derive an order that moves more than one component', () => {
    const spogQuads = prepare([ DF.defaultGraph() ]);
    const from: QuadTermName[] = [ 'graph', 'subject', 'object', 'predicate' ];
    expect(derive(spogQuads, from, [ 'graph', 'predicate', 'object', 'subject' ])).toBeUndefined();
  });

  it('does not derive the same order', () => {
    const spogQuads = prepare([ DF.defaultGraph() ]);
    const from: QuadTermName[] = [ 'graph', 'subject', 'object', 'predicate' ];
    expect(derive(spogQuads, from, [ ...from ])).toBeUndefined();
  });
});
