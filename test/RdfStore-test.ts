import arrayifyStream from 'arrayify-stream';
import each from 'jest-each';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import type { DatasetCoreWrapper } from '../lib/dataset/DatasetCoreWrapper';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStore } from '../lib/RdfStore';
import 'jest-rdf';
import { dictClazzToInstance, indexClazzToInstance } from './testUtil';

const streamifyArray = require('streamify-array');

const DF = new DataFactory();

// Test either with no cardinality sets, or with all cardinality sets
const allTermsCardinalitySets: QuadTermName[][] = [
  [ 'subject' ],
  [ 'subject', 'predicate', 'object', 'graph' ],
];
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
    each(Object.keys(indexClazzToInstance)).describe('for index type %s', indexClazz => {
      each(Object.keys(dictClazzToInstance)).describe('for dictionary type %s', dictClazz => {
        each(allTermsCardinalitySets).describe('with a terms index %o', termsCardinalitySets => {
          beforeEach(() => {
            store = new RdfStore<number>({
              indexCombinations,
              indexConstructor: subOptions => indexClazzToInstance[indexClazz](subOptions),
              dictionary: dictClazzToInstance[dictClazz](),
              dataFactory: new DataFactory(),
              termsCardinalitySets,
            });
          });

          describe('that is empty', () => {
            describe('find', () => {
              it('should produce no results', async() => {
                expect(await arrayifyStream(store.match())).toEqual([]);
              });
            });
            describe('getSubjects', () => {
              it('should produce no results', async() => {
                expect(store.getSubjects()).toEqual([]);
              });
            });
            describe('getPredicates', () => {
              it('should produce no results', async() => {
                expect(store.getPredicates()).toEqual([]);
              });
            });
            describe('getObjects', () => {
              it('should produce no results', async() => {
                expect(store.getObjects()).toEqual([]);
              });
            });
            describe('getGraphs', () => {
              it('should produce no results', async() => {
                expect(store.getGraphs()).toEqual([]);
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

            describe('subject', () => {
              it('should be s only', () => {
                expect(store.getSubjects()).toEqual([ DF.namedNode('s') ]);
              });
            });

            describe('predicate', () => {
              it('should be p only', () => {
                expect(store.getPredicates()).toEqual([ DF.namedNode('p') ]);
              });
            });

            describe('object', () => {
              it('should be o only', () => {
                expect(store.getObjects()).toEqual([ DF.namedNode('o') ]);
              });
            });

            // Describe('terms helper test', () => {
            // it('should be s only', () => {
            //     expect(store.getTermsHelper('subject')).toEqual([ DF.namedNode('s') ]);
            // });
            // });

            describe('graph', () => {
              it('should be g only', () => {
                expect(store.getGraphs()).toEqual([ DF.namedNode('g') ]);
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

            describe('remove', () => {
              it('should not remove quads for an empty stream', async() => {
                await new Promise(resolve => store.remove(streamifyArray([])).on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(4);
                expect((await arrayifyStream(store.match())).length).toEqual(4);
              });

              it('should remove quads for an non-empty stream', async() => {
                await new Promise(resolve => store.remove(streamifyArray([
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
                ])).on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(2);
                expect(await arrayifyStream(store.match())).toEqual([
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
            });

            describe('removeMatches', () => {
              it('should not remove quads for no matches', async() => {
                await new Promise(resolve => store.removeMatches(DF.namedNode('no')).on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(4);
                expect((await arrayifyStream(store.match())).length).toEqual(4);
              });

              it('should remove quads for matching quads', async() => {
                await new Promise(resolve => store.removeMatches(
                  DF.namedNode('s1'),
                  undefined,
                  undefined,
                  DF.namedNode('g1'),
                ).on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(2);
                expect(await arrayifyStream(store.match())).toEqual([
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
            });

            describe('deleteGraph', () => {
              it('should not remove quads for no matches', async() => {
                await new Promise(resolve => store.deleteGraph(DF.namedNode('no')).on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(4);
                expect((await arrayifyStream(store.match())).length).toEqual(4);
              });

              it('should remove quads for the matching graph', async() => {
                await new Promise(resolve => store.deleteGraph(DF.namedNode('g1')).on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(1);
                expect(await arrayifyStream(store.match())).toEqual([
                  DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p2'),
                    DF.namedNode('o2'),
                    DF.namedNode('g2'),
                  ),
                ]);
              });

              it('should remove quads for the matching graph as string', async() => {
                await new Promise(resolve => store.deleteGraph('g1').on('end', resolve));

                // Store should not be changed
                expect(store.size).toEqual(1);
                expect(await arrayifyStream(store.match())).toEqual([
                  DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p2'),
                    DF.namedNode('o2'),
                    DF.namedNode('g2'),
                  ),
                ]);
              });
            });

            describe('asDataset', () => {
              let dataset: DatasetCoreWrapper;
              beforeEach(() => {
                dataset = store.asDataset();
              });

              it('returns a dataset core', () => {
                expect(dataset).not.toBeFalsy();
              });

              describe('size', () => {
                it('to return the store size', () => {
                  expect(dataset.size).toEqual(4);
                });
              });

              describe('add', () => {
                it('to add quads', () => {
                  dataset.add(DF.quad(
                    DF.namedNode('s3'),
                    DF.namedNode('p3'),
                    DF.namedNode('o3'),
                    DF.namedNode('g3'),
                  ));
                  dataset.add(DF.quad(
                    DF.namedNode('s4'),
                    DF.namedNode('p4'),
                    DF.namedNode('o4'),
                    DF.namedNode('g4'),
                  ));

                  expect(dataset.size).toEqual(6);
                  expect(store.size).toEqual(6);
                });
              });

              describe('delete', () => {
                it('to delete quads', () => {
                  dataset.delete(DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p1'),
                    DF.namedNode('o1'),
                    DF.namedNode('g1'),
                  ));
                  dataset.delete(DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p2'),
                    DF.namedNode('o2'),
                    DF.namedNode('g2'),
                  ));

                  expect(dataset.size).toEqual(2);
                  expect(store.size).toEqual(2);
                });
              });

              describe('has', () => {
                it('to return true for contained quads', () => {
                  expect(dataset.has(DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p1'),
                    DF.namedNode('o1'),
                    DF.namedNode('g1'),
                  ))).toEqual(true);
                  expect(dataset.has(DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p2'),
                    DF.namedNode('o2'),
                    DF.namedNode('g2'),
                  ))).toEqual(true);
                  expect(dataset.has(DF.quad(
                    DF.namedNode('s3'),
                    DF.namedNode('p3'),
                    DF.namedNode('o3'),
                    DF.namedNode('g3'),
                  ))).toEqual(false);
                });
              });

              describe('match', () => {
                it('to return a new dataset for matching quads', () => {
                  const dataset2 = dataset.match(undefined, undefined, undefined, DF.namedNode('g1'));

                  expect(dataset2).not.toBe(dataset);
                  expect(dataset2.store).not.toBe(dataset.store);
                  expect(dataset2.store.dictionary).toBe(dataset.store.dictionary);
                  expect(dataset2.size).toEqual(3);

                  expect(dataset2.has(DF.quad(
                    DF.namedNode('s1'),
                    DF.namedNode('p1'),
                    DF.namedNode('o1'),
                    DF.namedNode('g1'),
                  ))).toEqual(true);
                  expect(dataset2.has(DF.quad(
                    DF.namedNode('s1'),
                    DF.namedNode('p2'),
                    DF.namedNode('o2'),
                    DF.namedNode('g1'),
                  ))).toEqual(true);
                  expect(dataset2.has(DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p1'),
                    DF.namedNode('o1'),
                    DF.namedNode('g1'),
                  ))).toEqual(true);
                  expect(dataset2.has(DF.quad(
                    DF.namedNode('s2'),
                    DF.namedNode('p2'),
                    DF.namedNode('o2'),
                    DF.namedNode('g2'),
                  ))).toEqual(false);
                });
              });

              describe('iterator', () => {
                it('to return all contained triples', () => {
                  expect([ ...dataset ]).toBeRdfIsomorphic([
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
              });
            });
          });

          describe('that has quoted quads', () => {
            beforeEach(async() => {
              const ret = store.import(streamifyArray([
                DF.quad(
                  DF.namedNode('ex:alice'),
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.literal('"Bob"'),
                  ),
                ),
                DF.quad(
                  DF.namedNode('ex:carol'),
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.literal('"NotBob"'),
                  ),
                ),
              ]));
              await new Promise(resolve => ret.on('end', resolve));
            });

            describe('getQuads', () => {
              it('should produce results for a top-level pattern', () => {
                expect(store.getQuads(
                  undefined,
                  DF.namedNode('ex:says'),
                )).toEqual([
                  DF.quad(
                    DF.namedNode('ex:alice'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"Bob"'),
                    ),
                  ),
                  DF.quad(
                    DF.namedNode('ex:carol'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"NotBob"'),
                    ),
                  ),
                ]);
              });

              it('should produce results for a quoted triple', () => {
                expect(store.getQuads(
                  undefined,
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.literal('"Bob"'),
                  ),
                )).toEqual([
                  DF.quad(
                    DF.namedNode('ex:alice'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"Bob"'),
                    ),
                  ),
                ]);
              });

              it('should produce results for a quoted object variable', () => {
                expect(store.getQuads(
                  undefined,
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.variable('name'),
                  ),
                )).toEqual([
                  DF.quad(
                    DF.namedNode('ex:alice'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"Bob"'),
                    ),
                  ),
                  DF.quad(
                    DF.namedNode('ex:carol'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"NotBob"'),
                    ),
                  ),
                ]);
              });

              it('should count results for a quoted object variable', () => {
                expect(store.countQuads(
                  undefined,
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.variable('name'),
                  ),
                )).toEqual(2);
              });

              it('should produce results for a quoted predicate variable', () => {
                expect(store.getQuads(
                  undefined,
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.variable('name'),
                    DF.literal('"Bob"'),
                  ),
                )).toEqual([
                  DF.quad(
                    DF.namedNode('ex:alice'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"Bob"'),
                    ),
                  ),
                ]);
              });

              it('should produce results for a quoted variable with partial match', () => {
                expect(store.getQuads(
                  undefined,
                  DF.namedNode('ex:says'),
                  DF.quad(
                    DF.variable('person'),
                    DF.namedNode('ex:name'),
                    DF.literal('"Bob"'),
                  ),
                )).toEqual([
                  DF.quad(
                    DF.namedNode('ex:alice'),
                    DF.namedNode('ex:says'),
                    DF.quad(
                      DF.namedNode('ex:bob'),
                      DF.namedNode('ex:name'),
                      DF.literal('"Bob"'),
                    ),
                  ),
                ]);
              });
            });
          });
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
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecordFullTerms(),
        dataFactory: new DataFactory(),
      })).toThrow(`At least one index combination is required`);
    });

    it('not not enough components', () => {
      expect(() => new RdfStore<number>({
        indexCombinations: [[ 'subject', 'predicate' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecordFullTerms(),
        dataFactory: new DataFactory(),
      })).toThrow(`Invalid index combination: subject,predicate`);
    });
  });
});
