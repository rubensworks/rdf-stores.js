import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import type { EncodedQuadTerms, PatternTerm, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested Maps,
 * and finds quads components via recursive methods calls.
 */
export class RdfStoreIndexNestedMapRecursive<E> implements IRdfStoreIndex<E> {
  private readonly dictionary: ITermDictionary<E>;
  private readonly nestedMap: NestedMapActual<E>;

  public constructor(options: IRdfStoreOptions<E>) {
    this.dictionary = options.dictionary;
    this.nestedMap = new Map();
  }

  public add(terms: EncodedQuadTerms<E>): boolean {
    let map = this.nestedMap;
    let contained = false;
    for (const [ i, term ] of terms.entries()) {
      const mapActual = map;
      let nextMap = mapActual.get(term);
      if (!nextMap) {
        nextMap = i === terms.length - 1 ? true : new Map();
        mapActual.set(term, nextMap);
      } else if (i === terms.length - 1) {
        contained = true;
      }
      map = <NestedMapActual<E>> nextMap;
    }

    return !contained;
  }

  public * find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    return yield * <IterableIterator<QuadTerms>> this.findInner(0, terms, this.nestedMap, []);
  }

  protected * findInner(
    index: number,
    terms: PatternTerm[],
    map: NestedMapActual<E>,
    partialQuad: RDF.Term[],
  ): IterableIterator<RDF.Term[]> {
    if (index === terms.length) {
      yield [ ...partialQuad ];
    } else {
      const currentTerm = terms[index];

      // If current term is undefined, iterate over all terms at this level.
      if (!currentTerm) {
        for (const [ key, subMap ] of map.entries()) {
          partialQuad[index] = this.dictionary.decode(key);
          yield * this.findInner(index + 1, terms, <NestedMapActual<E>>subMap, partialQuad);
        }
      } else {
        // If the current term is defined, find one matching map for the current term.
        const encodedTerm = this.dictionary.encode(currentTerm);
        const subMap = map.get(encodedTerm);
        if (subMap) {
          partialQuad[index] = currentTerm;
          yield * this.findInner(index + 1, terms, <NestedMapActual<E>>subMap, partialQuad);
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
    map: NestedMapActual<E>,
  ): number {
    const currentTerm = terms[index];
    let count = 0;

    // If current term is undefined, iterate over all terms at this level.
    if (!currentTerm) {
      if (index === terms.length - 1) {
        return map.size;
      }

      for (const subMap of map.values()) {
        count += this.countInner(index + 1, terms, <NestedMapActual<E>>subMap);
      }
    } else {
      // If the current term is defined, find one matching map for the current term.
      const encodedTerm = this.dictionary.encode(currentTerm);
      if (index === terms.length - 1) {
        if (map.has(this.dictionary.encode(currentTerm))) {
          return 1;
        }
        return 0;
      }

      const subMap = map.get(encodedTerm);
      if (subMap) {
        count += this.countInner(index + 1, terms, <NestedMapActual<E>>subMap);
      }
    }

    return count;
  }
}

export type NestedMap<E> = NestedMapActual<E> | true;
export type NestedMapActual<E> = Map<E, NestedMap<E>>;
