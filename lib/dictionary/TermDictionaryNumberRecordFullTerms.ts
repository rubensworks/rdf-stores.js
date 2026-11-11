import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * The encodings of literals with the same datatype, language and direction, by value.
 */
interface ILiterals {
  /**
   * The language or data type of this set of encodings.
   */
  languageOrDatatype: string | RDF.NamedNode | RDF.DirectionalLanguage;
  encodings: Map<string, number>;
}

/**
 * V8 copies strings shorter than this instead of slicing or concatenating them.
 */
const MIN_SHARED_STRING_LENGTH = 13;

/**
 * Deeply copy a string.
 * This is necessary as parsers (such as N3.js) emit strings that are slices of
 * larger chunks, which V8 keeps in memory for as long as their slices are kept.
 * As such, we deeply copy long strings to avoid this problem.
 * @param value A string.
 */
function copyString(value: string): string {
  return value.length < MIN_SHARED_STRING_LENGTH ? value : [ value.slice(0, 1), value.slice(1) ].join('');
}

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
  // Literals without a language by datatype, and literals with a language by language and direction.
  private readonly literalsByDatatype = new Map<string, ILiterals>();
  private readonly literalsByLanguage = new Map<string, ILiterals>();
  private readonly reverseDictionary: Record<number, RDF.Term> = {};
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: false };

  public constructor(dataFactory: RDF.DataFactory = new DataFactory()) {
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): number {
    switch (term.termType) {
      case 'Literal': {
        const literals = this.literalsOf(term, true)!;
        let encoded = literals.encodings.get(term.value);
        if (encoded === undefined) {
          const value = copyString(term.value);
          encoded = this.lastId++;
          literals.encodings.set(value, encoded);
          this.reverseDictionary[encoded] = this.dataFactory.literal(value, literals.languageOrDatatype);
        }
        return encoded;
      }
      case 'BlankNode': {
        let encoded = this.blankNodes.get(term.value);
        if (encoded === undefined) {
          const value = copyString(term.value);
          encoded = this.lastId++;
          this.blankNodes.set(value, encoded);
          this.reverseDictionary[encoded] = this.dataFactory.blankNode(value);
        }
        return encoded;
      }
      default: {
        const key = termToString(term);
        let encoded = this.dictionary[key];
        if (encoded === undefined) {
          encoded = this.lastId++;
          this.dictionary[key] = encoded;
          this.reverseDictionary[encoded] = term;
        }
        return encoded;
      }
    }
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    switch (term.termType) {
      case 'Literal':
        return this.literalsOf(term, false)?.encodings.get(term.value);
      case 'BlankNode':
        return this.blankNodes.get(term.value);
      default:
        return this.dictionary[termToString(term)];
    }
  }

  /**
   * The literals with the same datatype, language and direction as the given one.
   * @param literal A literal.
   * @param create If they must be created if there are none yet.
   */
  private literalsOf(literal: RDF.Literal, create: boolean): ILiterals | undefined {
    const language = literal.language;
    const direction = literal.direction ?? '';
    const groups = language ? this.literalsByLanguage : this.literalsByDatatype;
    const key = language ? `${language}--${direction}` : literal.datatype.value;
    let literals = groups.get(key);
    if (!literals && create) {
      literals = {
        languageOrDatatype: this.getLanguageOrDatatype(literal.datatype.value, language, direction),
        encodings: new Map(),
      };
      groups.set(key, literals);
    }
    return literals;
  }

  private getLanguageOrDatatype(
    datatype: string,
    language: string,
    direction: string,
  ): string | RDF.NamedNode | RDF.DirectionalLanguage {
    if (!language) {
      return this.dataFactory.namedNode(copyString(datatype));
    }
    if (!direction) {
      return copyString(language);
    }
    return { language: copyString(language), direction: <RDF.DirectionalLanguage['direction']> direction };
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
