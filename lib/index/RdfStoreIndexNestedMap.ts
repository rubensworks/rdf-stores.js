/* eslint-disable ts/no-unsafe-assignment */
import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { encodeOptionalTerms } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested Maps.
 */
export class RdfStoreIndexNestedMap<TE, TV> implements IRdfStoreIndex<TE, TV> {
  protected readonly dictionary: ITermDictionary<TE>;
  protected readonly nestedMap: NestedMapActual<TE, TV>;
  public readonly features = {
    quotedTripleFiltering: false,
  };

  public constructor(options: IRdfStoreOptions<TE>) {
    this.dictionary = options.dictionary;
    this.nestedMap = new Map();
  }

  public set(terms: EncodedQuadTerms<TE>, value: TV): boolean {
    const map0 = this.nestedMap;
    let map1: NestedMapActual<TE, TV> = <any> map0.get(terms[0]);
    if (!map1) {
      map1 = new Map();
      map0.set(terms[0], map1);
    }
    let map2: NestedMapActual<TE, TV> = <any> map1.get(terms[1]);
    if (!map2) {
      map2 = new Map();
      map1.set(terms[1], map2);
    }
    let map3: NestedMapActual<TE, TV> = <any> map2.get(terms[2]);
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

  public remove(terms: EncodedQuadTerms<TE>): boolean {
    const map0 = this.nestedMap;
    const map1: NestedMapActual<TE, TV> | undefined = <any> map0.get(terms[0]);
    if (!map1) {
      return false;
    }
    const map2: NestedMapActual<TE, TV> | undefined = <any> map1.get(terms[1]);
    if (!map2) {
      return false;
    }
    const map3: NestedMapActual<TE, TV> | undefined = <any> map2.get(terms[2]);
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

  public get(key: QuadTerms): TV | undefined {
    const encoded = encodeOptionalTerms(<QuadPatternTerms> key, this.dictionary);

    if (!encoded || encoded.includes(undefined)) {
      return undefined;
    }
    return this.getEncoded(<EncodedQuadTerms<TE>> encoded);
  }

  public getEncoded(ids: EncodedQuadTerms<TE>): TV | undefined {
    const map1: NestedMapActual<TE, TV> | undefined = <any> this.nestedMap.get(ids[0]);
    if (!map1) {
      return undefined;
    }
    const map2: NestedMapActual<TE, TV> | undefined = <any> map1.get(ids[1]);
    if (!map2) {
      return undefined;
    }
    const map3: NestedMapActual<TE, TV> | undefined = <any> map2.get(ids[2]);
    if (!map3) {
      return undefined;
    }
    return <TV | undefined> map3.get(ids[3]);
  }

  public* find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
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

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = id0 === undefined ? map0.keys() : (map0.has(id0) ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      partialQuad0 = term0 ?? this.dictionary.decode(key1);
      const map1Keys = id1 === undefined ? map1.keys() : (map1.has(id1) ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        partialQuad1 = term1 ?? this.dictionary.decode(key2);
        const map2Keys = id2 === undefined ? map2.keys() : (map2.has(id2) ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          partialQuad2 = term2 ?? this.dictionary.decode(key3);
          const map3Keys = id3 === undefined ? map3.keys() : (map3.has(id3) ? [ id3 ] : []);
          for (const key4 of map3Keys) {
            partialQuad3 = term3 ?? this.dictionary.decode(key4);
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }

  // The code below is nearly identical. We duplicate because abstraction would result in a significant performance hit.

  public* findEncoded(
    ids: EncodedQuadTerms<TE | undefined>,
    // eslint-disable-next-line ts/naming-convention
    _terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    const [ id0, id1, id2, id3 ] = ids;

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = id0 === undefined ? map0.keys() : (map0.has(id0) ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = id1 === undefined ? map1.keys() : (map1.has(id1) ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = id2 === undefined ? map2.keys() : (map2.has(id2) ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          const map3Keys = id3 === undefined ? map3.keys() : (map3.has(id3) ? [ id3 ] : []);
          for (const key4 of map3Keys) {
            yield [ <TE> key1, <TE> key2, <TE> key3, <TE> key4 ];
          }
        }
      }
    }
  }

  protected* findTermsInner(
    depth: number,
    map: NestedMapActual<TE, TV>,
    matchTerms: boolean[],
    partialResult: TE[],
  ): IterableIterator<TE[]> {
    if (matchTerms[depth]) {
      for (const entry of map) {
        const newPartialResult = [ ...partialResult, entry[0] ];
        yield* this.findTermsInner(depth + 1, <NestedMapActual<TE, TV>> entry[1], matchTerms, newPartialResult);
      }
    } else if (depth < matchTerms.length) {
      for (const subMap of map.values()) {
        yield* this.findTermsInner(depth + 1, <NestedMapActual<TE, TV>> subMap, matchTerms, partialResult);
      }
    } else {
      yield partialResult;
    }
  }

  public findTerms(matchTerms: boolean[]): IterableIterator<TE[]> {
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

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = id0 === undefined ? map0.keys() : (map0.has(id0) ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = id1 === undefined ? map1.keys() : (map1.has(id1) ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = id2 === undefined ? map2.keys() : (map2.has(id2) ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          if (id3 === undefined) {
            count += map3.size;
          } else if (map3.has(id3)) {
            count++;
          }
        }
      }
    }

    return count;
  }

  protected countTermsInner(
    depth: number,
    map: NestedMapActual<TE, TV>,
    matchTerms: boolean[],
  ): number {
    if (depth === matchTerms.length - 1) {
      return map.size;
    }

    let count = 0;
    for (const subMap of map.values()) {
      count += this.countTermsInner(depth + 1, <NestedMapActual<TE, TV>> subMap, matchTerms);
    }
    return count;
  }

  public countTerms(matchTerms: boolean[]): number {
    return this.countTermsInner(0, this.nestedMap, matchTerms);
  }
}

export type NestedMap<TE, TV> = NestedMapActual<TE, TV> | TV;
export type NestedMapActual<TE, TV> = Map<TE, NestedMap<TE, TV>>;
