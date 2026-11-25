/**
 * The number of keys after which a next object is started.
 * V8 slows down inserting into an object to a halt beyond about 2^23 keys.
 */
const MAX_CHUNK_SIZE = 2 ** 22;

/**
 * A record from strings to values without the size limits of a plain object,
 * which spreads its keys over objects of at most 2^22 keys each.
 * Keys are only added, never replaced or removed.
 *
 * Values may not be undefined.
 */
export class ChunkedRecord<TV> {
  private readonly maxChunkSize: number;
  private readonly first: Record<string, TV> = {};
  private firstSize = 0;
  // Objects that were started once the first one was full, the last one being filled.
  private rest: { record: Record<string, TV>; size: number }[] | undefined;

  /**
   * @param maxChunkSize The number of keys after which a next object is started.
   */
  public constructor(maxChunkSize = MAX_CHUNK_SIZE) {
    this.maxChunkSize = maxChunkSize;
  }

  /**
   * Get the value of a key.
   * @param key A key.
   */
  public get(key: string): TV | undefined {
    const value = this.first[key];
    if (value !== undefined || !this.rest) {
      return value;
    }
    for (const chunk of this.rest) {
      const restValue = chunk.record[key];
      if (restValue !== undefined) {
        return restValue;
      }
    }
    return undefined;
  }

  /**
   * Add a key that is not present yet.
   * @param key A key.
   * @param value A value, which may not be undefined.
   */
  public add(key: string, value: TV): void {
    if (!this.rest) {
      if (this.firstSize < this.maxChunkSize) {
        this.first[key] = value;
        this.firstSize++;
        return;
      }
      this.rest = [{ record: {}, size: 0 }];
    }
    let chunk = this.rest.at(-1)!;
    if (chunk.size >= this.maxChunkSize) {
      chunk = { record: {}, size: 0 };
      this.rest.push(chunk);
    }
    chunk.record[key] = value;
    chunk.size++;
  }
}
