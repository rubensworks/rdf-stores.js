/* eslint-disable ts/no-unsafe-assignment */
import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { computeEndDepth, encodeOptionalTerms } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';
import {
  EMPTY_QUAD_ITERATOR,
  RdfStoreIndexNestedMapIterator,
  RdfStoreIndexSingleQuadIterator,
} from './RdfStoreIndexNestedMapIterator';

/**
 * An RDF store index that is implemented using nested Maps.
 */
export class RdfStoreIndexNestedMap<TE, TV> implements IRdfStoreIndex<TE, TV> {
  protected readonly dictionary: ITermDictionary<TE>;
  protected readonly nestedMap: NestedMapActual<TE, TV>;
  public readonly features = {
    quotedTripleFiltering: false,
  };

  public constructor(options: IRdfStoreOptions<TE>) {
    this.dictionary = options.dictionary;
    this.nestedMap = new Map();
  }

  public set(terms: EncodedQuadTerms<TE>, value: TV): boolean {
    const map0 = this.nestedMap;
    let map1: NestedMapActual<TE, TV> = <any> map0.get(terms[0]);
    if (!map1) {
      map1 = new Map();
      map0.set(terms[0], map1);
    }
    let map2: NestedMapActual<TE, TV> = <any> map1.get(terms[1]);
    if (!map2) {
      map2 = new Map();
      map1.set(terms[1], map2);
    }
    let map3: NestedMapActual<TE, TV> = <any> map2.get(terms[2]);
    if (!map3) {
      map3 = new Map();
      map2.set(terms[2], map3);
    }
    const contained = map3.has(terms[3]);
    if (!contained) {
      map3.set(terms[3], value);
    }
    return !contained;
  }

  public remove(terms: EncodedQuadTerms<TE>): boolean {
    const map0 = this.nestedMap;
    const map1: NestedMapActual<TE, TV> | undefined = <any> map0.get(terms[0]);
    if (!map1) {
      return false;
    }
    const map2: NestedMapActual<TE, TV> | undefined = <any> map1.get(terms[1]);
    if (!map2) {
      return false;
    }
    const map3: NestedMapActual<TE, TV> | undefined = <any> map2.get(terms[2]);
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

  public get(key: QuadTerms): TV | undefined {
    const encoded = encodeOptionalTerms(<QuadPatternTerms> key, this.dictionary);

    if (!encoded || encoded.includes(undefined)) {
      return undefined;
    }
    return this.getEncoded(<EncodedQuadTerms<TE>> encoded);
  }

  public getEncoded(ids: EncodedQuadTerms<TE>): TV | undefined {
    const map1: NestedMapActual<TE, TV> | undefined = <any> this.nestedMap.get(ids[0]);
    if (!map1) {
      return undefined;
    }
    const map2: NestedMapActual<TE, TV> | undefined = <any> map1.get(ids[1]);
    if (!map2) {
      return undefined;
    }
    const map3: NestedMapActual<TE, TV> | undefined = <any> map2.get(ids[2]);
    if (!map3) {
      return undefined;
    }
    return <TV | undefined> map3.get(ids[3]);
  }

  /**
   * Check if all four pattern terms are plain (non-quoted) defined terms,
   * in which case the pattern can be resolved by a straight chain of map lookups.
   * @param terms The pattern terms.
   */
  protected isExactPattern(terms: QuadPatternTerms): boolean {
    for (let i = 0; i < 4; i++) {
      const term = terms[i];
      if (term === undefined || term.termType === 'Quad') {
        return false;
      }
    }
    return true;
  }

  /**
   * Resolve a fully defined pattern by directly walking down the nested maps.
   * @param ids The encoded pattern terms.
   * @return boolean If the quad is present in this index.
   */
  protected hasExact(ids: EncodedQuadTerms<TE | undefined>): boolean {
    const map1: NestedMapActual<TE, TV> | undefined = <any> this.nestedMap.get(<TE> ids[0]);
    if (map1 === undefined) {
      return false;
    }
    const map2: NestedMapActual<TE, TV> | undefined = <any> map1.get(<TE> ids[1]);
    if (map2 === undefined) {
      return false;
    }
    const map3: NestedMapActual<TE, TV> | undefined = <any> map2.get(<TE> ids[2]);
    if (map3 === undefined) {
      return false;
    }
    return map3.has(<TE> ids[3]);
  }

  public* find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return;
    }

    // Fully defined patterns are just a membership check, which avoids setting up the loops below.
    if (this.isExactPattern(terms)) {
      if (this.hasExact(<EncodedQuadTerms<TE | undefined>> ids)) {
        yield <QuadTerms> [ terms[0]!, terms[1]!, terms[2]!, terms[3]! ];
      }
      return;
    }

    // The loops below deliberately build a one-element key array for a defined component instead of
    // branching per iteration: that array is allocated once per call, while a per-iteration branch
    // would be paid once per result. Patterns that produce many results (which is what these loops
    // are for) are far more sensitive to the latter.

    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;

    let partialQuad0: RDF.Term;
    let partialQuad1: RDF.Term;
    let partialQuad2: RDF.Term;
    let partialQuad3: RDF.Term;

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = id0 === undefined ? map0.keys() : (map0.has(id0) ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      partialQuad0 = term0 ?? this.dictionary.decode(key1);
      const map1Keys = id1 === undefined ? map1.keys() : (map1.has(id1) ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        partialQuad1 = term1 ?? this.dictionary.decode(key2);
        const map2Keys = id2 === undefined ? map2.keys() : (map2.has(id2) ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          partialQuad2 = term2 ?? this.dictionary.decode(key3);
          const map3Keys = id3 === undefined ? map3.keys() : (map3.has(id3) ? [ id3 ] : []);
          for (const key4 of map3Keys) {
            partialQuad3 = term3 ?? this.dictionary.decode(key4);
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }

  // The code below is nearly identical. We duplicate because abstraction would result in a significant performance hit.

  public findEncoded(
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    return this.createFindEncodedIterator(ids, terms, false);
  }

  public findEncodedBuffered(
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    return this.createFindEncodedIterator(ids, terms, true);
  }

  /**
   * Create the iterator backing {@link RdfStoreIndexNestedMap#findEncoded}
   * and {@link RdfStoreIndexNestedMap#findEncodedBuffered}.
   * @param ids An iterable of encoded pattern terms, ordered in the component order of this index.
   * @param terms An iterable of pattern terms, ordered in the component order of this index.
   * @param reuseBuffer If a single array may be reused for all produced results.
   */
  protected createFindEncodedIterator(
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
    reuseBuffer: boolean,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    // Fully defined patterns are just a membership check, which avoids setting up the loops below.
    if (ids[0] !== undefined && ids[1] !== undefined && ids[2] !== undefined && ids[3] !== undefined) {
      return this.hasExact(ids) ?
        new RdfStoreIndexSingleQuadIterator<TE>(<EncodedQuadTerms<TE>> ids) :
        EMPTY_QUAD_ITERATOR;
    }
    return new RdfStoreIndexNestedMapIterator<TE, TV>(this.nestedMap, ids, terms, undefined, reuseBuffer);
  }

  protected existsPath(
    depth: number,
    endDepth: number,
    map: NestedMapActual<TE, TV>,
    filterTerms?: (TE | undefined)[],
  ): boolean {
    if (depth >= endDepth) {
      return true;
    }
    const filterTerm = filterTerms?.[depth];
    if (filterTerm !== undefined) {
      const subMap = map.get(filterTerm);
      return subMap !== undefined &&
        this.existsPath(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, filterTerms);
    }
    for (const subMap of map.values()) {
      if (this.existsPath(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, filterTerms)) {
        return true;
      }
    }
    return false;
  }

  protected* findTermsInner(
    depth: number,
    endDepth: number,
    map: NestedMapActual<TE, TV>,
    matchTerms: boolean[],
    partialResult: TE[],
    filterTerms?: (TE | undefined)[],
  ): IterableIterator<TE[]> {
    // `partialResult` is a scratch buffer that is pushed to and popped from while descending,
    // and only copied when a complete result is produced.
    // This avoids allocating one intermediate array per matched term per result.
    if (depth >= endDepth) {
      yield [ ...partialResult ];
      return;
    }
    const isMatch = depth < matchTerms.length && matchTerms[depth];
    const isLastMatch = depth === matchTerms.length - 1;
    const deepFilter = isLastMatch && endDepth > matchTerms.length;
    const filterTerm = filterTerms?.[depth];
    if (filterTerm === undefined) {
      if (isMatch) {
        for (const entry of map) {
          if (deepFilter && !this.existsPath(depth + 1, endDepth, <NestedMapActual<TE, TV>> entry[1], filterTerms)) {
            continue;
          }
          partialResult.push(entry[0]);
          if (deepFilter) {
            yield [ ...partialResult ];
          } else {
            yield* this.findTermsInner(
              depth + 1,
              endDepth,
<NestedMapActual<TE, TV>> entry[1],
matchTerms,
partialResult,
filterTerms,
            );
          }
          partialResult.pop();
        }
      } else {
        for (const subMap of map.values()) {
          yield* this.findTermsInner(
            depth + 1,
            endDepth,
<NestedMapActual<TE, TV>> subMap,
matchTerms,
partialResult,
filterTerms,
          );
        }
      }
    } else {
      const subMap = map.get(filterTerm);
      if (subMap) {
        if (isMatch) {
          partialResult.push(filterTerm);
          if (deepFilter) {
            if (this.existsPath(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, filterTerms)) {
              yield [ ...partialResult ];
            }
          } else {
            yield* this.findTermsInner(
              depth + 1,
              endDepth,
<NestedMapActual<TE, TV>> subMap,
matchTerms,
partialResult,
filterTerms,
            );
          }
          partialResult.pop();
        } else {
          yield* this.findTermsInner(
            depth + 1,
            endDepth,
<NestedMapActual<TE, TV>> subMap,
matchTerms,
partialResult,
filterTerms,
          );
        }
      }
    }
  }

  public findTerms(matchTerms: boolean[], filterTerms?: (TE | undefined)[]): IterableIterator<TE[]> {
    const endDepth = computeEndDepth(matchTerms, filterTerms);
    return this.findTermsInner(0, endDepth, this.nestedMap, matchTerms, [], filterTerms);
  }

  public count(terms: QuadPatternTerms): number {
    let count = 0;

    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return 0;
    }

    // Fully defined patterns are just a membership check, which avoids setting up the loops below.
    if (this.isExactPattern(terms)) {
      return this.hasExact(<EncodedQuadTerms<TE | undefined>> ids) ? 1 : 0;
    }

    // The loops below deliberately build a one-element key array for a defined component instead of
    // branching per iteration: that array is allocated once per call, while a per-iteration branch
    // would be paid once per result. Patterns that produce many results (which is what these loops
    // are for) are far more sensitive to the latter.

    const id0 = ids[0];
    const id1 = ids[1];
    const id2 = ids[2];
    const id3 = ids[3];

    let map1: NestedMapActual<TE, TV>;
    let map2: NestedMapActual<TE, TV>;
    let map3: NestedMapActual<TE, TV>;

    const map0: NestedMapActual<TE, TV> = this.nestedMap;
    const map0Keys = id0 === undefined ? map0.keys() : (map0.has(id0) ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = <any>map0.get(key1);
      const map1Keys = id1 === undefined ? map1.keys() : (map1.has(id1) ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = <any>map1.get(key2);
        const map2Keys = id2 === undefined ? map2.keys() : (map2.has(id2) ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = <any>map2.get(key3);
          if (id3 === undefined) {
            count += map3.size;
          } else if (map3.has(id3)) {
            count++;
          }
        }
      }
    }

    return count;
  }

  protected countTermsInner(
    depth: number,
    endDepth: number,
    map: NestedMapActual<TE, TV>,
    matchTerms: boolean[],
    filterTerms?: (TE | undefined)[],
  ): number {
    if (depth >= endDepth) {
      return 1;
    }
    const isLastMatch = depth === matchTerms.length - 1;
    const deepFilter = isLastMatch && endDepth > matchTerms.length;
    const filterTerm = filterTerms?.[depth];
    if (filterTerm !== undefined) {
      const subMap = map.get(filterTerm);
      if (!subMap) {
        return 0;
      }
      if (deepFilter) {
        return this.existsPath(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, filterTerms) ? 1 : 0;
      }
      return this.countTermsInner(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, matchTerms, filterTerms);
    }
    if (deepFilter) {
      let count = 0;
      for (const subMap of map.values()) {
        if (this.existsPath(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, filterTerms)) {
          count++;
        }
      }
      return count;
    }
    if (depth === endDepth - 1) {
      return map.size;
    }
    let count = 0;
    for (const subMap of map.values()) {
      count += this.countTermsInner(depth + 1, endDepth, <NestedMapActual<TE, TV>> subMap, matchTerms, filterTerms);
    }
    return count;
  }

  public countTerms(matchTerms: boolean[], filterTerms?: (TE | undefined)[]): number {
    const endDepth = computeEndDepth(matchTerms, filterTerms);
    return this.countTermsInner(0, endDepth, this.nestedMap, matchTerms, filterTerms);
  }
}

export type NestedMap<TE, TV> = NestedMapActual<TE, TV> | TV;
export type NestedMapActual<TE, TV> = Map<TE, NestedMap<TE, TV>>;
