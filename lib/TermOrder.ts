import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from './dictionary/ITermDictionary';

/**
 * The distance between the labels of neighbouring terms right after a relabel.
 * Terms inserted one by one take the midpoint of their neighbours, so this leaves room for about
 * twenty such insertions at one spot before everything has to be relabelled.
 */
const SPACING = 1 << 20;
/**
 * The number of encodings per chunk of the sorted term list.
 */
const CHUNK_SIZE = 1024;
/**
 * The bits of an encoding that remain after removing the flag that the quoted dictionaries set.
 */
const QUOTED_MASK = 0x7FFFFFFF;

const TERM_TYPE_ORDER: Record<string, number> = {
  /* eslint-disable ts/naming-convention */
  DefaultGraph: 0,
  BlankNode: 1,
  NamedNode: 2,
  Literal: 3,
  Quad: 4,
  Variable: 5,
  /* eslint-enable ts/naming-convention */
};

/**
 * A total order over RDF terms, used when no other comparator is given.
 * Orders on term type first, then on value, then on datatype, language, and base direction.
 * Two terms compare as equal exactly if they are equal RDF terms.
 * @param left A term.
 * @param right A term.
 */
export function defaultTermComparator(left: RDF.Term, right: RDF.Term): number {
  if (left.termType !== right.termType) {
    return TERM_TYPE_ORDER[left.termType] - TERM_TYPE_ORDER[right.termType];
  }
  if (left.termType === 'Quad') {
    const rightQuad = <RDF.BaseQuad> right;
    return defaultTermComparator(left.subject, rightQuad.subject) ||
      defaultTermComparator(left.predicate, rightQuad.predicate) ||
      defaultTermComparator(left.object, rightQuad.object) ||
      defaultTermComparator(left.graph, rightQuad.graph);
  }
  if (left.value !== right.value) {
    return left.value < right.value ? -1 : 1;
  }
  if (left.termType === 'Literal') {
    const rightLiteral = <RDF.Literal> right;
    if (left.datatype.value !== rightLiteral.datatype.value) {
      return left.datatype.value < rightLiteral.datatype.value ? -1 : 1;
    }
    if (left.language !== rightLiteral.language) {
      return left.language < rightLiteral.language ? -1 : 1;
    }
    const leftDirection = left.direction ?? '';
    const rightDirection = rightLiteral.direction ?? '';
    if (leftDirection !== rightDirection) {
      return leftDirection < rightDirection ? -1 : 1;
    }
  }
  return 0;
}

/**
 * Keeps every term that an ordered index holds in a sorted order, and gives each a numeric label
 * that increases along it, so that indexes can compare encoded terms without decoding them.
 *
 * Labels only ever keep their relative order, never their value: a term that is added between two
 * others takes the midpoint of their labels, and when no midpoint is left, all terms are relabelled.
 * Indexes therefore store encodings rather than labels, and look the labels up when comparing.
 *
 * Only dictionaries that encode to non-negative integers, optionally with the high bit set for
 * quoted triples, are supported. All bundled number dictionaries do.
 */
export class TermOrder {
  public readonly dictionary: ITermDictionary<number>;
  public readonly comparator: (left: RDF.Term, right: RDF.Term) => number;
  // Allocated on first use, since every store creates a term order, also when none of its indexes use one.
  private plainLabels: Float64Array = new Float64Array(0);
  private quotedLabels: Float64Array = new Float64Array(0);
  /**
   * All known encodings in sorted order, split into chunks so that inserting one stays cheap.
   */
  private chunks: number[][] = [];
  private termCount = 0;
  /**
   * If every label is exactly its rank plus one, times the spacing, which is what a relabel produces.
   */
  private uniform = true;

  public constructor(
    dictionary: ITermDictionary<number>,
    comparator: (left: RDF.Term, right: RDF.Term) => number = defaultTermComparator,
  ) {
    this.dictionary = dictionary;
    this.comparator = comparator;
  }

  /**
   * The number of terms in this order.
   */
  public get size(): number {
    return this.termCount;
  }

  /**
   * The label of an encoding, or 0 if it is not in this order.
   * @param encoding An encoded term.
   */
  public label(encoding: number): number {
    if (encoding >= 0) {
      const labels = this.plainLabels;
      return encoding < labels.length ? labels[encoding] : 0;
    }
    const index = encoding & QUOTED_MASK;
    const labels = this.quotedLabels;
    return index < labels.length ? labels[index] : 0;
  }

  /**
   * The rank of a known encoding, which is only valid right after {@link TermOrder#makeUniform}.
   * @param encoding An encoded term.
   */
  public rank(encoding: number): number {
    return (this.label(encoding) / SPACING) - 1;
  }

  private setLabel(encoding: number, value: number): void {
    if (encoding >= 0) {
      if (encoding >= this.plainLabels.length) {
        this.plainLabels = TermOrder.grow(this.plainLabels, encoding);
      }
      this.plainLabels[encoding] = value;
    } else {
      const index = encoding & QUOTED_MASK;
      if (index >= this.quotedLabels.length) {
        this.quotedLabels = TermOrder.grow(this.quotedLabels, index);
      }
      this.quotedLabels[index] = value;
    }
  }

  private static grow(labels: Float64Array, index: number): Float64Array {
    let length = Math.max(1024, labels.length * 2);
    while (length <= index) {
      length *= 2;
    }
    const grown = new Float64Array(length);
    grown.set(labels);
    return grown;
  }

  /**
   * Compare two distinct encodings. Terms that the comparator considers equal are ordered on their
   * encoding, so that the order is total.
   * @param left An encoded term.
   * @param right An encoded term.
   */
  public compareEncodings(left: number, right: number): number {
    return this.comparator(this.dictionary.decode(left), this.dictionary.decode(right)) || (left - right);
  }

  /**
   * Add a single encoding to this order, if it is not in it yet.
   * @param encoding An encoded term.
   */
  public add(encoding: number): void {
    if (this.label(encoding) !== 0) {
      return;
    }
    const chunks = this.chunks;
    if (this.termCount === 0) {
      chunks.push([ encoding ]);
      this.termCount = 1;
      this.setLabel(encoding, SPACING);
      return;
    }

    // Find the first chunk whose last element comes after the encoding, or the last chunk.
    let low = 0;
    let high = chunks.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      const chunk = chunks[middle];
      if (this.compareEncodings(chunk.at(-1)!, encoding) > 0) {
        high = middle;
      } else {
        low = middle + 1;
      }
    }
    const chunkIndex = low;
    const chunk = chunks[chunkIndex];
    let position = 0;
    let end = chunk.length;
    while (position < end) {
      const middle = (position + end) >>> 1;
      if (this.compareEncodings(chunk[middle], encoding) > 0) {
        end = middle;
      } else {
        position = middle + 1;
      }
    }

    const previous = position > 0 ?
      chunk[position - 1] :
        (chunkIndex > 0 ? chunks[chunkIndex - 1][chunks[chunkIndex - 1].length - 1] : undefined);
    const next = position < chunk.length ? chunk[position] : undefined;
    const previousLabel = previous === undefined ? 0 : this.label(previous);
    let label: number;
    if (next === undefined) {
      label = previousLabel + SPACING;
    } else {
      label = (previousLabel + this.label(next)) / 2;
      this.uniform = false;
    }

    chunk.splice(position, 0, encoding);
    this.termCount++;
    if (chunk.length > 2 * CHUNK_SIZE) {
      chunks.splice(chunkIndex + 1, 0, chunk.splice(CHUNK_SIZE));
    }
    if (label <= previousLabel || (next !== undefined && label >= this.label(next))) {
      // No room was left between the neighbours.
      this.relabel();
    } else {
      this.setLabel(encoding, label);
    }
  }

  /**
   * Add many encodings at once, which sorts the new ones a single time and merges them in,
   * instead of inserting them one by one.
   * @param encodings Encoded terms, possibly with duplicates and with terms already in this order.
   * @param length The number of entries of `encodings` to consider.
   */
  public addAll(encodings: ArrayLike<number>, length: number): void {
    // Mark new encodings with a negative label while collecting them, to skip duplicates.
    const added: number[] = [];
    for (let i = 0; i < length; i++) {
      const encoding = encodings[i];
      if (this.label(encoding) === 0) {
        this.setLabel(encoding, -1);
        added.push(encoding);
      }
    }
    if (added.length === 0) {
      return;
    }
    for (const encoding of added) {
      this.setLabel(encoding, 0);
    }

    // A handful of new terms is cheaper to insert one by one than to merge with all known terms.
    if (added.length * 16 < this.termCount) {
      for (const encoding of added) {
        this.add(encoding);
      }
      return;
    }

    added.sort((left, right) => this.compareEncodings(left, right));
    const merged: number[] = [];
    let addedIndex = 0;
    for (const chunk of this.chunks) {
      for (const encoding of chunk) {
        while (addedIndex < added.length && this.compareEncodings(added[addedIndex], encoding) < 0) {
          merged.push(added[addedIndex++]);
        }
        merged.push(encoding);
      }
    }
    while (addedIndex < added.length) {
      merged.push(added[addedIndex++]);
    }

    this.chunks = [];
    for (let i = 0; i < merged.length; i += CHUNK_SIZE) {
      this.chunks.push(merged.slice(i, i + CHUNK_SIZE));
    }
    this.termCount = merged.length;
    this.relabel();
  }

  /**
   * Make sure that every label is its rank plus one, times the spacing, so that {@link TermOrder#rank} holds.
   */
  public makeUniform(): void {
    if (!this.uniform) {
      this.relabel();
    }
  }

  private relabel(): void {
    let label = SPACING;
    for (const chunk of this.chunks) {
      for (const encoding of chunk) {
        this.setLabel(encoding, label);
        label += SPACING;
      }
    }
    this.uniform = true;
  }

  /**
   * The label of the first known term that is not before the given term, or Infinity if there is none.
   * The term does not have to be known, so a key `k` is before `term` exactly if `label(k)` is lower.
   * @param term A term.
   */
  public lowerBound(term: RDF.Term): number {
    const chunks = this.chunks;
    let low = 0;
    let high = chunks.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      const chunk = chunks[middle];
      if (this.comparator(this.dictionary.decode(chunk.at(-1)!), term) < 0) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    if (low === chunks.length) {
      return Number.POSITIVE_INFINITY;
    }
    const chunk = chunks[low];
    let position = 0;
    let end = chunk.length - 1;
    while (position < end) {
      const middle = (position + end) >>> 1;
      if (this.comparator(this.dictionary.decode(chunk[middle]), term) < 0) {
        position = middle + 1;
      } else {
        end = middle;
      }
    }
    return this.label(chunk[position]);
  }
}
