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

  public find(terms: QuadPatternTerms): QuadTerms[] {
    return <QuadTerms[]> this.findInner(terms, this.nestedMap);
  }

  protected findInner(terms: PatternTerm[], map: NestedMapActual<E>): RDF.Term[][] {
    if (terms.length === 0) {
      return [[]];
    }
    const currentTerm = terms[0];

    // If current term is undefined, iterate over all terms at this level.
    if (!currentTerm) {
      const partialQuads: RDF.Term[][][] = [];
      for (const [ key, subMap ] of map.entries()) {
        const termDefined = this.dictionary.decode(key);
        partialQuads.push(
          this.findInner(terms.slice(1), <NestedMapActual<E>> subMap)
            .map(quadComponents => [ termDefined, ...quadComponents ]),
        );
      }
      return partialQuads.flat();
    }

    // If the current term is defined, find one matching map for the current term.
    const encodedTerm = this.dictionary.encode(currentTerm);
    const subMap = map.get(encodedTerm);
    if (subMap) {
      return this.findInner(terms.slice(1), <NestedMapActual<E>> subMap)
        .map(quadComponents => [ currentTerm, ...quadComponents ]);
    }
    return [];
  }
}

export type NestedMap<E> = NestedMapActual<E> | true;
export type NestedMapActual<E> = Map<E, NestedMap<E>>;
