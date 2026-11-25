import { ChunkedRecord } from '../lib/ChunkedRecord';

describe('ChunkedRecord', () => {
  describe('within one chunk', () => {
    let record: ChunkedRecord<number>;

    beforeEach(() => {
      record = new ChunkedRecord();
    });

    it('is empty', () => {
      expect(record.get('a')).toBeUndefined();
    });

    it('adds and gets values', () => {
      record.add('a', 1);
      record.add('b', 2);
      expect(record.get('a')).toBe(1);
      expect(record.get('b')).toBe(2);
      expect(record.get('c')).toBeUndefined();
      expect((<any> record).rest).toBeUndefined();
    });
  });

  describe('over several chunks', () => {
    let record: ChunkedRecord<number>;

    beforeEach(() => {
      record = new ChunkedRecord(2);
      for (const [ i, key ] of [ 'a', 'b', 'c', 'd', 'e' ].entries()) {
        record.add(key, i);
      }
    });

    it('spreads keys over chunks', () => {
      expect((<any> record).firstSize).toBe(2);
      expect((<any> record).rest.map((chunk: { size: number }) => chunk.size)).toEqual([ 2, 1 ]);
    });

    it('gets values from every chunk', () => {
      expect([ 'a', 'b', 'c', 'd', 'e' ].map(key => record.get(key))).toEqual([ 0, 1, 2, 3, 4 ]);
      expect(record.get('f')).toBeUndefined();
    });
  });
});
