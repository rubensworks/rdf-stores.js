import type { ITermDictionary } from '../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberMap } from '../lib/dictionary/TermDictionaryNumberMap';
import { TermDictionaryNumberRecord } from '../lib/dictionary/TermDictionaryNumberRecord';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuoted } from '../lib/dictionary/TermDictionaryQuoted';
import { TermDictionaryQuotedIndexed } from '../lib/dictionary/TermDictionaryQuotedIndexed';
import type { IRdfStoreIndex } from '../lib/index/IRdfStoreIndex';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMapQuoted } from '../lib/index/RdfStoreIndexNestedMapQuoted';
import { RdfStoreIndexNestedMapRecursive } from '../lib/index/RdfStoreIndexNestedMapRecursive';
import { RdfStoreIndexNestedMapRecursiveQuoted } from '../lib/index/RdfStoreIndexNestedMapRecursiveQuoted';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStoreIndexNestedRecordQuoted } from '../lib/index/RdfStoreIndexNestedRecordQuoted';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';

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
};

export const indexSupportsQuotedTriples: [ string, boolean ][] = [
  [ 'RdfStoreIndexNestedMap', false ],
  [ 'RdfStoreIndexNestedMapQuoted', true ],
  [ 'RdfStoreIndexNestedMapRecursive', false ],
  [ 'RdfStoreIndexNestedMapRecursiveQuoted', true ],
  [ 'RdfStoreIndexNestedRecord', false ],
  [ 'RdfStoreIndexNestedRecordQuoted', true ],
];

export const dictClazzToInstance: Record<string, () => ITermDictionary<number>> = {
  TermDictionaryNumberMap: () => new TermDictionaryNumberMap(),
  TermDictionaryNumberRecord: () => new TermDictionaryNumberRecord(),
  TermDictionaryNumberRecordFullTerms: () => new TermDictionaryNumberRecordFullTerms(),
  TermDictionaryQuoted: () => new TermDictionaryQuoted(
    new TermDictionaryNumberRecordFullTerms(),
    new TermDictionaryNumberRecordFullTerms(),
  ),
  TermDictionaryQuotedIndexed: () => new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms()),
};
