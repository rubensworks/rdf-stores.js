import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import type { PatternTerm, QuadPatternTerms, QuadTerms, EncodedQuadTerms } from '../PatternTerm';
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

  public find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    return <IterableIterator<QuadTerms>> this.findInner(0, terms, this.nestedRecords, []);
  }

  protected * findInner(
    index: number,
    terms: PatternTerm[],
    map: NestedRecordActual<E>,
    partialQuad: RDF.Term[],
  ): IterableIterator<RDF.Term[]> {
    if (index === terms.length) {
      yield [ ...partialQuad ];
    } else {
      const currentTerm = terms[index];

      // If current term is undefined, iterate over all terms at this level.
      if (!currentTerm) {
        for (const [ key, subMap ] of Object.entries(map)) {
          partialQuad[index] = this.dictionary.decode(<E>Number.parseInt(key, 10));
          yield * this.findInner(index + 1, terms, <NestedRecordActual<E>>subMap, partialQuad);
        }
      } else {
        // If the current term is defined, find one matching map for the current term.
        const encodedTerm = this.dictionary.encode(currentTerm);
        const subMap = map[encodedTerm];
        if (subMap) {
          partialQuad[index] = currentTerm;
          yield * this.findInner(index + 1, terms, <NestedRecordActual<E>>subMap, partialQuad);
        }
      }
    }
  }
}

export type NestedRecord<E extends string | number | symbol> = NestedRecordActual<E> | true;
export type NestedRecordActual<E extends string | number | symbol> = Record<E, Record<E, Record<E, Record<E, any>>>>;
