import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import {
  getBestIndex, getComponentOrderScore,
  orderQuadComponents,
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
});
