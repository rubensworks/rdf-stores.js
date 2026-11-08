import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes to numbers, and stores the dictionary in memory in a Record.
 * The reverse dictionary will store full RDF term objects,
 * resulting in slightly better query performance at the cost of slightly higher memory usage.
 */
export class TermDictionaryNumberRecordFullTerms implements ITermDictionary<number> {
  private lastId = 0;
  private readonly dictionary: Record<string, number> = {};
  // Blank nodes and literals are keyed by their value, so no key string has to be built for them.
  private readonly blankNodes = new Map<string, number>();
  private readonly literals = new Map<string, Map<string, number>>();
  // The literals of the last datatype, language and direction, which consecutive literals often share.
  private lastDatatype: string | undefined;
  private lastLanguage = '';
  private lastDirection = '';
  private lastLiterals: Map<string, number> | undefined;
  private readonly reverseDictionary: Record<number, RDF.Term> = {};
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: false };

  public constructor(dataFactory: RDF.DataFactory = new DataFactory()) {
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): number {
    if (term.termType === 'Literal') {
      return this.encodeIn(this.literalsOf(term, true)!, term);
    }
    if (term.termType === 'BlankNode') {
      return this.encodeIn(this.blankNodes, term);
    }
    const key = termToString(term);
    let encoded = this.dictionary[key];
    if (encoded === undefined) {
      encoded = this.lastId++;
      this.dictionary[key] = encoded;
      this.reverseDictionary[encoded] = term;
    }
    return encoded;
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    if (term.termType === 'Literal') {
      return this.literalsOf(term, false)?.get(term.value);
    }
    if (term.termType === 'BlankNode') {
      return this.blankNodes.get(term.value);
    }
    return this.dictionary[termToString(term)];
  }

  private encodeIn(encodings: Map<string, number>, term: RDF.Term): number {
    let encoded = encodings.get(term.value);
    if (encoded === undefined) {
      encoded = this.lastId++;
      encodings.set(term.value, encoded);
      this.reverseDictionary[encoded] = term;
    }
    return encoded;
  }

  /**
   * The encodings of the literals with the same datatype, language and direction as the given one, by value.
   * @param literal A literal.
   * @param create If the encodings must be created if there are none yet.
   */
  private literalsOf(literal: RDF.Literal, create: boolean): Map<string, number> | undefined {
    const language = literal.language;
    const direction = literal.direction ?? '';
    // The datatype of a literal with a language follows from its language and direction.
    const datatype = language ? '' : literal.datatype.value;
    if (datatype !== this.lastDatatype || language !== this.lastLanguage || direction !== this.lastDirection) {
      const key = `${datatype}@${language}--${direction}`;
      let literals = this.literals.get(key);
      if (!literals) {
        if (!create) {
          return undefined;
        }
        literals = new Map();
        this.literals.set(key, literals);
      }
      this.lastDatatype = datatype;
      this.lastLanguage = language;
      this.lastDirection = direction;
      this.lastLiterals = literals;
    }
    return this.lastLiterals;
  }

  public decode(encoding: number): RDF.Term {
    const string = this.reverseDictionary[encoding];
    if (string === undefined) {
      throw new Error(`The value ${encoding} is not present in this dictionary`);
    }
    return string;
  }

  public* encodings(): IterableIterator<number> {
    for (const key of Object.keys(this.reverseDictionary)) {
      yield Number.parseInt(key, 10);
    }
  }

  public findQuotedTriples(): IterableIterator<RDF.Term> {
    throw new Error('findQuotedTriples is not supported');
  }

  public findQuotedTriplesEncoded(): IterableIterator<number> {
    throw new Error('findQuotedTriplesEncoded is not supported');
  }
}
