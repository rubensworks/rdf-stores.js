/**
 * The number of entries after which a next Map is started, below V8's limit of 2^24 entries per Map.
 */
const MAX_CHUNK_SIZE = 2 ** 23;

/**
 * A map without the limit of 2^24 entries of a JavaScript Map,
 * which spreads its entries over Maps of at most 2^23 entries each.
 *
 * While it holds fewer entries than that, it costs one Map lookup like a plain Map.
 * Beyond that, a lookup checks each Map in turn.
 *
 * Values may not be undefined.
 */
export class ChunkedMap<TK, TV> {
  private readonly maxChunkSize: number;
  private readonly first = new Map<TK, TV>();
  // Maps that were started once the first one was full, the last one being filled.
  private rest: Map<TK, TV>[] | undefined;

  /**
   * @param maxChunkSize The number of entries after which a next Map is started.
   */
  public constructor(maxChunkSize = MAX_CHUNK_SIZE) {
    this.maxChunkSize = maxChunkSize;
  }

  /**
   * The number of entries in this map.
   */
  public get size(): number {
    let size = this.first.size;
    if (this.rest) {
      for (const map of this.rest) {
        size += map.size;
      }
    }
    return size;
  }

  /**
   * Get the value of a key.
   * @param key A key.
   */
  public get(key: TK): TV | undefined {
    const value = this.first.get(key);
    if (value !== undefined || !this.rest) {
      return value;
    }
    for (const map of this.rest) {
      const restValue = map.get(key);
      if (restValue !== undefined) {
        return restValue;
      }
    }
    return undefined;
  }

  /**
   * Set the value of a key.
   * @param key A key.
   * @param value A value, which may not be undefined.
   */
  public set(key: TK, value: TV): void {
    if (!this.rest) {
      if (this.first.size < this.maxChunkSize || this.first.has(key)) {
        this.first.set(key, value);
        return;
      }
      this.rest = [ new Map() ];
    } else if (this.first.has(key)) {
      this.first.set(key, value);
      return;
    }
    const last = this.rest.length - 1;
    for (let i = 0; i < last; i++) {
      if (this.rest[i].has(key)) {
        this.rest[i].set(key, value);
        return;
      }
    }
    let map = this.rest[last];
    if (map.size >= this.maxChunkSize && !map.has(key)) {
      map = new Map();
      this.rest.push(map);
    }
    map.set(key, value);
  }
}
