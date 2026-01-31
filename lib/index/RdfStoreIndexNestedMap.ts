import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { encodeOptionalTerms } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested Maps.
 */
export class RdfStoreIndexNestedMap<E, V> implements IRdfStoreIndex<E, V> {
  protected readonly dictionary: ITermDictionary<E>;
  protected readonly nestedMap: NestedMapActual<E, V>;
  public readonly features = {
    quotedTripleFiltering: false,
  };

  public constructor(options: IRdfStoreOptions<E>) {
    this.dictionary = options.dictionary;
    this.nestedMap = new Map();
  }

  public set(terms: EncodedQuadTerms<E>, value: V): boolean {
    const map0 = this.nestedMap;
    let map1: NestedMapActual<E, V> = <any> map0.get(terms[0]);
    if (!map1) {
      map1 = new Map();
      map0.set(terms[0], map1);
    }
    let map2: NestedMapActual<E, V> = <any> map1.get(terms[1]);
    if (!map2) {
      map2 = new Map();
      map1.set(terms[1], map2);
    }
    let map3: NestedMapActual<E, V> = <any> map2.get(terms[2]);
    if (!map3) {
      map3 = new Map();
      map2.set(terms[2], map3);
    }
    const contained = map3.has(terms[3]);
    if (!contained) {
      map3.set(terms[3], value);
    }
    return !contained;
  }

  public remove(terms: EncodedQuadTerms<E>): boolean {
    const map0 = this.nestedMap;
    const map1: NestedMapActual<E, V> | undefined = <any> map0.get(terms[0]);
    if (!map1) {
      return false;
    }
    const map2: NestedMapActual<E, V> | undefined = <any> map1.get(terms[1]);
    if (!map2) {
      return false;
    }
    const map3: NestedMapActual<E, V> | undefined = <any> map2.get(terms[2]);
    if (!map3) {
      return false;
    }
    const ret = map3.delete(terms[3]);

    // Clean up intermediate maps
    if (ret && map3.size === 0) {
      map2.delete(terms[2]);
      if (map2.size === 0) {
        map1.delete(terms[1]);
        if (map1.size === 0) {
          map0.delete(terms[0]);
        }
      }
    }

    return ret;
  }

  public get(key: QuadTerms): V | undefined {
    const encoded = encodeOptionalTerms(<QuadPatternTerms> key, this.dictionary);
    // eslint-disable-next-line unicorn/no-useless-undefined
    if (!encoded || encoded.includes(undefined)) {
      return undefined;
    }
    return this.getEncoded(<EncodedQuadTerms<E>> encoded);
  }

  public getEncoded(ids: EncodedQuadTerms<E>): V | undefined {
    const map1: NestedMapActual<E, V> | undefined = <any> this.nestedMap.get(ids[0]);
    if (!map1) {
      return undefined;
    }
    const map2: NestedMapActual<E, V> | undefined = <any> map1.get(ids[1]);
    if (!map2) {
      return undefined;
    }
    const map3: NestedMapActual<E, V> | undefined = <any> map2.get(ids[2]);
    if (!map3) {
      return undefined;
    }
    return <V | undefined> map3.get(ids[3]);
  }

  public * find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return;
    }

    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;

    let partialQuad0: RDF.Term;
    let partialQuad1: RDF.Term;
    let partialQuad2: RDF.Term;
    let partialQuad3: RDF.Term;

    let map1: NestedMapActual<E, V>;
    let map2: NestedMapActual<E, V>;
    let map3: NestedMapActual<E, V>;

    const map0: NestedMapActual<E, V> = this.nestedMap;
    const map0Keys = id0 !== undefined ? (map0.has(id0) ? [ id0 ] : []) : map0.keys();
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      partialQuad0 = term0 || this.dictionary.decode(key1);
      const map1Keys = id1 !== undefined ? (map1.has(id1) ? [ id1 ] : []) : map1.keys();
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        partialQuad1 = term1 || this.dictionary.decode(key2);
        const map2Keys = id2 !== undefined ? (map2.has(id2) ? [ id2 ] : []) : map2.keys();
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          partialQuad2 = term2 || this.dictionary.decode(key3);
          const map3Keys = id3 !== undefined ? (map3.has(id3) ? [ id3 ] : []) : map3.keys();
          for (const key4 of map3Keys) {
            partialQuad3 = term3 || this.dictionary.decode(key4);
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }

  // The code below is nearly identical. We duplicate because abstraction would result in a significant performance hit.

  public * findEncoded(
    ids: EncodedQuadTerms<E | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<E>> {
    const [ id0, id1, id2, id3 ] = ids;

    let map1: NestedMapActual<E, V>;
    let map2: NestedMapActual<E, V>;
    let map3: NestedMapActual<E, V>;

    const map0: NestedMapActual<E, V> = this.nestedMap;
    const map0Keys = id0 !== undefined ? (map0.has(id0) ? [ id0 ] : []) : map0.keys();
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = id1 !== undefined ? (map1.has(id1) ? [ id1 ] : []) : map1.keys();
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = id2 !== undefined ? (map2.has(id2) ? [ id2 ] : []) : map2.keys();
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          const map3Keys = id3 !== undefined ? (map3.has(id3) ? [ id3 ] : []) : map3.keys();
          for (const key4 of map3Keys) {
            yield [ <E> key1, <E> key2, <E> key3, <E> key4 ];
          }
        }
      }
    }
  }

  protected * findTermsInner(
    depth: number,
    map: NestedMapActual<E, V>,
    matchTerms: boolean[],
    partialResult: E[],
  ): IterableIterator<E[]> {
    if (matchTerms[depth]) {
      for (const entry of map) {
        const newPartialResult = [ ...partialResult, entry[0] ];
        yield * this.findTermsInner(depth + 1, <NestedMapActual<E, V>> entry[1], matchTerms, newPartialResult);
      }
    } else if (depth < matchTerms.length) {
      for (const subMap of map.values()) {
        yield * this.findTermsInner(depth + 1, <NestedMapActual<E, V>> subMap, matchTerms, partialResult);
      }
    } else {
      yield partialResult;
    }
  }

  public findTerms(matchTerms: boolean[]): IterableIterator<E[]> {
    return this.findTermsInner(0, this.nestedMap, matchTerms, []);
  }

  public count(terms: QuadPatternTerms): number {
    let count = 0;

    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return 0;
    }
    const id0 = ids[0];
    const id1 = ids[1];
    const id2 = ids[2];
    const id3 = ids[3];

    let map1: NestedMapActual<E, V>;
    let map2: NestedMapActual<E, V>;
    let map3: NestedMapActual<E, V>;

    const map0: NestedMapActual<E, V> = this.nestedMap;
    const map0Keys = id0 !== undefined ? (map0.has(id0) ? [ id0 ] : []) : map0.keys();
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = id1 !== undefined ? (map1.has(id1) ? [ id1 ] : []) : map1.keys();
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = id2 !== undefined ? (map2.has(id2) ? [ id2 ] : []) : map2.keys();
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          if (id3 !== undefined) {
            if (map3.has(id3)) {
              count++;
            }
          } else {
            count += map3.size;
          }
        }
      }
    }

    return count;
  }
}

export type NestedMap<E, V> = NestedMapActual<E, V> | V;
export type NestedMapActual<E, V> = Map<E, NestedMap<E, V>>;
