import each from 'jest-each';
import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberMap } from '../../lib/dictionary/TermDictionaryNumberMap';
import { TermDictionaryQuotedIndexed } from '../../lib/dictionary/TermDictionaryQuotedIndexed';
import type { IRdfStoreIndex } from '../../lib/index/IRdfStoreIndex';
import { indexClazzToInstance, indexSupportsQuotedTriples } from '../testUtil';

const DF = new DataFactory();

describe('RdfStoreIndexes', () => {
  let index: IRdfStoreIndex<number, boolean>;
  let dictionary: ITermDictionary<number>;

  each(indexSupportsQuotedTriples).describe('%s', (clazz, quotedTripleFiltering) => {
    describe('in SPOG order', () => {
      beforeEach(() => {
        dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberMap());
        index = indexClazzToInstance[clazz]({
          indexCombinations: [],
          indexConstructor: <any> undefined,
          dictionary,
          dataFactory: new DataFactory(),
        });
      });

      describe('that is empty', () => {
        describe('get', () => {
          it('should produce no results', () => {
            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(undefined);
          });
        });

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

        describe('findEncoded', () => {
          it('should produce no results', () => {
            expect([ ...index.findEncoded([
              undefined,
              undefined,
              undefined,
              undefined,
            ], [
              undefined,
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ], [
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ]) ]).toEqual([]);
          });
        });

        describe('count', () => {
          it('should return 0', () => {
            expect(index.count([
              undefined,
              undefined,
              undefined,
              undefined,
            ])).toEqual(0);
            expect(index.count([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(0);
          });
        });

        describe('remove', () => {
          it('should be unable to remove non-existing quads', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ])).toEqual(false);
          });
        });
      });

      describe('that has one quad', () => {
        beforeEach(() => {
          index.set([
            dictionary.encode(DF.namedNode('s')),
            dictionary.encode(DF.namedNode('p')),
            dictionary.encode(DF.namedNode('o')),
            dictionary.encode(DF.namedNode('g')),
          ], true);
        });

        describe('add', () => {
          it('should not modify the index when adding the same quad', () => {
            expect(index.set([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ], true)).toBeFalsy();
          });

          it('should modify the index when adding another quad', () => {
            expect(index.set([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ], true)).toBeTruthy();
          });
        });

        describe('get', () => {
          it('should produce results', () => {
            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(true);

            expect(index.get([
              DF.namedNode('sother'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('pother'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('oother'),
              DF.namedNode('g'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('gother'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('p'),
              DF.namedNode('p'),
              DF.namedNode('p'),
              DF.namedNode('p'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('s'),
              DF.namedNode('s'),
              DF.namedNode('s'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('s'),
              DF.namedNode('s'),
            ])).toEqual(undefined);

            expect(index.get([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('s'),
            ])).toEqual(undefined);
          });
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

            expect([ ...index.find([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o1'),
              undefined,
            ]) ]).toEqual([]);
          });
        });

        describe('findEncoded', () => {
          it('should produce 1 result for a variable pattern', () => {
            expect([ ...index.findEncoded([
              undefined,
              undefined,
              undefined,
              undefined,
            ], [
              undefined,
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s')),
                dictionary.encode(DF.namedNode('p')),
                dictionary.encode(DF.namedNode('o')),
                dictionary.encode(DF.namedNode('g')),
              ],
            ]);
          });

          it('should produce 1 result for an exact match', () => {
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ], [
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s')),
                dictionary.encode(DF.namedNode('p')),
                dictionary.encode(DF.namedNode('o')),
                dictionary.encode(DF.namedNode('g')),
              ],
            ]);
          });

          it('should produce 1 result for a partial match', () => {
            expect([ ...index.findEncoded([
              undefined,
              dictionary.encode(DF.namedNode('p')),
              undefined,
              dictionary.encode(DF.namedNode('g')),
            ], [
              undefined,
              DF.namedNode('p'),
              undefined,
              DF.namedNode('g'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s')),
                dictionary.encode(DF.namedNode('p')),
                dictionary.encode(DF.namedNode('o')),
                dictionary.encode(DF.namedNode('g')),
              ],
            ]);
          });

          it('should produce 0 results for a partial non-match', () => {
            expect([ ...index.findEncoded([
              undefined,
              dictionary.encode(DF.namedNode('p1')),
              undefined,
              dictionary.encode(DF.namedNode('g')),
            ], [
              undefined,
              DF.namedNode('p1'),
              undefined,
              DF.namedNode('g'),
            ]) ]).toEqual([]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o1')),
              undefined,
            ], [
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o1'),
              undefined,
            ]) ]).toEqual([]);
          });
        });

        describe('count', () => {
          it('should return 1 for a variable pattern', () => {
            expect(index.count([
              undefined,
              undefined,
              undefined,
              undefined,
            ])).toEqual(1);
          });

          it('should return 1 for an exact match', () => {
            expect(index.count([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(1);
          });

          it('should return 1 for a partial match', () => {
            expect(index.count([
              undefined,
              DF.namedNode('p'),
              undefined,
              DF.namedNode('g'),
            ])).toEqual(1);
          });

          it('should return 0 for a partial non-match', () => {
            expect(index.count([
              undefined,
              DF.namedNode('p1'),
              undefined,
              DF.namedNode('g'),
            ])).toEqual(0);

            expect(index.count([
              DF.namedNode('s'),
              DF.namedNode('p'),
              DF.namedNode('o1'),
              undefined,
            ])).toEqual(0);
          });
        });

        describe('remove', () => {
          it('should be able to remove an existing quad', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ])).toEqual(true);
          });

          it('should be able to remove an existing quad only once', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ])).toEqual(true);

            expect(index.remove([
              dictionary.encode(DF.namedNode('s')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('g')),
            ])).toEqual(false);
          });

          it('should be unable to remove non-existing quads', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s-no')),
              dictionary.encode(DF.namedNode('p-no')),
              dictionary.encode(DF.namedNode('o-no')),
              dictionary.encode(DF.namedNode('g-no')),
            ])).toEqual(false);
          });
        });
      });

      describe('that has multiple quads', () => {
        beforeEach(() => {
          index.set([
            dictionary.encode(DF.namedNode('s1')),
            dictionary.encode(DF.namedNode('p1')),
            dictionary.encode(DF.namedNode('o1')),
            dictionary.encode(DF.namedNode('g1')),
          ], true);
          index.set([
            dictionary.encode(DF.namedNode('s1')),
            dictionary.encode(DF.namedNode('p2')),
            dictionary.encode(DF.namedNode('o2')),
            dictionary.encode(DF.namedNode('g1')),
          ], true);
          index.set([
            dictionary.encode(DF.namedNode('s2')),
            dictionary.encode(DF.namedNode('p1')),
            dictionary.encode(DF.namedNode('o1')),
            dictionary.encode(DF.namedNode('g1')),
          ], true);
          index.set([
            dictionary.encode(DF.namedNode('s2')),
            dictionary.encode(DF.namedNode('p2')),
            dictionary.encode(DF.namedNode('o2')),
            dictionary.encode(DF.namedNode('g2')),
          ], true);
        });

        describe('get', () => {
          it('should produce results', () => {
            expect(index.get([
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ])).toEqual(true);

            expect(index.get([
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ])).toEqual(true);

            expect(index.get([
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ])).toEqual(true);

            expect(index.get([
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ])).toEqual(true);

            expect(index.get([
              DF.namedNode('sother'),
              DF.namedNode('p'),
              DF.namedNode('o'),
              DF.namedNode('g'),
            ])).toEqual(undefined);
          });
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

            expect([ ...index.find([
              DF.namedNode('p1'),
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.find([
              DF.namedNode('s1'),
              DF.namedNode('s1'),
              undefined,
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.find([
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('s1'),
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.find([
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('s1'),
            ]) ]).toEqual([]);
          });
        });

        describe('findEncoded', () => {
          it('should produce all results for a variable pattern', () => {
            expect([ ...index.findEncoded([
              undefined,
              undefined,
              undefined,
              undefined,
            ], [
              undefined,
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g1')),
              ],
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g2')),
              ],
            ]);
          });

          it('should produce 1 result for exact matches', () => {
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ], [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p2')),
              dictionary.encode(DF.namedNode('o2')),
              dictionary.encode(DF.namedNode('g1')),
            ], [
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g1')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s2')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ], [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s2')),
              dictionary.encode(DF.namedNode('p2')),
              dictionary.encode(DF.namedNode('o2')),
              dictionary.encode(DF.namedNode('g2')),
            ], [
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g2')),
              ],
            ]);
          });

          it('should produce results for partial matches', () => {
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s1')),
              undefined,
              undefined,
              undefined,
            ], [
              DF.namedNode('s1'),
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g1')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s2')),
              undefined,
              undefined,
              undefined,
            ], [
              DF.namedNode('s2'),
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g2')),
              ],
            ]);

            expect([ ...index.findEncoded([
              undefined,
              dictionary.encode(DF.namedNode('p1')),
              undefined,
              undefined,
            ], [
              undefined,
              DF.namedNode('p1'),
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s2')),
              dictionary.encode(DF.namedNode('p1')),
              undefined,
              undefined,
            ], [
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s2')),
              undefined,
              undefined,
              dictionary.encode(DF.namedNode('g2')),
            ], [
              DF.namedNode('s2'),
              undefined,
              undefined,
              DF.namedNode('g2'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('s2')),
                dictionary.encode(DF.namedNode('p2')),
                dictionary.encode(DF.namedNode('o2')),
                dictionary.encode(DF.namedNode('g2')),
              ],
            ]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s2')),
              undefined,
              undefined,
              dictionary.encode(DF.namedNode('g3')),
            ], [
              DF.namedNode('s2'),
              undefined,
              undefined,
              DF.namedNode('g3'),
            ]) ]).toEqual([]);

            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('p1')),
              undefined,
              undefined,
              undefined,
            ], [
              DF.namedNode('p1'),
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('s1')),
              undefined,
              undefined,
            ], [
              DF.namedNode('s1'),
              DF.namedNode('s1'),
              undefined,
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('s1')),
              undefined,
            ], [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('s1'),
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('s1')),
            ], [
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('s1'),
            ]) ]).toEqual([]);
          });
        });

        describe('count', () => {
          it('should return results for a variable pattern', () => {
            expect(index.count([
              undefined,
              undefined,
              undefined,
              undefined,
            ])).toEqual(4);
          });

          it('should produce 1 result for exact matches', () => {
            expect(index.count([
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ])).toEqual(1);

            expect(index.count([
              DF.namedNode('s1'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g1'),
            ])).toEqual(1);

            expect(index.count([
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('g1'),
            ])).toEqual(1);

            expect(index.count([
              DF.namedNode('s2'),
              DF.namedNode('p2'),
              DF.namedNode('o2'),
              DF.namedNode('g2'),
            ])).toEqual(1);
          });

          it('should produce results for partial matches', () => {
            expect(index.count([
              DF.namedNode('s1'),
              undefined,
              undefined,
              undefined,
            ])).toEqual(2);

            expect(index.count([
              DF.namedNode('s2'),
              undefined,
              undefined,
              undefined,
            ])).toEqual(2);

            expect(index.count([
              undefined,
              DF.namedNode('p1'),
              undefined,
              undefined,
            ])).toEqual(2);

            expect(index.count([
              DF.namedNode('s2'),
              DF.namedNode('p1'),
              undefined,
              undefined,
            ])).toEqual(1);

            expect(index.count([
              DF.namedNode('s2'),
              undefined,
              undefined,
              DF.namedNode('g2'),
            ])).toEqual(1);

            expect(index.count([
              DF.namedNode('s2'),
              undefined,
              undefined,
              DF.namedNode('g3'),
            ])).toEqual(0);

            expect(index.count([
              DF.namedNode('p1'),
              undefined,
              undefined,
              undefined,
            ])).toEqual(0);
            expect(index.count([
              DF.namedNode('s1'),
              DF.namedNode('s1'),
              undefined,
              undefined,
            ])).toEqual(0);
            expect(index.count([
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('s1'),
              undefined,
            ])).toEqual(0);
            expect(index.count([
              DF.namedNode('s1'),
              DF.namedNode('p1'),
              DF.namedNode('o1'),
              DF.namedNode('s1'),
            ])).toEqual(0);
          });
        });

        describe('remove', () => {
          it('should be able to remove existing quads', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ])).toEqual(true);
            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p2')),
              dictionary.encode(DF.namedNode('o2')),
              dictionary.encode(DF.namedNode('g1')),
            ])).toEqual(true);
            expect(index.remove([
              dictionary.encode(DF.namedNode('s2')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ])).toEqual(true);
            expect(index.remove([
              dictionary.encode(DF.namedNode('s2')),
              dictionary.encode(DF.namedNode('p2')),
              dictionary.encode(DF.namedNode('o2')),
              dictionary.encode(DF.namedNode('g2')),
            ])).toEqual(true);
          });

          it('should be able to remove an existing quad only once', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ])).toEqual(true);

            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1')),
            ])).toEqual(false);
          });

          it('should be unable to remove non-existing quads', () => {
            expect(index.remove([
              dictionary.encode(DF.namedNode('s1-no')),
              dictionary.encode(DF.namedNode('p1-no')),
              dictionary.encode(DF.namedNode('o1-no')),
              dictionary.encode(DF.namedNode('g1-no')),
            ])).toEqual(false);

            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1-no')),
              dictionary.encode(DF.namedNode('o1-no')),
              dictionary.encode(DF.namedNode('g1-no')),
            ])).toEqual(false);

            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1-no')),
              dictionary.encode(DF.namedNode('g1-no')),
            ])).toEqual(false);

            expect(index.remove([
              dictionary.encode(DF.namedNode('s1')),
              dictionary.encode(DF.namedNode('p1')),
              dictionary.encode(DF.namedNode('o1')),
              dictionary.encode(DF.namedNode('g1-no')),
            ])).toEqual(false);
          });
        });
      });

      if (quotedTripleFiltering) {
        describe('that has quoted quads', () => {
          beforeEach(() => {
            index.set([
              dictionary.encode(DF.namedNode('Alice')),
              dictionary.encode(DF.namedNode('says')),
              dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
              dictionary.encode(DF.namedNode('g1')),
            ], true);
            index.set([
              dictionary.encode(DF.namedNode('Alice')),
              dictionary.encode(DF.namedNode('says')),
              dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue'))),
              dictionary.encode(DF.namedNode('g1')),
            ], true);
            index.set([
              dictionary.encode(DF.namedNode('Bob')),
              dictionary.encode(DF.namedNode('says')),
              dictionary.encode(DF.quad(
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
              )),
              dictionary.encode(DF.namedNode('g1')),
            ], true);
          });

          describe('get', () => {
            it('should produce results', () => {
              expect(index.get([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('g1'),
              ])).toEqual(true);

              expect(index.get([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                DF.namedNode('g1'),
              ])).toEqual(true);

              expect(index.get([
                DF.namedNode('Bob'),
                DF.namedNode('says'),
                DF.quad(
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                ),
                DF.namedNode('g1'),
              ])).toEqual(true);

              expect(index.get([
                DF.namedNode('sother'),
                DF.namedNode('p'),
                DF.namedNode('o'),
                DF.namedNode('g'),
              ])).toEqual(undefined);
            });
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
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('g1'),
                ],
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('g1'),
                ],
                [
                  DF.namedNode('Bob'),
                  DF.namedNode('says'),
                  DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce 1 result for exact matches', () => {
              expect([ ...index.find([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('g1'),
                ],
              ]);

              expect([ ...index.find([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('g1'),
                ],
              ]);

              expect([ ...index.find([
                DF.namedNode('Bob'),
                DF.namedNode('says'),
                DF.quad(
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                ),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('Bob'),
                  DF.namedNode('says'),
                  DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce results for a variable', () => {
              expect([ ...index.find([
                undefined,
                DF.namedNode('says'),
                undefined,
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('g1'),
                ],
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('g1'),
                ],
                [
                  DF.namedNode('Bob'),
                  DF.namedNode('says'),
                  DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple', () => {
              expect([ ...index.find([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('g1'),
                ],
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce results for a variable inside and outside a quoted triple', () => {
              expect([ ...index.find([
                undefined,
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('g1'),
                ],
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple in subject position', () => {
              index.set([
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], true);

              expect([ ...index.find([
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  DF.namedNode('says'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple in predicate position', () => {
              index.set([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], true);

              expect([ ...index.find([
                DF.namedNode('s1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  DF.namedNode('s1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple in graph position', () => {
              index.set([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
              ], true);

              expect([ ...index.find([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.namedNode('o1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
              ]) ]).toEqual([
                [
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.namedNode('o1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                ],
              ]);
            });
          });

          describe('findEncoded', () => {
            it('should produce all results for a variable pattern', () => {
              expect([ ...index.findEncoded([
                undefined,
                undefined,
                undefined,
                undefined,
              ], [
                undefined,
                undefined,
                undefined,
                undefined,
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('Blue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
                [
                  dictionary.encode(DF.namedNode('Bob')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(
                      DF.namedNode('Violets'),
                      DF.namedNode('haveColor'),
                      DF.namedNode('Yellow'),
                    ),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce 1 result for exact matches', () => {
              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);

              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Violets'),
                  DF.namedNode('haveColor'),
                  DF.namedNode('DarkBlue'),
                )),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);

              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('Bob')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                )),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                DF.namedNode('Bob'),
                DF.namedNode('says'),
                DF.quad(
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                ),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Bob')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce results for a variable', () => {
              expect([ ...index.findEncoded([
                undefined,
                dictionary.encode(DF.namedNode('says')),
                undefined,
                dictionary.encode(DF.namedNode('g1')),
              ], [
                undefined,
                DF.namedNode('says'),
                undefined,
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('Blue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
                [
                  dictionary.encode(DF.namedNode('Bob')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple', () => {
              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Violets'),
                  DF.namedNode('haveColor'),
                  DF.variable('color'),
                )),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('Blue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce results for a variable inside and outside a quoted triple', () => {
              expect([ ...index.findEncoded([
                undefined,
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Violets'),
                  DF.namedNode('haveColor'),
                  DF.variable('color'),
                )),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                undefined,
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('Blue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple in subject position', () => {
              index.set([
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], true);

              expect([ ...index.findEncoded([
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('o1')),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple in predicate position', () => {
              index.set([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], true);

              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color'))),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], [
                DF.namedNode('s1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('s1')),
                  dictionary.encode(
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  dictionary.encode(DF.namedNode('o1')),
                  dictionary.encode(DF.namedNode('g1')),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple in graph position', () => {
              index.set([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
              ], true);

              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color'))),
              ], [
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.namedNode('o1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('Alice')),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('o1')),
                  dictionary.encode(
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                ],
              ]);
            });
          });

          describe('count', () => {
            it('should produce all results for a variable pattern', () => {
              expect(index.count([
                undefined,
                undefined,
                undefined,
                undefined,
              ])).toEqual(3);
            });

            it('should produce 1 result for exact matches', () => {
              expect(index.count([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('g1'),
              ])).toEqual(1);

              expect(index.count([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                DF.namedNode('g1'),
              ])).toEqual(1);

              expect(index.count([
                DF.namedNode('Bob'),
                DF.namedNode('says'),
                DF.quad(
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                ),
                DF.namedNode('g1'),
              ])).toEqual(1);
            });

            it('should produce results for a variable', () => {
              expect(index.count([
                undefined,
                DF.namedNode('says'),
                undefined,
                DF.namedNode('g1'),
              ])).toEqual(3);
            });

            it('should produce results for a variable inside a quoted triple', () => {
              expect(index.count([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('g1'),
              ])).toEqual(2);
            });

            it('should produce results for a variable inside and outside a quoted triple', () => {
              expect(index.count([
                undefined,
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('g1'),
              ])).toEqual(2);
            });

            it('should produce results for a variable inside a quoted triple in subject position', () => {
              index.set([
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], true);

              expect(index.count([
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ])).toEqual(1);
            });

            it('should produce results for a variable inside a quoted triple in predicate position', () => {
              index.set([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1')),
              ], true);

              expect(index.count([
                DF.namedNode('s1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ])).toEqual(1);
            });

            it('should produce results for a variable inside a quoted triple in graph position', () => {
              index.set([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow'))),
              ], true);

              expect(index.count([
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.namedNode('o1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
              ])).toEqual(1);
            });
          });

          describe('remove', () => {
            it('should be able to remove existing quads', () => {
              expect(index.remove([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('g1')),
              ])).toEqual(true);
              expect(index.remove([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Violets'),
                  DF.namedNode('haveColor'),
                  DF.namedNode('DarkBlue'),
                )),
                dictionary.encode(DF.namedNode('g1')),
              ])).toEqual(true);
              expect(index.remove([
                dictionary.encode(DF.namedNode('Bob')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Alice'),
                  DF.namedNode('says'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                )),
                dictionary.encode(DF.namedNode('g1')),
              ])).toEqual(true);
            });

            it('should be able to remove an existing quad only once', () => {
              expect(index.remove([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('g1')),
              ])).toEqual(true);

              expect(index.remove([
                dictionary.encode(DF.namedNode('Alice')),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('g1')),
              ])).toEqual(false);
            });

            it('should be unable to remove non-existing quads', () => {
              expect(index.remove([
                dictionary.encode(DF.namedNode('s1-no')),
                dictionary.encode(DF.namedNode('p1-no')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('g1-no')),
              ])).toEqual(false);

              expect(index.remove([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1-no')),
                dictionary.encode(DF.namedNode('o1-no')),
                dictionary.encode(DF.namedNode('g1-no')),
              ])).toEqual(false);

              expect(index.remove([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1-no')),
                dictionary.encode(DF.namedNode('g1-no')),
              ])).toEqual(false);

              expect(index.remove([
                dictionary.encode(DF.namedNode('s1')),
                dictionary.encode(DF.namedNode('p1')),
                dictionary.encode(DF.namedNode('o1')),
                dictionary.encode(DF.namedNode('g1-no')),
              ])).toEqual(false);
            });
          });
        });
      }
    });

    describe('in GOPS order', () => {
      beforeEach(() => {
        dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberMap());
        index = indexClazzToInstance[clazz]({
          indexCombinations: [],
          indexConstructor: <any> undefined,
          dictionary,
          dataFactory: new DataFactory(),
        });
      });

      describe('that is empty', () => {
        describe('get', () => {
          it('should produce no results', () => {
            expect(index.get([
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('s'),
            ])).toEqual(undefined);
          });
        });

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

        describe('findEncoded', () => {
          it('should produce no results', () => {
            expect([ ...index.findEncoded([
              undefined,
              undefined,
              undefined,
              undefined,
            ], [
              undefined,
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([]);
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('g')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('s')),
            ], [
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
          index.set([
            dictionary.encode(DF.namedNode('g')),
            dictionary.encode(DF.namedNode('o')),
            dictionary.encode(DF.namedNode('p')),
            dictionary.encode(DF.namedNode('s')),
          ], true);
        });

        describe('get', () => {
          it('should produce results', () => {
            expect(index.get([
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('s'),
            ])).toEqual(true);

            expect(index.get([
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('sother'),
            ])).toEqual(undefined);
          });
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

        describe('findEncoded', () => {
          it('should produce 1 result for a variable pattern', () => {
            expect([ ...index.findEncoded([
              undefined,
              undefined,
              undefined,
              undefined,
            ], [
              undefined,
              undefined,
              undefined,
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('g')),
                dictionary.encode(DF.namedNode('o')),
                dictionary.encode(DF.namedNode('p')),
                dictionary.encode(DF.namedNode('s')),
              ],
            ]);
          });

          it('should produce 1 result for an exact match', () => {
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('g')),
              dictionary.encode(DF.namedNode('o')),
              dictionary.encode(DF.namedNode('p')),
              dictionary.encode(DF.namedNode('s')),
            ], [
              DF.namedNode('g'),
              DF.namedNode('o'),
              DF.namedNode('p'),
              DF.namedNode('s'),
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('g')),
                dictionary.encode(DF.namedNode('o')),
                dictionary.encode(DF.namedNode('p')),
                dictionary.encode(DF.namedNode('s')),
              ],
            ]);
          });

          it('should produce 1 result for a partial match', () => {
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('g')),
              undefined,
              dictionary.encode(DF.namedNode('p')),
              undefined,
            ], [
              DF.namedNode('g'),
              undefined,
              DF.namedNode('p'),
              undefined,
            ]) ]).toEqual([
              [
                dictionary.encode(DF.namedNode('g')),
                dictionary.encode(DF.namedNode('o')),
                dictionary.encode(DF.namedNode('p')),
                dictionary.encode(DF.namedNode('s')),
              ],
            ]);
          });

          it('should produce 0 results for a partial non-match', () => {
            expect([ ...index.findEncoded([
              dictionary.encode(DF.namedNode('g')),
              undefined,
              dictionary.encode(DF.namedNode('p1')),
              undefined,
            ], [
              DF.namedNode('g'),
              undefined,
              DF.namedNode('p1'),
              undefined,
            ]) ]).toEqual([]);
          });
        });
      });

      if (quotedTripleFiltering) {
        describe('that has quoted quads', () => {
          beforeEach(() => {
            index.set([
              dictionary.encode(DF.namedNode('g1')),
              dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
              dictionary.encode(DF.namedNode('says')),
              dictionary.encode(DF.namedNode('Alice')),
            ], true);
            index.set([
              dictionary.encode(DF.namedNode('g1')),
              dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue'))),
              dictionary.encode(DF.namedNode('says')),
              dictionary.encode(DF.namedNode('Alice')),
            ], true);
            index.set([
              dictionary.encode(DF.namedNode('g1')),
              dictionary.encode(DF.quad(
                DF.namedNode('Alice'),
                DF.namedNode('says'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
              )),
              dictionary.encode(DF.namedNode('says')),
              dictionary.encode(DF.namedNode('Bob')),
            ], true);
          });

          describe('get', () => {
            it('should produce results', () => {
              expect(index.get([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ])).toEqual(true);

              expect(index.get([
                DF.namedNode('sother'),
                DF.namedNode('p'),
                DF.namedNode('o'),
                DF.namedNode('g'),
              ])).toEqual(undefined);
            });
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
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
                [
                  DF.namedNode('g1'),
                  DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  DF.namedNode('says'),
                  DF.namedNode('Bob'),
                ],
              ]);
            });

            it('should produce 1 result for exact matches', () => {
              expect([ ...index.find([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ]) ]).toEqual([
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
              ]);
            });

            it('should produce results for a variable', () => {
              expect([ ...index.find([
                DF.namedNode('g1'),
                undefined,
                DF.namedNode('says'),
                undefined,
              ]) ]).toEqual([
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
                [
                  DF.namedNode('g1'),
                  DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  ),
                  DF.namedNode('says'),
                  DF.namedNode('Bob'),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple', () => {
              expect([ ...index.find([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ]) ]).toEqual([
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
              ]);
            });

            it('should produce results for a variable inside and outside a quoted triple', () => {
              expect([ ...index.find([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                undefined,
              ]) ]).toEqual([
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
                [
                  DF.namedNode('g1'),
                  DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
                  DF.namedNode('says'),
                  DF.namedNode('Alice'),
                ],
              ]);
            });
          });

          describe('findEncoded', () => {
            it('should produce all results for a variable pattern', () => {
              expect([ ...index.findEncoded([
                undefined,
                undefined,
                undefined,
                undefined,
              ], [
                undefined,
                undefined,
                undefined,
                undefined,
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('Blue'),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Bob')),
                ],
              ]);
            });

            it('should produce 1 result for exact matches', () => {
              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('g1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('Alice')),
              ], [
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
              ]);
            });

            it('should produce results for a variable', () => {
              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('g1')),
                undefined,
                dictionary.encode(DF.namedNode('says')),
                undefined,
              ], [
                DF.namedNode('g1'),
                undefined,
                DF.namedNode('says'),
                undefined,
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Alice'),
                    DF.namedNode('says'),
                    DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Bob')),
                ],
              ]);
            });

            it('should produce results for a variable inside a quoted triple', () => {
              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('g1')),
                dictionary.encode(DF.quad(
                  DF.namedNode('Violets'),
                  DF.namedNode('haveColor'),
                  DF.variable('color'),
                )),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('Alice')),
              ], [
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('Blue'),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
              ]);
            });

            it('should produce results for a variable inside and outside a quoted triple', () => {
              expect([ ...index.findEncoded([
                dictionary.encode(DF.namedNode('g1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color'))),
                dictionary.encode(DF.namedNode('says')),
                undefined,
              ], [
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                undefined,
              ]) ]).toEqual([
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
                [
                  dictionary.encode(DF.namedNode('g1')),
                  dictionary.encode(DF.quad(
                    DF.namedNode('Violets'),
                    DF.namedNode('haveColor'),
                    DF.namedNode('DarkBlue'),
                  )),
                  dictionary.encode(DF.namedNode('says')),
                  dictionary.encode(DF.namedNode('Alice')),
                ],
              ]);
            });
          });

          describe('count', () => {
            it('should produce all results for a variable pattern', () => {
              expect(index.count([
                undefined,
                undefined,
                undefined,
                undefined,
              ])).toEqual(3);
            });

            it('should produce 1 result for exact matches', () => {
              expect(index.count([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ])).toEqual(1);
            });

            it('should produce results for a variable', () => {
              expect(index.count([
                DF.namedNode('g1'),
                undefined,
                DF.namedNode('says'),
                undefined,
              ])).toEqual(3);
            });

            it('should produce results for a variable inside a quoted triple', () => {
              expect(index.count([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                DF.namedNode('Alice'),
              ])).toEqual(2);
            });

            it('should produce results for a variable inside and outside a quoted triple', () => {
              expect(index.count([
                DF.namedNode('g1'),
                DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
                DF.namedNode('says'),
                undefined,
              ])).toEqual(2);
            });
          });

          describe('remove', () => {
            it('should be able to remove existing quads', () => {
              expect(index.remove([
                dictionary.encode(DF.namedNode('g1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('Alice')),
              ])).toEqual(true);
            });

            it('should be able to remove an existing quad only once', () => {
              expect(index.remove([
                dictionary.encode(DF.namedNode('g1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('Alice')),
              ])).toEqual(true);

              expect(index.remove([
                dictionary.encode(DF.namedNode('g1')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('says')),
                dictionary.encode(DF.namedNode('Alice')),
              ])).toEqual(false);
            });

            it('should be unable to remove non-existing quads', () => {
              expect(index.remove([
                dictionary.encode(DF.namedNode('g1-no')),
                dictionary.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue'))),
                dictionary.encode(DF.namedNode('p1-no')),
                dictionary.encode(DF.namedNode('s1-no')),
              ])).toEqual(false);
            });
          });
        });
      }
    });
  });
});
