/* eslint-disable ts/no-unsafe-assignment */
import { isPatternQuoted } from '../OrderUtils';
import type { EncodedQuadTerms, PatternTerm, QuadPatternTerms } from '../PatternTerm';
import type { NestedMapActual } from './RdfStoreIndexNestedMap';

/**
 * A shared iterator that is already exhausted, used for components without any matching key.
 */
const EMPTY_ITERATOR = <Iterator<never>> [][Symbol.iterator]();
const DONE = <IteratorResult<never>> { value: undefined, done: true };

/**
 * Something that can determine the keys within a map that match a quoted triple pattern.
 */
export interface IQuotedPatternKeysProvider<TE, TV> {
  getQuotedPatternKeys: (map: NestedMapActual<TE, TV>, term: PatternTerm) => IterableIterator<TE>;
}

/**
 * Iterates over the encoded quads of a nested-map index that match a quad pattern.
 *
 * This is written as an explicit state machine rather than as a generator function.
 * A generator saves and restores its whole frame on every `next()` call, which for a
 * four-level nested loop costs several times more than advancing four iterators by hand.
 * Lookups that produce many results spend most of their time in exactly this loop,
 * so that difference dominates them.
 */
export class RdfStoreIndexNestedMapIterator<TE, TV> implements IterableIterator<EncodedQuadTerms<TE>> {
  private readonly ids: EncodedQuadTerms<TE | undefined>;
  private readonly terms: QuadPatternTerms;
  /**
   * Only set for indexes that support quoted triple patterns,
   * in which case the pattern terms instead of the encoded ids determine the keys to visit.
   */
  private readonly quotedProvider: IQuotedPatternKeysProvider<TE, TV> | undefined;
  private readonly quoted: boolean[] | undefined;
  private readonly map0: NestedMapActual<TE, TV>;
  private map1: NestedMapActual<TE, TV> | undefined;
  private map2: NestedMapActual<TE, TV> | undefined;
  private map3: NestedMapActual<TE, TV> | undefined;
  private iterator0: Iterator<TE>;
  private iterator1: Iterator<TE> | undefined;
  private iterator2: Iterator<TE> | undefined;
  private iterator3: Iterator<TE> | undefined;
  private key0: TE;
  private key1: TE;
  private key2: TE;
  public constructor(
    nestedMap: NestedMapActual<TE, TV>,
    ids: EncodedQuadTerms<TE | undefined>,
    terms: QuadPatternTerms,
    quotedProvider?: IQuotedPatternKeysProvider<TE, TV>,
  ) {
    this.ids = ids;
    this.terms = terms;
    this.map0 = nestedMap;
    this.quotedProvider = quotedProvider;
    if (quotedProvider) {
      this.quoted = [
        isPatternQuoted(terms[0]),
        isPatternQuoted(terms[1]),
        isPatternQuoted(terms[2]),
        isPatternQuoted(terms[3]),
      ];
    }

    this.iterator0 = this.keysAt(0, nestedMap);
  }

  /**
   * Determine the keys to visit within the given map at the given level.
   *
   * This is invoked once per visited parent entry, not once per produced result.
   *
   * @param level The nesting level of the given map.
   * @param map The map to determine the keys of.
   */
  private keysAt(level: number, map: NestedMapActual<TE, TV>): Iterator<TE> {
    const quotedProvider = this.quotedProvider;
    if (quotedProvider !== undefined) {
      const term = this.terms[level];
      if (term === undefined) {
        return map.keys();
      }
      if (this.quoted![level]) {
        return quotedProvider.getQuotedPatternKeys(map, term);
      }
    } else if (this.ids[level] === undefined) {
      return map.keys();
    }
    const id = <TE> this.ids[level];
    return map.has(id) ? [ id ][Symbol.iterator]() : EMPTY_ITERATOR;
  }

  public [Symbol.iterator](): IterableIterator<EncodedQuadTerms<TE>> {
    return this;
  }

  public next(): IteratorResult<EncodedQuadTerms<TE>> {
    for (;;) {
      if (this.iterator3 !== undefined) {
        const entry = this.iterator3.next();
        if (entry.done !== true) {
          return { value: [ this.key0, this.key1, this.key2, entry.value ], done: false };
        }
        this.iterator3 = undefined;
      }
      if (this.iterator2 !== undefined) {
        const entry = this.iterator2.next();
        if (entry.done !== true) {
          this.key2 = entry.value;
          this.map3 = <any> this.map2!.get(entry.value);
          this.iterator3 = this.keysAt(3, this.map3!);
          continue;
        }
        this.iterator2 = undefined;
      }
      if (this.iterator1 !== undefined) {
        const entry = this.iterator1.next();
        if (entry.done !== true) {
          this.key1 = entry.value;
          this.map2 = <any> this.map1!.get(entry.value);
          this.iterator2 = this.keysAt(2, this.map2!);
          continue;
        }
        this.iterator1 = undefined;
      }
      const entry = this.iterator0.next();
      if (entry.done === true) {
        return DONE;
      }
      this.key0 = entry.value;
      this.map1 = <any> this.map0.get(entry.value);
      this.iterator1 = this.keysAt(1, this.map1!);
    }
  }

  /**
   * Stop iterating, and release the references that are held into the index.
   */
  public return(): IteratorResult<EncodedQuadTerms<TE>> {
    this.iterator0 = EMPTY_ITERATOR;
    this.iterator1 = undefined;
    this.iterator2 = undefined;
    this.iterator3 = undefined;
    this.map1 = undefined;
    this.map2 = undefined;
    this.map3 = undefined;
    return DONE;
  }
}

/**
 * An iterator over exactly one encoded quad.
 *
 * Fully defined patterns are a single membership check, so they get this instead of the
 * four-level state machine above.
 */
export class RdfStoreIndexSingleQuadIterator<TE> implements IterableIterator<EncodedQuadTerms<TE>> {
  private quad: EncodedQuadTerms<TE> | undefined;

  public constructor(quad: EncodedQuadTerms<TE>) {
    this.quad = quad;
  }

  public [Symbol.iterator](): IterableIterator<EncodedQuadTerms<TE>> {
    return this;
  }

  public next(): IteratorResult<EncodedQuadTerms<TE>> {
    const quad = this.quad;
    if (quad === undefined) {
      return DONE;
    }
    this.quad = undefined;
    return { value: quad, done: false };
  }
}

/**
 * A shared iterator over no encoded quads at all, for patterns without any match.
 *
 * An exhausted array iterator stays exhausted, so a single instance can be handed out for all of them.
 */
export const EMPTY_QUAD_ITERATOR = <IterableIterator<any>> [][Symbol.iterator]();
