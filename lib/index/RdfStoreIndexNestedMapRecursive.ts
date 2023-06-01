import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { arePatternsQuoted, encodeOptionalTerms, quadHasVariables } from '../OrderUtils';
import type { EncodedQuadTerms, PatternTerm, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested Maps,
 * and finds quads components via recursive methods calls.
 */
export class RdfStoreIndexNestedMapRecursive<E, V> implements IRdfStoreIndex<E, V> {
  private readonly dictionary: ITermDictionary<E>;
  private readonly nestedMap: NestedMapActual<E, V>;
  public readonly features = {
    quotedTripleFiltering: true,
  };

  public constructor(options: IRdfStoreOptions<E>) {
    this.dictionary = options.dictionary;
    this.nestedMap = new Map();
  }

  public set(terms: EncodedQuadTerms<E>, value: V): boolean {
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
      map = <NestedMapActual<E, V>> nextMap;
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

    for (const termsEncoded of this.findEncoded(<EncodedQuadTerms<E | undefined>> ids, terms)) {
      yield [
        ids[0] !== undefined ? terms[0]! : this.dictionary.decode(termsEncoded[0]),
        ids[1] !== undefined ? terms[1]! : this.dictionary.decode(termsEncoded[1]),
        ids[2] !== undefined ? terms[2]! : this.dictionary.decode(termsEncoded[2]),
        ids[3] !== undefined ? terms[3]! : this.dictionary.decode(termsEncoded[3]),
      ];
    }
  }

  public * findEncoded(
    ids: EncodedQuadTerms<E | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<E>> {
    return yield * <IterableIterator<EncodedQuadTerms<E>>> this
      .findEncodedInner(0, ids, terms, arePatternsQuoted(terms), this.nestedMap, []);
  }

  protected * findEncodedInner(
    index: number,
    ids: (E | undefined)[],
    terms: QuadPatternTerms,
    isQuotedPattern: boolean[],
    map: NestedMapActual<E, V>,
    partialQuad: E[],
  ): IterableIterator<E[]> {
    if (index === ids.length) {
      yield [ ...partialQuad ];
    } else {
      const id = ids[index];
      const currentTerm = terms[index];

      // If current term is undefined, iterate over all terms at this level.
      if (!currentTerm) {
        for (const [ key, subMap ] of map.entries()) {
          partialQuad[index] = key;
          yield * this
            .findEncodedInner(index + 1, ids, terms, isQuotedPattern, <NestedMapActual<E, V>>subMap, partialQuad);
        }
      } else if (isQuotedPattern[index]) {
        const quotedTriplesEncoded: IterableIterator<E> = this
          .dictionary.findQuotedTriplesEncoded(<RDF.Quad>currentTerm);
        // Below, we perform a type of inner (hash) join between quotedTriplesEncoded and map (with hash on map)
        for (const quotedTripleEncoded of quotedTriplesEncoded) {
          const subMap = map.get(quotedTripleEncoded);
          if (subMap) {
            partialQuad[index] = quotedTripleEncoded;
            yield * this
              .findEncodedInner(index + 1, ids, terms, isQuotedPattern, <NestedMapActual<E, V>>subMap, partialQuad);
          }
        }
      } else {
        // If the current term is defined, find one matching map for the current term.
        const encodedTerm = id;
        if (encodedTerm !== undefined) {
          const subMap = map.get(encodedTerm);
          if (subMap) {
            partialQuad[index] = <E> id;
            yield * this
              .findEncodedInner(index + 1, ids, terms, isQuotedPattern, <NestedMapActual<E, V>>subMap, partialQuad);
          }
        }
      }
    }
  }

  public count(terms: QuadPatternTerms): number {
    return this.countInner(0, terms, this.nestedMap);
  }

  protected countInner(
    index: number,
    terms: PatternTerm[],
    map: NestedMapActual<E, V>,
  ): number {
    const currentTerm = terms[index];
    let count = 0;

    // If current term is undefined, iterate over all terms at this level.
    if (!currentTerm) {
      if (index === terms.length - 1) {
        return map.size;
      }

      for (const subMap of map.values()) {
        count += this.countInner(index + 1, terms, <NestedMapActual<E, V>>subMap);
      }
    } else if (currentTerm.termType === 'Quad' && quadHasVariables(currentTerm)) {
      const quotedTriplesEncoded: IterableIterator<E> = this.dictionary.findQuotedTriplesEncoded(currentTerm);
      // Below, we perform a type of inner (hash) join between quotedTriplesEncoded and map (with hash on map)
      for (const quotedTripleEncoded of quotedTriplesEncoded) {
        if (index === terms.length - 1) {
          if (map.has(quotedTripleEncoded)) {
            count++;
          }
        } else {
          const subMap = map.get(quotedTripleEncoded);
          if (subMap) {
            count += this.countInner(index + 1, terms, <NestedMapActual<E, V>>subMap);
          }
        }
      }
    } else {
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
          count += this.countInner(index + 1, terms, <NestedMapActual<E, V>>subMap);
        }
      }
    }

    return count;
  }
}

export type NestedMap<E, V> = NestedMapActual<E, V> | V;
export type NestedMapActual<E, V> = Map<E, NestedMap<E, V>>;
