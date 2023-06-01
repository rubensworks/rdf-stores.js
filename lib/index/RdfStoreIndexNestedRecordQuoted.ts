import type * as RDF from '@rdfjs/types';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { arePatternsQuoted, encodeOptionalTerms } from '../OrderUtils';
import type { QuadPatternTerms, EncodedQuadTerms, PatternTerm } from '../PatternTerm';
import type { NestedRecordActual } from './RdfStoreIndexNestedRecord';
import { RdfStoreIndexNestedRecord } from './RdfStoreIndexNestedRecord';

/**
 * An RDF store index that is implemented using nested records with optimized quoted triple support.
 */
export class RdfStoreIndexNestedRecordQuoted<E extends number, V> extends RdfStoreIndexNestedRecord<E, V> {
  public readonly features = {
    quotedTripleFiltering: true,
  };

  public constructor(options: IRdfStoreOptions<E>) {
    super(options);
  }

  protected * getQuotedPatternKeys(map: NestedRecordActual<E>, term: PatternTerm): IterableIterator<E> {
    for (const quotedTripleEncoded of this.dictionary.findQuotedTriplesEncoded(<RDF.Quad>term)) {
      if (quotedTripleEncoded in map) {
        yield quotedTripleEncoded;
      }
    }
  }

  public * findEncoded(
    ids: EncodedQuadTerms<E | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<E>> {
    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;
    const [ quotedTerm0, quotedTerm1, quotedTerm2, quotedTerm3 ] = arePatternsQuoted(terms);

    let map1: NestedRecordActual<E>;
    let map2: NestedRecordActual<E>;
    let map3: NestedRecordActual<E>;

    const map0: NestedRecordActual<E> = this.nestedRecords;
    const map0Keys = <E[] | string[] | IterableIterator<E>> (term0 !== undefined ?
      (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (id0! in map0 ? [ id0 ] : [])) :
      Object.keys(map0));
    for (const key1 of map0Keys) {
      map1 = map0[<E>key1];
      const map1Keys = <E[] | string[] | IterableIterator<E>> (term1 !== undefined ?
        (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (id1! in map1 ? [ id1 ] : [])) :
        Object.keys(map1));
      for (const key2 of map1Keys) {
        map2 = map1[<E>key2];
        const map2Keys = <E[] | string[] | IterableIterator<E>> (term2 !== undefined ?
          (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (id2! in map2 ? [ id2 ] : [])) :
          Object.keys(map2));
        for (const key3 of map2Keys) {
          map3 = map2[<E>key3];
          const map3Keys = <E[] | string[] | IterableIterator<E>> (term3 !== undefined ?
            (quotedTerm3 ? this.getQuotedPatternKeys(map3, term3) : (id3! in map3 ? [ id3 ] : [])) :
            Object.keys(map3));
          for (const key4 of map3Keys) {
            yield [
              <E>Number.parseInt(<string>key1, 10),
              <E>Number.parseInt(<string>key2, 10),
              <E>Number.parseInt(<string>key3, 10),
              <E>Number.parseInt(<string>key4, 10),
            ];
          }
        }
      }
    }
  }

  public count(terms: QuadPatternTerms): number {
    let count = 0;

    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return 0;
    }
    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;
    const [ quotedTerm0, quotedTerm1, quotedTerm2, quotedTerm3 ] = arePatternsQuoted(terms);

    let map1: NestedRecordActual<E>;
    let map2: NestedRecordActual<E>;
    let map3: NestedRecordActual<E>;

    const map0: NestedRecordActual<E> = this.nestedRecords;
    const map0Keys = <E[] | string[] | IterableIterator<E>> (term0 !== undefined ?
      (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (id0! in map0 ? [ id0 ] : [])) :
      Object.keys(map0));
    for (const key1 of map0Keys) {
      map1 = map0[<E>key1];
      const map1Keys = <E[] | string[] | IterableIterator<E>> (term1 !== undefined ?
        (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (id1! in map1 ? [ id1 ] : [])) :
        Object.keys(map1));
      for (const key2 of map1Keys) {
        map2 = map1[<E>key2];
        const map2Keys = <E[] | string[] | IterableIterator<E>> (term2 !== undefined ?
          (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (id2! in map2 ? [ id2 ] : [])) :
          Object.keys(map2));
        for (const key3 of map2Keys) {
          map3 = map2[<E>key3];
          if (term3 !== undefined) {
            if (quotedTerm3) {
              count += [ ...this.getQuotedPatternKeys(map3, term3) ].length;
            } else if (id3! in map3) {
              count++;
            }
          } else {
            count += Object.keys(map3).length;
          }
        }
      }
    }

    return count;
  }
}
