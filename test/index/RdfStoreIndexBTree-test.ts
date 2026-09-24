import { Readable } from 'node:stream';
import { BindingsFactory } from '@comunica/utils-bindings-factory';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { termToString } from 'rdf-string';
import 'jest-rdf';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberMap } from '../../lib/dictionary/TermDictionaryNumberMap';
import { TermDictionaryNumberRecordFullTerms } from '../../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuotedIndexed } from '../../lib/dictionary/TermDictionaryQuotedIndexed';
import { RdfStoreIndexBTree } from '../../lib/index/RdfStoreIndexBTree';
import { RdfStoreIndexNestedMap } from '../../lib/index/RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMapQuoted } from '../../lib/index/RdfStoreIndexNestedMapQuoted';
import type { EncodedQuadTerms, QuadPatternTerms } from '../../lib/PatternTerm';
import { RdfStore } from '../../lib/RdfStore';
import { defaultTermComparator, TermOrder } from '../../lib/TermOrder';

const DF = new DataFactory();
const BF = new BindingsFactory(DF);
const V = DF.variable.bind(DF);

/**
 * A small deterministic pseudo-random generator, so that failures reproduce.
 * @param seed The seed.
 */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7FFFFFFF;
    return state / 0x7FFFFFFF;
  };
}

describe('RdfStoreIndexBTree', () => {
  let dictionary: ITermDictionary<number>;
  let index: RdfStoreIndexBTree;
  let reference: RdfStoreIndexNestedMap<number, boolean>;
  let next: () => number;
  let terms: RDF.Term[];

  function options(): any {
    return { indexCombinations: [], indexConstructor: undefined, dictionary, dataFactory: DF };
  }

  function randomQuad(): EncodedQuadTerms<number> {
    return [
      dictionary.encode(terms[Math.floor(next() * 40)]),
      dictionary.encode(terms[Math.floor(next() * 8)]),
      dictionary.encode(terms[Math.floor(next() * terms.length)]),
      dictionary.encode(terms[Math.floor(next() * 3)]),
    ];
  }

  function compareQuads(left: number[], right: number[]): number {
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) {
        return defaultTermComparator(dictionary.decode(left[i]), dictionary.decode(right[i])) || left[i] - right[i];
      }
    }
    return 0;
  }

  function sorted(quads: number[][]): number[][] {
    return [ ...quads ].sort(compareQuads);
  }

  function unique(quads: number[][]): number[][] {
    return quads.filter((quad, i) => i === 0 || compareQuads(quad, quads[i - 1]) !== 0);
  }

  function randomPattern(): [ EncodedQuadTerms<number | undefined>, QuadPatternTerms ] {
    const pick = randomQuad();
    const ids = <EncodedQuadTerms<number | undefined>> pick.map(id => next() < 0.5 ? id : undefined);
    const patternTerms = <QuadPatternTerms> ids.map(id => id === undefined ? undefined : dictionary.decode(id));
    return [ ids, patternTerms ];
  }

  function checkAgainstReference(): void {
    expect(index.size).toBe(reference.count([ undefined, undefined, undefined, undefined ]));
    const all = [ ...index.findEncoded([ undefined, undefined, undefined, undefined ], <any> [ undefined ]) ];
    expect(all).toEqual(sorted(all));
    for (let i = 0; i < 60; i++) {
      const [ ids, patternTerms ] = randomPattern();
      const actual = [ ...index.findEncoded(ids, patternTerms) ];
      expect(actual).toEqual(sorted([ ...reference.findEncoded(ids, patternTerms) ]));
      expect(index.count(patternTerms)).toBe(actual.length);
      expect([ ...index.find(patternTerms) ].map(quad => quad.map(term => dictionary.encode(term))))
        .toEqual(actual);
    }
    for (let i = 0; i < 40; i++) {
      const length = 1 + Math.floor(next() * 4);
      const matchTerms = Array.from({ length }, () => next() < 0.7);
      const [ filters ] = randomPattern();
      const filterTerms = next() < 0.5 ? filters : undefined;
      const actual = [ ...index.findTerms(matchTerms, filterTerms) ];
      const expected = [ ...reference.findTerms(matchTerms, filterTerms) ];
      if (matchTerms.includes(false)) {
        // Distinctness is only guaranteed when all terms are matched, and the store deduplicates otherwise.
        expect(unique(sorted(actual))).toEqual(unique(sorted(expected)));
      } else {
        expect(actual).toEqual(sorted(expected));
      }
      // The store only counts on the index when every unmatched level is pinned by a filter.
      if (matchTerms.every((matched, level) => matched || filterTerms?.[level] !== undefined)) {
        expect(index.countTerms(matchTerms, filterTerms)).toBe(reference.countTerms(matchTerms, filterTerms));
      }
    }
  }

  beforeEach(() => {
    dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
    index = new RdfStoreIndexBTree(options());
    reference = new RdfStoreIndexNestedMap(options());
    next = random(42);
    terms = [];
    for (let i = 0; i < 300; i++) {
      terms.push(i % 3 === 0 ? DF.literal(`${i}`) : DF.namedNode(`ex:${(i * 7919) % 1000}`));
    }
    const quoted = DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p'), DF.literal('o'));
    terms.push(DF.defaultGraph(), DF.blankNode('b'), quoted);
  });

  it('matches a nested-map index under inserts and removals one by one', () => {
    const inserted: EncodedQuadTerms<number>[] = [];
    for (let i = 0; i < 6000; i++) {
      const quad = randomQuad();
      expect(index.set(quad, true)).toBe(reference.set(quad, true));
      inserted.push(quad);
    }
    expect(index.leaves.length).toBeGreaterThan(8);
    checkAgainstReference();
    for (let i = 0; i < 5000; i++) {
      const quad = inserted[Math.floor(next() * inserted.length)];
      expect(index.remove(quad)).toBe(reference.remove(quad));
      expect(index.getEncoded(quad)).toBe(reference.getEncoded(quad));
    }
    checkAgainstReference();
  });

  it('matches a nested-map index under batch inserts', () => {
    for (const batchSize of [ 5000, 3000, 10, 4000 ]) {
      const batch = new Int32Array(batchSize * 4);
      let expectedAdded = 0;
      for (let i = 0; i < batchSize; i++) {
        const quad = randomQuad();
        batch.set(quad, i * 4);
        if (reference.set(quad, true)) {
          expectedAdded++;
        }
      }
      expect(index.setAll(batch, batchSize)).toBe(expectedAdded);
    }
    checkAgainstReference();
  });

  it('removes down to empty and inserts again', () => {
    const quads = Array.from({ length: 2000 }, () => randomQuad());
    for (const quad of quads) {
      index.set(quad, true);
    }
    for (const quad of quads) {
      index.remove(quad);
    }
    expect(index.size).toBe(0);
    expect([ ...index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []) ]).toEqual([]);
    expect(index.remove(quads[0])).toBe(false);
    expect(index.set(quads[0], true)).toBe(true);
    expect(index.size).toBe(1);
  });

  it('skips ahead within the varying component on seek', () => {
    for (let i = 0; i < 6000; i++) {
      index.set(randomQuad(), true);
    }
    for (let i = 0; i < 200; i++) {
      // Bind a prefix of the components, and seek within the first one that varies.
      const bound = Math.floor(next() * 3);
      const pick = randomQuad();
      const ids = <EncodedQuadTerms<number | undefined>> pick.map((id, level) => level < bound ? id : undefined);
      const expected = [ ...index.findEncoded(ids, <any> []) ];
      const iterator = <any> index.findEncoded(ids, <any> []);
      const skipped = Math.floor(next() * Math.min(expected.length, 50));
      const actual = [];
      for (let j = 0; j < skipped; j++) {
        actual.push(iterator.next().value);
      }
      const target = terms[Math.floor(next() * terms.length)];
      const targetLabel = index.termOrder.lowerBound(target);
      iterator.seek(bound, (key: number) => index.termOrder.label(key) < targetLabel);
      actual.push(...iterator);
      expect(actual).toEqual([
        ...expected.slice(0, skipped),
        ...expected.slice(skipped)
          .filter(quad => defaultTermComparator(dictionary.decode(quad[bound]), target) >= 0),
      ]);
    }
  });

  it('keeps iterating correctly while quads are removed', () => {
    for (let i = 0; i < 3000; i++) {
      index.set(randomQuad(), true);
    }
    const expected = [ ...index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []) ];
    const actual = [];
    for (const quad of index.findEncoded([ undefined, undefined, undefined, undefined ], <any> [])) {
      actual.push(quad);
      index.remove(quad);
    }
    expect(actual).toEqual(expected);
    expect(index.size).toBe(0);
  });

  it('keeps finding terms correctly while quads are added', () => {
    for (let i = 0; i < 1000; i++) {
      index.set(randomQuad(), true);
    }
    const expected = [ ...index.findTerms([ true ]) ];
    const actual = [];
    for (const term of index.findTerms([ true ])) {
      actual.push(term);
      index.set([ term[0], dictionary.encode(DF.namedNode('ex:new')), term[0], term[0] ], true);
    }
    expect(actual).toEqual(expected);
  });

  it('sorts a batch over more terms than one radix digit covers', () => {
    const count = 70000;
    const batch = new Int32Array(count * 4);
    const predicate = dictionary.encode(DF.namedNode('ex:p'));
    const graph = dictionary.encode(DF.defaultGraph());
    for (let i = 0; i < count; i++) {
      // Subjects and objects in an order unrelated to their term order.
      const value = (i * 7919) % count;
      batch.set([
        dictionary.encode(DF.namedNode(`ex:s${value % 1000}`)),
        predicate,
        dictionary.encode(DF.literal(`${value}`)),
        graph,
      ], i * 4);
    }
    expect(index.setAll(batch, count)).toBe(count);
    const all = [ ...index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []) ];
    expect(all).toHaveLength(count);
    for (let i = 1; i < all.length; i++) {
      expect(compareQuads(all[i - 1], all[i])).toBeLessThan(0);
    }
  });

  it('starts from the beginning when the index changes before the first result is read', () => {
    for (let i = 0; i < 100; i++) {
      index.set(randomQuad(), true);
    }
    const iterator = index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []);
    const first = randomQuad();
    index.set(first, true);
    expect([ ...iterator ]).toHaveLength(index.size);
  });

  it('counts a prefix that spans many leaves', () => {
    const subject = dictionary.encode(DF.namedNode('ex:shared'));
    for (let i = 0; i < 3000; i++) {
      index.set([ subject, dictionary.encode(DF.namedNode(`ex:p${i}`)), subject, subject ], true);
    }
    expect(index.count([ DF.namedNode('ex:shared'), undefined, undefined, undefined ])).toBe(3000);
  });

  it('ends a scan for good, whether it ran out, was sought past, or was returned', () => {
    for (let i = 0; i < 100; i++) {
      index.set(randomQuad(), true);
    }
    const all: any = index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []);
    const count = [ ...all ].length;
    expect(count).toBe(index.size);
    expect(all.next().done).toBe(true);
    expect(() => all.seek(0, () => true)).not.toThrow();

    const sought: any = index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []);
    sought.seek(0, () => true);
    expect(sought.next().done).toBe(true);
    // Nothing is left to match, so a further seek has nothing to skip within.
    expect(() => sought.seek(0, () => true)).not.toThrow();

    const drained: any = index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []);
    for (let i = 0; i < count; i++) {
      drained.next();
    }
    // The last result was read, but the end not yet noticed: a seek finds nothing left to skip within.
    expect(() => drained.seek(0, () => true)).not.toThrow();
    expect(drained.next().done).toBe(true);

    const returned: any = index.findEncoded([ undefined, undefined, undefined, undefined ], <any> []);
    expect(returned.next().done).toBe(false);
    expect(returned.return().done).toBe(true);
    expect(returned.next().done).toBe(true);
  });

  it('only finds nothing for unknown terms', () => {
    index.set(randomQuad(), true);
    const unknown = dictionary.encode(DF.namedNode('ex:unknown'));
    expect([ ...index.findEncoded([ unknown, undefined, undefined, undefined ], <any> []) ]).toEqual([]);
    expect(index.count([ DF.namedNode('ex:unknown'), undefined, undefined, undefined ])).toBe(0);
    expect(index.count([ DF.namedNode('ex:never'), undefined, undefined, undefined ])).toBe(0);
    expect([ ...index.findTerms([ true ], [ unknown ]) ]).toEqual([]);
    expect(index.countTerms([ true ], [ unknown ])).toBe(0);
    expect(index.remove([ unknown, unknown, unknown, unknown ])).toBe(false);
    expect(index.getEncoded([ unknown, unknown, unknown, unknown ])).toBeUndefined();
    const never = DF.namedNode('ex:never');
    expect(index.get([ never, never, never, never ])).toBeUndefined();
  });
});

describe('RdfStoreIndexBTree with quoted triples', () => {
  let dictionary: ITermDictionary<number>;
  let index: RdfStoreIndexBTree;
  let reference: RdfStoreIndexNestedMapQuoted<number, boolean>;
  let next: () => number;
  let plain: RDF.NamedNode[];
  let quoted: RDF.Quad[];

  function options(): any {
    return { indexCombinations: [], indexConstructor: undefined, dictionary, dataFactory: DF };
  }

  function pick<T>(terms: T[]): T {
    return terms[Math.floor(next() * terms.length)];
  }

  function compareQuads(left: number[], right: number[]): number {
    for (let i = 0; i < left.length; i++) {
      if (left[i] !== right[i]) {
        return defaultTermComparator(dictionary.decode(left[i]), dictionary.decode(right[i])) || left[i] - right[i];
      }
    }
    return 0;
  }

  /**
   * A quoted triple pattern that keeps some components of a stored quoted triple, and turns the others
   * into variables, possibly nesting one level deeper.
   */
  function quotedPattern(): RDF.Quad {
    const base = pick(quoted);
    const object = base.object.termType === 'Quad' && next() < 0.5 ?
      DF.quad(base.object.subject, DF.variable('inner'), base.object.object) :
        (next() < 0.5 ? DF.variable('o') : base.object);
    return DF.quad(
      next() < 0.5 ? DF.variable('s') : base.subject,
      next() < 0.3 ? DF.variable('p') : base.predicate,
      object,
    );
  }

  beforeEach(() => {
    dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
    index = new RdfStoreIndexBTree(options());
    reference = new RdfStoreIndexNestedMapQuoted(options());
    next = random(3);
    plain = Array.from({ length: 30 }, (_, i) => DF.namedNode(`ex:t${(i * 37) % 30}`));
    quoted = [];
    for (let i = 0; i < 40; i++) {
      const object = i % 4 === 0 && quoted.length > 0 ? pick(quoted) : pick(plain);
      quoted.push(DF.quad(pick(plain), pick(plain.slice(0, 4)), object));
    }
    for (let i = 0; i < 3000; i++) {
      const quad: EncodedQuadTerms<number> = [
        dictionary.encode(next() < 0.4 ? pick(quoted) : pick(plain)),
        dictionary.encode(pick(plain.slice(0, 5))),
        dictionary.encode(next() < 0.4 ? pick(quoted) : pick(plain)),
        dictionary.encode(pick(plain.slice(0, 2))),
      ];
      index.set(quad, true);
      reference.set(quad, true);
    }
  });

  it('supports quoted triple filtering with a quoted dictionary', () => {
    expect(index.features.quotedTripleFiltering).toBe(true);
    expect(new RdfStoreIndexBTree(<any> {
      dictionary: new TermDictionaryNumberRecordFullTerms(),
    }).features.quotedTripleFiltering).toBe(false);
  });

  it('matches a nested-map index on quoted triple patterns', () => {
    let withResults = 0;
    for (let i = 0; i < 300; i++) {
      const terms = <QuadPatternTerms> [
        next() < 0.5 ? quotedPattern() : (next() < 0.5 ? pick(plain) : undefined),
        next() < 0.5 ? pick(plain.slice(0, 5)) : undefined,
        next() < 0.6 ? quotedPattern() : (next() < 0.3 ? pick(quoted) : undefined),
        next() < 0.5 ? pick(plain.slice(0, 2)) : undefined,
      ];
      const ids = <EncodedQuadTerms<number | undefined>> terms
        .map(term => term === undefined || (term.termType === 'Quad' && isQuotedPattern(term)) ?
          undefined :
          dictionary.encodeOptional(term));
      if (terms.some((term, level) => term !== undefined && !isQuotedPattern(term) && ids[level] === undefined)) {
        continue;
      }
      const actual = [ ...index.findEncoded(ids, terms) ];
      const expected = [ ...reference.findEncoded(ids, terms) ];
      withResults += expected.length > 0 ? 1 : 0;
      expect(actual).toEqual([ ...expected ].sort(compareQuads));
      expect(index.count(terms)).toBe(expected.length);
      expect(index.count(terms)).toBe(reference.count(terms));
      expect([ ...index.find(terms) ].map(quad => quad.map(term => dictionary.encode(term)))).toEqual(actual);
    }
    // Enough patterns match something for this to say anything.
    expect(withResults).toBeGreaterThan(50);
  });

  it('skips ahead in a scan with a quoted triple pattern', () => {
    let skipped = 0;
    for (let i = 0; i < 100; i++) {
      const terms = <QuadPatternTerms> [ undefined, pick(plain.slice(0, 5)), quotedPattern(), undefined ];
      const ids = <EncodedQuadTerms<number | undefined>>
        [ undefined, dictionary.encode(terms[1]!), undefined, undefined ];
      const expected = [ ...index.findEncoded(ids, terms) ];
      const iterator = <any> index.findEncoded(ids, terms);
      const target = pick(plain);
      const targetLabel = index.termOrder.lowerBound(target);
      iterator.seek(0, (key: number) => index.termOrder.label(key) < targetLabel);
      const remaining = expected.filter(quad => defaultTermComparator(dictionary.decode(quad[0]), target) >= 0);
      skipped += expected.length - remaining.length;
      expect([ ...iterator ]).toEqual(remaining);
    }
    expect(skipped).toBeGreaterThan(0);
  });

  it('finds nothing for a quoted triple pattern without matches', () => {
    const none = DF.quad(DF.variable('s'), DF.namedNode('ex:none'), DF.variable('o'));
    const terms = <QuadPatternTerms> [ none, undefined, undefined, undefined ];
    expect([ ...index.findEncoded([ undefined, undefined, undefined, undefined ], terms) ]).toEqual([]);
    expect(index.count(terms)).toBe(0);
  });
});

function isQuotedPattern(term: RDF.Term): boolean {
  return term.termType === 'Quad' && [ term.subject, term.predicate, term.object, term.graph ]
    .some(component => component.termType === 'Variable' || isQuotedPattern(component));
}

describe('TermOrder', () => {
  let dictionary: ITermDictionary<number>;
  let order: TermOrder;

  beforeEach(() => {
    dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
    order = new TermOrder(dictionary);
  });

  function checkOrder(): void {
    const encodings = [ ...dictionary.encodings() ].filter(encoding => order.label(encoding) !== 0);
    const byLabel = [ ...encodings ].sort((left, right) => order.label(left) - order.label(right));
    const byTerm = [ ...encodings ].sort((left, right) => order.compareEncodings(left, right));
    expect(byLabel).toEqual(byTerm);
  }

  it('keeps labels ordered under inserts at the same spot', () => {
    order.add(dictionary.encode(DF.namedNode('ex:a')));
    order.add(dictionary.encode(DF.namedNode('ex:z')));
    // Each insert lands just before the previous one, halving the same gap until it runs out.
    for (let i = 0; i < 200; i++) {
      order.add(dictionary.encode(DF.namedNode(`ex:b${String(1000 - i).padStart(4, '0')}`)));
    }
    // And at the very start.
    for (let i = 0; i < 100; i++) {
      order.add(dictionary.encode(DF.blankNode(`b${String(1000 - i).padStart(4, '0')}`)));
    }
    checkOrder();
    order.makeUniform();
    const encodings = [ ...dictionary.encodings() ].sort((left, right) => order.label(left) - order.label(right));
    expect(encodings.map(encoding => order.rank(encoding))).toEqual(encodings.map((_, rank) => rank));
  });

  it('orders terms that the comparator considers equal on their encoding', () => {
    order = new TermOrder(dictionary, () => 0);
    const encodings = [ 'c', 'a', 'b' ].map(value => dictionary.encode(DF.namedNode(value)));
    for (const encoding of [ ...encodings ].reverse()) {
      order.add(encoding);
    }
    expect([ ...encodings ].sort((left, right) => order.label(left) - order.label(right)))
      .toEqual([ ...encodings ].sort((left, right) => left - right));
  });

  it('grows its labels to encodings far beyond the current capacity', () => {
    let last = 0;
    for (let i = 0; i < 5000; i++) {
      last = dictionary.encode(DF.namedNode(`ex:${i}`));
    }
    order.add(last);
    expect(order.label(last)).toBeGreaterThan(0);
    expect(order.label(last + 100000)).toBe(0);
  });

  it('keeps labels ordered over many chunks', () => {
    const next = random(7);
    for (let i = 0; i < 5000; i++) {
      order.add(dictionary.encode(DF.literal(`${Math.floor(next() * 100000)}`)));
    }
    checkOrder();
    const batch = Array.from({ length: 3000 }, () => dictionary.encode(DF.literal(`${Math.floor(next() * 100000)}`)));
    order.addAll(batch, batch.length);
    checkOrder();
    expect(order.lowerBound(DF.literal('50000'))).toBe(order.label([ ...dictionary.encodings() ]
      .filter(encoding => (<RDF.Literal> dictionary.decode(encoding)).value >= '50000')
      .sort((left, right) => order.label(left) - order.label(right))[0]));
    expect(order.lowerBound(DF.literal('~'))).toBe(Number.POSITIVE_INFINITY);
  });

  it('orders terms of different types and quoted triples', () => {
    const all = [
      DF.defaultGraph(),
      DF.blankNode('a'),
      DF.namedNode('ex:a'),
      DF.namedNode('ex:b'),
      DF.literal('a'),
      DF.literal('a', 'en'),
      DF.literal('a', 'nl'),
      DF.literal('a', DF.namedNode('ex:dt')),
      DF.quad(DF.namedNode('ex:a'), DF.namedNode('ex:p'), DF.literal('a')),
      DF.quad(DF.namedNode('ex:a'), DF.namedNode('ex:p'), DF.literal('b')),
      DF.variable('a'),
    ];
    for (const term of [ ...all ].reverse()) {
      order.add(dictionary.encode(term));
    }
    const encodings = all.map(term => dictionary.encode(term));
    expect([ ...encodings ].sort((left, right) => order.label(left) - order.label(right))).toEqual([
      encodings[0],
      encodings[1],
      encodings[2],
      encodings[3],
      // Literals with equal values are ordered on their datatype IRI.
      encodings[7],
      encodings[5],
      encodings[6],
      encodings[4],
      encodings[8],
      encodings[9],
      encodings[10],
    ]);
    expect(defaultTermComparator(DF.literal('a'), DF.literal('a'))).toBe(0);
  });

  it('compares quoted triples component by component, and literals on datatype and language', () => {
    const [ a, b ] = [ DF.namedNode('ex:a'), DF.namedNode('ex:b') ];
    const cases: [ RDF.Term, RDF.Term ][] = [
      [ DF.quad(a, a, a, a), DF.quad(b, a, a, a) ],
      [ DF.quad(a, a, a, a), DF.quad(a, b, a, a) ],
      [ DF.quad(a, a, a, a), DF.quad(a, a, b, a) ],
      [ DF.quad(a, a, a, a), DF.quad(a, a, a, b) ],
      [ DF.literal('x', a), DF.literal('x', b) ],
      [ DF.literal('x', 'en'), DF.literal('x', 'nl') ],
      [ DF.literal('x', { language: 'en', direction: 'ltr' }), DF.literal('x', { language: 'en', direction: 'rtl' }) ],
      // A directional literal has rdf:dirLangString as datatype, which comes before rdf:langString.
      [ DF.literal('x', { language: 'en', direction: 'ltr' }), DF.literal('x', 'en') ],
    ];
    for (const [ smaller, larger ] of cases) {
      expect(defaultTermComparator(smaller, larger)).toBeLessThan(0);
      expect(defaultTermComparator(larger, smaller)).toBeGreaterThan(0);
    }
    expect(defaultTermComparator(DF.quad(a, a, a, a), DF.quad(a, a, a, a))).toBe(0);
    // Literals from factories that predate base directions have none at all.
    const withoutDirection = <RDF.Literal> <unknown> { ...DF.literal('x', 'en'), direction: undefined };
    expect(defaultTermComparator(withoutDirection, DF.literal('x', 'en'))).toBe(0);
    expect(defaultTermComparator(DF.literal('x', 'en'), withoutDirection)).toBe(0);
  });
});

describe('order-preserving encodings', () => {
  function sortedByTerm(dictionary: ITermDictionary<number>): number[] {
    return [ ...dictionary.encodings() ]
      .sort((left, right) => defaultTermComparator(dictionary.decode(left), dictionary.decode(right)));
  }

  describe('dictionary reordering', () => {
    it('renumbers a full-terms dictionary in the given order', () => {
      const dictionary = new TermDictionaryNumberRecordFullTerms();
      const [ c, a, b ] = [ 'c', 'a', 'b' ].map(value => dictionary.encode(DF.namedNode(value)));
      const mapping = dictionary.reorder([ a, b, c ])!;
      expect([ mapping(a), mapping(b), mapping(c) ]).toEqual([ 0, 1, 2 ]);
      expect(dictionary.decode(0)).toEqualRdfTerm(DF.namedNode('a'));
      expect(dictionary.decode(2)).toEqualRdfTerm(DF.namedNode('c'));
      expect(dictionary.encode(DF.namedNode('b'))).toBe(1);
      expect(dictionary.encode(DF.namedNode('d'))).toBe(3);
    });

    it('refuses to renumber with an incomplete list of encodings', () => {
      const dictionary = new TermDictionaryNumberRecordFullTerms();
      dictionary.encode(DF.namedNode('a'));
      dictionary.encode(DF.namedNode('b'));
      expect(dictionary.reorder([ 0 ])).toBeUndefined();
    });

    it('lets a quoted dictionary renumber until it holds a quoted triple', () => {
      const dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
      const [ b, a ] = [ 'b', 'a' ].map(value => dictionary.encode(DF.namedNode(value)));
      expect(dictionary.reorder([ a, b ])!(a)).toBe(0);
      dictionary.encode(DF.quad(DF.namedNode('a'), DF.namedNode('b'), DF.namedNode('a')));
      expect(dictionary.reorder([ ...dictionary.encodings() ])).toBeUndefined();
    });

    it('does not let a quoted dictionary renumber if its plain dictionary can not', () => {
      const dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberMap());
      dictionary.encode(DF.namedNode('a'));
      expect(dictionary.reorder([ 0 ])).toBeUndefined();
    });
  });

  describe('a term order', () => {
    it('stays aligned while terms are added in the order of their encodings', () => {
      const dictionary = new TermDictionaryNumberRecordFullTerms();
      const order = new TermOrder(dictionary);
      for (const value of [ 'a', 'b', 'c' ]) {
        order.add(dictionary.encode(DF.namedNode(value)));
      }
      expect(order.aligned).toBe(true);
      expect(order.alignDictionary()).toBeUndefined();
      order.add(dictionary.encode(DF.namedNode('0')));
      expect(order.aligned).toBe(false);
    });

    it('is no longer aligned when a batch goes against the encodings', () => {
      const dictionary = new TermDictionaryNumberRecordFullTerms();
      const order = new TermOrder(dictionary);
      const encodings = [ 'c', 'b', 'a' ].map(value => dictionary.encode(DF.namedNode(value)));
      order.addAll(encodings, encodings.length);
      expect(order.aligned).toBe(false);
    });

    it('renumbers its dictionary to follow the order, putting unknown terms last', () => {
      const dictionary = new TermDictionaryNumberRecordFullTerms();
      const order = new TermOrder(dictionary);
      const encodings = [ 'c', 'a', 'b' ].map(value => dictionary.encode(DF.namedNode(value)));
      dictionary.encode(DF.namedNode('0'));
      order.addAll(encodings, encodings.length);
      const mapping = order.alignDictionary()!;
      expect(encodings.map(mapping)).toEqual([ 2, 0, 1 ]);
      expect(order.aligned).toBe(true);
      expect(dictionary.decode(3)).toEqualRdfTerm(DF.namedNode('0'));
      expect([ 0, 1, 2 ].map(encoding => order.label(encoding)))
        .toEqual([ 0, 1, 2 ].map(encoding => order.label(encoding)).sort((left, right) => left - right));
      expect(order.before(0, 1)).toBe(true);
      expect(order.before(2, 1)).toBe(false);
    });

    it('does not renumber a dictionary that can not be renumbered', () => {
      const dictionary = new TermDictionaryNumberMap();
      const order = new TermOrder(dictionary);
      const encodings = [ 'c', 'a' ].map(value => dictionary.encode(DF.namedNode(value)));
      order.addAll(encodings, encodings.length);
      expect(order.alignDictionary()).toBeUndefined();
      const quoted = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
      const quotedOrder = new TermOrder(quoted);
      const quotedEncodings = [
        quoted.encode(DF.namedNode('c')),
        quoted.encode(DF.quad(DF.namedNode('a'), DF.namedNode('b'), DF.namedNode('c'))),
        quoted.encode(DF.namedNode('a')),
      ];
      quotedOrder.addAll(quotedEncodings, quotedEncodings.length);
      expect(quotedOrder.alignDictionary()).toBeUndefined();
    });

    it('finds the label of a known term without searching', () => {
      const dictionary = new TermDictionaryNumberRecordFullTerms();
      const order = new TermOrder(dictionary);
      const encodings = [ 'a', 'c' ].map(value => dictionary.encode(DF.namedNode(value)));
      order.addAll(encodings, encodings.length);
      dictionary.encode(DF.namedNode('b'));
      expect(order.lowerBound(DF.namedNode('c'))).toBe(order.label(encodings[1]));
      // Known to the dictionary, but not to the order.
      expect(order.lowerBound(DF.namedNode('b'))).toBe(order.label(encodings[1]));
    });
  });

  describe('an ordered store', () => {
    function randomQuads(seed: number, count: number, quoted = false): RDF.Quad[] {
      const next = random(seed);
      const term = (range: number): RDF.NamedNode | RDF.Literal => next() < 0.3 ?
        DF.literal(`${Math.floor(next() * range)}`) :
        DF.namedNode(`ex:${Math.floor(next() * range)}`);
      return Array.from({ length: count }, (_, i) => DF.quad(
        <RDF.NamedNode> DF.namedNode(`ex:s${Math.floor(next() * 50)}`),
        DF.namedNode(`ex:p${Math.floor(next() * 6)}`),
        quoted && i % 10 === 0 ? DF.quad(DF.namedNode('ex:a'), DF.namedNode('ex:b'), term(20)) : term(300),
      ));
    }

    function expectSameAnswers(store: RdfStore<number>, reference: RdfStore<number>): void {
      const toStrings = (quads: RDF.Quad[]): string[] => quads.map(quad => termToString(quad)).sort();
      expect(store.size).toBe(reference.size);
      const next = random(9);
      for (let i = 0; i < 50; i++) {
        const pick = reference.getQuads()[Math.floor(next() * reference.size)];
        const pattern = [ pick.subject, pick.predicate, pick.object ].map(term => next() < 0.5 ? term : undefined);
        const [ subject, predicate, object ] = pattern;
        expect(toStrings(store.getQuads(subject, predicate, object)))
          .toEqual(toStrings(reference.getQuads(subject, predicate, object)));
        expect(store.countQuads(subject, predicate, object)).toBe(reference.countQuads(subject, predicate, object));
      }
      // A scan comes back in the order it reports, whichever encodings its terms have.
      const iterator = <any> store.matchBindings(BF, V('s'), DF.namedNode('ex:p1'), V('o'), DF.defaultGraph());
      const variables = (<string[]> iterator.resultOrder).map(component => component === 'subject' ? 's' : 'o');
      const rows: RDF.Term[][] = [];
      let bindings = iterator.read();
      while (bindings !== null) {
        rows.push(variables.map(variable => bindings.get(variable)));
        bindings = iterator.read();
      }
      const compareRows = (left: RDF.Term[], right: RDF.Term[]): number =>
        defaultTermComparator(left[0], right[0]) || defaultTermComparator(left[1], right[1]);
      expect(rows).toEqual([ ...rows ].sort(compareRows));
    }

    it('renumbers its dictionary to follow the term order on its first batch', () => {
      const store = RdfStore.createOrdered();
      const reference = RdfStore.createDefault();
      const quads = randomQuads(1, 2000);
      store.addQuads(quads);
      reference.addQuads(quads);
      const encodings = sortedByTerm(store.dictionary);
      expect(encodings).toEqual([ ...encodings ].sort((left, right) => left - right));
      expectSameAnswers(store, reference);

      // A later term in the middle of the order no longer follows the encodings, which must still work.
      const more = [ DF.quad(DF.namedNode('ex:s0'), DF.namedNode('ex:p1'), DF.namedNode('ex:0-middle')) ];
      store.addQuads(more);
      reference.addQuads(more);
      store.addQuad(DF.quad(DF.namedNode('ex:0-other'), DF.namedNode('ex:p1'), DF.namedNode('ex:1')));
      reference.addQuad(DF.quad(DF.namedNode('ex:0-other'), DF.namedNode('ex:p1'), DF.namedNode('ex:1')));
      expectSameAnswers(store, reference);
    });

    it('renumbers its dictionary when importing a stream', async() => {
      const store = RdfStore.createOrdered();
      const reference = RdfStore.createDefault();
      const quads = randomQuads(2, 1000);
      await new Promise(resolve => store.import(Readable.from(quads)).on('end', resolve));
      reference.addQuads(quads);
      const encodings = sortedByTerm(store.dictionary);
      expect(encodings).toEqual([ ...encodings ].sort((left, right) => left - right));
      expectSameAnswers(store, reference);
    });

    it('keeps its encodings when its first batch holds quoted triples', () => {
      const store = RdfStore.createOrdered();
      const reference = RdfStore.createDefault();
      const quads = randomQuads(3, 1000, true);
      store.addQuads(quads);
      reference.addQuads(quads);
      expectSameAnswers(store, reference);
    });

    it('keeps its encodings unless it may renumber its dictionary', () => {
      const dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
      const store = new RdfStore<number>({
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexBTree(subOptions),
        dictionary,
        dataFactory: DF,
      });
      store.addQuads([ DF.quad(DF.namedNode('ex:b'), DF.namedNode('ex:p'), DF.namedNode('ex:a')) ]);
      expect(dictionary.encodeOptional(DF.namedNode('ex:b'))).toBe(0);
    });
  });
});

describe('RdfStore with ordered indexes', () => {
  it('imports a stream as one batch per index', async() => {
    const store = RdfStore.createOrdered({ nodes: true });
    const quads = Array.from({ length: 3000 }, (_, i) => DF.quad(
      DF.namedNode(`ex:s${i % 97}`),
      DF.namedNode(`ex:p${i % 5}`),
      DF.literal(`${i % 211}`),
    ));
    await new Promise(resolve => store.import(Readable.from(quads)).on('end', resolve));
    const reference = RdfStore.createDefault();
    for (const quad of quads) {
      reference.addQuad(quad);
    }
    expect(store.size).toBe(reference.size);
    const p1 = DF.namedNode('ex:p1');
    expect(store.countQuads(undefined, p1)).toBe(reference.countQuads(undefined, p1));
    expect(store.getQuads()).toHaveLength(reference.size);
    expect(store.countNodes(DF.defaultGraph())).toBe(97 + 211);
    expect(store.addQuads(quads.slice(0, 10))).toBe(0);
    expect(store.addQuads(new Set(quads.slice(0, 10)))).toBe(0);
    expect(store.addQuads([ DF.quad(DF.namedNode('ex:new'), DF.namedNode('ex:p'), DF.namedNode('ex:o')) ])).toBe(1);
    expect(store.size).toBe(reference.size + 1);
    expect(store.indexOrders).toEqual(RdfStore.DEFAULT_INDEX_COMBINATIONS);
  });

  it('adds quads one by one when an index can not take batches', async() => {
    const store = RdfStore.createDefault();
    const quads = [ DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p'), DF.namedNode('ex:o')) ];
    expect(store.addQuads(quads)).toBe(1);
    expect(store.addQuads(new Set(quads))).toBe(0);
    const other = RdfStore.createDefault();
    await new Promise(resolve => other.import(Readable.from(quads)).on('end', resolve));
    expect(other.size).toBe(1);
  });

  it('matches and counts quoted triple patterns like a nested-map store', async() => {
    const q = (subject: string, predicate: string, object: string): RDF.Quad =>
      DF.quad(DF.namedNode(subject), DF.namedNode(predicate), DF.namedNode(object));
    const quads = [
      DF.quad(DF.namedNode('Alice'), DF.namedNode('says'), q('Violets', 'haveColor', 'Blue')),
      DF.quad(DF.namedNode('Bob'), DF.namedNode('says'), q('Violets', 'haveColor', 'Red')),
      DF.quad(DF.namedNode('Bob'), DF.namedNode('says'), q('Roses', 'haveColor', 'Red')),
      DF.quad(
        DF.namedNode('Bob'),
        DF.namedNode('says'),
        DF.quad(DF.namedNode('Carol'), DF.namedNode('says'), q('Roses', 'haveColor', 'Red')),
      ),
      DF.quad(DF.namedNode('Bob'), DF.namedNode('says'), DF.namedNode('Hi')),
    ];
    const ordered = RdfStore.createOrdered();
    const reference = RdfStore.createDefault();
    ordered.addQuads(quads);
    reference.addQuads(quads);
    const patterns: RDF.Term[][] = [
      [ DF.variable('s'), DF.namedNode('says'), DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), V('c')) ],
      [ DF.namedNode('Bob'), DF.variable('p'), DF.quad(V('x'), DF.namedNode('haveColor'), DF.namedNode('Red')) ],
      [ V('s'), V('p'), DF.quad(V('x'), DF.namedNode('says'), DF.quad(V('y'), V('z'), DF.namedNode('Red'))) ],
      [ DF.variable('s'), DF.variable('p'), DF.quad(DF.variable('x'), DF.namedNode('none'), DF.variable('y')) ],
    ];
    for (const [ subject, predicate, object ] of patterns) {
      expect(ordered.countQuads(subject, predicate, object)).toBe(reference.countQuads(subject, predicate, object));
      expect(ordered.getQuads(subject, predicate, object))
        .toBeRdfIsomorphic(reference.getQuads(subject, predicate, object));
      const toStrings = (bindings: RDF.Bindings[]): string[] => bindings
        .map(binding => [ ...binding ].map(([ key, value ]) => `${key.value}=${termToString(value)}`).sort().join(' '))
        .sort();
      expect(toStrings(ordered.getBindings(BF, subject, predicate, object, DF.defaultGraph())))
        .toEqual(toStrings(reference.getBindings(BF, subject, predicate, object, DF.defaultGraph())));
    }
    expect(ordered.countQuads(DF.variable('s'), DF.namedNode('says'), patterns[0][2])).toBe(2);
  });

  it('reports order and seeks within a scan', async() => {
    const store = RdfStore.createOrdered();
    for (let i = 0; i < 1000; i++) {
      store.addQuad(DF.quad(DF.namedNode(`ex:s${String(i).padStart(4, '0')}`), DF.namedNode('ex:p'), DF.literal(`${i}`)));
    }
    const iterator = <any> store
      .matchBindings(BF, DF.variable('s'), DF.namedNode('ex:p'), DF.variable('o'), DF.defaultGraph());
    expect(iterator.resultOrder).toEqual([ 'object', 'subject' ]);
    expect(iterator.read().get('o').value).toBe('0');
    iterator.seekTo('object', DF.literal('500'));
    expect(iterator.read().get('o').value).toBe('500');
    iterator.seekTo('object', DF.literal('9999'));
    expect(iterator.read()).toBeNull();
  });
});
