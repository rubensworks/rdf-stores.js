import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import type { PatternTerm, QuadPatternTerms, QuadTerms } from '../PatternTerm';
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

  public add(terms: QuadTerms): void {
    let map = this.nestedMap;
    for (const [ i, term ] of terms.entries()) {
      const mapActual = map;
      const encodedTerm = this.dictionary.encode(term);
      let nextMap = mapActual.get(encodedTerm);
      if (!nextMap) {
        nextMap = i === terms.length - 1 ? true : new Map();
        mapActual.set(encodedTerm, nextMap);
      }
      map = <NestedMapActual<E>> nextMap;
    }
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
}

export type NestedMap<E> = NestedMapActual<E> | true;
export type NestedMapActual<E> = Map<E, NestedMap<E>>;
