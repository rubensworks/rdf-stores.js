import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import type { QuadPatternTerms, QuadTerms, EncodedQuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested records.
 */
export class RdfStoreIndexNestedRecord<E extends number> implements IRdfStoreIndex<E> {
  private readonly dictionary: ITermDictionary<E>;
  private readonly nestedRecords: NestedRecordActual<E>;

  public constructor(options: IRdfStoreOptions<E>) {
    this.dictionary = options.dictionary;
    this.nestedRecords = <any>{};
  }

  public add(terms: EncodedQuadTerms<E>): void {
    const map0 = this.nestedRecords;
    const map1 = map0[terms[0]] || (map0[terms[0]] = <any>{});
    const map2 = map1[terms[1]] || (map1[terms[1]] = <any>{});
    const map3 = map2[terms[2]] || (map2[terms[2]] = <any>{});
    map3[terms[3]] = true;
  }

  public * find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    const ids: (E | undefined)[] = terms.map(term => term ? this.dictionary.encode(term) : term);
    const id0 = ids[0];
    const id1 = ids[1];
    const id2 = ids[2];
    const id3 = ids[3];

    let partialQuad0: RDF.Term;
    let partialQuad1: RDF.Term;
    let partialQuad2: RDF.Term;
    let partialQuad3: RDF.Term;

    let map1: NestedRecordActual<E>;
    let map2: NestedRecordActual<E>;
    let map3: NestedRecordActual<E>;
    let map4: NestedRecordActual<E>;

    const map0: NestedRecordActual<E> = this.nestedRecords;
    const map0Keys = id0 !== undefined ? (id0 in map0 ? [ id0 ] : []) : Object.keys(map0);
    for (const key1 of map0Keys) {
      map1 = map0[<E>key1];
      partialQuad0 = terms[0] || this.dictionary.decode(<E>Number.parseInt(<string>key1, 10));
      const map1Keys = id1 !== undefined ? (id1 in map1 ? [ id1 ] : []) : Object.keys(map1);
      for (const key2 of map1Keys) {
        map2 = map1[<E>key2];
        partialQuad1 = terms[1] || this.dictionary.decode(<E>Number.parseInt(<string>key2, 10));
        const map2Keys = id2 !== undefined ? (id2 in map2 ? [ id2 ] : []) : Object.keys(map2);
        for (const key3 of map2Keys) {
          map3 = map2[<E>key3];
          partialQuad2 = terms[2] || this.dictionary.decode(<E>Number.parseInt(<string>key3, 10));
          const map3Keys = id3 !== undefined ? (id3 in map3 ? [ id3 ] : []) : Object.keys(map3);
          for (const key4 of map3Keys) {
            partialQuad3 = terms[3] || this.dictionary.decode(<E>Number.parseInt(<string>key4, 10));
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }
}

export type NestedRecord<E extends string | number | symbol> = NestedRecordActual<E> | true;
export type NestedRecordActual<E extends string | number | symbol> = Record<E, Record<E, Record<E, Record<E, any>>>>;
