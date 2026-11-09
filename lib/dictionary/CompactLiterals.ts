const XSD = 'http://www.w3.org/2001/XMLSchema#';

/**
 * How the literals of a datatype are stored as a number,
 * for those literals whose lexical form is exactly the one that number formats to.
 */
export interface ICompactLiteralKind {
  /**
   * The number for a lexical form, or undefined if formatting that number would not give back the same lexical form.
   * @param value A lexical form.
   */
  parse: (value: string) => number | undefined;
  /**
   * The lexical form of a number that `parse` returned.
   * @param value A number.
   */
  format: (value: number) => string;
}

const INTEGER: ICompactLiteralKind = {
  parse(value) {
    const number = Number(value);
    return Number.isSafeInteger(number) && String(number) === value ? number : undefined;
  },
  format: String,
};

const DATE_TIME: ICompactLiteralKind = {
  parse(value) {
    // Only the form that toISOString produces: a four digit year, milliseconds, and UTC.
    if (value.length !== 24 || !value.endsWith('Z')) {
      return;
    }
    const time = Date.parse(value);
    return !Number.isNaN(time) && new Date(time).toISOString() === value ? time : undefined;
  },
  format: value => new Date(value).toISOString(),
};

const DATE: ICompactLiteralKind = {
  parse(value) {
    // Only a four digit year, without a timezone.
    if (value.length !== 10) {
      return;
    }
    const time = Date.parse(value);
    return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value ? time : undefined;
  },
  format: value => new Date(value).toISOString().slice(0, 10),
};

const BOOLEAN: ICompactLiteralKind = {
  parse: value => value === 'true' ? 1 : (value === 'false' ? 0 : undefined),
  format: value => value === 1 ? 'true' : 'false',
};

/**
 * The datatypes whose literals can be stored as numbers, by datatype IRI.
 */
export const COMPACT_LITERAL_KINDS = new Map<string, ICompactLiteralKind>([
  [ `${XSD}integer`, INTEGER ],
  [ `${XSD}long`, INTEGER ],
  [ `${XSD}int`, INTEGER ],
  [ `${XSD}short`, INTEGER ],
  [ `${XSD}byte`, INTEGER ],
  [ `${XSD}nonNegativeInteger`, INTEGER ],
  [ `${XSD}positiveInteger`, INTEGER ],
  [ `${XSD}nonPositiveInteger`, INTEGER ],
  [ `${XSD}negativeInteger`, INTEGER ],
  [ `${XSD}unsignedLong`, INTEGER ],
  [ `${XSD}unsignedInt`, INTEGER ],
  [ `${XSD}unsignedShort`, INTEGER ],
  [ `${XSD}unsignedByte`, INTEGER ],
  [ `${XSD}dateTime`, DATE_TIME ],
  [ `${XSD}date`, DATE ],
  [ `${XSD}boolean`, BOOLEAN ],
]);

/**
 * A map from numbers to non-negative integers, kept in typed arrays with open addressing,
 * so that its entries are not objects.
 */
export class NumberMap {
  private static readonly view = new Float64Array(1);
  private static readonly bits = new Uint32Array(NumberMap.view.buffer);
  private keys = new Float64Array(16);
  // -1 marks a free slot.
  private values = new Int32Array(16).fill(-1);
  private mask = 15;
  private count = 0;

  /**
   * The number of entries.
   */
  public get size(): number {
    return this.count;
  }

  private slot(key: number): number {
    NumberMap.view[0] = key;
    let hash = Math.imul(NumberMap.bits[0] ^ Math.imul(NumberMap.bits[1], 0x9E3779B1), 0x85EBCA6B);
    hash ^= hash >>> 15;
    let slot = hash & this.mask;
    while (this.values[slot] !== -1 && this.keys[slot] !== key) {
      slot = (slot + 1) & this.mask;
    }
    return slot;
  }

  public get(key: number): number | undefined {
    const value = this.values[this.slot(key)];
    return value === -1 ? undefined : value;
  }

  /**
   * Set the value of a key.
   * @param key A number other than NaN and -0.
   * @param value A non-negative integer below 2^31.
   */
  public set(key: number, value: number): void {
    if ((this.count + 1) * 2 > this.values.length) {
      this.grow();
    }
    const slot = this.slot(key);
    if (this.values[slot] === -1) {
      this.count++;
    }
    this.keys[slot] = key;
    this.values[slot] = value;
  }

  private grow(): void {
    const keys = this.keys;
    const values = this.values;
    this.keys = new Float64Array(keys.length * 2);
    this.values = new Int32Array(values.length * 2).fill(-1);
    this.mask = this.values.length - 1;
    for (const [ i, value ] of values.entries()) {
      if (value !== -1) {
        const slot = this.slot(keys[i]);
        this.keys[slot] = keys[i];
        this.values[slot] = value;
      }
    }
  }
}
