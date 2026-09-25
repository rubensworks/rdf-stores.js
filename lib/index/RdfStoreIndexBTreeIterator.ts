import type { EncodedQuadTerms } from '../PatternTerm';
import type { IBTreeCandidates, IBTreeCursor, RdfStoreIndexBTree } from './RdfStoreIndexBTree';

const DONE = <IteratorResult<never>> { value: undefined, done: true };

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

  /**
   * @param index The index to iterate over.
   * @param ids The encoded terms to match, of which only the entries at `levels` are considered.
   * @param levels The levels that must match, in ascending order.
   * @param leading The number of levels that are bound to a single term from the first one onwards without a gap.
   * @param candidates For levels with a quoted triple pattern, the quoted triples it matches.
   */
  public constructor(
    index: RdfStoreIndexBTree,
    ids: (number | undefined)[],
    levels: number[],
    leading: number,
    candidates?: (IBTreeCandidates | undefined)[],
  ) {
    this.index = index;
    this.ids = ids;
    this.levels = levels;
    this.leading = leading;
    this.candidates = candidates;
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
