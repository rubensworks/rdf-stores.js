/**
 * The number of entries after which a next Set is started, below V8's limit of 2^24 entries per Set.
 */
const MAX_SET_SIZE = 2 ** 23;
/**
 * The number of indexes a set must hold before they move to a bitset,
 * so that small sets keep their insertion order and do not allocate a bitset.
 */
const MIN_BITSET_INDEXES = 4096;
/**
 * The largest number of bits that a bitset may take per index it holds, which is 8 bytes.
 * A Set takes about 21 bytes per entry.
 */
const MAX_BITS_PER_INDEX = 64;

/**
 * The bound on the indexes that a bitset holds, so that bitwise operations on them stay within 32 bits.
 */
const MAX_INDEX = 2 ** 31;

/**
 * If the given encoded term is an integer that a bitset can hold.
 * @param term An encoded term.
 */
function isIndex(term: unknown): term is number {
  return typeof term === 'number' && Number.isInteger(term) && term >= 0 && term < MAX_INDEX;
}

/**
 * A set of encoded terms without the limit of 2^24 entries of a JavaScript Set.
 *
 * Non-negative integer encodings, such as those of numeric term dictionaries,
 * move to a bitset once there are enough of them close together, as that takes far less memory than a Set.
 * Other encodings are kept in Sets of at most 2^23 entries each.
 *
 * Without a bitset, terms are produced in insertion order.
 * With a bitset, the terms in the bitset are produced first, in ascending order.
 */
export class EncodedTermSet<TE> implements Iterable<TE> {
  private readonly maxSetSize: number;
  private readonly sets: Set<TE>[] = [ new Set() ];
  private bits: Uint32Array | undefined;
  private bitsSize = 0;
  // While there is no bitset: the number of indexes in the sets, and the largest one.
  private setsIndexes = 0;
  private setsMaxIndex = -1;

  /**
   * @param maxSetSize The number of entries after which a next Set is started.
   */
  public constructor(maxSetSize = MAX_SET_SIZE) {
    this.maxSetSize = maxSetSize;
  }

  /**
   * The number of terms in this set.
   */
  public get size(): number {
    let size = this.bitsSize;
    for (const set of this.sets) {
      size += set.size;
    }
    return size;
  }

  /**
   * Add a term to this set.
   * @param term An encoded term.
   */
  public add(term: TE): void {
    if (this.bits && isIndex(term) && (term < this.bits.length * 32 || this.grow(term))) {
      const word = term >>> 5;
      const mask = 1 << (term & 31);
      const value = this.bits[word];
      if ((value & mask) === 0) {
        this.bits[word] = value | mask;
        this.bitsSize++;
      }
      return;
    }
    if (this.addToSets(term) && !this.bits && isIndex(term)) {
      this.setsIndexes++;
      this.setsMaxIndex = Math.max(this.setsMaxIndex, term);
      if (this.setsIndexes >= MIN_BITSET_INDEXES && this.setsMaxIndex < this.setsIndexes * MAX_BITS_PER_INDEX) {
        this.bits = new Uint32Array(Math.ceil((this.setsMaxIndex + 1) / 32));
        this.moveIndexesToBits();
      }
    }
  }

  /**
   * Remove a term from this set.
   * @param term An encoded term.
   * @return boolean If the term was present.
   */
  public delete(term: TE): boolean {
    if (this.bits && isIndex(term) && term < this.bits.length * 32) {
      const word = term >>> 5;
      const mask = 1 << (term & 31);
      const value = this.bits[word];
      if ((value & mask) === 0) {
        return false;
      }
      this.bits[word] = value & ~mask;
      this.bitsSize--;
      return true;
    }
    for (const set of this.sets) {
      if (set.delete(term)) {
        if (!this.bits && isIndex(term)) {
          this.setsIndexes--;
        }
        return true;
      }
    }
    return false;
  }

  public* [Symbol.iterator](): IterableIterator<TE> {
    // The bitset is read again for every word, so that terms added while iterating are also produced.
    for (let word = 0; this.bits && word < this.bits.length; word++) {
      let value = this.bits[word];
      while (value !== 0) {
        const lowest = value & -value;
        yield <TE> <unknown> (word * 32 + 31 - Math.clz32(lowest));
        value ^= lowest;
      }
    }
    for (const set of this.sets) {
      yield* set;
    }
  }

  /**
   * Add a term to the sets.
   * @param term An encoded term.
   * @return boolean If the term was not yet present.
   */
  private addToSets(term: TE): boolean {
    const last = this.sets.length - 1;
    for (let i = 0; i < last; i++) {
      if (this.sets[i].has(term)) {
        return false;
      }
    }
    const set = this.sets[last];
    const size = set.size;
    set.add(term);
    if (set.size === size) {
      return false;
    }
    if (set.size >= this.maxSetSize) {
      this.sets.push(new Set());
    }
    return true;
  }

  /**
   * Grow the bitset so that it can hold the given index, unless that would take too many bits per index.
   * @param index An index beyond the bitset.
   * @return boolean If the bitset was grown.
   */
  private grow(index: number): boolean {
    if (index >= (this.bitsSize + 1) * MAX_BITS_PER_INDEX) {
      return false;
    }
    const bits = new Uint32Array(Math.max(Math.ceil((index + 1) / 32), Math.ceil(this.bits!.length * 1.5)));
    bits.set(this.bits!);
    this.bits = bits;
    this.moveIndexesToBits();
    return true;
  }

  /**
   * Move the indexes from the sets that the bitset can hold to the bitset.
   */
  private moveIndexesToBits(): void {
    const bits = this.bits!;
    for (const set of this.sets) {
      for (const term of set) {
        if (isIndex(term) && term < bits.length * 32) {
          set.delete(term);
          bits[term >>> 5] |= 1 << (term & 31);
          this.bitsSize++;
        }
      }
    }
  }
}
