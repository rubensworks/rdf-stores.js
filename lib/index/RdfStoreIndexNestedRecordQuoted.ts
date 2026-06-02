import type * as RDF from '@rdfjs/types';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { arePatternsQuoted, encodeOptionalTerms } from '../OrderUtils';
import type { QuadPatternTerms, EncodedQuadTerms, PatternTerm, QuadTerms } from '../PatternTerm';
import type { NestedRecordActual } from './RdfStoreIndexNestedRecord';
import { RdfStoreIndexNestedRecord } from './RdfStoreIndexNestedRecord';

/**
 * An RDF store index that is implemented using nested records with optimized quoted triple support.
 */
export class RdfStoreIndexNestedRecordQuoted<TE extends number, TV> extends RdfStoreIndexNestedRecord<TE, TV> {
  public override readonly features = {
    quotedTripleFiltering: true,
  };

  public constructor(options: IRdfStoreOptions<TE>) {
    super(options);
  }

  protected* getQuotedPatternKeys(map: NestedRecordActual<TE>, term: PatternTerm): IterableIterator<TE> {
    for (const quotedTripleEncoded of this.dictionary.findQuotedTriplesEncoded(<RDF.Quad>term)) {
      if (quotedTripleEncoded in map) {
        yield quotedTripleEncoded;
      }
    }
  }

  public override* find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return;
    }

    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;
    const [ quotedTerm0, quotedTerm1, quotedTerm2, quotedTerm3 ] = arePatternsQuoted(terms);

    let partialQuad0: RDF.Term;
    let partialQuad1: RDF.Term;
    let partialQuad2: RDF.Term;
    let partialQuad3: RDF.Term;

    let map1: NestedRecordActual<TE>;
    let map2: NestedRecordActual<TE>;
    let map3: NestedRecordActual<TE>;

    const map0: NestedRecordActual<TE> = this.nestedRecords;
    const map0Keys = <TE[] | string[] | IterableIterator<TE>> (term0 === undefined ?
      Object.keys(map0) :
        (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (id0! in map0 ? [ id0 ] : [])));
    for (const key1 of map0Keys) {
      map1 = map0[<TE>key1];
      partialQuad0 = !quotedTerm0 && term0 ? term0 : this.dictionary.decode(<TE>Number.parseInt(<string>key1, 10));
      const map1Keys = <TE[] | string[] | IterableIterator<TE>> (term1 === undefined ?
        Object.keys(map1) :
          (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (id1! in map1 ? [ id1 ] : [])));
      for (const key2 of map1Keys) {
        map2 = map1[<TE>key2];
        partialQuad1 = !quotedTerm1 && term1 ? term1 : this.dictionary.decode(<TE>Number.parseInt(<string>key2, 10));
        const map2Keys = <TE[] | string[] | IterableIterator<TE>> (term2 === undefined ?
          Object.keys(map2) :
            (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (id2! in map2 ? [ id2 ] : [])));
        for (const key3 of map2Keys) {
          map3 = map2[<TE>key3];
          partialQuad2 = !quotedTerm2 && term2 ? term2 : this.dictionary.decode(<TE>Number.parseInt(<string>key3, 10));
          const map3Keys = <TE[] | string[] | IterableIterator<TE>> (term3 === undefined ?
            Object.keys(map3) :
              (quotedTerm3 ? this.getQuotedPatternKeys(map3, term3) : (id3! in map3 ? [ id3 ] : [])));
          for (const key4 of map3Keys) {
            partialQuad3 = !quotedTerm3 && term3 ?
              term3 :
              this.dictionary.decode(<TE>Number.parseInt(<string>key4, 10));
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }

  // The code below is nearly identical. We duplicate because abstraction would result in a significant performance hit.

  public override* findEncoded(
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;
    const [ quotedTerm0, quotedTerm1, quotedTerm2, quotedTerm3 ] = arePatternsQuoted(terms);

    let map1: NestedRecordActual<TE>;
    let map2: NestedRecordActual<TE>;
    let map3: NestedRecordActual<TE>;

    const map0: NestedRecordActual<TE> = this.nestedRecords;
    const map0Keys = <TE[] | string[] | IterableIterator<TE>> (term0 === undefined ?
      Object.keys(map0) :
        (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (id0! in map0 ? [ id0 ] : [])));
    for (const key1 of map0Keys) {
      map1 = map0[<TE>key1];
      const map1Keys = <TE[] | string[] | IterableIterator<TE>> (term1 === undefined ?
        Object.keys(map1) :
          (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (id1! in map1 ? [ id1 ] : [])));
      for (const key2 of map1Keys) {
        map2 = map1[<TE>key2];
        const map2Keys = <TE[] | string[] | IterableIterator<TE>> (term2 === undefined ?
          Object.keys(map2) :
            (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (id2! in map2 ? [ id2 ] : [])));
        for (const key3 of map2Keys) {
          map3 = map2[<TE>key3];
          const map3Keys = <TE[] | string[] | IterableIterator<TE>> (term3 === undefined ?
            Object.keys(map3) :
              (quotedTerm3 ? this.getQuotedPatternKeys(map3, term3) : (id3! in map3 ? [ id3 ] : [])));
          for (const key4 of map3Keys) {
            yield [
              <TE>Number.parseInt(<string>key1, 10),
              <TE>Number.parseInt(<string>key2, 10),
              <TE>Number.parseInt(<string>key3, 10),
              <TE>Number.parseInt(<string>key4, 10),
            ];
          }
        }
      }
    }
  }

  public override count(terms: QuadPatternTerms): number {
    let count = 0;

    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return 0;
    }
    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;
    const [ quotedTerm0, quotedTerm1, quotedTerm2, quotedTerm3 ] = arePatternsQuoted(terms);

    let map1: NestedRecordActual<TE>;
    let map2: NestedRecordActual<TE>;
    let map3: NestedRecordActual<TE>;

    const map0: NestedRecordActual<TE> = this.nestedRecords;
    const map0Keys = <TE[] | string[] | IterableIterator<TE>> (term0 === undefined ?
      Object.keys(map0) :
        (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (id0! in map0 ? [ id0 ] : [])));
    for (const key1 of map0Keys) {
      map1 = map0[<TE>key1];
      const map1Keys = <TE[] | string[] | IterableIterator<TE>> (term1 === undefined ?
        Object.keys(map1) :
          (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (id1! in map1 ? [ id1 ] : [])));
      for (const key2 of map1Keys) {
        map2 = map1[<TE>key2];
        const map2Keys = <TE[] | string[] | IterableIterator<TE>> (term2 === undefined ?
          Object.keys(map2) :
            (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (id2! in map2 ? [ id2 ] : [])));
        for (const key3 of map2Keys) {
          map3 = map2[<TE>key3];
          if (term3 === undefined) {
            count += Object.keys(map3).length;
          } else if (quotedTerm3) {
            count += [ ...this.getQuotedPatternKeys(map3, term3) ].length;
          } else if (id3! in map3) {
            count++;
          }
        }
      }
    }

    return count;
  }
}
