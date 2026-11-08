import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * The encodings of literals with the same datatype, language and direction, by value.
 */
interface ILiterals {
  datatype: string;
  language: string;
  direction: string;
  /**
   * What new literals are created with, which they share.
   */
  languageOrDatatype: string | RDF.NamedNode | RDF.DirectionalLanguage;
  encodings: Map<string, number>;
}

/**
 * Copy a string, so the copy does not keep a larger string alive.
 * Parsers usually produce strings that are slices of the chunks they parse,
 * which V8 keeps alive for as long as any of their slices.
 * Joining parts of a string creates a new flat string, unlike concatenating or slicing it.
 * @param value A string.
 */
function copyString(value: string): string {
  return value.length > 1 ? [ value.slice(0, 1), value.slice(1) ].join('') : value;
}

/**
 * A term dictionary that encodes to numbers, and stores the dictionary in memory in a Record.
 * The reverse dictionary will store full RDF term objects,
 * resulting in slightly better query performance at the cost of slightly higher memory usage.
 * It stores its own copies of literals and blank nodes, created with its data factory,
 * so they do not keep alive what the given terms were parsed from.
 */
export class TermDictionaryNumberRecordFullTerms implements ITermDictionary<number> {
  private lastId = 0;
  private readonly dictionary: Record<string, number> = {};
  // Blank nodes and literals are keyed by their value, so no key string has to be built for them.
  private readonly blankNodes = new Map<string, number>();
  private readonly literals = new Map<string, ILiterals>();
  // The literals of the last datatype, language and direction, which consecutive literals often share.
  private lastLiterals: ILiterals | undefined;
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
        const key = term.termType === 'NamedNode' ? term.value : termToString(term);
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
        return this.dictionary[term.termType === 'NamedNode' ? term.value : termToString(term)];
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
    // The datatype of a literal with a language follows from its language and direction.
    const datatype = language ? '' : literal.datatype.value;
    const last = this.lastLiterals;
    if (!last || datatype !== last.datatype || language !== last.language || direction !== last.direction) {
      const key = `${datatype}@${language}--${direction}`;
      let literals = this.literals.get(key);
      if (!literals) {
        if (!create) {
          return undefined;
        }
        literals = {
          datatype: copyString(datatype),
          language: copyString(language),
          direction,
          languageOrDatatype: this.getLanguageOrDatatype(datatype, language, direction),
          encodings: new Map(),
        };
        this.literals.set(key, literals);
      }
      this.lastLiterals = literals;
    }
    return this.lastLiterals;
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
