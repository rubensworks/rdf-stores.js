import type * as RDF from '@rdfjs/types';

const XSD = 'http://www.w3.org/2001/XMLSchema#';

/**
 * How literals of a datatype are stored as a number, for the literals whose lexical form that number gives back exactly.
 */
interface ICompactKind {
  /**
   * The number for a lexical form, or undefined if the lexical form is not the one `format` gives for it.
   */
  parse: (value: string) => number | undefined;
  format: (value: number) => string;
}

const INTEGER: ICompactKind = {
  parse(value) {
    const number = Number(value);
    return Number.isSafeInteger(number) && String(number) === value ? number : undefined;
  },
  format: value => String(value),
};

const DATE_TIME: ICompactKind = {
  parse(value) {
    // Only the form of toISOString: four digit years, milliseconds, and UTC.
    if (value.length !== 24 || value.charCodeAt(23) !== 90) {
      return undefined;
    }
    const time = Date.parse(value);
    return Number.isNaN(time) || new Date(time).toISOString() !== value ? undefined : time;
  },
  format: value => new Date(value).toISOString(),
};

const DATE: ICompactKind = {
  parse(value) {
    if (value.length !== 10) {
      return undefined;
    }
    const time = Date.parse(value);
    return Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value ? undefined : time;
  },
  format: value => new Date(value).toISOString().slice(0, 10),
};

const BOOLEAN: ICompactKind = {
  parse: value => value === 'true' ? 1 : (value === 'false' ? 0 : undefined),
  format: value => value ? 'true' : 'false',
};

/**
 * The datatypes whose literals can be stored as numbers.
 */
export const COMPACT_KINDS: Record<string, ICompactKind> = {
  [`${XSD}integer`]: INTEGER,
  [`${XSD}long`]: INTEGER,
  [`${XSD}int`]: INTEGER,
  [`${XSD}short`]: INTEGER,
  [`${XSD}byte`]: INTEGER,
  [`${XSD}nonNegativeInteger`]: INTEGER,
  [`${XSD}positiveInteger`]: INTEGER,
  [`${XSD}nonPositiveInteger`]: INTEGER,
  [`${XSD}negativeInteger`]: INTEGER,
  [`${XSD}unsignedLong`]: INTEGER,
  [`${XSD}unsignedInt`]: INTEGER,
  [`${XSD}unsignedShort`]: INTEGER,
  [`${XSD}unsignedByte`]: INTEGER,
  [`${XSD}dateTime`]: DATE_TIME,
  [`${XSD}date`]: DATE,
  [`${XSD}boolean`]: BOOLEAN,
};

/**
 * A map from numbers to non-negative integers, kept in typed arrays with open addressing,
 * so that its entries are not objects.
 */
export class NumberMap {
  private keys = new Float64Array(16);
  private values = new Int32Array(16).fill(-1);
  private mask = 15;
  private count = 0;
  private static readonly view = new Float64Array(1);
  private static readonly bits = new Uint32Array(NumberMap.view.buffer);

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
    for (let i = 0; i < values.length; i++) {
      if (values[i] !== -1) {
        const slot = this.slot(keys[i]);
        this.keys[slot] = keys[i];
        this.values[slot] = values[i];
      }
    }
  }
}

/**
 * The literals of one datatype that are stored as numbers.
 */
export interface ICompactLiterals {
  kind: ICompactKind;
  datatype: RDF.NamedNode;
  encodings: NumberMap;
  /**
   * This table's position in the dictionary's list of tables, plus one.
   */
  id: number;
}
