import { DataFactory } from 'rdf-data-factory';
import { TermDictionaryNumber } from '../../lib/dictionary/TermDictionaryNumber';
import { RdfStoreIndexNestedMap } from '../../lib/index/RdfStoreIndexNestedMap';

const DF = new DataFactory();

describe('RdfStoreIndexNestedMap', () => {
  let index: RdfStoreIndexNestedMap<number>;

  describe('in SPOG order', () => {
    beforeEach(() => {
      index = new RdfStoreIndexNestedMap<number>({
        indexCombinations: [],
        indexConstructor: <any> undefined,
        dictionary: new TermDictionaryNumber(),
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
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.namedNode('o'),
          DF.namedNode('g'),
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
          DF.namedNode('s1'),
          DF.namedNode('p1'),
          DF.namedNode('o1'),
          DF.namedNode('g1'),
        ]);
        index.add([
          DF.namedNode('s1'),
          DF.namedNode('p2'),
          DF.namedNode('o2'),
          DF.namedNode('g1'),
        ]);
        index.add([
          DF.namedNode('s2'),
          DF.namedNode('p1'),
          DF.namedNode('o1'),
          DF.namedNode('g1'),
        ]);
        index.add([
          DF.namedNode('s2'),
          DF.namedNode('p2'),
          DF.namedNode('o2'),
          DF.namedNode('g2'),
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
      index = new RdfStoreIndexNestedMap<number>({
        indexCombinations: [],
        indexConstructor: <any> undefined,
        dictionary: new TermDictionaryNumber(),
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
          DF.namedNode('g'),
          DF.namedNode('o'),
          DF.namedNode('p'),
          DF.namedNode('s'),
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
