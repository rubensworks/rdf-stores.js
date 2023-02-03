import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import type { PatternTerm, QuadPatternTerms, QuadTerms } from '../PatternTerm';
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

  public add(terms: QuadTerms): void {
    let map = this.nestedRecords;
    for (const [ i, term ] of terms.entries()) {
      const mapActual = map;
      const encodedTerm = this.dictionary.encode(term);
      let nextMap = mapActual[encodedTerm];
      if (!nextMap) {
        nextMap = i === terms.length - 1 ? true : {};
        mapActual[encodedTerm] = nextMap;
      }
      map = <NestedRecordActual<E>> nextMap;
    }
  }

  public find(terms: QuadPatternTerms): QuadTerms[] {
    return <QuadTerms[]> this.findInner(terms, this.nestedRecords);
  }

  protected findInner(terms: PatternTerm[], map: NestedRecordActual<E>): RDF.Term[][] {
    if (terms.length === 0) {
      return [[]];
    }
    const currentTerm = terms[0];

    // If current term is undefined, iterate over all terms at this level.
    if (!currentTerm) {
      const partialQuads: RDF.Term[][][] = [];
      for (const [ key, subMap ] of Object.entries(map)) {
        const termDefined = this.dictionary.decode(<E>Number.parseInt(key, 10));
        partialQuads.push(
          this.findInner(terms.slice(1), <NestedRecordActual<E>> subMap)
            .map(quadComponents => [ termDefined, ...quadComponents ]),
        );
      }
      return partialQuads.flat();
    }

    // If the current term is defined, find one matching map for the current term.
    const encodedTerm = this.dictionary.encode(currentTerm);
    const subMap = map[encodedTerm];
    if (subMap) {
      return this.findInner(terms.slice(1), <NestedRecordActual<E>> subMap)
        .map(quadComponents => [ currentTerm, ...quadComponents ]);
    }
    return [];
  }
}

export type NestedRecord<E extends string | number | symbol> = NestedRecordActual<E> | true;
export type NestedRecordActual<E extends string | number | symbol> = Record<E, any>;
