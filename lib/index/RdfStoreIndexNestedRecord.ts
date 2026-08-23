/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-return */
import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { computeEndDepth, encodeOptionalTerms } from '../OrderUtils';
import type { QuadPatternTerms, QuadTerms, EncodedQuadTerms } from '../PatternTerm';
import type { IRdfStoreIndex } from './IRdfStoreIndex';

/**
 * An RDF store index that is implemented using nested records.
 */
export class RdfStoreIndexNestedRecord<TE extends number, TV> implements IRdfStoreIndex<TE, TV> {
  protected readonly dictionary: ITermDictionary<TE>;
  protected readonly nestedRecords: NestedRecordActual<TE>;
  public readonly features = {
    quotedTripleFiltering: false,
  };

  public constructor(options: IRdfStoreOptions<TE>) {
    this.dictionary = options.dictionary;
    this.nestedRecords = <any>{};
  }

  public set(terms: EncodedQuadTerms<TE>, value: TV): boolean {
    const map0 = this.nestedRecords;
    const map1 = map0[terms[0]] ?? (map0[terms[0]] = <any>{});
    const map2 = map1[terms[1]] ?? (map1[terms[1]] = <any>{});
    const map3 = map2[terms[2]] ?? (map2[terms[2]] = <any>{});
    if (map3[terms[3]]) {
      return false;
    }
    map3[terms[3]] = value;
    return true;
  }

  public remove(terms: EncodedQuadTerms<TE>): boolean {
    const map0 = this.nestedRecords;
    const map1 = map0[terms[0]];
    if (!map1) {
      return false;
    }
    const map2 = map1[terms[1]];
    if (!map2) {
      return false;
    }
    const map3 = map2[terms[2]];
    if (!map3) {
      return false;
    }
    if (!map3[terms[3]]) {
      return false;
    }
    delete map3[terms[3]];

    // Clean up intermediate maps
    if (Object.keys(map3).length === 0) {
      delete map2[terms[2]];
      if (Object.keys(map2).length === 0) {
        delete map1[terms[1]];
        if (Object.keys(map1).length === 0) {
          delete map0[terms[0]];
        }
      }
    }

    return true;
  }

  public get(key: QuadTerms): TV | undefined {
    const encoded = encodeOptionalTerms(<QuadPatternTerms> key, this.dictionary);

    if (!encoded || encoded.includes(undefined)) {
      return undefined;
    }
    return this.getEncoded(<EncodedQuadTerms<TE>> encoded);
  }

  public getEncoded(ids: EncodedQuadTerms<TE>): TV | undefined {
    return this.nestedRecords[ids[0]]?.[ids[1]]?.[ids[2]]?.[ids[3]];
  }

  public* find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return;
    }

    const [ id0, id1, id2, id3 ] = ids;
    const [ term0, term1, term2, term3 ] = terms;

    let partialQuad0: RDF.Term;
    let partialQuad1: RDF.Term;
    let partialQuad2: RDF.Term;
    let partialQuad3: RDF.Term;

    let map1: NestedRecordActual<TE>;
    let map2: NestedRecordActual<TE>;
    let map3: NestedRecordActual<TE>;

    const map0: NestedRecordActual<TE> = this.nestedRecords;
    const map0Keys = id0 === undefined ? Object.keys(map0) : (id0 in map0 ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = map0[<TE>key1];
      partialQuad0 = term0 ?? this.dictionary.decode(<TE>Number.parseInt(<string>key1, 10));
      const map1Keys = id1 === undefined ? Object.keys(map1) : (id1 in map1 ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = map1[<TE>key2];
        partialQuad1 = term1 ?? this.dictionary.decode(<TE>Number.parseInt(<string>key2, 10));
        const map2Keys = id2 === undefined ? Object.keys(map2) : (id2 in map2 ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = map2[<TE>key3];
          partialQuad2 = term2 ?? this.dictionary.decode(<TE>Number.parseInt(<string>key3, 10));
          const map3Keys = id3 === undefined ? Object.keys(map3) : (id3 in map3 ? [ id3 ] : []);
          for (const key4 of map3Keys) {
            partialQuad3 = term3 ?? this.dictionary.decode(<TE>Number.parseInt(<string>key4, 10));
            yield <any>[ partialQuad0, partialQuad1, partialQuad2, partialQuad3 ];
          }
        }
      }
    }
  }

  // The code below is nearly identical. We duplicate because abstraction would result in a significant performance hit.

  public* findEncoded(
    ids: EncodedQuadTerms<TE | undefined>,
    // eslint-disable-next-line ts/naming-convention
    _terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<TE>> {
    const [ id0, id1, id2, id3 ] = ids;

    let map1: NestedRecordActual<TE>;
    let map2: NestedRecordActual<TE>;
    let map3: NestedRecordActual<TE>;

    const map0: NestedRecordActual<TE> = this.nestedRecords;
    const map0Keys = id0 === undefined ? Object.keys(map0) : (id0 in map0 ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = map0[<TE>key1];
      const map1Keys = id1 === undefined ? Object.keys(map1) : (id1 in map1 ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = map1[<TE>key2];
        const map2Keys = id2 === undefined ? Object.keys(map2) : (id2 in map2 ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = map2[<TE>key3];
          const map3Keys = id3 === undefined ? Object.keys(map3) : (id3 in map3 ? [ id3 ] : []);
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

  protected existsPath(
    depth: number,
    endDepth: number,
    map: NestedRecordActual<TE>,
    filterTerms?: (TE | undefined)[],
  ): boolean {
    if (depth >= endDepth) {
      return true;
    }
    const filterTerm = filterTerms?.[depth];
    if (filterTerm !== undefined) {
      const subMap = map[filterTerm];
      return subMap !== undefined &&
        this.existsPath(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, filterTerms);
    }
    for (const subMap of Object.values(map)) {
      if (this.existsPath(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, filterTerms)) {
        return true;
      }
    }
    return false;
  }

  protected* findTermsInner(
    depth: number,
    endDepth: number,
    map: NestedRecordActual<TE>,
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
        for (const [ key1, subMap ] of Object.entries(map)) {
          const key = <TE> Number.parseInt(key1, 10);
          if (deepFilter && !this.existsPath(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, filterTerms)) {
            continue;
          }
          partialResult.push(key);
          if (deepFilter) {
            yield [ ...partialResult ];
          } else {
            yield* this.findTermsInner(
              depth + 1,
              endDepth,
<NestedRecordActual<TE>> subMap,
matchTerms,
partialResult,
filterTerms,
            );
          }
          partialResult.pop();
        }
      } else {
        for (const subMap of Object.values(map)) {
          yield* this.findTermsInner(
            depth + 1,
            endDepth,
<NestedRecordActual<TE>> subMap,
matchTerms,
partialResult,
filterTerms,
          );
        }
      }
    } else {
      const subMap = map[filterTerm];
      if (subMap) {
        if (isMatch) {
          partialResult.push(filterTerm);
          if (deepFilter) {
            if (this.existsPath(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, filterTerms)) {
              yield [ ...partialResult ];
            }
          } else {
            yield* this.findTermsInner(
              depth + 1,
              endDepth,
<NestedRecordActual<TE>> subMap,
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
<NestedRecordActual<TE>> subMap,
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
    return this.findTermsInner(0, endDepth, this.nestedRecords, matchTerms, [], filterTerms);
  }

  public count(terms: QuadPatternTerms): number {
    let count = 0;

    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return 0;
    }
    const id0 = ids[0];
    const id1 = ids[1];
    const id2 = ids[2];
    const id3 = ids[3];

    let map1: NestedRecordActual<TE>;
    let map2: NestedRecordActual<TE>;
    let map3: NestedRecordActual<TE>;

    const map0: NestedRecordActual<TE> = this.nestedRecords;
    const map0Keys = id0 === undefined ? Object.keys(map0) : (id0 in map0 ? [ id0 ] : []);
    for (const key1 of map0Keys) {
      map1 = map0[<TE>key1];
      const map1Keys = id1 === undefined ? Object.keys(map1) : (id1 in map1 ? [ id1 ] : []);
      for (const key2 of map1Keys) {
        map2 = map1[<TE>key2];
        const map2Keys = id2 === undefined ? Object.keys(map2) : (id2 in map2 ? [ id2 ] : []);
        for (const key3 of map2Keys) {
          map3 = map2[<TE>key3];
          if (id3 === undefined) {
            count += Object.keys(map3).length;
          } else if (id3 in map3) {
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
    map: NestedRecordActual<TE>,
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
      const subMap = map[filterTerm];
      if (!subMap) {
        return 0;
      }
      if (deepFilter) {
        return this.existsPath(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, filterTerms) ? 1 : 0;
      }
      return this.countTermsInner(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, matchTerms, filterTerms);
    }
    if (deepFilter) {
      let count = 0;
      for (const subMap of Object.values(map)) {
        if (this.existsPath(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, filterTerms)) {
          count++;
        }
      }
      return count;
    }
    if (depth === endDepth - 1) {
      return Object.keys(map).length;
    }
    let count = 0;
    for (const subMap of Object.values(map)) {
      count += this.countTermsInner(depth + 1, endDepth, <NestedRecordActual<TE>> subMap, matchTerms, filterTerms);
    }
    return count;
  }

  public countTerms(matchTerms: boolean[], filterTerms?: (TE | undefined)[]): number {
    const endDepth = computeEndDepth(matchTerms, filterTerms);
    return this.countTermsInner(0, endDepth, this.nestedRecords, matchTerms, filterTerms);
  }
}

export type NestedRecord<TE extends string | number | symbol> = NestedRecordActual<TE> | true;
// eslint-disable-next-line max-len
export type NestedRecordActual<TE extends string | number | symbol> = Record<TE, Record<TE, Record<TE, Record<TE, any>>>>;
