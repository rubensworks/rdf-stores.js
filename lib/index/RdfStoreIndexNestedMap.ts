import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested Maps.
 */
export class RdfStoreIndexNestedMap<E> implements IRdfStoreIndex<E> {
  private readonly dictionary: ITermDictionary<E>;
  private readonly nestedMap: NestedMapActual<E>;

  public constructor(options: IRdfStoreOptions<E>) {
    this.dictionary = options.dictionary;
    this.nestedMap = new Map();
  }

  public add(terms: EncodedQuadTerms<E>): void {
    const map0 = this.nestedMap;
    let map1: NestedMapActual<E> = <any> map0.get(terms[0]);
    if (!map1) {
      map1 = new Map();
      map0.set(terms[0], map1);
    }
    let map2: NestedMapActual<E> = <any> map1.get(terms[1]);
    if (!map2) {
      map2 = new Map();
      map1.set(terms[1], map2);
    }
    let map3: NestedMapActual<E> = <any> map2.get(terms[2]);
    if (!map3) {
      map3 = new Map();
      map2.set(terms[2], map3);
    }
    map3.set(terms[3], true);
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

    let map1: NestedMapActual<E>;
    let map2: NestedMapActual<E>;
    let map3: NestedMapActual<E>;
    let map4: NestedMapActual<E>;

    const map0: NestedMapActual<E> = this.nestedMap;
    const map0Keys = id0 !== undefined ? (map0.has(id0) ? [ id0 ] : []) : map0.keys();
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      partialQuad0 = terms[0] || this.dictionary.decode(<E>Number.parseInt(<string>key1, 10));
      const map1Keys = id1 !== undefined ? (map1.has(id1) ? [ id1 ] : []) : map1.keys();
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        partialQuad1 = terms[1] || this.dictionary.decode(<E>Number.parseInt(<string>key2, 10));
        const map2Keys = id2 !== undefined ? (map2.has(id2) ? [ id2 ] : []) : map2.keys();
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          partialQuad2 = terms[2] || this.dictionary.decode(<E>Number.parseInt(<string>key3, 10));
          const map3Keys = id3 !== undefined ? (map3.has(id3) ? [ id3 ] : []) : map3.keys();
          for (const key4 of map3Keys) {
            partialQuad3 = terms[3] || this.dictionary.decode(<E>Number.parseInt(<string>key4, 10));
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }
}

export type NestedMap<E> = NestedMapActual<E> | true;
export type NestedMapActual<E> = Map<E, NestedMap<E>>;
