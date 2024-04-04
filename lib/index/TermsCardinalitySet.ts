import type { ITermsCardinalitySet } from './ITermsCardinalitySet';

export class TermsCardinalitySet<E> implements ITermsCardinalitySet<E> {
  private readonly map: Map<E, number>;

  public constructor() {
    this.map = new Map();
  }

  public add(key: E): number {
    const count = this.map.get(key);
    if (count) {
      this.map.set(key, count + 1);
      return count + 1;
    }
    this.map.set(key, 1);
    return 1;
  }

  public remove(key: E): number {
    const count = this.map.get(key);
    if (count && count - 1 === 0) {
      this.map.delete(key);
      return 0;
    }
    if (count) {
      this.map.set(key, count - 1);
      return count - 1;
    }
    return 0;
  }

  public getTerms(): E[] {
    return [ ...this.map.keys() ];
  }

  public count(key: E): number {
    const count = this.map.get(key);
    return count || 0;
  }
}
