import type * as RDF from '@rdfjs/types';
import { termToString } from 'rdf-string';
import type { ITermDictionary } from '../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberMap } from '../lib/dictionary/TermDictionaryNumberMap';
import { TermDictionaryNumberRecord } from '../lib/dictionary/TermDictionaryNumberRecord';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuoted } from '../lib/dictionary/TermDictionaryQuoted';
import { TermDictionaryQuotedIndexed } from '../lib/dictionary/TermDictionaryQuotedIndexed';
import { TermDictionaryQuotedReferential } from '../lib/dictionary/TermDictionaryQuotedReferential';
import type { IRdfStoreIndex } from '../lib/index/IRdfStoreIndex';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMapQuoted } from '../lib/index/RdfStoreIndexNestedMapQuoted';
import { RdfStoreIndexNestedMapRecursive } from '../lib/index/RdfStoreIndexNestedMapRecursive';
import { RdfStoreIndexNestedMapRecursiveQuoted } from '../lib/index/RdfStoreIndexNestedMapRecursiveQuoted';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStoreIndexNestedRecordQuoted } from '../lib/index/RdfStoreIndexNestedRecordQuoted';
import { RdfStoreIndexSortedBlocks } from '../lib/index/RdfStoreIndexSortedBlocks';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';
import type { EncodedQuadTerms } from '../lib/PatternTerm';

/**
 * A sorted-blocks index that compresses its leaves after every change, into leaves of two quads,
 * so that every read decodes leaves, and every change decompresses them first.
 */
export class RdfStoreIndexSortedBlocksCompressing extends RdfStoreIndexSortedBlocks {
  public constructor(options: IRdfStoreOptions<number>) {
    super(options, { compressedLeafCapacity: 2 });
  }

  public override set(key: EncodedQuadTerms<number>, value: boolean): boolean {
    const result = super.set(key, value);
    this.compress();
    return result;
  }

  public override remove(key: EncodedQuadTerms<number>): boolean {
    const result = super.remove(key);
    this.compress();
    return result;
  }

  public override setAll(keys: Int32Array, count: number): number {
    const result = super.setAll(keys, count);
    this.compress();
    return result;
  }

  public override setAllSorted(sorted: Int32Array, count: number): number {
    const result = super.setAllSorted(sorted, count);
    this.compress();
    return result;
  }
}

export const indexClazzToInstance: Record<string, (subOptions: IRdfStoreOptions<number>) =>
IRdfStoreIndex<number, boolean>> = {
  RdfStoreIndexNestedMap:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMap<number, boolean>(subOptions),
  RdfStoreIndexNestedMapQuoted:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMapQuoted<number, boolean>(subOptions),
  RdfStoreIndexNestedMapRecursive:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMapRecursive<number, boolean>(subOptions),
  RdfStoreIndexNestedMapRecursiveQuoted:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMapRecursiveQuoted<number, boolean>(subOptions),
  RdfStoreIndexNestedRecord:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedRecord<number, boolean>(subOptions),
  RdfStoreIndexNestedRecordQuoted:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedRecordQuoted<number, boolean>(subOptions),
  RdfStoreIndexSortedBlocks:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexSortedBlocks(subOptions),
  RdfStoreIndexSortedBlocksCompressing:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexSortedBlocksCompressing(subOptions),
};

export const indexSupportsQuotedTriples: [ string, boolean ][] = [
  [ 'RdfStoreIndexNestedMap', false ],
  [ 'RdfStoreIndexNestedMapQuoted', true ],
  [ 'RdfStoreIndexNestedMapRecursive', false ],
  [ 'RdfStoreIndexNestedMapRecursiveQuoted', true ],
  [ 'RdfStoreIndexNestedRecord', false ],
  [ 'RdfStoreIndexNestedRecordQuoted', true ],
  [ 'RdfStoreIndexSortedBlocks', true ],
  [ 'RdfStoreIndexSortedBlocksCompressing', true ],
];

export const dictClazzToInstance: Record<string, () => ITermDictionary<number>> = {
  TermDictionaryNumberMap: () => new TermDictionaryNumberMap(),
  TermDictionaryNumberRecord: () => new TermDictionaryNumberRecord(),
  TermDictionaryNumberRecordFullTerms: () => new TermDictionaryNumberRecordFullTerms(),
  TermDictionaryQuoted: () => new TermDictionaryQuoted(
    new TermDictionaryNumberRecordFullTerms(),
    new TermDictionaryNumberRecordFullTerms(),
  ),
  TermDictionaryQuotedReferential: () => new TermDictionaryQuotedReferential(new TermDictionaryNumberRecordFullTerms()),
  TermDictionaryQuotedIndexed: () => new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms()),
};

export function expectToEqualTerms(terms1: RDF.Term[][], terms2: RDF.Term[][]) {
  const compareFn = (left: RDF.Term[], right: RDF.Term[]) => {
    return left
      .map(element => termToString(element))
      .join(',')
      .localeCompare(right.map(element => termToString(element)).join(','));
  };
  expect(terms1.sort(compareFn)).toEqual(terms2.sort(compareFn));
}

/**
 * Compare two lists of encoded quads regardless of their order,
 * since ordered indexes produce them in term order rather than in insertion order.
 * @param quads1 Encoded quads.
 * @param quads2 Encoded quads.
 */
export function expectToEqualEncoded(quads1: number[][], quads2: number[][]) {
  const compareFn = (left: number[], right: number[]) => left.join(',').localeCompare(right.join(','));
  expect([ ...quads1 ].sort(compareFn)).toEqual([ ...quads2 ].sort(compareFn));
}
