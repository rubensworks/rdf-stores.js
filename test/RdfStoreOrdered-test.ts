import { BindingsFactory } from '@comunica/utils-bindings-factory';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuotedIndexed } from '../lib/dictionary/TermDictionaryQuotedIndexed';
import { RdfStoreIndexBTree } from '../lib/index/RdfStoreIndexBTree';
import { RdfStoreIndexNestedMapQuoted } from '../lib/index/RdfStoreIndexNestedMapQuoted';
import { RdfStore } from '../lib/RdfStore';
import 'jest-rdf';

const DF = new DataFactory();
const BF = new BindingsFactory(DF);
const V = DF.variable.bind(DF);
const N = DF.namedNode.bind(DF);
const DG = DF.defaultGraph();

// The SPARQL order of two terms, simplified to what these fixtures need.
const PRIORITY: Record<string, number> = { BlankNode: 0, NamedNode: 1, Literal: 2, Quad: 3, DefaultGraph: 4 };
function compare(termA: any, termB: any): number {
  if (termA.termType !== termB.termType) {
    return PRIORITY[termA.termType] - PRIORITY[termB.termType];
  }
  return termA.value === termB.value ? 0 : (termA.value < termB.value ? -1 : 1);
}

function createStore(indexCombinations?: QuadTermName[][]): RdfStore<number> {
  return new RdfStore<number>({
    indexCombinations: indexCombinations ?? [
      [ 'graph', 'subject', 'predicate', 'object' ],
      [ 'graph', 'predicate', 'subject', 'object' ],
      [ 'graph', 'object', 'subject', 'predicate' ],
      [ 'graph', 'predicate', 'object', 'subject' ],
    ],
    indexConstructor: subOptions => new RdfStoreIndexBTree(subOptions),
    indexNodes: true,
    dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms()),
    dataFactory: new DataFactory(),
    termComparator: compare,
  });
}

function createUnorderedStore(): RdfStore<number> {
  return new RdfStore<number>({
    indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
    indexConstructor: subOptions => new RdfStoreIndexNestedMapQuoted(subOptions),
    dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms()),
    dataFactory: new DataFactory(),
  });
}

// Deliberately inserted out of order, so that a sorted scan cannot be insertion order by accident.
function fill(store: any, subjects: number[], predicates = [ 'p' ]): void {
  for (const subject of subjects) {
    for (const predicate of predicates) {
      store.addQuad(DF.quad(N(`s${String(subject).padStart(3, '0')}`), N(predicate), N(`o${String(subject).padStart(3, '0')}`)));
    }
  }
}

function subjectsOf(store: any, predicate = 'p'): string[] {
  const iterator: any = store.matchBindings(BF, V('s'), N(predicate), V('o'), DG);
  const out: string[] = [];
  let bindings = iterator.read();
  while (bindings !== null) {
    out.push(bindings.get(V('s')).value);
    bindings = iterator.read();
  }
  return out;
}

describe('an ordered store', () => {
  it('scans in the comparator\'s order rather than insertion order', () => {
    const store = createStore();
    fill(store, [ 3, 1, 2 ]);
    expect(subjectsOf(store)).toEqual([ 's001', 's002', 's003' ]);
  });

  it('orders every level of an index, not only the first', () => {
    const store = createStore([[ 'graph', 'predicate', 'subject', 'object' ]]);
    for (const [ predicate, subject ] of [[ 'p2', 's2' ], [ 'p1', 's3' ], [ 'p2', 's1' ], [ 'p1', 's1' ]]) {
      store.addQuad(DF.quad(N(subject), N(predicate), N('o')));
    }
    const iterator: any = store.matchBindings(BF, V('s'), V('p'), V('o'), DG);
    const seen: string[] = [];
    let bindings = iterator.read();
    while (bindings !== null) {
      seen.push(`${bindings.get(V('p')).value}/${bindings.get(V('s')).value}`);
      bindings = iterator.read();
    }
    expect(seen).toEqual([ 'p1/s1', 'p1/s3', 'p2/s1', 'p2/s2' ]);
  });

  it('stays ordered when more quads are added', () => {
    const store = createStore();
    fill(store, [ 3, 1 ]);
    expect(subjectsOf(store)).toEqual([ 's001', 's003' ]);
    fill(store, [ 2 ]);
    expect(subjectsOf(store)).toEqual([ 's001', 's002', 's003' ]);
  });
});

describe('indexOrders', () => {
  it('is empty for a store without ordered indexes', () => {
    const store = createUnorderedStore();
    fill(store, [ 1 ]);
    expect(store.indexOrders).toEqual([]);
  });

  it('lists the orders of the ordered indexes', () => {
    const store = createStore();
    expect(store.indexOrders).toEqual([
      [ 'graph', 'subject', 'predicate', 'object' ],
      [ 'graph', 'predicate', 'subject', 'object' ],
      [ 'graph', 'object', 'subject', 'predicate' ],
      [ 'graph', 'predicate', 'object', 'subject' ],
    ]);
  });

  it('hands out copies, so that a consumer cannot reorder the store', () => {
    const store = createStore();
    fill(store, [ 1 ]);
    store.indexOrders[0].reverse();
    expect(store.indexOrders[0]).toEqual([ 'graph', 'subject', 'predicate', 'object' ]);
  });
});

describe('resultOrder', () => {
  it('is absent for a store without ordered indexes', () => {
    const store = createUnorderedStore();
    fill(store, [ 1 ]);
    expect((<any> store.matchBindings(BF, V('s'), N('p'), V('o'), DG)).resultOrder).toBeUndefined();
  });

  it('names the components the scan varies over, in the order it produces them', () => {
    const store = createStore();
    fill(store, [ 1 ]);
    const orderOf = (subject: any, predicate: any, object: any): any =>
      (<any> store.matchBindings(BF, subject, predicate, object, DG)).resultOrder;
    expect(orderOf(V('s'), V('p'), V('o'))).toEqual([ 'subject', 'predicate', 'object' ]);
    expect(orderOf(V('s'), N('p'), V('o'))).toEqual([ 'subject', 'object' ]);
    expect(orderOf(V('s'), N('p'), N('o001'))).toEqual([ 'subject' ]);
    expect(orderOf(N('s001'), V('p'), V('o'))).toEqual([ 'predicate', 'object' ]);
  });

  it('puts the object first when only an object-before-subject index is available', () => {
    const store = createStore([
      [ 'graph', 'subject', 'predicate', 'object' ],
      [ 'graph', 'predicate', 'object', 'subject' ],
      [ 'graph', 'object', 'subject', 'predicate' ],
    ]);
    fill(store, [ 1 ]);
    expect((<any> store.matchBindings(BF, V('s'), N('p'), V('o'), DG)).resultOrder)
      .toEqual([ 'object', 'subject' ]);
  });
});

describe('seekTo', () => {
  function seekableStore(subjects: number[]): any {
    const store = createStore();
    fill(store, subjects);
    return store;
  }

  function label(value: number): string {
    return `s${String(value).padStart(3, '0')}`;
  }

  it('is absent for a store without ordered indexes', () => {
    const store = createUnorderedStore();
    fill(store, [ 1 ]);
    expect((<any> store.matchBindings(BF, V('s'), N('p'), V('o'), DG)).seekTo).toBeUndefined();
  });

  it('skips to the first result that is not before the sought term', () => {
    const store = seekableStore([ 1, 2, 3, 4, 5 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    expect(iterator.read().get(V('s')).value).toBe(label(1));
    iterator.seekTo('subject', N(label(4)));
    expect(iterator.read().get(V('s')).value).toBe(label(4));
    expect(iterator.read().get(V('s')).value).toBe(label(5));
    expect(iterator.read()).toBeNull();
  });

  it('lands on the next term when the sought one is not in the store', () => {
    const store = seekableStore([ 1, 3, 5 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    iterator.seekTo('subject', N(label(4)));
    expect(iterator.read().get(V('s')).value).toBe(label(5));
    expect(iterator.read()).toBeNull();
  });

  it('ends the scan when nothing reaches the sought term', () => {
    const store = seekableStore([ 1, 2, 3 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    iterator.seekTo('subject', N(label(9)));
    expect(iterator.read()).toBeNull();
  });

  it('applies a seek right away, so that a later seek to an earlier term does not rewind', () => {
    const store = seekableStore([ 1, 2, 3, 4 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    iterator.seekTo('subject', N(label(3)));
    iterator.seekTo('subject', N(label(1)));
    expect(iterator.read().get(V('s')).value).toBe(label(3));
  });

  it('does not hand back a result it has already produced', () => {
    const store = seekableStore([ 1, 2, 3, 4, 5 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    iterator.seekTo('subject', N(label(4)));
    expect(iterator.read().get(V('s')).value).toBe(label(4));
    // Seeking backwards after reading cannot rewind the scan: a seek only drops what is still ahead.
    iterator.seekTo('subject', N(label(1)));
    expect(iterator.read().get(V('s')).value).toBe(label(5));
    expect(iterator.read()).toBeNull();
  });

  it('produces exactly the results a filtered full scan would', () => {
    const subjects = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
    for (const target of [ 1, 4, 8, 9 ]) {
      const store = seekableStore(subjects);
      const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
      const seen: string[] = [];
      iterator.seekTo('subject', N(label(target)));
      let bindings = iterator.read();
      while (bindings !== null) {
        seen.push(bindings.get(V('s')).value);
        bindings = iterator.read();
      }
      expect(seen).toEqual(subjects.filter(subject => subject >= target).map(label));
    }
  });

  it('ignores a component the scan does not vary over', () => {
    const store = seekableStore([ 1, 2, 3 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    // The predicate is bound, so it is constant across the scan and there is nothing to skip within.
    iterator.seekTo('predicate', N('p'));
    expect(iterator.read().get(V('s')).value).toBe(label(1));
  });

  it('does nothing once the scan has ended', () => {
    const store = seekableStore([ 1 ]);
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    expect(iterator.read().get(V('s')).value).toBe(label(1));
    expect(iterator.read()).toBeNull();
    expect(() => iterator.seekTo('subject', N(label(1)))).not.toThrow();
    expect(iterator.read()).toBeNull();
  });

  it('skips within a deeper level of the index', () => {
    const store = createStore([[ 'graph', 'predicate', 'subject', 'object' ]]);
    for (const subject of [ 3, 1, 2 ]) {
      store.addQuad(DF.quad(N(label(subject)), N('p'), N(`o${subject}`)));
    }
    const iterator: any = store.matchBindings(BF, V('s'), N('p'), V('o'), DG);
    // Subject sits one level below the bound predicate in this index.
    iterator.seekTo('subject', N(label(2)));
    expect(iterator.read().get(V('s')).value).toBe(label(2));
  });
});

describe('seekTo at each level of an index', () => {
  // One index, and a pattern binding nothing, so that every component is a level the scan varies over.
  function gridStore(): any {
    const store = createStore([[ 'graph', 'subject', 'predicate', 'object' ]]);
    for (const graph of [ 'g2', 'g1' ]) {
      for (const subject of [ 's2', 's1' ]) {
        for (const predicate of [ 'p2', 'p1' ]) {
          for (const object of [ 'o2', 'o1' ]) {
            store.addQuad(DF.quad(N(subject), N(predicate), N(object), N(graph)));
          }
        }
      }
    }
    return store;
  }

  function drain(iterator: any): string[] {
    const seen: string[] = [];
    let bindings = iterator.read();
    while (bindings !== null) {
      seen.push([ 'g', 's', 'p', 'o' ].map(name => bindings.get(V(name)).value).join('/'));
      bindings = iterator.read();
    }
    return seen;
  }

  function scan(store: any): any {
    return store.matchBindings(BF, V('s'), V('p'), V('o'), V('g'));
  }

  it('varies over all four components', () => {
    expect((scan(gridStore())).resultOrder).toEqual([ 'graph', 'subject', 'predicate', 'object' ]);
    expect(drain(scan(gridStore()))).toHaveLength(16);
  });

  // A seek drops what precedes the target within the group enclosing the next result, and is satisfied once it
  // lands, so later groups are produced in full. Of the 16 quads, seeking the outermost component
  // drops the most and the innermost the least.
  it.each([
    [ 'graph', 'g2', 8 ],
    [ 'subject', 's2', 12 ],
    [ 'predicate', 'p2', 14 ],
    [ 'object', 'o2', 15 ],
  ])('skips within the %s level before anything is read', (component, target, expected) => {
    const iterator = scan(gridStore());
    iterator.seekTo(component, N(target));
    const seen = drain(iterator);
    const position = [ 'graph', 'subject', 'predicate', 'object' ].indexOf(component);
    expect(seen[0].split('/')[position]).toBe(target);
    expect(seen).toHaveLength(expected);
    // Whatever it dropped is gone for good, and the rest is intact and still in order.
    expect(seen).toEqual([ ...seen ].sort());
  });

  it.each([
    [ 'graph', 'g2' ],
    [ 'subject', 's2' ],
    [ 'predicate', 'p2' ],
    [ 'object', 'o2' ],
  ])('abandons the subtree being emitted when it precedes the sought %s', (component, target) => {
    const iterator = scan(gridStore());
    // Read one result first, so that a subtree is part-way through being emitted.
    expect(iterator.read()).not.toBeNull();
    iterator.seekTo(component, N(target));
    const seen = drain(iterator);
    const position = [ 'graph', 'subject', 'predicate', 'object' ].indexOf(component);
    expect(seen[0].split('/')[position]).toBe(target);
    // Nothing already produced comes back, and nothing before the target at this level follows.
    expect(seen).not.toContain('g1/s1/p1/o1');
  });

  it('drops a whole subtree without producing what is underneath it', () => {
    const store = gridStore();
    const iterator = scan(store);
    // Seeking the graph past g1 must not emit any of the eight quads in it.
    iterator.seekTo('graph', N('g2'));
    const seen = drain(iterator);
    expect(seen).toHaveLength(8);
    expect(seen.every(row => row.startsWith('g2/'))).toBe(true);
  });
});
