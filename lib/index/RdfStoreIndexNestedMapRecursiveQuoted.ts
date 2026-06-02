/* eslint-disable ts/no-unsafe-return */
import type * as RDF from '@rdfjs/types';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { arePatternsQuoted, quadHasVariables } from '../OrderUtils';
import type { EncodedQuadTerms, PatternTerm, QuadPatternTerms } from '../PatternTerm';
import type { NestedMapActual } from './RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMapRecursive } from './RdfStoreIndexNestedMapRecursive';

/**
 * An RDF store index that is implemented using nested Maps,
 * and finds quads components via recursive methods calls
 * with optimized quoted triple support.
 */
export class RdfStoreIndexNestedMapRecursiveQuoted<TE, TV> extends RdfStoreIndexNestedMapRecursive<TE, TV> {
  public override readonly features = {
    quotedTripleFiltering: true,
  };

  public constructor(options: IRdfStoreOptions<TE>) {
    super(options);
  }

  public override* findEncoded(
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    return yield* <IterableIterator<EncodedQuadTerms<TE>>> this
      .findEncodedInnerQuoted(0, ids, terms, arePatternsQuoted(terms), this.nestedMap, []);
  }

  protected* findEncodedInnerQuoted(
    index: number,
    ids: (TE | undefined)[],
    terms: QuadPatternTerms,
    isQuotedPattern: boolean[],
    map: NestedMapActual<TE, TV>,
    partialQuad: TE[],
  ): IterableIterator<TE[]> {
    if (index === ids.length) {
      yield [ ...partialQuad ];
    } else {
      const id = ids[index];
      const currentTerm = terms[index];

      // If current term is undefined, iterate over all terms at this level.
      if (!currentTerm) {
        for (const [ key, subMap ] of map.entries()) {
          partialQuad[index] = key;
          yield* this.findEncodedInnerQuoted(
            index + 1,
            ids,
            terms,
            isQuotedPattern,
<NestedMapActual<TE, TV>>subMap,
partialQuad,
          );
        }
      } else if (isQuotedPattern[index]) {
        const quotedTriplesEncoded: IterableIterator<TE> = this
          .dictionary.findQuotedTriplesEncoded(<RDF.Quad>currentTerm);
        // Below, we perform a type of inner (hash) join between quotedTriplesEncoded and map (with hash on map)
        for (const quotedTripleEncoded of quotedTriplesEncoded) {
          const subMap = map.get(quotedTripleEncoded);
          if (subMap) {
            partialQuad[index] = quotedTripleEncoded;
            yield* this.findEncodedInnerQuoted(
              index + 1,
              ids,
              terms,
              isQuotedPattern,
<NestedMapActual<TE, TV>>subMap,
partialQuad,
            );
          }
        }
      } else {
        // If the current term is defined, find one matching map for the current term.
        const encodedTerm = id;
        const subMap = map.get(encodedTerm!);
        if (subMap) {
          partialQuad[index] = <TE> id;
          yield* this.findEncodedInnerQuoted(
            index + 1,
            ids,
            terms,
            isQuotedPattern,
<NestedMapActual<TE, TV>>subMap,
partialQuad,
          );
        }
      }
    }
  }

  protected override countInner(
    index: number,
    terms: PatternTerm[],
    map: NestedMapActual<TE, TV>,
  ): number {
    const currentTerm = terms[index];
    let count = 0;

    // If current term is undefined, iterate over all terms at this level.
    if (!currentTerm) {
      if (index === terms.length - 1) {
        return map.size;
      }

      for (const subMap of map.values()) {
        count += this.countInner(index + 1, terms, <NestedMapActual<TE, TV>>subMap);
      }
    } else if (currentTerm.termType === 'Quad' && quadHasVariables(currentTerm)) {
      const quotedTriplesEncoded: IterableIterator<TE> = this.dictionary.findQuotedTriplesEncoded(currentTerm);
      // Below, we perform a type of inner (hash) join between quotedTriplesEncoded and map (with hash on map)
      for (const quotedTripleEncoded of quotedTriplesEncoded) {
        if (index === terms.length - 1) {
          if (map.has(quotedTripleEncoded)) {
            count++;
          }
        } else {
          const subMap = map.get(quotedTripleEncoded);
          if (subMap) {
            count += this.countInner(index + 1, terms, <NestedMapActual<TE, TV>>subMap);
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
          count += this.countInner(index + 1, terms, <NestedMapActual<TE, TV>>subMap);
        }
      }
    }

    return count;
  }
}
