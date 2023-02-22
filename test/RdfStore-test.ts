import arrayifyStream from 'arrayify-stream';
import each from 'jest-each';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import { TermDictionaryNumberMap } from '../lib/dictionary/TermDictionaryNumberMap';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStore } from '../lib/RdfStore';
import 'jest-rdf';

const streamifyArray = require('streamify-array');

const DF = new DataFactory();
const allComponentOrders: QuadTermName[][][][] = [
  [[[ 'subject', 'predicate', 'object', 'graph' ]]],
  [[[ 'predicate', 'subject', 'object', 'graph' ]]],
  [[[ 'predicate', 'object', 'subject', 'graph' ]]],
  [[[ 'object', 'predicate', 'subject', 'graph' ]]],
  [[[ 'object', 'subject', 'predicate', 'graph' ]]],
  [[[ 'subject', 'object', 'predicate', 'graph' ]]],

  [[[ 'graph', 'subject', 'predicate', 'object' ]]],
  [[[ 'graph', 'predicate', 'subject', 'object' ]]],
  [[[ 'graph', 'predicate', 'object', 'subject' ]]],
  [[[ 'graph', 'object', 'predicate', 'subject' ]]],
  [[[ 'graph', 'object', 'subject', 'predicate' ]]],
  [[[ 'graph', 'subject', 'object', 'predicate' ]]],

  [[[ 'subject', 'graph', 'predicate', 'object' ]]],
  [[[ 'predicate', 'graph', 'subject', 'object' ]]],
  [[[ 'predicate', 'graph', 'object', 'subject' ]]],
  [[[ 'object', 'graph', 'predicate', 'subject' ]]],
  [[[ 'object', 'graph', 'subject', 'predicate' ]]],
  [[[ 'subject', 'graph', 'object', 'predicate' ]]],

  [[[ 'subject', 'predicate', 'graph', 'object' ]]],
  [[[ 'predicate', 'subject', 'graph', 'object' ]]],
  [[[ 'predicate', 'object', 'graph', 'subject' ]]],
  [[[ 'object', 'predicate', 'graph', 'subject' ]]],
  [[[ 'object', 'subject', 'graph', 'predicate' ]]],
  [[[ 'subject', 'object', 'graph', 'predicate' ]]],

  [ RdfStore.DEFAULT_INDEX_COMBINATIONS ],
];

describe('RdfStore', () => {
  let store: RdfStore<number>;

  each(allComponentOrders).describe('with one index in %o order', indexCombinations => {
    beforeEach(() => {
      store = new RdfStore<number>({
        indexCombinations,
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      });
    });

    describe('that is empty', () => {
      describe('find', () => {
        it('should produce no results', async() => {
          expect(await arrayifyStream(store.match())).toEqual([]);
        });
      });
    });

    describe('that has one quad', () => {
      beforeEach(() => {
        store.addQuad(DF.quad(
          DF.namedNode('s'),
          DF.namedNode('p'),
          DF.namedNode('o'),
          DF.namedNode('g'),
        ));
      });

      describe('addQuad', () => {
        it('should not modify the index when adding the same quad', () => {
          expect(store.addQuad(DF.quad(
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ))).toBeFalsy();
        });

        it('should modify the index when adding another quad', () => {
          expect(store.addQuad(DF.quad(
            DF.namedNode('s1'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ))).toBeTruthy();
        });
      });

      describe('size', () => {
        it('should be 1', () => {
          expect(store.size).toEqual(1);
        });
      });

      describe('getQuads', () => {
        it('should produce 1 result for a variable pattern', () => {
          expect(store.getQuads()).toEqual([
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
          ]);
        });
      });

      describe('countQuads', () => {
        it('should return 1 for a variable pattern', () => {
          expect(store.countQuads()).toEqual(1);
        });
      });

      describe('find', () => {
        it('should produce 1 result for a variable pattern', async() => {
          expect(await arrayifyStream(store.match())).toEqual([
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
          ]);
        });

        it('should produce 1 result for an exact match', async() => {
          expect(await arrayifyStream(store.match(
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
          ]);
        });

        it('should produce 1 result for a partial match', async() => {
          expect(await arrayifyStream(store.match(
            undefined,
            DF.namedNode('p'),
            undefined,
            DF.namedNode('g'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
          ]);
        });

        it('should produce 0 results for a partial non-match', async() => {
          expect(await arrayifyStream(store.match(
            undefined,
            DF.namedNode('p1'),
            undefined,
            DF.namedNode('g'),
          ))).toEqual([]);
        });
      });

      describe('removeQuad', () => {
        it('should not remove a non-existing quad', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s'),
            DF.namedNode('s'),
            DF.namedNode('s'),
            DF.namedNode('s'),
          ))).toEqual(false);

          // Store should not be changed
          expect(store.size).toEqual(1);
          expect(await arrayifyStream(store.match())).toEqual([
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
          ]);
        });

        it('should not remove a non-existing quad that is not encoded', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s-non'),
            DF.namedNode('s-non'),
            DF.namedNode('s-non'),
            DF.namedNode('s-non'),
          ))).toEqual(false);

          // Store should not be changed
          expect(store.size).toEqual(1);
          expect(await arrayifyStream(store.match())).toEqual([
            DF.quad(
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ),
          ]);
        });

        it('should remove an existing quad', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ))).toEqual(true);

          // Store should be changed
          expect(store.size).toEqual(0);
          expect(await arrayifyStream(store.match())).toEqual([]);
        });

        it('should remove an existing quad just once', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ))).toEqual(true);

          expect(store.removeQuad(DF.quad(
            DF.namedNode('s'),
            DF.namedNode('p'),
            DF.namedNode('o'),
            DF.namedNode('g'),
          ))).toEqual(false);

          // Store should be changed
          expect(store.size).toEqual(0);
          expect(await arrayifyStream(store.match())).toEqual([]);
        });
      });
    });

    describe('that has multiple quads', () => {
      beforeEach(async() => {
        const ret = store.import(streamifyArray([
          DF.quad(
            DF.namedNode('s1'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ),
          DF.quad(
            DF.namedNode('s1'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g1'),
          ),
          DF.quad(
            DF.namedNode('s2'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ),
          DF.quad(
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          ),
        ]));
        await new Promise(resolve => ret.on('end', resolve));
      });

      describe('size', () => {
        it('should be 4', () => {
          expect(store.size).toEqual(4);
        });
      });

      describe('find', () => {
        it('should produce all results for a variable pattern', async() => {
          expect(await arrayifyStream(store.match())).toBeRdfIsomorphic([
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ),
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ),
          ]);
        });

        it('should produce 1 result for exact matches', async() => {
          expect(await arrayifyStream(store.match(
            DF.namedNode('s1'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s1'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g1'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ),
          ]);
        });

        it('should produce results for partial matches', async() => {
          expect(await arrayifyStream(store.match(
            DF.namedNode('s1'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            undefined,
            DF.namedNode('p1'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
            DF.namedNode('p1'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
            undefined,
            undefined,
            DF.namedNode('g2'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
            DF.variable('v1'),
            DF.variable('v2'),
            DF.namedNode('g2'),
          ))).toEqual([
            DF.quad(
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ),
          ]);

          expect(await arrayifyStream(store.match(
            DF.namedNode('s2'),
            undefined,
            undefined,
            DF.namedNode('g3'),
          ))).toEqual([]);
        });
      });

      describe('countQuads', () => {
        it('should produce all results for a variable pattern', async() => {
          expect(store.countQuads()).toEqual(4);
        });

        it('should produce 1 result for exact matches', async() => {
          expect(store.countQuads(
            DF.namedNode('s1'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          )).toEqual(1);

          expect(store.countQuads(
            DF.namedNode('s1'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g1'),
          )).toEqual(1);

          expect(store.countQuads(
            DF.namedNode('s2'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          )).toEqual(1);

          expect(store.countQuads(
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          )).toEqual(1);
        });

        it('should produce results for partial matches', async() => {
          expect(store.countQuads(
            DF.namedNode('s1'),
          )).toEqual(2);

          expect(store.countQuads(
            DF.namedNode('s2'),
          )).toEqual(2);

          expect(store.countQuads(
            undefined,
            DF.namedNode('p1'),
          )).toEqual(2);

          expect(store.countQuads(
            DF.namedNode('s2'),
            DF.namedNode('p1'),
          )).toEqual(1);

          expect(store.countQuads(
            DF.namedNode('s2'),
            undefined,
            undefined,
            DF.namedNode('g2'),
          )).toEqual(1);

          expect(store.countQuads(
            DF.namedNode('s2'),
            DF.variable('v1'),
            DF.variable('v2'),
            DF.namedNode('g2'),
          )).toEqual(1);

          expect(store.countQuads(
            DF.namedNode('s2'),
            undefined,
            undefined,
            DF.namedNode('g3'),
          )).toEqual(0);
        });
      });

      describe('removeQuad', () => {
        it('should not remove a non-existing quad', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s1'),
            DF.namedNode('s1'),
            DF.namedNode('s1'),
            DF.namedNode('s1'),
          ))).toEqual(false);

          // Store should not be changed
          expect(store.size).toEqual(4);
          expect((await arrayifyStream(store.match())).length).toEqual(4);
        });

        it('should not remove a non-existing quad that is not encoded', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s-non'),
            DF.namedNode('s-non'),
            DF.namedNode('s-non'),
            DF.namedNode('s-non'),
          ))).toEqual(false);

          // Store should not be changed
          expect(store.size).toEqual(4);
          expect((await arrayifyStream(store.match())).length).toEqual(4);
        });

        it('should remove an existing quad', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          ))).toEqual(true);

          // Store should be changed
          expect(store.size).toEqual(3);
          expect((await arrayifyStream(store.match())).length).toEqual(3);

          expect(store.removeQuad(DF.quad(
            DF.namedNode('s2'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ))).toEqual(true);

          // Store should be changed
          expect(store.size).toEqual(2);
          expect((await arrayifyStream(store.match())).length).toEqual(2);

          expect(store.removeQuad(DF.quad(
            DF.namedNode('s1'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g1'),
          ))).toEqual(true);

          // Store should be changed
          expect(store.size).toEqual(1);
          expect((await arrayifyStream(store.match())).length).toEqual(1);

          expect(store.removeQuad(DF.quad(
            DF.namedNode('s1'),
            DF.namedNode('p1'),
            DF.namedNode('o1'),
            DF.namedNode('g1'),
          ))).toEqual(true);

          // Store should be changed
          expect(store.size).toEqual(0);
          expect((await arrayifyStream(store.match())).length).toEqual(0);
        });

        it('should remove an existing quad just once', async() => {
          expect(store.removeQuad(DF.quad(
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          ))).toEqual(true);

          expect(store.removeQuad(DF.quad(
            DF.namedNode('s2'),
            DF.namedNode('p2'),
            DF.namedNode('o2'),
            DF.namedNode('g2'),
          ))).toEqual(false);

          // Store should be changed
          expect(store.size).toEqual(3);
          expect((await arrayifyStream(store.match())).length).toEqual(3);
        });
      });
    });
  });

  describe('createDefault', () => {
    beforeEach(() => {
      store = RdfStore.createDefault();
    });

    it('contains 3 indexes', () => {
      expect((<any> store).indexesWrapped).toHaveLength(3);
    });
  });

  describe('constructed for invalid combinations should throw', () => {
    it('not no combinations', () => {
      expect(() => new RdfStore<number>({
        indexCombinations: [],
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      })).toThrow(`At least one index combination is required`);
    });

    it('not not enough components', () => {
      expect(() => new RdfStore<number>({
        indexCombinations: [[ 'subject', 'predicate' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      })).toThrow(`Invalid index combination: subject,predicate`);
    });
  });
});
