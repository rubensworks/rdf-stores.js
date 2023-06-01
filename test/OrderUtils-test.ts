import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import type { ITermDictionary } from '../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import {
  encodeOptionalTerms,
  getBestIndex, getComponentOrderScore,
  orderQuadComponents, quadHasVariables, quadToPattern,
} from '../lib/OrderUtils';

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
        .toEqual(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        undefined,
      ]))
        .toEqual(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        undefined,
        DF.namedNode('g'),
      ]))
        .toEqual(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        DF.namedNode('p'),
        undefined,
        undefined,
      ]))
        .toEqual(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toEqual(2);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        DF.namedNode('o'),
        undefined,
      ]))
        .toEqual(2);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        undefined,
        DF.namedNode('g'),
      ]))
        .toEqual(0);
      expect(getBestIndex(orders, [
        DF.namedNode('s'),
        undefined,
        undefined,
        undefined,
      ]))
        .toEqual(0);

      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toEqual(1);
      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        DF.namedNode('o'),
        undefined,
      ]))
        .toEqual(1);
      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        undefined,
        DF.namedNode('g'),
      ]))
        .toEqual(1);
      expect(getBestIndex(orders, [
        undefined,
        DF.namedNode('p'),
        undefined,
        undefined,
      ]))
        .toEqual(1);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        DF.namedNode('o'),
        DF.namedNode('g'),
      ]))
        .toEqual(2);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        DF.namedNode('o'),
        undefined,
      ]))
        .toEqual(2);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        undefined,
        DF.namedNode('g'),
      ]))
        .toEqual(0);
      expect(getBestIndex(orders, [
        undefined,
        undefined,
        undefined,
        undefined,
      ]))
        .toEqual(0);
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
      ])).toEqual(10);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'object',
        'predicate',
      ])).toEqual(9);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'predicate',
      ])).toEqual(6);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'object',
      ])).toEqual(7);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
        'subject',
      ])).toEqual(5);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'graph',
      ])).toEqual(4);

      expect(getComponentOrderScore([
        'graph',
        'object',
        'predicate',
        'subject',
      ], [
        'object',
        'predicate',
        'subject',
      ])).toEqual(6);
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
        0, 1, 2, 3,
      ]);
    });

    it('should encode undefined terms', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        undefined,
        DF.namedNode('o'),
        undefined,
      ], dict)).toEqual([
        0, undefined, 2, undefined,
      ]);
    });

    it('should return undefined for non-encoded terms', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.namedNode('p-not-in-dict'),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toEqual(undefined);
    });

    it('should return for quoted patterns without variables', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.quad(DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o')),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toEqual([
        0, 4, 2, 3,
      ]);
    });

    it('should return for quoted patterns with variables', () => {
      expect(encodeOptionalTerms([
        DF.namedNode('s'),
        DF.quad(DF.namedNode('s'), DF.variable('p'), DF.namedNode('o')),
        DF.namedNode('o'),
        DF.namedNode('g'),
      ], dict)).toEqual([
        0, undefined, 2, 3,
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
});
