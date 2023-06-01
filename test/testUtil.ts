import type { IRdfStoreIndex } from '../lib/index/IRdfStoreIndex';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMapQuoted } from '../lib/index/RdfStoreIndexNestedMapQuoted';
import { RdfStoreIndexNestedMapRecursive } from '../lib/index/RdfStoreIndexNestedMapRecursive';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStoreIndexNestedRecordQuoted } from '../lib/index/RdfStoreIndexNestedRecordQuoted';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';

export const clazzToInstance: Record<string, (subOptions: IRdfStoreOptions<number>) =>
IRdfStoreIndex<number, boolean>> = {
  RdfStoreIndexNestedMap:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMap<number, boolean>(subOptions),
  RdfStoreIndexNestedMapQuoted:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMapQuoted<number, boolean>(subOptions),
  RdfStoreIndexNestedMapRecursive:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedMapRecursive<number, boolean>(subOptions),
  RdfStoreIndexNestedRecord:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedRecord<number, boolean>(subOptions),
  RdfStoreIndexNestedRecordQuoted:
    (subOptions: IRdfStoreOptions<number>) => new RdfStoreIndexNestedRecordQuoted<number, boolean>(subOptions),
};
