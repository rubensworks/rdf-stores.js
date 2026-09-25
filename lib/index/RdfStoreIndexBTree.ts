import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { computeEndDepth, encodeOptionalTerms, isPatternQuoted } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms, QuadTerms } from '../PatternTerm';
import { TermOrder } from '../TermOrder';
import type { IRdfStoreIndex } from './IRdfStoreIndex';
import { EMPTY_QUAD_ITERATOR, RdfStoreIndexSingleQuadIterator } from './RdfStoreIndexNestedMapIterator';

/**
 * The maximum number of quads per leaf.
 */
const LEAF_CAPACITY = 512;
/**
 * The number of quads that a batch fills a new leaf with, leaving room for later inserts without a split.
 */
const LEAF_FILL = 460;
/**
 * Batches smaller than this fraction of the index are inserted one by one rather than merged in.
 */
const MERGE_THRESHOLD = 32;
/**
 * The number of quads checked one by one when skipping a group, before searching instead.
 */
const LINEAR_PROBES = 8;
const DONE = <IteratorResult<never>> { value: undefined, done: true };

/**
 * A position within the leaves of an index.
 * A leaf index equal to the number of leaves means the end has been reached.
 */
export interface IBTreeCursor {
  leaf: number;
  offset: number;
}

/**
 * The quoted triples that a quoted triple pattern at some level of an index can match.
 */
export interface IBTreeCandidates {
  /**
   * The encodings of the matching quoted triples.
   */
  members: Set<number>;
  /**
   * The same encodings, in term order, to jump from one to the next.
   */
  sorted: number[];
}

/**
 * An RDF store index that keeps its quads sorted, in a B+tree of height two:
 * a directory of fixed-size leaves, each of which holds a sorted run of quads as a flat Int32Array.
 *
 * Quads are ordered lexicographically on the order of their terms, which a shared {@link TermOrder}
 * defines. Scans therefore produce sorted results, can skip ahead to a term with a binary search,
 * and count a range without visiting it.
 *
 * The last quad of every leaf is also kept in a single contiguous array, which is all that the search for
 * a leaf reads, and the number of quads before every leaf is tracked, so that counting a range takes two
 * searches whatever its length.
 *
 * Inserting one quad costs a binary search and a shift within one leaf. {@link RdfStoreIndexBTree#setAll}
 * inserts many quads at once by sorting them a single time and merging them into the leaves.
 *
 * Only dictionaries that encode to 32-bit integers are supported, and values are not stored:
 * every quad in the index maps to `true`.
 */
export class RdfStoreIndexBTree implements IRdfStoreIndex<number, boolean> {
  public readonly features: { quotedTripleFiltering: boolean };

  public readonly termOrder: TermOrder;
  protected readonly dictionary: ITermDictionary<number>;
  /**
   * The leaves, each holding `sizes[i]` quads of four encodings each. Only the first leaf may be empty,
   * and only when the whole index is.
   */
  public leaves: Int32Array[] = [ new Int32Array(LEAF_CAPACITY * 4) ];
  public sizes: number[] = [ 0 ];
  /**
   * The last quad of every leaf, four encodings each, so that finding a leaf reads one contiguous array
   * rather than a quad from every leaf it passes. The entry of an empty leaf is meaningless.
   */
  private separators = new Int32Array(4);
  /**
   * The number of quads before each leaf, of which only the first `startsValid` entries are up to date.
   * These are brought up to date when needed, so that a change only costs the invalidation.
   */
  private starts: number[] = [ 0 ];
  private startsValid = 1;
  /**
   * A key to seek to, reused to avoid allocating one per seek.
   */
  private readonly seekScratch = new Int32Array(4);
  /**
   * Incremented on every change, so that iterators can notice that their position is stale.
   */
  public version = 0;
  private quadCount = 0;
  /**
   * Distinct term counts by their arguments, which are only valid for the version they were counted at.
   * Unlike nested maps, this index can not read such a count off a map size, and query engines tend to
   * ask for the same counts over and over.
   */
  private readonly termCounts = new Map<string, number>();
  private termCountsVersion = 0;

  public constructor(options: IRdfStoreOptions<number>) {
    this.dictionary = options.dictionary;
    // Quoted triple patterns are matched against the quoted triples that the dictionary finds for them.
    this.features = { quotedTripleFiltering: Boolean(options.dictionary.features.quotedTriples) };
    this.termOrder = options.termOrder ?? new TermOrder(options.dictionary, options.termComparator);
  }

  /**
   * The number of quads in this index.
   */
  public get size(): number {
    return this.quadCount;
  }

  /**
   * Compare the first `length` components of the quad at `offset` in `data` with those of `key`.
   * @param data A leaf.
   * @param offset The offset of a quad within the leaf.
   * @param key An encoded quad or prefix of one.
   * @param length The number of components to compare.
   */
  public compare(data: Int32Array, offset: number, key: ArrayLike<number>, length: number): number {
    for (let i = 0; i < length; i++) {
      const left = data[offset + i];
      const right = key[i];
      if (left !== right) {
        return this.termOrder.label(left) < this.termOrder.label(right) ? -1 : 1;
      }
    }
    return 0;
  }

  /**
   * Move a cursor forward to the first quad for which `skip` is false.
   * `skip` must hold for a (possibly empty) run of quads starting at the cursor, and for none after it.
   * This gallops over the leaves and then searches within one, so it costs logarithmic time in the
   * distance moved.
   * @param cursor The cursor to move.
   * @param skip Whether the quad at an offset within a leaf must be skipped.
   */
  public advance(cursor: IBTreeCursor, skip: (data: Int32Array, offset: number) => boolean): void {
    const leaves = this.leaves;
    const sizes = this.sizes;
    const separators = this.separators;
    const leafCount = leaves.length;
    let leaf = cursor.leaf;
    if (leaf >= leafCount || !skip(leaves[leaf], cursor.offset * 4)) {
      return;
    }

    // The target lies in the current leaf if its last quad is not skipped.
    if (skip(separators, leaf * 4)) {
      // Gallop over the leaves on their last quad, then narrow down with a binary search.
      let low = leaf;
      let step = 1;
      let high = leaf + 1;
      while (high < leafCount && skip(separators, high * 4)) {
        low = high;
        step *= 2;
        high = low + step;
      }
      if (high > leafCount) {
        high = leafCount;
      }
      let start = low + 1;
      while (start < high) {
        const middle = (start + high) >>> 1;
        if (skip(separators, middle * 4)) {
          start = middle + 1;
        } else {
          high = middle;
        }
      }
      leaf = start;
      if (leaf === leafCount) {
        cursor.leaf = leafCount;
        cursor.offset = 0;
        return;
      }
      cursor.offset = 0;
    }

    const data = leaves[leaf];
    let low = cursor.offset;
    let high = sizes[leaf] - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (skip(data, middle * 4)) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    cursor.leaf = leaf;
    cursor.offset = low;
  }

  /**
   * A cursor at the first quad whose first `length` components are not before those of `key`.
   * @param key An encoded quad or prefix of one.
   * @param length The number of components to compare.
   * @param after If the cursor must instead be placed after all quads with those components.
   */
  public seekKey(key: ArrayLike<number>, length: number, after: boolean): IBTreeCursor {
    const cursor = this.start();
    this.seekForward(cursor, key, length, after);
    return cursor;
  }

  /**
   * Whether the quad at `offset` in `data` comes before `key` on its first `length` components,
   * or, if `after` is set, is equal to it on those.
   * @param data A leaf or the separators.
   * @param offset The offset of a quad within `data`.
   * @param key An encoded quad or prefix of one.
   * @param length The number of components to compare.
   * @param after If a quad that is equal on those components counts as before.
   */
  private precedes(data: Int32Array, offset: number, key: ArrayLike<number>, length: number, after: boolean): boolean {
    for (let i = 0; i < length; i++) {
      const left = data[offset + i];
      const right = key[i];
      if (left !== right) {
        return this.termOrder.label(left) < this.termOrder.label(right);
      }
    }
    return after;
  }

  /**
   * Move a cursor forward to the first quad whose first `length` components are not before those of `key`,
   * or, if `after` is set, to the first quad after all quads with those components.
   * This does what {@link RdfStoreIndexBTree#advance} does for such a condition, without a callback.
   * @param cursor The cursor to move.
   * @param key An encoded quad or prefix of one.
   * @param length The number of components to compare.
   * @param after If the cursor must be placed after the quads with those components.
   */
  public seekForward(cursor: IBTreeCursor, key: ArrayLike<number>, length: number, after: boolean): void {
    const leafCount = this.leaves.length;
    let leaf = cursor.leaf;
    if (leaf >= leafCount || !this.precedes(this.leaves[leaf], cursor.offset * 4, key, length, after)) {
      return;
    }

    const separators = this.separators;
    if (this.precedes(separators, leaf * 4, key, length, after)) {
      let low = leaf;
      let step = 1;
      let high = leaf + 1;
      while (high < leafCount && this.precedes(separators, high * 4, key, length, after)) {
        low = high;
        step *= 2;
        high = low + step;
      }
      if (high > leafCount) {
        high = leafCount;
      }
      let start = low + 1;
      while (start < high) {
        const middle = (start + high) >>> 1;
        if (this.precedes(separators, middle * 4, key, length, after)) {
          start = middle + 1;
        } else {
          high = middle;
        }
      }
      leaf = start;
      if (leaf === leafCount) {
        cursor.leaf = leafCount;
        cursor.offset = 0;
        return;
      }
      cursor.offset = 0;
    }

    const data = this.leaves[leaf];
    let low = cursor.offset;
    let high = this.sizes[leaf] - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (this.precedes(data, middle * 4, key, length, after)) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    cursor.leaf = leaf;
    cursor.offset = low;
  }

  /**
   * A cursor at the first quad, or at the end if the index is empty.
   */
  public start(): IBTreeCursor {
    return { leaf: this.sizes[0] === 0 ? this.leaves.length : 0, offset: 0 };
  }

  /**
   * Move the cursor to the next quad.
   * @param cursor A cursor that is not at the end.
   */
  public step(cursor: IBTreeCursor): void {
    if (++cursor.offset >= this.sizes[cursor.leaf]) {
      cursor.leaf++;
      cursor.offset = 0;
    }
  }

  /**
   * The number of quads from one cursor up to another.
   * @param from The first cursor.
   * @param to A cursor at or after the first one.
   */
  public distance(from: IBTreeCursor, to: IBTreeCursor): number {
    if (from.leaf === to.leaf) {
      return to.offset - from.offset;
    }
    return this.position(to) - this.position(from);
  }

  /**
   * The number of quads before a cursor.
   * @param cursor A cursor.
   */
  public position(cursor: IBTreeCursor): number {
    const leaf = cursor.leaf;
    if (leaf >= this.leaves.length) {
      return this.quadCount;
    }
    const starts = this.starts;
    const sizes = this.sizes;
    for (let i = this.startsValid; i <= leaf; i++) {
      starts[i] = starts[i - 1] + sizes[i - 1];
    }
    if (this.startsValid <= leaf) {
      this.startsValid = leaf + 1;
    }
    return starts[leaf] + cursor.offset;
  }

  /**
   * Mark the quad counts before the leaves from the given one onwards as outdated.
   * @param leaf A leaf index above zero, as nothing ever precedes the first leaf.
   */
  private invalidateStarts(leaf: number): void {
    if (leaf < this.startsValid) {
      this.startsValid = leaf;
    }
  }

  /**
   * Copy the last quad of a leaf into the separators.
   * @param leaf A non-empty leaf index.
   */
  private updateSeparator(leaf: number): void {
    const from = (this.sizes[leaf] - 1) * 4;
    this.separators.set(this.leaves[leaf].subarray(from, from + 4), leaf * 4);
  }

  /**
   * Make room in the separators for a leaf that is inserted at the given index.
   * @param leaf The index of the new leaf.
   */
  private insertSeparator(leaf: number): void {
    const used = (this.leaves.length - 1) * 4;
    if (used + 4 > this.separators.length) {
      const grown = new Int32Array(this.separators.length * 2);
      grown.set(this.separators);
      this.separators = grown;
    }
    this.separators.copyWithin((leaf + 1) * 4, leaf * 4, used);
  }

  /**
   * Rebuild all separators, for after the leaves have been replaced.
   */
  private rebuildSeparators(): void {
    const leafCount = this.leaves.length;
    this.separators = new Int32Array(leafCount * 4);
    for (let leaf = 0; leaf < leafCount; leaf++) {
      if (this.sizes[leaf] > 0) {
        this.updateSeparator(leaf);
      }
    }
    this.starts = [ 0 ];
    this.startsValid = 1;
  }

  /**
   * Move the cursor past all quads that share their first `length` components with the quad at the cursor.
   *
   * Groups are often only a few quads long, for example when counting distinct objects, so a few quads
   * are checked one by one before falling back to a binary search.
   * @param cursor A cursor that is not at the end.
   * @param length The number of components that define the group.
   */
  public skipGroup(cursor: IBTreeCursor, length: number): void {
    const start = this.leaves[cursor.leaf];
    const startOffset = cursor.offset * 4;
    for (let probe = 0; probe < LINEAR_PROBES; probe++) {
      this.step(cursor);
      if (cursor.leaf >= this.leaves.length) {
        return;
      }
      const data = this.leaves[cursor.leaf];
      const offset = cursor.offset * 4;
      for (let i = 0; i < length; i++) {
        if (data[offset + i] !== start[startOffset + i]) {
          return;
        }
      }
    }
    const key = this.seekScratch;
    for (let i = 0; i < length; i++) {
      key[i] = start[startOffset + i];
    }
    this.seekForward(cursor, key, length, true);
  }

  /**
   * Move the cursor to the first quad, from the cursor onwards, whose components at the given levels
   * equal those of `ids`, or are among the candidates for that level, skipping over the quads that
   * can not match with a binary search.
   * @param cursor The cursor to move.
   * @param ids The encoded terms to match, of which only the entries at `levels` are considered.
   * @param levels The levels that must match, in ascending order.
   * @param leading The number of levels that are bound to a single term from the first one onwards without a gap.
   * @param candidates For levels with a quoted triple pattern, the quoted triples it matches.
   * @return boolean If a matching quad was found, rather than the end.
   */
  public nextMatch(
    cursor: IBTreeCursor,
    ids: ArrayLike<number | undefined>,
    levels: number[],
    leading: number,
    candidates?: (IBTreeCandidates | undefined)[],
  ): boolean {
    const leafCount = this.leaves.length;
    for (;;) {
      if (cursor.leaf >= leafCount) {
        return false;
      }
      const data = this.leaves[cursor.leaf];
      const offset = cursor.offset * 4;
      let mismatch = -1;
      for (const level of levels) {
        const value = data[offset + level];
        if (value !== ids[level] && (candidates?.[level] === undefined || !candidates[level].members.has(value))) {
          mismatch = level;
          break;
        }
      }
      if (mismatch < 0) {
        return true;
      }

      // The next term at this level that could match: the bound one if it comes later,
      // or the first candidate after the current one.
      const label = this.termOrder.label(data[offset + mismatch]);
      const levelCandidates = candidates?.[mismatch];
      let target: number | undefined;
      if (levelCandidates === undefined) {
        if (label < this.termOrder.label(<number> ids[mismatch])) {
          target = <number> ids[mismatch];
        }
      } else {
        target = this.nextCandidate(levelCandidates.sorted, label);
      }

      if (target !== undefined) {
        // Jump to where that term would start under the current prefix.
        const key = this.seekScratch;
        for (let i = 0; i < mismatch; i++) {
          key[i] = data[offset + i];
        }
        key[mismatch] = target;
        this.seekForward(cursor, key, mismatch + 1, false);
      } else if (mismatch < leading) {
        // Everything after this is past a prefix that the pattern fixes.
        cursor.leaf = leafCount;
        cursor.offset = 0;
        return false;
      } else {
        // The sought term is not under the current prefix, so move on to the next prefix.
        // That group was entered at the sought term, so it rarely ends within a few quads.
        const key = this.seekScratch;
        for (let i = 0; i < mismatch; i++) {
          key[i] = data[offset + i];
        }
        this.seekForward(cursor, key, mismatch, true);
      }
    }
  }

  /**
   * The first of the given encodings, in term order, whose label is above the given one.
   * @param sorted Encodings in term order.
   * @param label A label.
   */
  private nextCandidate(sorted: number[], label: number): number | undefined {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (this.termOrder.label(sorted[middle]) <= label) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    return low < sorted.length ? sorted[low] : undefined;
  }

  /**
   * For each level that holds a quoted triple pattern, the quoted triples in this index that it matches.
   * @param terms Pattern terms, in the component order of this index.
   * @return The candidates per level, undefined if no level holds a quoted triple pattern,
   *         or null if some quoted triple pattern matches nothing.
   */
  protected quotedCandidates(terms: QuadPatternTerms): (IBTreeCandidates | undefined)[] | undefined | null {
    if (!this.features.quotedTripleFiltering) {
      return undefined;
    }
    let candidates: (IBTreeCandidates | undefined)[] | undefined;
    for (let level = 0; level < 4; level++) {
      const term = terms[level];
      if (isPatternQuoted(term)) {
        const sorted: number[] = [];
        for (const encoding of this.dictionary.findQuotedTriplesEncoded(<RDF.Quad> term)) {
          if (this.termOrder.label(encoding) !== 0) {
            sorted.push(encoding);
          }
        }
        if (sorted.length === 0) {
          return null;
        }
        sorted.sort((left, right) => this.termOrder.label(left) - this.termOrder.label(right));
        candidates ??= [];
        candidates[level] = { members: new Set(sorted), sorted };
      }
    }
    return candidates;
  }

  public set(key: EncodedQuadTerms<number>, value: boolean): boolean {
    // Only membership is stored, so the value is always true.
    void value;
    const termOrder = this.termOrder;
    termOrder.add(key[0]);
    termOrder.add(key[1]);
    termOrder.add(key[2]);
    termOrder.add(key[3]);

    const cursor = this.seekKey(key, 4, false);
    let leaf = cursor.leaf;
    let offset = cursor.offset;
    if (leaf < this.leaves.length && this.compare(this.leaves[leaf], offset * 4, key, 4) === 0) {
      return false;
    }
    if (leaf === this.leaves.length) {
      // After all quads, so at the end of the last leaf.
      leaf = this.leaves.length - 1;
      offset = this.sizes[leaf];
    }
    this.insertAt(leaf, offset, key);
    this.quadCount++;
    this.version++;
    return true;
  }

  private insertAt(leaf: number, offset: number, key: ArrayLike<number>): void {
    let data = this.leaves[leaf];
    let size = this.sizes[leaf];
    if (size === LEAF_CAPACITY) {
      // Split the leaf in two halves.
      const half = LEAF_CAPACITY >>> 1;
      const right = new Int32Array(LEAF_CAPACITY * 4);
      right.set(data.subarray(half * 4, size * 4));
      this.leaves.splice(leaf + 1, 0, right);
      this.sizes.splice(leaf + 1, 0, size - half);
      this.sizes[leaf] = half;
      this.insertSeparator(leaf + 1);
      this.updateSeparator(leaf);
      this.updateSeparator(leaf + 1);
      this.invalidateStarts(leaf + 1);
      if (offset > half) {
        leaf++;
        offset -= half;
        data = right;
      }
      size = this.sizes[leaf];
    }
    data.copyWithin((offset + 1) * 4, offset * 4, size * 4);
    data[offset * 4] = key[0];
    data[(offset * 4) + 1] = key[1];
    data[(offset * 4) + 2] = key[2];
    data[(offset * 4) + 3] = key[3];
    this.sizes[leaf] = size + 1;
    if (offset === size) {
      this.updateSeparator(leaf);
    }
    this.invalidateStarts(leaf + 1);
  }

  public remove(key: EncodedQuadTerms<number>): boolean {
    if (this.termOrder.label(key[0]) === 0 || this.termOrder.label(key[1]) === 0 ||
      this.termOrder.label(key[2]) === 0 || this.termOrder.label(key[3]) === 0) {
      return false;
    }
    const cursor = this.seekKey(key, 4, false);
    const leaf = cursor.leaf;
    if (leaf === this.leaves.length || this.compare(this.leaves[leaf], cursor.offset * 4, key, 4) !== 0) {
      return false;
    }
    const size = this.sizes[leaf];
    this.leaves[leaf].copyWithin(cursor.offset * 4, (cursor.offset + 1) * 4, size * 4);
    this.sizes[leaf] = size - 1;
    if (size === 1 && this.leaves.length > 1) {
      this.leaves.splice(leaf, 1);
      this.sizes.splice(leaf, 1);
      this.separators.copyWithin(leaf * 4, (leaf + 1) * 4, (this.leaves.length + 1) * 4);
    } else if (cursor.offset === size - 1 && size > 1) {
      this.updateSeparator(leaf);
    }
    this.invalidateStarts(leaf + 1);
    this.quadCount--;
    this.version++;
    return true;
  }

  /**
   * Insert many quads at once.
   *
   * The quads are sorted a single time and then merged into the leaves, instead of being inserted one
   * by one, and every new term is added to the term order in a single pass as well.
   * @param keys Encoded quads in the component order of this index, four entries per quad.
   * @param count The number of quads in `keys`.
   * @return number The number of quads that were not yet present.
   */
  public setAll(keys: Int32Array, count: number): number {
    const termOrder = this.termOrder;
    termOrder.addAll(keys, count * 4);
    if (count * MERGE_THRESHOLD < this.quadCount) {
      let added = 0;
      for (let i = 0; i < count; i++) {
        const offset = i * 4;
        if (this.set(<EncodedQuadTerms<number>> <unknown> keys.subarray(offset, offset + 4), true)) {
          added++;
        }
      }
      return added;
    }

    const [ sorted, sortedCount ] = this.sortUnique(keys, count);
    const merged: Int32Array[] = [];
    const mergedSizes: number[] = [];
    let leaf = new Int32Array(LEAF_CAPACITY * 4);
    let leafSize = 0;
    const push = (data: Int32Array, offset: number): void => {
      if (leafSize === LEAF_FILL) {
        merged.push(leaf);
        mergedSizes.push(leafSize);
        leaf = new Int32Array(LEAF_CAPACITY * 4);
        leafSize = 0;
      }
      const target = leafSize * 4;
      leaf[target] = data[offset];
      leaf[target + 1] = data[offset + 1];
      leaf[target + 2] = data[offset + 2];
      leaf[target + 3] = data[offset + 3];
      leafSize++;
    };

    // Merge the sorted batch with the quads already present, skipping those that are in both.
    const cursor = this.start();
    let added = 0;
    for (let i = 0; i < sortedCount; i++) {
      const offset = i * 4;
      const key = sorted.subarray(offset, offset + 4);
      let comparison = 1;
      while (cursor.leaf < this.leaves.length) {
        comparison = this.compare(this.leaves[cursor.leaf], cursor.offset * 4, key, 4);
        if (comparison >= 0) {
          break;
        }
        push(this.leaves[cursor.leaf], cursor.offset * 4);
        this.step(cursor);
      }
      if (cursor.leaf < this.leaves.length && comparison === 0) {
        continue;
      }
      push(sorted, offset);
      added++;
    }
    while (cursor.leaf < this.leaves.length) {
      push(this.leaves[cursor.leaf], cursor.offset * 4);
      this.step(cursor);
    }
    merged.push(leaf);
    mergedSizes.push(leafSize);

    this.leaves = merged;
    this.sizes = mergedSizes;
    this.rebuildSeparators();
    this.quadCount += added;
    this.version++;
    return added;
  }

  /**
   * Sort encoded quads on the term order, and drop duplicates.
   *
   * This is a least-significant-digit radix sort on term ranks, sixteen bits per pass,
   * which skips the passes in which all quads share the same digit.
   * @param keys Encoded quads, four entries per quad.
   * @param count The number of quads.
   * @return A new array with the sorted unique quads, and the number of quads in it.
   */
  protected sortUnique(keys: Int32Array, count: number): [ Int32Array, number ] {
    const termOrder = this.termOrder;
    termOrder.makeUniform();
    const ranks = new Int32Array(count * 4);
    for (let i = 0; i < count * 4; i++) {
      ranks[i] = termOrder.rank(keys[i]);
    }
    const digitsPerComponent = termOrder.size > 0x10000 ? 2 : 1;

    let permutation = new Uint32Array(count);
    let buffer = new Uint32Array(count);
    for (let i = 0; i < count; i++) {
      permutation[i] = i;
    }
    const histogram = new Uint32Array(0x10000);
    for (let component = 3; component >= 0; component--) {
      for (let digit = 0; digit < digitsPerComponent; digit++) {
        const shift = digit * 16;
        histogram.fill(0);
        for (let i = 0; i < count; i++) {
          histogram[(ranks[(permutation[i] * 4) + component] >>> shift) & 0xFFFF]++;
        }
        if (count === 0 || histogram[(ranks[(permutation[0] * 4) + component] >>> shift) & 0xFFFF] === count) {
          continue;
        }
        let total = 0;
        for (let bucket = 0; bucket < 0x10000; bucket++) {
          const bucketCount = histogram[bucket];
          histogram[bucket] = total;
          total += bucketCount;
        }
        for (let i = 0; i < count; i++) {
          const index = permutation[i];
          buffer[histogram[(ranks[(index * 4) + component] >>> shift) & 0xFFFF]++] = index;
        }
        const swap = permutation;
        permutation = buffer;
        buffer = swap;
      }
    }

    const sorted = new Int32Array(count * 4);
    let sortedCount = 0;
    for (let i = 0; i < count; i++) {
      const offset = permutation[i] * 4;
      if (sortedCount > 0) {
        const last = (sortedCount - 1) * 4;
        if (sorted[last] === keys[offset] && sorted[last + 1] === keys[offset + 1] &&
          sorted[last + 2] === keys[offset + 2] && sorted[last + 3] === keys[offset + 3]) {
          continue;
        }
      }
      const target = sortedCount * 4;
      sorted[target] = keys[offset];
      sorted[target + 1] = keys[offset + 1];
      sorted[target + 2] = keys[offset + 2];
      sorted[target + 3] = keys[offset + 3];
      sortedCount++;
    }
    return [ sorted, sortedCount ];
  }

  public get(key: QuadTerms): boolean | undefined {
    const encoded = encodeOptionalTerms(<QuadPatternTerms> key, this.dictionary);
    if (!encoded || encoded.includes(undefined)) {
      return undefined;
    }
    return this.getEncoded(<EncodedQuadTerms<number>> encoded);
  }

  public getEncoded(key: EncodedQuadTerms<number>): boolean | undefined {
    if (this.termOrder.label(key[0]) === 0 || this.termOrder.label(key[1]) === 0 ||
      this.termOrder.label(key[2]) === 0 || this.termOrder.label(key[3]) === 0) {
      return undefined;
    }
    const cursor = this.seekKey(key, 4, false);
    return cursor.leaf < this.leaves.length && this.compare(this.leaves[cursor.leaf], cursor.offset * 4, key, 4) === 0 ?
      true :
      undefined;
  }

  public* find(terms: QuadPatternTerms): IterableIterator<QuadTerms> {
    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return;
    }
    const dictionary = this.dictionary;
    // Quoted triple patterns are not the terms that are found, so those are decoded like variables.
    const [ term0, term1, term2, term3 ] = terms.map((term, level) => ids[level] === undefined ? undefined : term);
    for (const quad of this.findEncoded(<EncodedQuadTerms<number | undefined>> ids, terms)) {
      yield [
        term0 ?? dictionary.decode(quad[0]),
        term1 ?? dictionary.decode(quad[1]),
        term2 ?? dictionary.decode(quad[2]),
        term3 ?? dictionary.decode(quad[3]),
      ];
    }
  }

  public findEncoded(
    ids: EncodedQuadTerms<number | undefined>,
    terms: QuadPatternTerms,
  ): IterableIterator<EncodedQuadTerms<number>> {
    const candidates = this.quotedCandidates(terms);
    if (candidates === null) {
      return <IterableIterator<EncodedQuadTerms<number>>> EMPTY_QUAD_ITERATOR;
    }
    if (candidates !== undefined) {
      // A quoted triple pattern is matched on its candidates, whatever encoding it was given.
      ids = <EncodedQuadTerms<number | undefined>> ids
        .map((id, level) => candidates[level] === undefined ? id : undefined);
    }
    if (ids[0] !== undefined && ids[1] !== undefined && ids[2] !== undefined && ids[3] !== undefined) {
      return this.getEncoded(<EncodedQuadTerms<number>> ids) ?
        new RdfStoreIndexSingleQuadIterator<number>(<EncodedQuadTerms<number>> ids) :
        <IterableIterator<EncodedQuadTerms<number>>> EMPTY_QUAD_ITERATOR;
    }
    for (let i = 0; i < 4; i++) {
      if (ids[i] !== undefined && this.termOrder.label(ids[i]!) === 0) {
        return <IterableIterator<EncodedQuadTerms<number>>> EMPTY_QUAD_ITERATOR;
      }
    }
    return new RdfStoreIndexBTreeIterator(this, ids, candidates);
  }

  public count(terms: QuadPatternTerms): number {
    const ids = encodeOptionalTerms(terms, this.dictionary);
    if (!ids) {
      return 0;
    }
    const candidates = this.quotedCandidates(terms);
    if (candidates === null) {
      return 0;
    }
    const levels: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (ids[i] !== undefined) {
        if (this.termOrder.label(ids[i]!) === 0) {
          return 0;
        }
        levels.push(i);
      } else if (candidates?.[i] !== undefined) {
        levels.push(i);
      }
    }
    if (levels.length === 0) {
      return this.quadCount;
    }
    const leading = RdfStoreIndexBTree.leadingLevels(levels, candidates);
    if (leading === levels.length) {
      // The pattern fixes a prefix, whose quads are contiguous.
      const key = <number[]> ids;
      const from = this.seekKey(key, leading, false);
      const to = { leaf: from.leaf, offset: from.offset };
      this.seekForward(to, key, leading, true);
      return this.distance(from, to);
    }
    return this.countGroups(ids, levels, levels.at(-1)! + 1, candidates);
  }

  /**
   * Count the quads matching `ids` at `levels`, by jumping over each run of matches that share the
   * first `groupLength` components rather than visiting them.
   * @param ids The encoded terms to match.
   * @param levels The levels that must match, in ascending order.
   * @param groupLength A prefix length at which all quads of a group either match or do not.
   * @param candidates For levels with a quoted triple pattern, the quoted triples it matches.
   */
  private countGroups(
    ids: ArrayLike<number | undefined>,
    levels: number[],
    groupLength: number,
    candidates?: (IBTreeCandidates | undefined)[],
  ): number {
    const leading = RdfStoreIndexBTree.leadingLevels(levels, candidates);
    const cursor = this.start();
    let count = 0;
    while (this.nextMatch(cursor, ids, levels, leading, candidates)) {
      const from = { leaf: cursor.leaf, offset: cursor.offset };
      this.skipGroup(cursor, groupLength);
      count += this.distance(from, cursor);
    }
    return count;
  }

  /**
   * The number of levels that are bound to a single term from the first one onwards without a gap.
   * @param levels Bound levels in ascending order.
   * @param candidates For levels with a quoted triple pattern, the quoted triples it matches.
   */
  public static leadingLevels(levels: number[], candidates?: (IBTreeCandidates | undefined)[]): number {
    let leading = 0;
    while (leading < levels.length && levels[leading] === leading && candidates?.[leading] === undefined) {
      leading++;
    }
    return leading;
  }

  private static filterLevels(endDepth: number, filterTerms?: (number | undefined)[]): number[] {
    const levels: number[] = [];
    if (filterTerms) {
      for (let i = 0; i < endDepth; i++) {
        if (filterTerms[i] !== undefined) {
          levels.push(i);
        }
      }
    }
    return levels;
  }

  public* findTerms(matchTerms: boolean[], filterTerms?: (number | undefined)[]): IterableIterator<number[]> {
    const endDepth = computeEndDepth(matchTerms, filterTerms);
    const levels = RdfStoreIndexBTree.filterLevels(endDepth, filterTerms);
    for (const level of levels) {
      if (this.termOrder.label(filterTerms![level]!) === 0) {
        return;
      }
    }
    const leading = RdfStoreIndexBTree.leadingLevels(levels);
    const length = matchTerms.length;
    const ids = filterTerms ?? [];
    let cursor = this.start();
    while (this.nextMatch(cursor, ids, levels, leading)) {
      const data = this.leaves[cursor.leaf];
      const offset = cursor.offset * 4;
      const result: number[] = [];
      for (let i = 0; i < length; i++) {
        if (matchTerms[i]) {
          result.push(data[offset + i]);
        }
      }
      const key = data.slice(offset, offset + length);
      const version = this.version;
      yield result;
      if (this.version === version) {
        this.skipGroup(cursor, length);
      } else {
        cursor = this.seekKey(key, length, true);
      }
    }
  }

  public countTerms(matchTerms: boolean[], filterTerms?: (number | undefined)[]): number {
    if (this.termCountsVersion !== this.version) {
      this.termCounts.clear();
      this.termCountsVersion = this.version;
    }
    const cacheKey = `${matchTerms.join(',')}|${filterTerms?.join(',') ?? ''}`;
    let count = this.termCounts.get(cacheKey);
    if (count === undefined) {
      count = this.countTermsUncached(matchTerms, filterTerms);
      this.termCounts.set(cacheKey, count);
    }
    return count;
  }

  private countTermsUncached(matchTerms: boolean[], filterTerms?: (number | undefined)[]): number {
    const endDepth = computeEndDepth(matchTerms, filterTerms);
    const levels = RdfStoreIndexBTree.filterLevels(endDepth, filterTerms);
    for (const level of levels) {
      if (this.termOrder.label(filterTerms![level]!) === 0) {
        return 0;
      }
    }
    const leading = RdfStoreIndexBTree.leadingLevels(levels);
    const length = matchTerms.length;
    const ids = filterTerms ?? [];
    const cursor = this.start();
    let count = 0;
    while (this.nextMatch(cursor, ids, levels, leading)) {
      count++;
      this.skipGroup(cursor, length);
    }
    return count;
  }
}

/**
 * Iterates over the quads of a {@link RdfStoreIndexBTree} that match a pattern, in index order.
 *
 * Components that the pattern binds after an unbound one are matched with a skip-scan: a quad that
 * does not match makes the scan jump ahead with a binary search rather than read on.
 *
 * The index may change while this iterates. The iterator then relocates itself after the last quad
 * it produced, so it neither repeats nor loses quads that were there all along.
 */
export class RdfStoreIndexBTreeIterator implements IterableIterator<EncodedQuadTerms<number>> {
  private readonly index: RdfStoreIndexBTree;
  private readonly ids: (number | undefined)[];
  private readonly levels: number[];
  private readonly leading: number;
  private readonly candidates: (IBTreeCandidates | undefined)[] | undefined;
  private cursor: IBTreeCursor;
  private version: number;
  private last: EncodedQuadTerms<number> | undefined;
  private done = false;

  public constructor(
    index: RdfStoreIndexBTree,
    ids: (number | undefined)[],
    candidates?: (IBTreeCandidates | undefined)[],
  ) {
    this.index = index;
    this.ids = ids;
    this.candidates = candidates;
    const levels: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (ids[i] !== undefined || candidates?.[i] !== undefined) {
        levels.push(i);
      }
    }
    this.levels = levels;
    this.leading = RdfStoreIndexBTree.leadingLevels(levels, candidates);
    this.cursor = index.start();
    this.version = index.version;
  }

  private resync(): void {
    if (this.version !== this.index.version) {
      this.version = this.index.version;
      this.cursor = this.last === undefined ? this.index.start() : this.index.seekKey(this.last, 4, true);
    }
  }

  /**
   * Skip forward to the first result whose component at `level` is not before the sought term.
   *
   * Only quads that share the components before `level` with the next quad are skipped, and they are
   * found by binary search, so skipping costs logarithmic time in the number of skipped quads.
   * @param level The level to skip within.
   * @param isBefore Whether a key at that level precedes the sought term.
   */
  public seek(level: number, isBefore: (key: number) => boolean): void {
    if (this.done) {
      return;
    }
    this.resync();
    const index = this.index;
    const cursor = this.cursor;
    // Skip within the group of the next result, which is not necessarily that of the next quad.
    if (!index.nextMatch(cursor, this.ids, this.levels, this.leading, this.candidates)) {
      return;
    }
    const offset = cursor.offset * 4;
    const prefix = index.leaves[cursor.leaf].slice(offset, offset + level);
    index.advance(cursor, (data, dataOffset) => {
      for (let i = 0; i < level; i++) {
        if (data[dataOffset + i] !== prefix[i]) {
          return false;
        }
      }
      return isBefore(data[dataOffset + level]);
    });
  }

  public [Symbol.iterator](): IterableIterator<EncodedQuadTerms<number>> {
    return this;
  }

  public next(): IteratorResult<EncodedQuadTerms<number>> {
    if (this.done) {
      return DONE;
    }
    this.resync();
    const index = this.index;
    const cursor = this.cursor;
    if (!index.nextMatch(cursor, this.ids, this.levels, this.leading, this.candidates)) {
      this.done = true;
      return DONE;
    }
    const data = index.leaves[cursor.leaf];
    const offset = cursor.offset * 4;
    const value: EncodedQuadTerms<number> = [ data[offset], data[offset + 1], data[offset + 2], data[offset + 3] ];
    this.last = value;
    index.step(cursor);
    return { value, done: false };
  }

  public return(): IteratorResult<EncodedQuadTerms<number>> {
    this.done = true;
    return DONE;
  }
}
