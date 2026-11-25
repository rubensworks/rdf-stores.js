import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { termToString } from 'rdf-string';
import { ChunkedMap } from '../ChunkedMap';
import { ChunkedRecord } from '../ChunkedRecord';
import type { ICompactLiteralKind } from './CompactLiterals';
import { COMPACT_LITERAL_KINDS, NumberMap } from './CompactLiterals';
import type { ITermDictionary } from './ITermDictionary';

/**
 * The encodings of literals with the same datatype, language and direction, by value.
 */
interface ILiterals {
  /**
   * The language or data type of this set of encodings.
   */
  languageOrDatatype: string | RDF.NamedNode | RDF.DirectionalLanguage;
  encodings: ChunkedMap<string, number>;
}

/**
 * The literals of a datatype that are stored as numbers, with the encodings of those numbers.
 */
interface ICompactLiterals {
  kind: ICompactLiteralKind;
  datatype: RDF.NamedNode;
  encodings: NumberMap;
  /**
   * The position of this table in the list of tables, plus one.
   */
  id: number;
}

/**
 * Options for {@link TermDictionaryNumberRecordFullTerms}.
 */
export interface ITermDictionaryNumberRecordFullTermsOptions {
  /**
   * If literals of integer, date, dateTime and boolean datatypes are stored as numbers rather than as term objects,
   * which takes less memory. Only literals in the lexical form that their number formats to are stored this way,
   * such as `5` but not `05`, so all literals are decoded exactly as they were encoded.
   * Decoding such a literal creates a new term object each time.
   */
  compactLiterals?: boolean;
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
 * A term dictionary that encodes to numbers, and stores the dictionary in memory.
 * The reverse dictionary will store full RDF term objects,
 * resulting in slightly better query performance at the cost of slightly higher memory usage.
 */
export class TermDictionaryNumberRecordFullTerms implements ITermDictionary<number> {
  private lastId = 0;
  private readonly dictionary = new ChunkedRecord<number>();
  // Blank nodes and literals are keyed by their value, so no key string has to be built for them.
  private readonly blankNodes = new ChunkedMap<string, number>();
  // Literals without a language by datatype, and literals with a language by language and direction.
  private readonly literalsByDatatype = new Map<string, ILiterals>();
  private readonly literalsByLanguage = new Map<string, ILiterals>();
  // Literals that are stored as numbers are not in here, so that decoding other terms costs the same as without them.
  private readonly reverseDictionary: Record<number, RDF.Term> = {};
  private readonly compactLiterals: boolean;
  // The tables of literals that are stored as numbers by datatype, or null for datatypes without one.
  private readonly compactTablesByDatatype = new Map<string, ICompactLiterals | null>();
  private readonly compactTables: ICompactLiterals[] = [];
  // The id of the table of each encoding that is stored as a number, 0 for other encodings.
  private compactTableIds = new Uint8Array(0);
  // The number of each encoding that is stored as a number.
  private compactNumbers = new Float64Array(0);
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: false };

  public constructor(
    dataFactory: RDF.DataFactory = new DataFactory(),
    options: ITermDictionaryNumberRecordFullTermsOptions = {},
  ) {
    this.dataFactory = dataFactory;
    this.compactLiterals = Boolean(options.compactLiterals);
  }

  public encode(term: RDF.Term): number {
    switch (term.termType) {
      case 'Literal': {
        if (this.compactLiterals && !term.language) {
          const table = this.compactTableOf(term.datatype.value, true);
          const number = table?.kind.parse(term.value);
          if (number !== undefined) {
            return this.encodeCompact(table!, number);
          }
        }
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
        let encoded = this.dictionary.get(key);
        if (encoded === undefined) {
          encoded = this.lastId++;
          this.dictionary.add(key, encoded);
          this.reverseDictionary[encoded] = term;
        }
        return encoded;
      }
    }
  }

  /**
   * The encoding of a literal that is stored as a number.
   * @param table The table of its datatype.
   * @param number Its number.
   */
  private encodeCompact(table: ICompactLiterals, number: number): number {
    let encoded = table.encodings.get(number);
    if (encoded === undefined) {
      encoded = this.lastId++;
      table.encodings.set(number, encoded);
      if (encoded >= this.compactTableIds.length) {
        const length = Math.max(1024, encoded + 1, Math.ceil(this.compactTableIds.length * 1.5));
        const ids = new Uint8Array(length);
        ids.set(this.compactTableIds);
        this.compactTableIds = ids;
        const numbers = new Float64Array(length);
        numbers.set(this.compactNumbers);
        this.compactNumbers = numbers;
      }
      this.compactTableIds[encoded] = table.id;
      this.compactNumbers[encoded] = number;
    }
    return encoded;
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    switch (term.termType) {
      case 'Literal':
        if (this.compactLiterals && !term.language) {
          const table = this.compactTableOf(term.datatype.value, false);
          const number = table?.kind.parse(term.value);
          if (number !== undefined) {
            return table!.encodings.get(number);
          }
        }
        return this.literalsOf(term, false)?.encodings.get(term.value);
      case 'BlankNode':
        return this.blankNodes.get(term.value);
      default:
        return this.dictionary.get(termToString(term));
    }
  }

  /**
   * The table of literals of a datatype that are stored as numbers, if literals of that datatype can be.
   * @param datatype A datatype IRI.
   * @param create If the table must be created if there is none yet.
   */
  private compactTableOf(datatype: string, create: boolean): ICompactLiterals | undefined {
    let table = this.compactTablesByDatatype.get(datatype);
    if (table === undefined) {
      if (!create) {
        return undefined;
      }
      const kind = COMPACT_LITERAL_KINDS.get(datatype);
      table = kind ?
          {
            kind,
            datatype: this.dataFactory.namedNode(copyString(datatype)),
            encodings: new NumberMap(),
            id: this.compactTables.length + 1,
          } :
        null;
      if (table) {
        this.compactTables.push(table);
      }
      this.compactTablesByDatatype.set(datatype, table);
    }
    return table ?? undefined;
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
        encodings: new ChunkedMap(),
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
    const term = this.reverseDictionary[encoding];
    if (term === undefined) {
      return this.decodeCompact(encoding);
    }
    return term;
  }

  /**
   * Decode a literal that is stored as a number.
   * @param encoding Its encoding.
   */
  private decodeCompact(encoding: number): RDF.Term {
    const tableId = this.compactTableIds[encoding];
    if (!tableId) {
      throw new Error(`The value ${encoding} is not present in this dictionary`);
    }
    const table = this.compactTables[tableId - 1];
    return this.dataFactory.literal(table.kind.format(this.compactNumbers[encoding]), table.datatype);
  }

  public* encodings(): IterableIterator<number> {
    // Every encoding below the last one belongs to a term, in the reverse dictionary or stored as a number.
    for (let encoding = 0; encoding < this.lastId; encoding++) {
      yield encoding;
    }
  }

  public findQuotedTriples(): IterableIterator<RDF.Term> {
    throw new Error('findQuotedTriples is not supported');
  }

  public findQuotedTriplesEncoded(): IterableIterator<number> {
    throw new Error('findQuotedTriplesEncoded is not supported');
  }
}
