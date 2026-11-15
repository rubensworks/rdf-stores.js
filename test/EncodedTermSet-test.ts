import { EncodedTermSet } from '../lib/EncodedTermSet';

function range(start: number, end: number, step = 1): number[] {
  const values: number[] = [];
  for (let i = start; i < end; i += step) {
    values.push(i);
  }
  return values;
}

describe('EncodedTermSet', () => {
  let set: EncodedTermSet<any>;

  beforeEach(() => {
    set = new EncodedTermSet();
  });

  describe('without a bitset', () => {
    it('is empty', () => {
      expect(set.size).toBe(0);
      expect([ ...set ]).toEqual([]);
    });

    it('produces terms in insertion order', () => {
      set.add(5);
      set.add(1);
      set.add(3);
      expect(set.size).toBe(3);
      expect([ ...set ]).toEqual([ 5, 1, 3 ]);
    });

    it('ignores terms that are already present', () => {
      set.add(1);
      set.add(1);
      expect(set.size).toBe(1);
    });

    it('holds terms that are not indexes', () => {
      for (const term of [ -1, 1.5, 2 ** 31, 'a', Symbol.for('b') ]) {
        set.add(term);
      }
      expect([ ...set ]).toEqual([ -1, 1.5, 2 ** 31, 'a', Symbol.for('b') ]);
    });

    it('deletes terms', () => {
      set.add(1);
      set.add('a');
      expect(set.delete(1)).toBe(true);
      expect(set.delete(1)).toBe(false);
      expect(set.delete('a')).toBe(true);
      expect(set.size).toBe(0);
    });

    it('does not use a bitset for few indexes', () => {
      for (const term of range(0, 4095)) {
        set.add(term);
      }
      expect((<any> set).bits).toBeUndefined();
      expect(set.size).toBe(4095);
    });

    it('does not use a bitset for sparse indexes', () => {
      for (const term of range(0, 4096 * 100, 100)) {
        set.add(term);
      }
      expect((<any> set).bits).toBeUndefined();
      expect(set.size).toBe(4096);
    });

    it('does not count deleted indexes towards a bitset', () => {
      for (const term of range(0, 4095)) {
        set.add(term);
      }
      set.delete(0);
      set.add(5000);
      expect((<any> set).bits).toBeUndefined();
      set.add(5001);
      expect((<any> set).bits).toBeDefined();
    });
  });

  describe('with a bitset', () => {
    beforeEach(() => {
      set.add('a');
      set.add(-1);
      for (const term of range(0, 4096).reverse()) {
        set.add(term);
      }
    });

    it('moves dense indexes to a bitset', () => {
      expect((<any> set).bits).toHaveLength(128);
      expect(set.size).toBe(4098);
      expect([ ...set ]).toEqual([ ...range(0, 4096), 'a', -1 ]);
    });

    it('ignores indexes that are already present', () => {
      set.add(10);
      expect(set.size).toBe(4098);
    });

    it('deletes indexes', () => {
      expect(set.delete(10)).toBe(true);
      expect(set.delete(10)).toBe(false);
      expect(set.size).toBe(4097);
      expect([ ...set ]).not.toContain(10);
    });

    it('deletes terms that are not indexes', () => {
      expect(set.delete('a')).toBe(true);
      expect(set.delete(-1)).toBe(true);
      expect(set.delete('a')).toBe(false);
      expect(set.size).toBe(4096);
    });

    it('produces indexes with the highest bit of a word', () => {
      set.add(4127);
      expect([ ...set ].slice(4095, 4097)).toEqual([ 4095, 4127 ]);
    });

    it('grows the bitset for nearby indexes', () => {
      set.add(5000);
      expect((<any> set).bits).toHaveLength(192);
      set.add(10_000);
      expect((<any> set).bits).toHaveLength(313);
      expect(set.size).toBe(4100);
      expect([ ...set ].slice(4095, 4099)).toEqual([ 4095, 5000, 10_000, 'a' ]);
    });

    it('keeps far indexes in a set', () => {
      set.add(10_000_000);
      expect((<any> set).bits).toHaveLength(128);
      expect(set.size).toBe(4099);
      expect([ ...set ].slice(-3)).toEqual([ 'a', -1, 10_000_000 ]);
      expect(set.delete(10_000_000)).toBe(true);
      expect(set.size).toBe(4098);
    });

    it('moves indexes from the sets to a grown bitset', () => {
      set.add(300_000);
      expect([ ...set ].slice(-1)).toEqual([ 300_000 ]);
      for (const term of range(4096, 8192)) {
        set.add(term);
      }
      set.add(300_000);
      set.add(400_000);
      expect((<any> set).bits.length).toBeGreaterThan(400_000 / 32);
      expect(set.size).toBe(8196);
      expect([ ...set ].slice(-4)).toEqual([ 300_000, 400_000, 'a', -1 ]);
    });

    it('produces indexes added while iterating', () => {
      const terms: any[] = [];
      for (const term of set) {
        terms.push(term);
        if (term === 0) {
          set.add(4097);
        }
      }
      expect(terms).toHaveLength(4099);
      expect(terms[4096]).toBe(4097);
    });
  });

  describe('with a small maximum set size', () => {
    beforeEach(() => {
      set = new EncodedTermSet(2);
    });

    it('starts a next set when a set is full', () => {
      for (const term of [ 'a', 'b', 'c', 'd', 'e' ]) {
        set.add(term);
      }
      expect((<any> set).sets).toHaveLength(3);
      expect(set.size).toBe(5);
      expect([ ...set ]).toEqual([ 'a', 'b', 'c', 'd', 'e' ]);
    });

    it('ignores terms that are present in an earlier set', () => {
      for (const term of [ 'a', 'b', 'c', 'a', 'b' ]) {
        set.add(term);
      }
      expect(set.size).toBe(3);
    });

    it('deletes terms from any set', () => {
      for (const term of [ 'a', 'b', 'c' ]) {
        set.add(term);
      }
      expect(set.delete('c')).toBe(true);
      expect(set.delete('a')).toBe(true);
      expect([ ...set ]).toEqual([ 'b' ]);
    });
  });
});
