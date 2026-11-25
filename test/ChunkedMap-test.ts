import { ChunkedMap } from '../lib/ChunkedMap';

describe('ChunkedMap', () => {
  describe('within one chunk', () => {
    let map: ChunkedMap<string, number>;

    beforeEach(() => {
      map = new ChunkedMap();
    });

    it('is empty', () => {
      expect(map.size).toBe(0);
      expect(map.get('a')).toBeUndefined();
    });

    it('sets and gets values', () => {
      map.set('a', 1);
      map.set('b', 2);
      expect(map.get('a')).toBe(1);
      expect(map.get('b')).toBe(2);
      expect(map.get('c')).toBeUndefined();
      expect(map.size).toBe(2);
    });

    it('replaces values', () => {
      map.set('a', 1);
      map.set('a', 2);
      expect(map.get('a')).toBe(2);
      expect(map.size).toBe(1);
      expect((<any> map).rest).toBeUndefined();
    });
  });

  describe('over several chunks', () => {
    let map: ChunkedMap<string, number>;

    beforeEach(() => {
      map = new ChunkedMap(2);
      for (const [ i, key ] of [ 'a', 'b', 'c', 'd', 'e' ].entries()) {
        map.set(key, i);
      }
    });

    it('spreads entries over chunks', () => {
      expect((<any> map).first.size).toBe(2);
      expect((<any> map).rest.map((chunk: Map<string, number>) => chunk.size)).toEqual([ 2, 1 ]);
      expect(map.size).toBe(5);
    });

    it('gets values from every chunk', () => {
      expect([ 'a', 'b', 'c', 'd', 'e' ].map(key => map.get(key))).toEqual([ 0, 1, 2, 3, 4 ]);
      expect(map.get('f')).toBeUndefined();
    });

    it('replaces values in the chunk that holds them', () => {
      map.set('a', 10);
      map.set('c', 12);
      map.set('e', 14);
      expect([ 'a', 'b', 'c', 'd', 'e' ].map(key => map.get(key))).toEqual([ 10, 1, 12, 3, 14 ]);
      expect(map.size).toBe(5);
    });

    it('replaces values in a full last chunk', () => {
      map.set('f', 5);
      map.set('f', 15);
      expect(map.get('f')).toBe(15);
      expect((<any> map).rest.map((chunk: Map<string, number>) => chunk.size)).toEqual([ 2, 2 ]);
    });

    it('starts a next chunk when the last one is full', () => {
      map.set('f', 5);
      map.set('g', 6);
      expect((<any> map).rest.map((chunk: Map<string, number>) => chunk.size)).toEqual([ 2, 2, 1 ]);
      expect(map.get('g')).toBe(6);
    });
  });
});
