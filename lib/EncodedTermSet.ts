/**
 * The number of entries after which a next Set is started, below V8's limit of 2^24 entries per Set.
 */
const MAX_SET_SIZE = 2 ** 23;
/**
 * The number of indexes a set must hold before they move to a bitset.
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
 * A bitset of indexes, kept in an object of its own so that iterators keep reading it when it grows.
 */
interface IBitset {
  words: Uint32Array;
  size: number;
}

/**
 * A set of encoded terms that can go beyond the limit of 2^24 entries of a JavaScript Set.
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
  private bitset: IBitset | undefined;
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
    let size = this.bitset?.size ?? 0;
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
    const bitset = this.bitset;
    if (bitset && isIndex(term) && (term < bitset.words.length * 32 || this.grow(bitset, term))) {
      const word = term >>> 5;
      const mask = 1 << (term & 31);
      const value = bitset.words[word];
      if ((value & mask) === 0) {
        bitset.words[word] = value | mask;
        bitset.size++;
      }
      return;
    }
    if (this.addToSets(term) && !bitset && isIndex(term)) {
      this.setsIndexes++;
      this.setsMaxIndex = Math.max(this.setsMaxIndex, term);
      if (this.setsIndexes >= MIN_BITSET_INDEXES && this.setsMaxIndex < this.setsIndexes * MAX_BITS_PER_INDEX) {
        this.bitset = { words: new Uint32Array(Math.ceil((this.setsMaxIndex + 1) / 32)), size: 0 };
        this.moveIndexesToBitset(this.bitset);
      }
    }
  }

  /**
   * Remove a term from this set.
   * @param term An encoded term.
   * @return boolean If the term was present.
   */
  public delete(term: TE): boolean {
    const bitset = this.bitset;
    if (bitset && isIndex(term) && term < bitset.words.length * 32) {
      const word = term >>> 5;
      const mask = 1 << (term & 31);
      const value = bitset.words[word];
      if ((value & mask) === 0) {
        return false;
      }
      bitset.words[word] = value & ~mask;
      bitset.size--;
      return true;
    }
    for (const set of this.sets) {
      if (set.delete(term)) {
        if (!bitset && isIndex(term)) {
          this.setsIndexes--;
        }
        return true;
      }
    }
    return false;
  }

  public [Symbol.iterator](): Iterator<TE> {
    return new EncodedTermSetIterator(this.bitset, this.sets);
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
   * @param bitset The bitset.
   * @param index An index beyond the bitset.
   * @return boolean If the bitset was grown.
   */
  private grow(bitset: IBitset, index: number): boolean {
    if (index >= (bitset.size + 1) * MAX_BITS_PER_INDEX) {
      return false;
    }
    const words = new Uint32Array(Math.max(Math.ceil((index + 1) / 32), Math.ceil(bitset.words.length * 1.5)));
    words.set(bitset.words);
    bitset.words = words;
    this.moveIndexesToBitset(bitset);
    return true;
  }

  /**
   * Move the indexes from the sets that the bitset can hold to the bitset.
   * @param bitset The bitset.
   */
  private moveIndexesToBitset(bitset: IBitset): void {
    for (const set of this.sets) {
      for (const term of set) {
        if (isIndex(term) && term < bitset.words.length * 32) {
          set.delete(term);
          bitset.words[term >>> 5] |= 1 << (term & 31);
          bitset.size++;
        }
      }
    }
  }
}

/**
 * Produces the terms of a bitset and then those of its sets.
 */
class EncodedTermSetIterator<TE> implements Iterator<TE> {
  private readonly bitset: IBitset | undefined;
  private readonly sets: Set<TE>[];
  private word = -1;
  private value = 0;
  private setIndex = 0;
  private setIterator: Iterator<TE> | undefined;

  public constructor(bitset: IBitset | undefined, sets: Set<TE>[]) {
    this.bitset = bitset;
    this.sets = sets;
  }

  public next(): IteratorResult<TE> {
    // The words are read again on every call, so that indexes added while iterating are also produced.
    if (this.bitset) {
      const words = this.bitset.words;
      while (this.value === 0 && this.word < words.length - 1) {
        this.value = words[++this.word];
      }
      if (this.value !== 0) {
        const lowest = this.value & -this.value;
        this.value ^= lowest;
        return { value: <TE> <unknown> (this.word * 32 + 31 - Math.clz32(lowest)), done: false };
      }
    }
    while (this.setIndex < this.sets.length) {
      this.setIterator ??= this.sets[this.setIndex].values();
      const result = this.setIterator.next();
      if (!result.done) {
        return result;
      }
      this.setIterator = undefined;
      this.setIndex++;
    }
    return { value: undefined, done: true };
  }
}
