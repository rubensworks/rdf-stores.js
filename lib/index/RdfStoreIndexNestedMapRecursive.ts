/* eslint-disable ts/no-unsafe-assignment */
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { encodeOptionalTerms } from '../OrderUtils';
import type { EncodedQuadTerms, PatternTerm, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';
import type { NestedMapActual } from './RdfStoreIndexNestedMap';

/**
 * An RDF store index that is implemented using nested Maps,
 * and finds quads components via recursive methods calls.
 */
export class RdfStoreIndexNestedMapRecursive<TE, TV> implements IRdfStoreIndex<TE, TV> {
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
    let map = this.nestedMap;
    let contained = false;
    for (const [ i, term ] of terms.entries()) {
      const mapActual = map;
      let nextMap = mapActual.get(term);
      if (!nextMap) {
        nextMap = i === terms.length - 1 ? value : new Map();
        mapActual.set(term, nextMap);
      } else if (i === terms.length - 1) {
        contained = true;
      }
      map = <NestedMapActual<TE, TV>> nextMap;
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

    for (const termsEncoded of this.findEncoded(<EncodedQuadTerms<TE | undefined>> ids, terms)) {
      yield [
        ids[0] === undefined ? this.dictionary.decode(termsEncoded[0]) : terms[0]!,
        ids[1] === undefined ? this.dictionary.decode(termsEncoded[1]) : terms[1]!,
        ids[2] === undefined ? this.dictionary.decode(termsEncoded[2]) : terms[2]!,
        ids[3] === undefined ? this.dictionary.decode(termsEncoded[3]) : terms[3]!,
      ];
    }
  }

  public* findEncoded(
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    // eslint-disable-next-line ts/no-unsafe-return
    return yield* <IterableIterator<EncodedQuadTerms<TE>>> this
      .findEncodedInner(0, ids, terms, this.nestedMap, []);
  }

  protected* findEncodedInner(
    index: number,
    ids: (TE | undefined)[],
    terms: QuadPatternTerms,
    map: NestedMapActual<TE, TV>,
    partialQuad: TE[],
  ): IterableIterator<TE[]> {
    if (index === ids.length) {
      yield [ ...partialQuad ];
    } else {
      const id = ids[index];
      const currentTerm = terms[index];

      // If current term is undefined, iterate over all terms at this level.
      if (currentTerm) {
        // If the current term is defined, find one matching map for the current term.
        const encodedTerm = id;
        const subMap = map.get(encodedTerm!);
        if (subMap) {
          partialQuad[index] = <TE> id;
          yield* this
            .findEncodedInner(index + 1, ids, terms, <NestedMapActual<TE, TV>>subMap, partialQuad);
        }
      } else {
        for (const [ key, subMap ] of map.entries()) {
          partialQuad[index] = key;
          yield* this
            .findEncodedInner(index + 1, ids, terms, <NestedMapActual<TE, TV>>subMap, partialQuad);
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
      for (const [ key1, subMap ] of map.entries()) {
        const newPartialResult = [ ...partialResult, key1 ];
        yield* this.findTermsInner(depth + 1, <NestedMapActual<TE, TV>> subMap, matchTerms, newPartialResult);
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
    return this.countInner(0, terms, this.nestedMap);
  }

  protected countInner(
    index: number,
    terms: PatternTerm[],
    map: NestedMapActual<TE, TV>,
  ): number {
    const currentTerm = terms[index];
    let count = 0;

    // If current term is undefined, iterate over all terms at this level.
    if (currentTerm) {
      // If the current term is defined, find one matching map for the current term.
      const encodedTerm = this.dictionary.encodeOptional(currentTerm);
      if (encodedTerm !== undefined) {
        if (index === terms.length - 1) {
          if (map.has(encodedTerm)) {
            return 1;
          }
          return 0;
        }

        const subMap = map.get(encodedTerm);
        if (subMap) {
          count += this.countInner(index + 1, terms, <NestedMapActual<TE, TV>>subMap);
        }
      }
    } else {
      if (index === terms.length - 1) {
        return map.size;
      }

      for (const subMap of map.values()) {
        count += this.countInner(index + 1, terms, <NestedMapActual<TE, TV>>subMap);
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
