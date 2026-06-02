/* eslint-disable ts/no-unsafe-assignment */
import type * as RDF from '@rdfjs/types';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { arePatternsQuoted, encodeOptionalTerms } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms, PatternTerm, QuadTerms } from '../PatternTerm';
import type { NestedMapActual } from './RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMap } from './RdfStoreIndexNestedMap';

/**
 * An RDF store index that is implemented using nested Maps with optimized quoted triple support.
 */
export class RdfStoreIndexNestedMapQuoted<TE, TV> extends RdfStoreIndexNestedMap<TE, TV> {
  public override readonly features = {
    quotedTripleFiltering: true,
  };

  public constructor(options: IRdfStoreOptions<TE>) {
    super(options);
  }

  protected* getQuotedPatternKeys(map: NestedMapActual<TE, TV>, term: PatternTerm): IterableIterator<TE> {
    for (const quotedTripleEncoded of this.dictionary.findQuotedTriplesEncoded(<RDF.Quad>term)) {
      if (map.has(quotedTripleEncoded)) {
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

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = <TE[] | IterableIterator<TE>> (term0 === undefined ?
      map0.keys() :
        (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (map0.has(id0!) ? [ id0 ] : [])));
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      partialQuad0 = !quotedTerm0 && term0 ? term0 : this.dictionary.decode(key1);
      const map1Keys = <TE[] | IterableIterator<TE>> (term1 === undefined ?
        map1.keys() :
          (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (map1.has(id1!) ? [ id1 ] : [])));
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        partialQuad1 = !quotedTerm1 && term1 ? term1 : this.dictionary.decode(key2);
        const map2Keys = <TE[] | IterableIterator<TE>> (term2 === undefined ?
          map2.keys() :
            (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (map2.has(id2!) ? [ id2 ] : [])));
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          partialQuad2 = !quotedTerm2 && term2 ? term2 : this.dictionary.decode(key3);
          const map3Keys = <TE[] | IterableIterator<TE>> (term3 === undefined ?
            map3.keys() :
              (quotedTerm3 ? this.getQuotedPatternKeys(map3, term3) : (map3.has(id3!) ? [ id3 ] : [])));
          for (const key4 of map3Keys) {
            partialQuad3 = !quotedTerm3 && term3 ? term3 : this.dictionary.decode(key4);
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

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = <TE[] | IterableIterator<TE>> (term0 === undefined ?
      map0.keys() :
        (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (map0.has(id0!) ? [ id0 ] : [])));
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = <TE[] | IterableIterator<TE>> (term1 === undefined ?
        map1.keys() :
          (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (map1.has(id1!) ? [ id1 ] : [])));
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = <TE[] | IterableIterator<TE>> (term2 === undefined ?
          map2.keys() :
            (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (map2.has(id2!) ? [ id2 ] : [])));
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          const map3Keys = <TE[] | IterableIterator<TE>> (term3 === undefined ?
            map3.keys() :
              (quotedTerm3 ? this.getQuotedPatternKeys(map3, term3) : (map3.has(id3!) ? [ id3 ] : [])));
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

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = <TE[] | IterableIterator<TE>> (term0 === undefined ?
      map0.keys() :
        (quotedTerm0 ? this.getQuotedPatternKeys(map0, term0) : (map0.has(id0!) ? [ id0 ] : [])));
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = <TE[] | IterableIterator<TE>> (term1 === undefined ?
        map1.keys() :
          (quotedTerm1 ? this.getQuotedPatternKeys(map1, term1) : (map1.has(id1!) ? [ id1 ] : [])));
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = <TE[] | IterableIterator<TE>> (term2 === undefined ?
          map2.keys() :
            (quotedTerm2 ? this.getQuotedPatternKeys(map2, term2) : (map2.has(id2!) ? [ id2 ] : [])));
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          if (term3 === undefined) {
            count += map3.size;
          } else if (quotedTerm3) {
            count += [ ...this.getQuotedPatternKeys(map3, term3) ].length;
          } else if (map3.has(id3!)) {
            count++;
          }
        }
      }
    }

    return count;
  }
}
