import { BindingsFactory } from '@comunica/utils-bindings-factory';
import arrayifyStream from 'arrayify-stream';
import each from 'jest-each';
import { DataFactory } from 'rdf-data-factory';
import type { QuadTermName } from 'rdf-terms';
import type { DatasetCoreWrapper } from '../lib/dataset/DatasetCoreWrapper';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStore } from '../lib/RdfStore';
import 'jest-rdf';
import '@comunica/utils-jest';
import { dictClazzToInstance, expectToEqualTerms, indexClazzToInstance } from './testUtil';

const streamifyArray = require('streamify-array');

const DF = new DataFactory();
const BF = new BindingsFactory(DF);
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
  each(allComponentOrders).describe('with one index in %o order', (indexCombinations) => {
    each(Object.keys(indexClazzToInstance)).describe('for index type %s', (indexClazz) => {
      each(Object.keys(dictClazzToInstance)).describe('for dictionary type %s', (dictClazz) => {
        beforeEach(() => {
          store = new RdfStore<number>({
            indexCombinations,
            indexConstructor: subOptions => indexClazzToInstance[indexClazz](subOptions),
            dictionary: dictClazzToInstance[dictClazz](),
            dataFactory: new DataFactory(),
          });
        });

        describe('that is empty', () => {
          describe('find', () => {
            it('should produce no results', async() => {
              await expect(arrayifyStream(store.match())).resolves.toEqual([]);
            });
          });

          describe('matchBindings', () => {
            it('should produce no results', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqual([]);
            });
          });

          describe('getDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject' ]), []);
            });

            it('should return distinct subjects and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'object' ]), []);
            });

            it('should return distinct subjects and objects and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'object', 'predicate' ]), []);
            });

            it('should return distinct subjects and predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'predicate', 'object' ]), []);
            });

            it('should return distinct subjects and graphs and predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'graph', 'predicate', 'object' ]), []);
            });

            it('should return distinct predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate' ]), []);
            });

            it('should return distinct predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object' ]), []);
            });

            it('should return distinct predicates and objects and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object', 'subject' ]), []);
            });

            it('should return distinct predicates and subjects and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'subject', 'object' ]), []);
            });

            it('should return distinct predicates and objects and subjects and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object', 'subject', 'graph' ]), []);
            });

            it('should return distinct predicates and subjects and graphs and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'subject', 'graph', 'object' ]), []);
            });

            it('should return distinct objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object' ]), []);
            });

            it('should return distinct objects and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'graph' ]), []);
            });

            it('should return distinct objects and predicates and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'predicate', 'graph' ]), []);
            });

            it('should return distinct objects and graphs and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'graph', 'predicate' ]), []);
            });

            it('should return distinct objects and predicates and graphs and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'predicate', 'graph', 'subject' ]), []);
            });

            it('should return distinct graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph' ]), []);
            });

            it('should return distinct graphs and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object' ]), []);
            });

            it('should return distinct graphs and objects and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object', 'subject' ]), []);
            });

            it('should return distinct graphs and objects and subjects and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object', 'subject', 'predicate' ]), []);
            });
          });

          describe('countDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expect(store.countDistinctTerms([ 'subject' ])).toBe(0);
            });

            it('should return distinct subjects and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'object' ])).toBe(0);
            });

            it('should return distinct subjects and objects and predicates', async() => {
              expect(store.countDistinctTerms([ 'subject', 'object', 'predicate' ])).toBe(0);
            });

            it('should return distinct subjects and predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'predicate', 'object' ])).toBe(0);
            });

            it('should return distinct subjects and graphs and predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'graph', 'predicate', 'object' ])).toBe(0);
            });

            it('should return distinct predicates', async() => {
              expect(store.countDistinctTerms([ 'predicate' ])).toBe(0);
            });

            it('should return distinct predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object' ])).toBe(0);
            });

            it('should return distinct predicates and objects and subjects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object', 'subject' ])).toBe(0);
            });

            it('should return distinct predicates and subjects and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'subject', 'object' ])).toBe(0);
            });

            it('should return distinct predicates and objects and subjects and graphs', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object', 'subject', 'graph' ])).toBe(0);
            });

            it('should return distinct predicates and subjects and graphs and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'subject', 'graph', 'object' ])).toBe(0);
            });

            it('should return distinct objects', async() => {
              expect(store.countDistinctTerms([ 'object' ])).toBe(0);
            });

            it('should return distinct objects and graphs', async() => {
              expect(store.countDistinctTerms([ 'object', 'graph' ])).toBe(0);
            });

            it('should return distinct objects and predicates and graphs', async() => {
              expect(store.countDistinctTerms([ 'object', 'predicate', 'graph' ])).toBe(0);
            });

            it('should return distinct objects and graphs and predicates', async() => {
              expect(store.countDistinctTerms([ 'object', 'graph', 'predicate' ])).toBe(0);
            });

            it('should return distinct objects and predicates and graphs and subjects', async() => {
              expect(store.countDistinctTerms([ 'object', 'predicate', 'graph', 'subject' ])).toBe(0);
            });

            it('should return distinct graphs', async() => {
              expect(store.countDistinctTerms([ 'graph' ])).toBe(0);
            });

            it('should return distinct graphs and objects', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object' ])).toBe(0);
            });

            it('should return distinct graphs and objects and subjects', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object', 'subject' ])).toBe(0);
            });

            it('should return distinct graphs and objects and subjects and predicates', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object', 'subject', 'predicate' ])).toBe(0);
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
              expect(store.size).toBe(1);
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
              expect(store.countQuads()).toBe(1);
            });
          });

          describe('find', () => {
            it('should produce 1 result for a variable pattern', async() => {
              await expect(arrayifyStream(store.match())).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s'),
                  DF.namedNode('p'),
                  DF.namedNode('o'),
                  DF.namedNode('g'),
                ),
              ]);
            });

            it('should produce 1 result for an exact match', async() => {
              await expect(arrayifyStream(store.match(
                DF.namedNode('s'),
                DF.namedNode('p'),
                DF.namedNode('o'),
                DF.namedNode('g'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s'),
                  DF.namedNode('p'),
                  DF.namedNode('o'),
                  DF.namedNode('g'),
                ),
              ]);
            });

            it('should produce 1 result for a partial match', async() => {
              await expect(arrayifyStream(store.match(
                undefined,
                DF.namedNode('p'),
                undefined,
                DF.namedNode('g'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s'),
                  DF.namedNode('p'),
                  DF.namedNode('o'),
                  DF.namedNode('g'),
                ),
              ]);
            });

            it('should produce 0 results for a partial non-match', async() => {
              await expect(arrayifyStream(store.match(
                undefined,
                DF.namedNode('p1'),
                undefined,
                DF.namedNode('g'),
              ))).resolves.toEqual([]);
            });
          });

          describe('matchBindings', () => {
            it('should produce 1 result for a variable pattern', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('s'),
                  p: DF.namedNode('p'),
                  o: DF.namedNode('o'),
                  g: DF.namedNode('g'),
                }),
              ]);
            });

            it('should produce 1 result for an exact match', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s'),
                DF.namedNode('p'),
                DF.namedNode('o'),
                DF.namedNode('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({}),
              ]);
            });

            it('should produce 1 result for a partial match', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('p'),
                DF.variable('o'),
                DF.namedNode('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('s'),
                  o: DF.namedNode('o'),
                }),
              ]);
            });

            it('should produce 0 results for a partial non-match', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('p1'),
                DF.variable('o'),
                DF.namedNode('g'),
              ))).resolves.toEqualBindingsArray([]);
            });
          });

          describe('getBindings', () => {
            it('should produce 1 result for a variable pattern', () => {
              expect(store.getBindings(
                BF,
                DF.variable('s'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              )).toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('s'),
                  p: DF.namedNode('p'),
                  o: DF.namedNode('o'),
                  g: DF.namedNode('g'),
                }),
              ]);
            });
          });

          describe('removeQuad', () => {
            it('should not remove a non-existing quad', async() => {
              expect(store.removeQuad(DF.quad(
                DF.namedNode('s'),
                DF.namedNode('s'),
                DF.namedNode('s'),
                DF.namedNode('s'),
              ))).toBe(false);

              // Store should not be changed
              expect(store.size).toBe(1);
              await expect(arrayifyStream(store.match())).resolves.toEqual([
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
              ))).toBe(false);

              // Store should not be changed
              expect(store.size).toBe(1);
              await expect(arrayifyStream(store.match())).resolves.toEqual([
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
              ))).toBe(true);

              // Store should be changed
              expect(store.size).toBe(0);
              await expect(arrayifyStream(store.match())).resolves.toEqual([]);
            });

            it('should remove an existing quad just once', async() => {
              expect(store.removeQuad(DF.quad(
                DF.namedNode('s'),
                DF.namedNode('p'),
                DF.namedNode('o'),
                DF.namedNode('g'),
              ))).toBe(true);

              expect(store.removeQuad(DF.quad(
                DF.namedNode('s'),
                DF.namedNode('p'),
                DF.namedNode('o'),
                DF.namedNode('g'),
              ))).toBe(false);

              // Store should be changed
              expect(store.size).toBe(0);
              await expect(arrayifyStream(store.match())).resolves.toEqual([]);
            });
          });

          describe('getDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject' ]), [
                [ DF.namedNode('s') ],
              ]);
            });

            it('should return distinct subjects and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'object' ]), [
                [ DF.namedNode('s'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct subjects and objects and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'object', 'predicate' ]), [
                [ DF.namedNode('s'), DF.namedNode('o'), DF.namedNode('p') ],
              ]);
            });

            it('should return distinct subjects and predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'predicate', 'object' ]), [
                [ DF.namedNode('s'), DF.namedNode('p'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct subjects and graphs and predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'graph', 'predicate', 'object' ]), [
                [ DF.namedNode('s'), DF.namedNode('g'), DF.namedNode('p'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate' ]), [
                [ DF.namedNode('p') ],
              ]);
            });

            it('should return distinct predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object' ]), [
                [ DF.namedNode('p'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct predicates and objects and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object', 'subject' ]), [
                [ DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('s') ],
              ]);
            });

            it('should return distinct predicates and subjects and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'subject', 'object' ]), [
                [ DF.namedNode('p'), DF.namedNode('s'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct predicates and objects and subjects and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object', 'subject', 'graph' ]), [
                [ DF.namedNode('p'), DF.namedNode('o'), DF.namedNode('s'), DF.namedNode('g') ],
              ]);
            });

            it('should return distinct predicates and subjects and graphs and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'subject', 'graph', 'object' ]), [
                [ DF.namedNode('p'), DF.namedNode('s'), DF.namedNode('g'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object' ]), [
                [ DF.namedNode('o') ],
              ]);
            });

            it('should return distinct objects and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'graph' ]), [
                [ DF.namedNode('o'), DF.namedNode('g') ],
              ]);
            });

            it('should return distinct objects and predicates and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'predicate', 'graph' ]), [
                [ DF.namedNode('o'), DF.namedNode('p'), DF.namedNode('g') ],
              ]);
            });

            it('should return distinct objects and graphs and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'graph', 'predicate' ]), [
                [ DF.namedNode('o'), DF.namedNode('g'), DF.namedNode('p') ],
              ]);
            });

            it('should return distinct objects and predicates and graphs and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'predicate', 'graph', 'subject' ]), [
                [ DF.namedNode('o'), DF.namedNode('p'), DF.namedNode('g'), DF.namedNode('s') ],
              ]);
            });

            it('should return distinct graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph' ]), [
                [ DF.namedNode('g') ],
              ]);
            });

            it('should return distinct graphs and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object' ]), [
                [ DF.namedNode('g'), DF.namedNode('o') ],
              ]);
            });

            it('should return distinct graphs and objects and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object', 'subject' ]), [
                [ DF.namedNode('g'), DF.namedNode('o'), DF.namedNode('s') ],
              ]);
            });

            it('should return distinct graphs and objects and subjects and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object', 'subject', 'predicate' ]), [
                [ DF.namedNode('g'), DF.namedNode('o'), DF.namedNode('s'), DF.namedNode('p') ],
              ]);
            });
          });

          describe('countDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expect(store.countDistinctTerms([ 'subject' ])).toBe(1);
            });

            it('should return distinct subjects and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'object' ])).toBe(1);
            });

            it('should return distinct subjects and objects and predicates', async() => {
              expect(store.countDistinctTerms([ 'subject', 'object', 'predicate' ])).toBe(1);
            });

            it('should return distinct subjects and predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'predicate', 'object' ])).toBe(1);
            });

            it('should return distinct subjects and graphs and predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'graph', 'predicate', 'object' ])).toBe(1);
            });

            it('should return distinct predicates', async() => {
              expect(store.countDistinctTerms([ 'predicate' ])).toBe(1);
            });

            it('should return distinct predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object' ])).toBe(1);
            });

            it('should return distinct predicates and objects and subjects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object', 'subject' ])).toBe(1);
            });

            it('should return distinct predicates and subjects and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'subject', 'object' ])).toBe(1);
            });

            it('should return distinct predicates and objects and subjects and graphs', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object', 'subject', 'graph' ])).toBe(1);
            });

            it('should return distinct predicates and subjects and graphs and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'subject', 'graph', 'object' ])).toBe(1);
            });

            it('should return distinct objects', async() => {
              expect(store.countDistinctTerms([ 'object' ])).toBe(1);
            });

            it('should return distinct objects and graphs', async() => {
              expect(store.countDistinctTerms([ 'object', 'graph' ])).toBe(1);
            });

            it('should return distinct objects and predicates and graphs', async() => {
              expect(store.countDistinctTerms([ 'object', 'predicate', 'graph' ])).toBe(1);
            });

            it('should return distinct objects and graphs and predicates', async() => {
              expect(store.countDistinctTerms([ 'object', 'graph', 'predicate' ])).toBe(1);
            });

            it('should return distinct objects and predicates and graphs and subjects', async() => {
              expect(store.countDistinctTerms([ 'object', 'predicate', 'graph', 'subject' ])).toBe(1);
            });

            it('should return distinct graphs', async() => {
              expect(store.countDistinctTerms([ 'graph' ])).toBe(1);
            });

            it('should return distinct graphs and objects', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object' ])).toBe(1);
            });

            it('should return distinct graphs and objects and subjects', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object', 'subject' ])).toBe(1);
            });

            it('should return distinct graphs and objects and subjects and predicates', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object', 'subject', 'predicate' ])).toBe(1);
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
              expect(store.size).toBe(4);
            });
          });

          describe('find', () => {
            it('should produce all results for a variable pattern', async() => {
              await expect(arrayifyStream(store.match())).resolves.toBeRdfIsomorphic([
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
              await expect(arrayifyStream(store.match(
                DF.namedNode('s1'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s1'),
                  DF.namedNode('p1'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ),
              ]);

              await expect(arrayifyStream(store.match(
                DF.namedNode('s1'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g1'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s1'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g1'),
                ),
              ]);

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p1'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ),
              ]);

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g2'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g2'),
                ),
              ]);
            });

            it('should produce results for partial matches', async() => {
              await expect(arrayifyStream(store.match(
                DF.namedNode('s1'),
              ))).resolves.toEqual([
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

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
              ))).resolves.toEqual([
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

              await expect(arrayifyStream(store.match(
                undefined,
                DF.namedNode('p1'),
              ))).resolves.toEqual([
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

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
                DF.namedNode('p1'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p1'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ),
              ]);

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
                undefined,
                undefined,
                DF.namedNode('g2'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g2'),
                ),
              ]);

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
                DF.variable('v1'),
                DF.variable('v2'),
                DF.namedNode('g2'),
              ))).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g2'),
                ),
              ]);

              await expect(arrayifyStream(store.match(
                DF.namedNode('s2'),
                undefined,
                undefined,
                DF.namedNode('g3'),
              ))).resolves.toEqual([]);
            });
          });

          describe('matchBindings', () => {
            it('should produce all results for a variable pattern', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('s1'),
                  p: DF.namedNode('p1'),
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
                BF.fromRecord({
                  s: DF.namedNode('s1'),
                  p: DF.namedNode('p2'),
                  o: DF.namedNode('o2'),
                  g: DF.namedNode('g1'),
                }),
                BF.fromRecord({
                  s: DF.namedNode('s2'),
                  p: DF.namedNode('p1'),
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
                BF.fromRecord({
                  s: DF.namedNode('s2'),
                  p: DF.namedNode('p2'),
                  o: DF.namedNode('o2'),
                  g: DF.namedNode('g2'),
                }),
              ], true);
            });

            it('should produce 1 result for exact matches', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s1'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({}),
              ]);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s1'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g1'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({}),
              ]);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({}),
              ]);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g2'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({}),
              ]);
            });

            it('should produce results for partial matches', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s1'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  p: DF.namedNode('p1'),
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
                BF.fromRecord({
                  p: DF.namedNode('p2'),
                  o: DF.namedNode('o2'),
                  g: DF.namedNode('g1'),
                }),
              ], true);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  p: DF.namedNode('p1'),
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
                BF.fromRecord({
                  p: DF.namedNode('p2'),
                  o: DF.namedNode('o2'),
                  g: DF.namedNode('g2'),
                }),
              ], true);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('p1'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('s1'),
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
                BF.fromRecord({
                  s: DF.namedNode('s2'),
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
              ], true);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.namedNode('p1'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  o: DF.namedNode('o1'),
                  g: DF.namedNode('g1'),
                }),
              ], true);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.variable('p'),
                DF.variable('o'),
                DF.namedNode('g2'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  p: DF.namedNode('p2'),
                  o: DF.namedNode('o2'),
                }),
              ], true);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.variable('v1'),
                DF.variable('v2'),
                DF.namedNode('g2'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  v1: DF.namedNode('p2'),
                  v2: DF.namedNode('o2'),
                }),
              ], true);

              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('s2'),
                DF.variable('p'),
                DF.variable('o'),
                DF.namedNode('g3'),
              ))).resolves.toEqualBindingsArray([], true);
            });
          });

          describe('countQuads', () => {
            it('should produce all results for a variable pattern', async() => {
              expect(store.countQuads()).toBe(4);
            });

            it('should produce 1 result for exact matches', async() => {
              expect(store.countQuads(
                DF.namedNode('s1'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              )).toBe(1);

              expect(store.countQuads(
                DF.namedNode('s1'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g1'),
              )).toBe(1);

              expect(store.countQuads(
                DF.namedNode('s2'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              )).toBe(1);

              expect(store.countQuads(
                DF.namedNode('s2'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g2'),
              )).toBe(1);
            });

            it('should produce results for partial matches', async() => {
              expect(store.countQuads(
                DF.namedNode('s1'),
              )).toBe(2);

              expect(store.countQuads(
                DF.namedNode('s2'),
              )).toBe(2);

              expect(store.countQuads(
                undefined,
                DF.namedNode('p1'),
              )).toBe(2);

              expect(store.countQuads(
                DF.namedNode('s2'),
                DF.namedNode('p1'),
              )).toBe(1);

              expect(store.countQuads(
                DF.namedNode('s2'),
                undefined,
                undefined,
                DF.namedNode('g2'),
              )).toBe(1);

              expect(store.countQuads(
                DF.namedNode('s2'),
                DF.variable('v1'),
                DF.variable('v2'),
                DF.namedNode('g2'),
              )).toBe(1);

              expect(store.countQuads(
                DF.namedNode('s2'),
                undefined,
                undefined,
                DF.namedNode('g3'),
              )).toBe(0);
            });
          });

          describe('removeQuad', () => {
            it('should not remove a non-existing quad', async() => {
              expect(store.removeQuad(DF.quad(
                DF.namedNode('s1'),
                DF.namedNode('s1'),
                DF.namedNode('s1'),
                DF.namedNode('s1'),
              ))).toBe(false);

              // Store should not be changed
              expect(store.size).toBe(4);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(4);
            });

            it('should not remove a non-existing quad that is not encoded', async() => {
              expect(store.removeQuad(DF.quad(
                DF.namedNode('s-non'),
                DF.namedNode('s-non'),
                DF.namedNode('s-non'),
                DF.namedNode('s-non'),
              ))).toBe(false);

              // Store should not be changed
              expect(store.size).toBe(4);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(4);
            });

            it('should remove an existing quad', async() => {
              expect(store.removeQuad(DF.quad(
                DF.namedNode('s2'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g2'),
              ))).toBe(true);

              // Store should be changed
              expect(store.size).toBe(3);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(3);

              expect(store.removeQuad(DF.quad(
                DF.namedNode('s2'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ))).toBe(true);

              // Store should be changed
              expect(store.size).toBe(2);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(2);

              expect(store.removeQuad(DF.quad(
                DF.namedNode('s1'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g1'),
              ))).toBe(true);

              // Store should be changed
              expect(store.size).toBe(1);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(1);

              expect(store.removeQuad(DF.quad(
                DF.namedNode('s1'),
                DF.namedNode('p1'),
                DF.namedNode('o1'),
                DF.namedNode('g1'),
              ))).toBe(true);

              // Store should be changed
              expect(store.size).toBe(0);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(0);
            });

            it('should remove an existing quad just once', async() => {
              expect(store.removeQuad(DF.quad(
                DF.namedNode('s2'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g2'),
              ))).toBe(true);

              expect(store.removeQuad(DF.quad(
                DF.namedNode('s2'),
                DF.namedNode('p2'),
                DF.namedNode('o2'),
                DF.namedNode('g2'),
              ))).toBe(false);

              // Store should be changed
              expect(store.size).toBe(3);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(3);
            });
          });

          describe('remove', () => {
            it('should not remove quads for an empty stream', async() => {
              await new Promise(resolve => store.remove(streamifyArray([])).on('end', resolve));

              // Store should not be changed
              expect(store.size).toBe(4);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(4);
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
              expect(store.size).toBe(2);
              await expect(arrayifyStream(store.match())).resolves.toEqual([
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
              expect(store.size).toBe(4);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(4);
            });

            it('should remove quads for matching quads', async() => {
              await new Promise(resolve => store.removeMatches(
                DF.namedNode('s1'),
                undefined,
                undefined,
                DF.namedNode('g1'),
              ).on('end', resolve));

              // Store should not be changed
              expect(store.size).toBe(2);
              await expect(arrayifyStream(store.match())).resolves.toEqual([
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
              expect(store.size).toBe(4);
              await expect((arrayifyStream(store.match()))).resolves.toHaveLength(4);
            });

            it('should remove quads for the matching graph', async() => {
              await new Promise(resolve => store.deleteGraph(DF.namedNode('g1')).on('end', resolve));

              // Store should not be changed
              expect(store.size).toBe(1);
              await expect(arrayifyStream(store.match())).resolves.toEqual([
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
              expect(store.size).toBe(1);
              await expect(arrayifyStream(store.match())).resolves.toEqual([
                DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g2'),
                ),
              ]);
            });
          });

          describe('getDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject' ]), [
                [ DF.namedNode('s1') ],
                [ DF.namedNode('s2') ],
              ]);
            });

            it('should return distinct subjects and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'object' ]), [
                [ DF.namedNode('s1'), DF.namedNode('o1') ],
                [ DF.namedNode('s2'), DF.namedNode('o1') ],
                [ DF.namedNode('s1'), DF.namedNode('o2') ],
                [ DF.namedNode('s2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct subjects and objects and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'object', 'predicate' ]), [
                [ DF.namedNode('s1'), DF.namedNode('o1'), DF.namedNode('p1') ],
                [ DF.namedNode('s2'), DF.namedNode('o1'), DF.namedNode('p1') ],
                [ DF.namedNode('s1'), DF.namedNode('o2'), DF.namedNode('p2') ],
                [ DF.namedNode('s2'), DF.namedNode('o2'), DF.namedNode('p2') ],
              ]);
            });

            it('should return distinct subjects and predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'predicate', 'object' ]), [
                [ DF.namedNode('s1'), DF.namedNode('p1'), DF.namedNode('o1') ],
                [ DF.namedNode('s2'), DF.namedNode('p1'), DF.namedNode('o1') ],
                [ DF.namedNode('s1'), DF.namedNode('p2'), DF.namedNode('o2') ],
                [ DF.namedNode('s2'), DF.namedNode('p2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct subjects and graphs and predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'subject', 'graph', 'predicate', 'object' ]), [
                [ DF.namedNode('s1'), DF.namedNode('g1'), DF.namedNode('p1'), DF.namedNode('o1') ],
                [ DF.namedNode('s2'), DF.namedNode('g1'), DF.namedNode('p1'), DF.namedNode('o1') ],
                [ DF.namedNode('s1'), DF.namedNode('g1'), DF.namedNode('p2'), DF.namedNode('o2') ],
                [ DF.namedNode('s2'), DF.namedNode('g2'), DF.namedNode('p2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate' ]), [
                [ DF.namedNode('p1') ],
                [ DF.namedNode('p2') ],
              ]);
            });

            it('should return distinct predicates and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object' ]), [
                [ DF.namedNode('p1'), DF.namedNode('o1') ],
                [ DF.namedNode('p2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct predicates and objects and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object', 'subject' ]), [
                [ DF.namedNode('p1'), DF.namedNode('o1'), DF.namedNode('s1') ],
                [ DF.namedNode('p2'), DF.namedNode('o2'), DF.namedNode('s1') ],
                [ DF.namedNode('p1'), DF.namedNode('o1'), DF.namedNode('s2') ],
                [ DF.namedNode('p2'), DF.namedNode('o2'), DF.namedNode('s2') ],
              ]);
            });

            it('should return distinct predicates and subjects and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'subject', 'object' ]), [
                [ DF.namedNode('p1'), DF.namedNode('s1'), DF.namedNode('o1') ],
                [ DF.namedNode('p2'), DF.namedNode('s1'), DF.namedNode('o2') ],
                [ DF.namedNode('p1'), DF.namedNode('s2'), DF.namedNode('o1') ],
                [ DF.namedNode('p2'), DF.namedNode('s2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct predicates and objects and subjects and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'object', 'subject', 'graph' ]), [
                [ DF.namedNode('p1'), DF.namedNode('o1'), DF.namedNode('s1'), DF.namedNode('g1') ],
                [ DF.namedNode('p2'), DF.namedNode('o2'), DF.namedNode('s1'), DF.namedNode('g1') ],
                [ DF.namedNode('p1'), DF.namedNode('o1'), DF.namedNode('s2'), DF.namedNode('g1') ],
                [ DF.namedNode('p2'), DF.namedNode('o2'), DF.namedNode('s2'), DF.namedNode('g2') ],
              ]);
            });

            it('should return distinct predicates and subjects and graphs and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'predicate', 'subject', 'graph', 'object' ]), [
                [ DF.namedNode('p1'), DF.namedNode('s1'), DF.namedNode('g1'), DF.namedNode('o1') ],
                [ DF.namedNode('p2'), DF.namedNode('s1'), DF.namedNode('g1'), DF.namedNode('o2') ],
                [ DF.namedNode('p1'), DF.namedNode('s2'), DF.namedNode('g1'), DF.namedNode('o1') ],
                [ DF.namedNode('p2'), DF.namedNode('s2'), DF.namedNode('g2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object' ]), [
                [ DF.namedNode('o1') ],
                [ DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct objects and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'graph' ]), [
                [ DF.namedNode('o1'), DF.namedNode('g1') ],
                [ DF.namedNode('o2'), DF.namedNode('g1') ],
                [ DF.namedNode('o2'), DF.namedNode('g2') ],
              ]);
            });

            it('should return distinct objects and predicates and graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'predicate', 'graph' ]), [
                [ DF.namedNode('o1'), DF.namedNode('p1'), DF.namedNode('g1') ],
                [ DF.namedNode('o2'), DF.namedNode('p2'), DF.namedNode('g1') ],
                [ DF.namedNode('o2'), DF.namedNode('p2'), DF.namedNode('g2') ],
              ]);
            });

            it('should return distinct objects and graphs and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'graph', 'predicate' ]), [
                [ DF.namedNode('o1'), DF.namedNode('g1'), DF.namedNode('p1') ],
                [ DF.namedNode('o2'), DF.namedNode('g1'), DF.namedNode('p2') ],
                [ DF.namedNode('o2'), DF.namedNode('g2'), DF.namedNode('p2') ],
              ]);
            });

            it('should return distinct objects and predicates and graphs and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'object', 'predicate', 'graph', 'subject' ]), [
                [ DF.namedNode('o1'), DF.namedNode('p1'), DF.namedNode('g1'), DF.namedNode('s1') ],
                [ DF.namedNode('o1'), DF.namedNode('p1'), DF.namedNode('g1'), DF.namedNode('s2') ],
                [ DF.namedNode('o2'), DF.namedNode('p2'), DF.namedNode('g1'), DF.namedNode('s1') ],
                [ DF.namedNode('o2'), DF.namedNode('p2'), DF.namedNode('g2'), DF.namedNode('s2') ],
              ]);
            });

            it('should return distinct graphs', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph' ]), [
                [ DF.namedNode('g1') ],
                [ DF.namedNode('g2') ],
              ]);
            });

            it('should return distinct graphs and objects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object' ]), [
                [ DF.namedNode('g1'), DF.namedNode('o1') ],
                [ DF.namedNode('g1'), DF.namedNode('o2') ],
                [ DF.namedNode('g2'), DF.namedNode('o2') ],
              ]);
            });

            it('should return distinct graphs and objects and subjects', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object', 'subject' ]), [
                [ DF.namedNode('g1'), DF.namedNode('o1'), DF.namedNode('s1') ],
                [ DF.namedNode('g1'), DF.namedNode('o1'), DF.namedNode('s2') ],
                [ DF.namedNode('g1'), DF.namedNode('o2'), DF.namedNode('s1') ],
                [ DF.namedNode('g2'), DF.namedNode('o2'), DF.namedNode('s2') ],
              ]);
            });

            it('should return distinct graphs and objects and subjects and predicates', async() => {
              expectToEqualTerms(store.getDistinctTerms([ 'graph', 'object', 'subject', 'predicate' ]), [
                [ DF.namedNode('g1'), DF.namedNode('o1'), DF.namedNode('s1'), DF.namedNode('p1') ],
                [ DF.namedNode('g1'), DF.namedNode('o1'), DF.namedNode('s2'), DF.namedNode('p1') ],
                [ DF.namedNode('g1'), DF.namedNode('o2'), DF.namedNode('s1'), DF.namedNode('p2') ],
                [ DF.namedNode('g2'), DF.namedNode('o2'), DF.namedNode('s2'), DF.namedNode('p2') ],
              ]);
            });
          });

          describe('matchDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expectToEqualTerms(await store.matchDistinctTerms([ 'subject' ]).toArray(), [
                [ DF.namedNode('s1') ],
                [ DF.namedNode('s2') ],
              ]);
            });
          });

          describe('countDistinctTerms', () => {
            it('should return distinct subjects', async() => {
              expect(store.countDistinctTerms([ 'subject' ])).toBe(2);
            });

            it('should return distinct subjects and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'object' ])).toBe(4);
            });

            it('should return distinct subjects and objects and predicates', async() => {
              expect(store.countDistinctTerms([ 'subject', 'object', 'predicate' ])).toBe(4);
            });

            it('should return distinct subjects and predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'predicate', 'object' ])).toBe(4);
            });

            it('should return distinct subjects and graphs and predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'subject', 'graph', 'predicate', 'object' ])).toBe(4);
            });

            it('should return distinct predicates', async() => {
              expect(store.countDistinctTerms([ 'predicate' ])).toBe(2);
            });

            it('should return distinct predicates and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object' ])).toBe(2);
            });

            it('should return distinct predicates and objects and subjects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object', 'subject' ])).toBe(4);
            });

            it('should return distinct predicates and subjects and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'subject', 'object' ])).toBe(4);
            });

            it('should return distinct predicates and objects and subjects and graphs', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'object', 'subject', 'graph' ])).toBe(4);
            });

            it('should return distinct predicates and subjects and graphs and objects', async() => {
              expect(store.countDistinctTerms([ 'predicate', 'subject', 'graph', 'object' ])).toBe(4);
            });

            it('should return distinct objects', async() => {
              expect(store.countDistinctTerms([ 'object' ])).toBe(2);
            });

            it('should return distinct objects and graphs', async() => {
              expect(store.countDistinctTerms([ 'object', 'graph' ])).toBe(3);
            });

            it('should return distinct objects and predicates and graphs', async() => {
              expect(store.countDistinctTerms([ 'object', 'predicate', 'graph' ])).toBe(3);
            });

            it('should return distinct objects and graphs and predicates', async() => {
              expect(store.countDistinctTerms([ 'object', 'graph', 'predicate' ])).toBe(3);
            });

            it('should return distinct objects and predicates and graphs and subjects', async() => {
              expect(store.countDistinctTerms([ 'object', 'predicate', 'graph', 'subject' ])).toBe(4);
            });

            it('should return distinct graphs', async() => {
              expect(store.countDistinctTerms([ 'graph' ])).toBe(2);
            });

            it('should return distinct graphs and objects', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object' ])).toBe(3);
            });

            it('should return distinct graphs and objects and subjects', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object', 'subject' ])).toBe(4);
            });

            it('should return distinct graphs and objects and subjects and predicates', async() => {
              expect(store.countDistinctTerms([ 'graph', 'object', 'subject', 'predicate' ])).toBe(4);
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
                expect(dataset.size).toBe(4);
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

                expect(dataset.size).toBe(6);
                expect(store.size).toBe(6);
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

                expect(dataset.size).toBe(2);
                expect(store.size).toBe(2);
              });
            });

            describe('has', () => {
              it('to return true for contained quads', () => {
                expect(dataset.has(DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p1'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ))).toBe(true);
                expect(dataset.has(DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g2'),
                ))).toBe(true);
                expect(dataset.has(DF.quad(
                  DF.namedNode('s3'),
                  DF.namedNode('p3'),
                  DF.namedNode('o3'),
                  DF.namedNode('g3'),
                ))).toBe(false);
              });
            });

            describe('match', () => {
              it('to return a new dataset for matching quads', () => {
                const dataset2 = dataset.match(undefined, undefined, undefined, DF.namedNode('g1'));

                expect(dataset2).not.toBe(dataset);
                expect(dataset2.store).not.toBe(dataset.store);
                expect(dataset2.store.dictionary).toBe(dataset.store.dictionary);
                expect(dataset2.size).toBe(3);

                expect(dataset2.has(DF.quad(
                  DF.namedNode('s1'),
                  DF.namedNode('p1'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ))).toBe(true);
                expect(dataset2.has(DF.quad(
                  DF.namedNode('s1'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g1'),
                ))).toBe(true);
                expect(dataset2.has(DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p1'),
                  DF.namedNode('o1'),
                  DF.namedNode('g1'),
                ))).toBe(true);
                expect(dataset2.has(DF.quad(
                  DF.namedNode('s2'),
                  DF.namedNode('p2'),
                  DF.namedNode('o2'),
                  DF.namedNode('g2'),
                ))).toBe(false);
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

        describe('that has reused terms across triple positions', () => {
          beforeEach(async() => {
            const ret = store.import(streamifyArray([
              DF.quad(
                DF.namedNode('t1'),
                DF.namedNode('t1'),
                DF.namedNode('t1'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t1'),
                DF.namedNode('t1'),
                DF.namedNode('t2'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t1'),
                DF.namedNode('t2'),
                DF.namedNode('t1'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t1'),
                DF.namedNode('t2'),
                DF.namedNode('t2'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t2'),
                DF.namedNode('t1'),
                DF.namedNode('t1'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t2'),
                DF.namedNode('t1'),
                DF.namedNode('t2'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t2'),
                DF.namedNode('t2'),
                DF.namedNode('t1'),
                DF.namedNode('t1'),
              ),
              DF.quad(
                DF.namedNode('t2'),
                DF.namedNode('t2'),
                DF.namedNode('t2'),
                DF.namedNode('t1'),
              ),
            ]));
            await new Promise(resolve => ret.on('end', resolve));
          });

          describe('matchBindings', () => {
            it('should match a subset', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.namedNode('t1'),
                DF.variable('p'),
                DF.variable('o'),
                DF.variable('g'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  p: DF.namedNode('t1'),
                  o: DF.namedNode('t1'),
                  g: DF.namedNode('t1'),
                }),
                BF.fromRecord({
                  p: DF.namedNode('t1'),
                  o: DF.namedNode('t2'),
                  g: DF.namedNode('t1'),
                }),
                BF.fromRecord({
                  p: DF.namedNode('t2'),
                  o: DF.namedNode('t1'),
                  g: DF.namedNode('t1'),
                }),
                BF.fromRecord({
                  p: DF.namedNode('t2'),
                  o: DF.namedNode('t2'),
                  g: DF.namedNode('t1'),
                }),
              ], true);
            });

            it('should for all reused variables', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('t'),
                DF.variable('t'),
                DF.variable('t'),
                DF.variable('t'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  t: DF.namedNode('t1'),
                }),
              ], true);
            });

            it('should for all some reused variables', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('ta'),
                DF.variable('tb'),
                DF.variable('ta'),
                DF.variable('tb'),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  ta: DF.namedNode('t1'),
                  tb: DF.namedNode('t1'),
                }),
                BF.fromRecord({
                  ta: DF.namedNode('t2'),
                  tb: DF.namedNode('t1'),
                }),
              ], true);
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
              DF.quad(
                DF.namedNode('ex:carol'),
                DF.namedNode('ex:thinks'),
                DF.quad(
                  DF.namedNode('ex:carol'),
                  DF.namedNode('ex:name'),
                  DF.literal('"Carol"'),
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
              )).toBe(2);
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

          describe('matchBindings', () => {
            it('should produce results for a top-level pattern', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('ex:says'),
                DF.variable('o'),
                DF.defaultGraph(),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('ex:alice'),
                  o: DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.literal('"Bob"'),
                  ),
                }),
                BF.fromRecord({
                  s: DF.namedNode('ex:carol'),
                  o: DF.quad(
                    DF.namedNode('ex:bob'),
                    DF.namedNode('ex:name'),
                    DF.literal('"NotBob"'),
                  ),
                }),
              ], true);
            });

            it('should produce results for a quoted triple', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('ex:says'),
                DF.quad(
                  DF.namedNode('ex:bob'),
                  DF.namedNode('ex:name'),
                  DF.literal('"Bob"'),
                ),
                DF.defaultGraph(),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('ex:alice'),
                }),
              ]);
            });

            it('should produce results for a quoted object variable', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('ex:says'),
                DF.quad(
                  DF.namedNode('ex:bob'),
                  DF.namedNode('ex:name'),
                  DF.variable('name'),
                ),
                DF.defaultGraph(),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('ex:alice'),
                  name: DF.literal('"Bob"'),
                }),
                BF.fromRecord({
                  s: DF.namedNode('ex:carol'),
                  name: DF.literal('"NotBob"'),
                }),
              ]);
            });

            it('should produce results for a quoted predicate variable', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('ex:says'),
                DF.quad(
                  DF.namedNode('ex:bob'),
                  DF.variable('name'),
                  DF.literal('"Bob"'),
                ),
                DF.defaultGraph(),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('ex:alice'),
                  name: DF.namedNode('ex:name'),
                }),
              ]);
            });

            it('should produce results for a quoted variable with partial match', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.namedNode('ex:says'),
                DF.quad(
                  DF.variable('person'),
                  DF.namedNode('ex:name'),
                  DF.literal('"Bob"'),
                ),
                DF.defaultGraph(),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('ex:alice'),
                  person: DF.namedNode('ex:bob'),
                }),
              ]);
            });

            it('should produce results for reused variables in quoted triple', async() => {
              await expect(arrayifyStream(store.matchBindings(
                BF,
                DF.variable('s'),
                DF.variable('p'),
                DF.quad(
                  DF.variable('s'),
                  DF.namedNode('ex:name'),
                  DF.variable('name'),
                ),
                DF.defaultGraph(),
              ))).resolves.toEqualBindingsArray([
                BF.fromRecord({
                  s: DF.namedNode('ex:carol'),
                  p: DF.namedNode('ex:thinks'),
                  name: DF.literal('"Carol"'),
                }),
              ]);
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
      expect((<any> store).indexNodes).toBeUndefined();
    });

    it('countNodes should throw', () => {
      expect(() => store.countNodes(DF.namedNode('g')))
        .toThrow('Nodes can only be read when the store was constructed');
    });

    it('readNodes should throw', () => {
      expect(() => [ ...store.readNodes(DF.namedNode('g')) ])
        .toThrow('Nodes can only be read when the store was constructed');
    });

    it('getNodes should throw', () => {
      expect(() => store.getNodes(DF.namedNode('g')))
        .toThrow('Nodes can only be read when the store was constructed');
    });

    it('matchNodes should throw', async() => {
      expect(() => store.matchNodes(DF.namedNode('g')))
        .toThrow('Nodes can only be read when the store was constructed');
    });
  });

  describe('createDefault with nodes: true', () => {
    beforeEach(async() => {
      store = RdfStore.createDefault(true);
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
          DF.namedNode('o1'),
          DF.namedNode('g1'),
        ),
        DF.quad(
          DF.namedNode('s2'),
          DF.namedNode('p2'),
          DF.namedNode('o2'),
          DF.namedNode('g2'),
        ),
        DF.quad(
          DF.namedNode('s3'),
          DF.namedNode('p3'),
          DF.namedNode('o3'),
          DF.namedNode('g3'),
        ),
      ]));
      await new Promise(resolve => ret.on('end', resolve));
      store.removeQuad(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p1'),
        DF.namedNode('o1'),
        DF.namedNode('g1'),
      ));
      store.removeQuad(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
        DF.namedNode('g3'),
      ));
    });

    it('contains 3 indexes', () => {
      expect((<any> store).indexesWrapped).toHaveLength(3);
      expect((<any> store).indexNodes).toBeDefined();
    });

    it('countNodes should return 4 for variable g', () => {
      expect(store.countNodes(DF.variable('g'))).toBe(6);
    });

    it('countNodes should return 2 for an existing g', () => {
      expect(store.countNodes(DF.namedNode('g1'))).toBe(4);
    });

    it('countNodes should return 0 for a non-existing g', () => {
      expect(store.countNodes(DF.namedNode('gother'))).toBe(0);
    });

    it('readNodes should return all nodes for variable g', () => {
      expect([ ...store.readNodes(DF.variable('g')) ]).toEqual([
        [ DF.namedNode('g1'), DF.namedNode('s1') ],
        [ DF.namedNode('g1'), DF.namedNode('o1') ],
        [ DF.namedNode('g1'), DF.namedNode('o2') ],
        [ DF.namedNode('g1'), DF.namedNode('s2') ],
        [ DF.namedNode('g2'), DF.namedNode('s2') ],
        [ DF.namedNode('g2'), DF.namedNode('o2') ],
      ]);
    });

    it('readNodes should return all nodes for an existing g', () => {
      expect([ ...store.readNodes(DF.namedNode('g1')) ]).toEqual([
        [ DF.namedNode('g1'), DF.namedNode('s1') ],
        [ DF.namedNode('g1'), DF.namedNode('o1') ],
        [ DF.namedNode('g1'), DF.namedNode('o2') ],
        [ DF.namedNode('g1'), DF.namedNode('s2') ],
      ]);
    });

    it('readNodes should return all nodes for a non-existing g', () => {
      expect([ ...store.readNodes(DF.namedNode('gother')) ]).toEqual([]);
    });

    it('getNodes should return all nodes for variable g', () => {
      expect(store.getNodes(DF.variable('g'))).toEqual([
        [ DF.namedNode('g1'), DF.namedNode('s1') ],
        [ DF.namedNode('g1'), DF.namedNode('o1') ],
        [ DF.namedNode('g1'), DF.namedNode('o2') ],
        [ DF.namedNode('g1'), DF.namedNode('s2') ],
        [ DF.namedNode('g2'), DF.namedNode('s2') ],
        [ DF.namedNode('g2'), DF.namedNode('o2') ],
      ]);
    });

    it('matchNodes should return all nodes for variable g', async() => {
      await expect(store.matchNodes(DF.variable('g')).toArray()).resolves.toEqual([
        [ DF.namedNode('g1'), DF.namedNode('s1') ],
        [ DF.namedNode('g1'), DF.namedNode('o1') ],
        [ DF.namedNode('g1'), DF.namedNode('o2') ],
        [ DF.namedNode('g1'), DF.namedNode('s2') ],
        [ DF.namedNode('g2'), DF.namedNode('s2') ],
        [ DF.namedNode('g2'), DF.namedNode('o2') ],
      ]);
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
