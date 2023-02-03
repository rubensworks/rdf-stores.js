import { DataFactory } from 'rdf-data-factory';
import { TermDictionaryNumberMap } from '../../lib/dictionary/TermDictionaryNumberMap';
import { RdfStoreIndexNestedRecord } from '../../lib/index/RdfStoreIndexNestedRecord';

const DF = new DataFactory();

describe('RdfStoreIndexNestedRecord', () => {
  let index: RdfStoreIndexNestedRecord<number>;
  let dictionary: TermDictionaryNumberMap;

  describe('in SPOG order', () => {
    beforeEach(() => {
      dictionary = new TermDictionaryNumberMap();
      index = new RdfStoreIndexNestedRecord<number>({
        indexCombinations: [],
        indexConstructor: <any> undefined,
        dictionary,
        dataFactory: new DataFactory(),
      });
    });

    describe('that is empty', () => {
      describe('find', () => {
        it('should produce no results', () => {
          expect([ ...index.find([
            undefined,
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([]);
          expect([ ...index.find([
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ]) ]).toEqual([]);
        });
      });
    });

    describe('that has one quad', () => {
      beforeEach(() => {
        index.add([
          dictionary.encode(DF.namedNode('s')),
          dictionary.encode(DF.namedNode('p')),
          dictionary.encode(DF.namedNode('o')),
          dictionary.encode(DF.namedNode('g')),
        ]);
      });

      describe('find', () => {
        it('should produce 1 result for a variable pattern', () => {
          expect([ ...index.find([
            undefined,
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ],
          ]);
        });

        it('should produce 1 result for an exact match', () => {
          expect([ ...index.find([
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ]) ]).toEqual([
            [
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ],
          ]);
        });

        it('should produce 1 result for a partial match', () => {
          expect([ ...index.find([
            undefined,
            DF.namedNode('p'),
            undefined,
            DF.namedNode('g'),
          ]) ]).toEqual([
            [
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ],
          ]);
        });

        it('should produce 0 results for a partial non-match', () => {
          expect([ ...index.find([
            undefined,
            DF.namedNode('p1'),
            undefined,
            DF.namedNode('g'),
          ]) ]).toEqual([]);
        });
      });
    });

    describe('that has multiple quads', () => {
      beforeEach(() => {
        index.add([
          dictionary.encode(DF.namedNode('s1')),
          dictionary.encode(DF.namedNode('p1')),
          dictionary.encode(DF.namedNode('o1')),
          dictionary.encode(DF.namedNode('g1')),
        ]);
        index.add([
          dictionary.encode(DF.namedNode('s1')),
          dictionary.encode(DF.namedNode('p2')),
          dictionary.encode(DF.namedNode('o2')),
          dictionary.encode(DF.namedNode('g1')),
        ]);
        index.add([
          dictionary.encode(DF.namedNode('s2')),
          dictionary.encode(DF.namedNode('p1')),
          dictionary.encode(DF.namedNode('o1')),
          dictionary.encode(DF.namedNode('g1')),
        ]);
        index.add([
          dictionary.encode(DF.namedNode('s2')),
          dictionary.encode(DF.namedNode('p2')),
          dictionary.encode(DF.namedNode('o2')),
          dictionary.encode(DF.namedNode('g2')),
        ]);
      });

      describe('find', () => {
        it('should produce all results for a variable pattern', () => {
          expect([ ...index.find([
            undefined,
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
            [
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ],
            [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
            [
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ],
          ]);
        });

        it('should produce 1 result for exact matches', () => {
          expect([ ...index.find([
            DF.namedNode('s1'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ]) ]).toEqual([
            [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s1'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g1'),
          ]) ]).toEqual([
            [
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s2'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ]) ]).toEqual([
            [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          ]) ]).toEqual([
            [
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ],
          ]);
        });

        it('should produce results for partial matches', () => {
          expect([ ...index.find([
            DF.namedNode('s1'),
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
            [
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s2'),
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
            [
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ],
          ]);

          expect([ ...index.find([
            undefined,
            DF.namedNode('p1'),
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
            [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s2'),
            DF.namedNode('p1'),
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s2'),
            undefined,
            undefined,
            DF.namedNode('g2'),
          ]) ]).toEqual([
            [
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ],
          ]);

          expect([ ...index.find([
            DF.namedNode('s2'),
            undefined,
            undefined,
            DF.namedNode('g3'),
          ]) ]).toEqual([]);
        });
      });
    });
  });

  describe('in GOPS order', () => {
    beforeEach(() => {
      dictionary = new TermDictionaryNumberMap();
      index = new RdfStoreIndexNestedRecord<number>({
        indexCombinations: [],
        indexConstructor: <any> undefined,
        dictionary,
        dataFactory: new DataFactory(),
      });
    });

    describe('that is empty', () => {
      describe('find', () => {
        it('should produce no results', () => {
          expect([ ...index.find([
            undefined,
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([]);
          expect([ ...index.find([
            DF.namedNode('g'),
            DF.namedNode('o'),
            DF.namedNode('p'),
            DF.namedNode('s'),
          ]) ]).toEqual([]);
        });
      });
    });

    describe('that has one quad', () => {
      beforeEach(() => {
        index.add([
          dictionary.encode(DF.namedNode('g')),
          dictionary.encode(DF.namedNode('o')),
          dictionary.encode(DF.namedNode('p')),
          dictionary.encode(DF.namedNode('s')),
        ]);
      });

      describe('find', () => {
        it('should produce 1 result for a variable pattern', () => {
          expect([ ...index.find([
            undefined,
            undefined,
            undefined,
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('s'),
            ],
          ]);
        });

        it('should produce 1 result for an exact match', () => {
          expect([ ...index.find([
            DF.namedNode('g'),
            DF.namedNode('o'),
            DF.namedNode('p'),
            DF.namedNode('s'),
          ]) ]).toEqual([
            [
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('s'),
            ],
          ]);
        });

        it('should produce 1 result for a partial match', () => {
          expect([ ...index.find([
            DF.namedNode('g'),
            undefined,
            DF.namedNode('p'),
            undefined,
          ]) ]).toEqual([
            [
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('s'),
            ],
          ]);
        });

        it('should produce 0 results for a partial non-match', () => {
          expect([ ...index.find([
            DF.namedNode('g'),
            undefined,
            DF.namedNode('p1'),
            undefined,
          ]) ]).toEqual([]);
        });
      });
    });
  });
});
