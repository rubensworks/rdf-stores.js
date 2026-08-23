import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import type { ITermDictionary } from '../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import {
  computeEndDepth,
  encodeOptionalTerms,
  getBestIndex,
  getBestIndexLookupTable,
  getBestIndexTerms,
  getComponentOrderPermutation,
  getComponentOrderScore,
  getIndexMatchTermsPath,
  orderQuadComponents,
  orderQuadComponentsPermutation,
  quadHasVariables,
  quadToPattern,
} from '../lib/OrderUtils';

const QUAD_TERM_NAME_PERMUTATIONS: QuadTermName[][] = (function permute(
  remaining: QuadTermName[],
): QuadTermName[][] {
  if (remaining.length <= 1) {
    return [ remaining ];
  }
  const permutations: QuadTermName[][] = [];
  for (let i = 0; i < remaining.length; i++) {
    for (const sub of permute([ ...remaining.slice(0, i), ...remaining.slice(i + 1) ])) {
      permutations.push([ remaining[i], ...sub ]);
    }
  }
  return permutations;
})([ 'subject', 'predicate', 'object', 'graph' ]);

const DF = new DataFactory();

describe('OrderUtils', () => {
  describe('getBestIndex', () => {
    it('determines the best index for 3 different orders', () => {
      const orders: QuadTermName[][] = [
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'graph', 'predicate', 'object', 'subject' ],
        [ 'graph', 'object', 'subject', 'predicate' ],
      ];

      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toBe(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        undefined,
      ]))
        .toBe(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        undefined,
        DF.namedNode('g'),
      ]))
        .toBe(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        undefined,
        undefined,
      ]))
        .toBe(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toBe(2);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        DF.namedNode('o'),
        undefined,
      ]))
        .toBe(2);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        undefined,
        DF.namedNode('g'),
      ]))
        .toBe(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        undefined,
        undefined,
      ]))
        .toBe(0);

      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toBe(1);
      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        DF.namedNode('o'),
        undefined,
      ]))
        .toBe(1);
      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        undefined,
        DF.namedNode('g'),
      ]))
        .toBe(1);
      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        undefined,
        undefined,
      ]))
        .toBe(1);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toBe(2);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        DF.namedNode('o'),
        undefined,
      ]))
        .toBe(2);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        undefined,
        DF.namedNode('g'),
      ]))
        .toBe(0);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        undefined,
        undefined,
      ]))
        .toBe(0);
    });
  });

  describe('getBestIndexLookupTable', () => {
    it('returns all-zeroes for a single order', () => {
      const table = getBestIndexLookupTable([[ 'graph', 'subject', 'predicate', 'object' ]]);
      expect(table).toHaveLength(16);
      expect([ ...table ]).toEqual(Array.from({ length: 16 }).fill(0));
    });

    it('agrees with getBestIndex for every combination of up to 3 orders', () => {
      const orderCombinations: QuadTermName[][][] = [];
      for (let i = 0; i < QUAD_TERM_NAME_PERMUTATIONS.length; i++) {
        orderCombinations.push([ QUAD_TERM_NAME_PERMUTATIONS[i] ]);
        for (let j = i + 1; j < QUAD_TERM_NAME_PERMUTATIONS.length; j++) {
          orderCombinations.push([ QUAD_TERM_NAME_PERMUTATIONS[i], QUAD_TERM_NAME_PERMUTATIONS[j] ]);
          for (let k = j + 1; k < QUAD_TERM_NAME_PERMUTATIONS.length; k++) {
            orderCombinations.push([
              QUAD_TERM_NAME_PERMUTATIONS[i],
              QUAD_TERM_NAME_PERMUTATIONS[j],
              QUAD_TERM_NAME_PERMUTATIONS[k],
            ]);
          }
        }
      }

      for (const orders of orderCombinations) {
        const table = getBestIndexLookupTable(orders);
        for (let mask = 0; mask < 16; mask++) {
          const pattern: any = [ undefined, undefined, undefined, undefined ];
          for (let component = 0; component < 4; component++) {
            if ((mask & (1 << component)) !== 0) {
              pattern[component] = DF.namedNode(`t${component}`);
            }
          }
          expect(table[mask]).toBe(getBestIndex(orders, pattern));
        }
      }
    });
  });

  describe('getComponentOrderPermutation', () => {
    it('determines the SPOG permutation of a component order', () => {
      expect(getComponentOrderPermutation([ 'subject', 'predicate', 'object', 'graph' ]))
        .toEqual([ 0, 1, 2, 3 ]);
      expect(getComponentOrderPermutation([ 'graph', 'subject', 'predicate', 'object' ]))
        .toEqual([ 3, 0, 1, 2 ]);
      expect(getComponentOrderPermutation([ 'graph', 'object', 'subject', 'predicate' ]))
        .toEqual([ 3, 2, 0, 1 ]);
    });
  });

  describe('orderQuadComponentsPermutation', () => {
    it('orders equally to orderQuadComponents for every component order', () => {
      const quad = [ 's', 'p', 'o', 'g' ];
      for (const order of QUAD_TERM_NAME_PERMUTATIONS) {
        expect(orderQuadComponentsPermutation(getComponentOrderPermutation(order), quad))
          .toEqual(orderQuadComponents(order, quad));
      }
    });
  });

  describe('getBestIndexTerms', () => {
    it('determines the best index for 3 different orders', () => {
      const orders: QuadTermName[][] = [
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'graph', 'predicate', 'object', 'subject' ],
        [ 'graph', 'object', 'subject', 'predicate' ],
      ];

      expect(getBestIndexTerms(orders, [
        'graph',
      ])).toBe(0);
      expect(getBestIndexTerms(orders, [
        'graph',
        'subject',
      ])).toBe(0);
      expect(getBestIndexTerms(orders, [
        'graph',
        'subject',
        'predicate',
      ])).toBe(0);
      expect(getBestIndexTerms(orders, [
        'graph',
        'subject',
        'predicate',
        'object',
      ])).toBe(0);

      expect(getBestIndexTerms(orders, [
        'graph',
        'predicate',
      ])).toBe(1);
      expect(getBestIndexTerms(orders, [
        'graph',
        'predicate',
        'object',
      ])).toBe(1);
      expect(getBestIndexTerms(orders, [
        'graph',
        'predicate',
        'object',
        'subject',
      ])).toBe(0);

      expect(getBestIndexTerms(orders, [
        'graph',
        'object',
      ])).toBe(2);
      expect(getBestIndexTerms(orders, [
        'graph',
        'object',
        'subject',
      ])).toBe(2);
      expect(getBestIndexTerms(orders, [
        'graph',
        'object',
        'subject',
        'predicate',
      ])).toBe(0);

      expect(getBestIndexTerms(orders, [
        'subject',
      ])).toBe(0);
      expect(getBestIndexTerms(orders, [
        'subject',
        'predicate',
      ])).toBe(0);

      expect(getBestIndexTerms(orders, [
        'predicate',
        'object',
      ])).toBe(1);
      expect(getBestIndexTerms(orders, [
        'predicate',
      ])).toBe(1);
      expect(getBestIndexTerms(orders, [
        'predicate',
        'object',
        'subject',
      ])).toBe(0);

      expect(getBestIndexTerms(orders, [
        'object',
      ])).toBe(2);
      expect(getBestIndexTerms(orders, [
        'object',
        'subject',
      ])).toBe(2);
      expect(getBestIndexTerms(orders, [
        'object',
        'subject',
        'predicate',
      ])).toBe(0);
      expect(getBestIndexTerms(orders, [
        'object',
        'predicate',
      ])).toBe(1);
    });
  });

  describe('getIndexMatchTermsPath', () => {
    it('determines match terms for an exact match', () => {
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'graph' ],
      )).toEqual([ true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'graph', 'subject' ],
      )).toEqual([ true, true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'graph', 'subject', 'predicate' ],
      )).toEqual([ true, true, true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'graph', 'subject', 'predicate', 'object' ],
      )).toEqual([ true, true, true, true ]);
    });

    it('determines match terms for a non-exact match', () => {
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'subject' ],
      )).toEqual([ false, true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'subject', 'predicate' ],
      )).toEqual([ false, true, true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'subject', 'predicate', 'object' ],
      )).toEqual([ false, true, true, true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'object' ],
      )).toEqual([ false, false, false, true ]);
      expect(getIndexMatchTermsPath(
        [ 'graph', 'subject', 'predicate', 'object' ],
        [ 'subject', 'object' ],
      )).toEqual([ false, true, false, true ]);
    });
  });

  describe('getComponentOrderScore', () => {
    it('calculates the score of different orders', () => {
      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'object',
        'predicate',
        'subject',
      ])).toBe(10);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'object',
        'predicate',
      ])).toBe(9);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'predicate',
      ])).toBe(6);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'object',
      ])).toBe(7);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'subject',
      ])).toBe(5);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
      ])).toBe(4);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'object',
        'predicate',
        'subject',
      ])).toBe(6);
    });
  });

  describe('orderQuadComponents', () => {
    it('orders quad components in the desired order', () => {
      expect(orderQuadComponents([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ])).toEqual([
        DF.namedNode('g'),
        DF.namedNode('o'),
        DF.namedNode('p'),
        DF.namedNode('s'),
      ]);
    });
  });

  describe('encodeOptionalTerms', () => {
    let dict: ITermDictionary<number>;
    beforeEach(() => {
      dict = new TermDictionaryNumberRecordFullTerms();
      dict.encode(DF.namedNode('s'));
      dict.encode(DF.namedNode('p'));
      dict.encode(DF.namedNode('o'));
      dict.encode(DF.namedNode('g'));
      dict.encode(DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o')));
    });

    it('should encode defined terms', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toEqual([
        0,
        1,
        2,
        3,
      ]);
    });

    it('should encode undefined terms', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        undefined,
        DF.namedNode('o'),
        undefined,
      ], dict)).toEqual([
        0,
        undefined,
        2,
        undefined,
      ]);
    });

    it('should return undefined for non-encoded terms', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.namedNode('p-not-in-dict'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toBeUndefined();
    });

    it('should return for quoted patterns without variables', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o')),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toEqual([
        0,
        4,
        2,
        3,
      ]);
    });

    it('should return for quoted patterns with variables', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.quad(DF.namedNode('s'), DF.variable('p'), DF.namedNode('o')),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toEqual([
        0,
        undefined,
        2,
        3,
      ]);
    });
  });

  describe('quadToPattern', () => {
    describe('without quoted triple support', () => {
      it('handles an undefined pattern', () => {
        expect(quadToPattern(undefined, undefined, undefined, undefined, false)).toEqual([
          [ undefined, undefined, undefined, undefined ],
          false,
        ]);
      });

      it('handles a variable pattern', () => {
        expect(quadToPattern(DF.variable('v'), DF.variable('v'), DF.variable('v'), DF.variable('v'), false)).toEqual([
          [ undefined, undefined, undefined, undefined ],
          false,
        ]);
      });

      it('handles a defined pattern', () => {
        expect(quadToPattern(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.namedNode('o'),
          DF.namedNode('g'),
          false,
        )).toEqual([
          [ DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g') ],
          false,
        ]);
      });

      it('handles a mixed variable and defined pattern', () => {
        expect(quadToPattern(
          DF.namedNode('s'),
          DF.variable('p'),
          DF.namedNode('o'),
          undefined,
          false,
        )).toEqual([
          [ DF.namedNode('s'), undefined, DF.namedNode('o'), undefined ],
          false,
        ]);
      });

      it('handles a defined pattern with quoted triples', () => {
        expect(quadToPattern(
          DF.namedNode('s'),
          DF.quad(DF.namedNode('s'), DF.namedNode('s'), DF.namedNode('s')),
          DF.namedNode('o'),
          DF.namedNode('g'),
          false,
        )).toEqual([
          [ DF.namedNode('s'), undefined, DF.namedNode('o'), DF.namedNode('g') ],
          true,
        ]);
      });
    });

    describe('with quoted triple support', () => {
      it('handles an undefined pattern', () => {
        expect(quadToPattern(undefined, undefined, undefined, undefined, true)).toEqual([
          [ undefined, undefined, undefined, undefined ],
          false,
        ]);
      });

      it('handles a variable pattern', () => {
        expect(quadToPattern(DF.variable('v'), DF.variable('v'), DF.variable('v'), DF.variable('v'), true)).toEqual([
          [ undefined, undefined, undefined, undefined ],
          false,
        ]);
      });

      it('handles a defined pattern', () => {
        expect(quadToPattern(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.namedNode('o'),
          DF.namedNode('g'),
          true,
        )).toEqual([
          [ DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('g') ],
          false,
        ]);
      });

      it('handles a mixed variable and defined pattern', () => {
        expect(quadToPattern(
          DF.namedNode('s'),
          DF.variable('p'),
          DF.namedNode('o'),
          undefined,
          true,
        )).toEqual([
          [ DF.namedNode('s'), undefined, DF.namedNode('o'), undefined ],
          false,
        ]);
      });

      it('handles a defined pattern with quoted triples', () => {
        expect(quadToPattern(
          DF.namedNode('s'),
          DF.quad(DF.namedNode('s'), DF.namedNode('s'), DF.namedNode('s')),
          DF.namedNode('o'),
          DF.namedNode('g'),
          true,
        )).toEqual([
          [
            DF.namedNode('s'),
            DF.quad(DF.namedNode('s'), DF.namedNode('s'), DF.namedNode('s')),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ],
          false,
        ]);
      });
    });
  });

  describe('quadHasVariables', () => {
    it('should be false for a nested quoted quad without variables', () => {
      expect(quadHasVariables(DF.quad(
        DF.quad(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.namedNode('o'),
        ),
        DF.namedNode('p'),
        DF.quad(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.namedNode('o'),
        ),
      ))).toBe(false);
    });

    it('should be false for a nested quoted quad with variables', () => {
      expect(quadHasVariables(DF.quad(
        DF.quad(
          DF.namedNode('s'),
          DF.variable('p'),
          DF.namedNode('o'),
        ),
        DF.namedNode('p'),
        DF.quad(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.variable('o'),
        ),
      ))).toBe(true);
    });
  });

  describe('computeEndDepth', () => {
    it('returns matchTerms.length when no filterTerms are given', () => {
      expect(computeEndDepth([ true, true, true ])).toBe(3);
      expect(computeEndDepth([ true ])).toBe(1);
      expect(computeEndDepth([])).toBe(0);
    });

    it('returns matchTerms.length when filterTerms are all undefined', () => {
      expect(computeEndDepth([ true, true ], [ undefined, undefined, undefined, undefined ])).toBe(2);
    });

    it('returns matchTerms.length when last defined filter does not exceed it', () => {
      expect(computeEndDepth([ true, true, true, true ], [ 1, undefined, undefined, undefined ])).toBe(4);
      expect(computeEndDepth([ true, true, true, true ], [ undefined, undefined, undefined, 1 ])).toBe(4);
    });

    it('returns filter depth + 1 when last defined filter exceeds matchTerms.length', () => {
      // MatchTerms has length 1, but filter is defined at index 3 → endDepth should be 4
      expect(computeEndDepth([ true ], [ undefined, undefined, undefined, 1 ])).toBe(4);
      // MatchTerms has length 2, filter defined at index 2 → endDepth should be 3
      expect(computeEndDepth([ true, true ], [ undefined, undefined, 1, undefined ])).toBe(3);
    });

    it('ignores trailing undefined filterTerms when scanning for last defined', () => {
      // Last defined is at index 1, which equals matchTerms.length (2) - 1, so endDepth stays 2
      expect(computeEndDepth([ true, true ], [ undefined, 1, undefined, undefined ])).toBe(2);
      // Last defined is at index 0, endDepth stays at matchTerms.length (3)
      expect(computeEndDepth([ true, true, true ], [ 1, undefined, undefined, undefined ])).toBe(3);
    });
  });
});
