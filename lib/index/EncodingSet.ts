// An encoding that marks free slots, which is tracked separately when it is added itself.
const EMPTY = -0x80000000;

/**
 * A set of 32-bit integer encodings, which keeps them in a flat array with linear probing.
 * This avoids the overhead of a Set of numbers when deduplicating many encodings.
 */
export class EncodingSet {
  private bits = 10;
  private table = new Int32Array(1 << this.bits).fill(EMPTY);
  private containsEmpty = false;
  public size = 0;

  /**
   * Add an encoding.
   * @param encoding A 32-bit integer.
   * @return boolean If the encoding was not in the set yet.
   */
  public add(encoding: number): boolean {
    if (encoding === EMPTY) {
      if (this.containsEmpty) {
        return false;
      }
      this.containsEmpty = true;
      this.size++;
      return true;
    }
    const table = this.table;
    const mask = table.length - 1;
    let slot = Math.imul(encoding, 0x9E3779B1) >>> (32 - this.bits);
    while (table[slot] !== EMPTY) {
      if (table[slot] === encoding) {
        return false;
      }
      slot = (slot + 1) & mask;
    }
    table[slot] = encoding;
    // The table is kept at most half full, so that probe sequences stay short.
    if (++this.size * 2 > table.length) {
      this.grow();
    }
    return true;
  }

  private grow(): void {
    const old = this.table;
    this.bits++;
    const table = new Int32Array(1 << this.bits).fill(EMPTY);
    const mask = table.length - 1;
    for (const encoding of old) {
      if (encoding !== EMPTY) {
        let slot = Math.imul(encoding, 0x9E3779B1) >>> (32 - this.bits);
        while (table[slot] !== EMPTY) {
          slot = (slot + 1) & mask;
        }
        table[slot] = encoding;
      }
    }
    this.table = table;
  }
}
