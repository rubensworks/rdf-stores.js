import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes to numbers based on the term type,
 * and stores the dictionary in memory in a Record.
 *
 * The reverse dictionary will store full RDF term objects,
 * resulting in slightly better query performance at the cost of slightly higher memory usage.
 */
export class TermDictionaryNumberTermTypeRecordFullTerms implements ITermDictionary<number> {
  private static readonly ENCODING_SHIFT = 3;
  private lastIdNamedNode = 0;
  private lastIdBlankNode = 0;
  private lastIdLiteralDatatype = 0;
  private lastIdLiteralLanguage = 0;
  private readonly dictionaryNamedNode: Record<string, number> = {};
  private readonly dictionaryBlankNode: Record<string, number> = {};
  private readonly dictionaryLiteralDatatype: Record<string, Record<string, number>> = {};
  private readonly dictionaryLiteralLanguage: Record<string, Record<string, number>> = {};
  private dictionaryDefaultGraph = false;
  private readonly reverseDictionary: Record<number, RDF.Term> = {};
  public readonly features = { quotedTriples: false };

  public encode(term: RDF.Term): number {
    switch (term.termType) {
      case 'NamedNode': {
        let encoded = this.dictionaryNamedNode[term.value];
        if (encoded === undefined) {
          const encodedPartial = this.lastIdNamedNode++;
          encoded = encodedPartial << TermDictionaryNumberTermTypeRecordFullTerms.ENCODING_SHIFT;
          this.dictionaryNamedNode[term.value] = encoded;
          this.reverseDictionary[encoded] = term;
        }
        return encoded;
      }
      case 'BlankNode': {
        let encoded = this.dictionaryBlankNode[term.value];
        if (encoded === undefined) {
          const encodedPartial = this.lastIdBlankNode++;
          encoded = (encodedPartial << TermDictionaryNumberTermTypeRecordFullTerms.ENCODING_SHIFT) | 1;
          this.dictionaryBlankNode[term.value] = encoded;
          this.reverseDictionary[encoded] = term;
        }
        return encoded;
      }
      case 'Literal': {
        if (term.language) {
          let encoded = (this.dictionaryLiteralLanguage[term.language] ||
            (this.dictionaryLiteralLanguage[term.language] = {}))[term.value];
          if (encoded === undefined) {
            const encodedPartial = this.lastIdLiteralLanguage++;
            encoded = (encodedPartial << TermDictionaryNumberTermTypeRecordFullTerms.ENCODING_SHIFT) | 2;
            this.dictionaryLiteralLanguage[term.language][term.value] = encoded;
            this.reverseDictionary[encoded] = term;
          }
          return encoded;
        }
        let encoded = (this.dictionaryLiteralDatatype[term.datatype.value] ||
            (this.dictionaryLiteralDatatype[term.datatype.value] = {}))[term.value];
        if (encoded === undefined) {
          const encodedPartial = this.lastIdLiteralDatatype++;
          encoded = (encodedPartial << TermDictionaryNumberTermTypeRecordFullTerms.ENCODING_SHIFT) | 3;
          this.dictionaryLiteralDatatype[term.datatype.value][term.value] = encoded;
          this.reverseDictionary[encoded] = term;
        }
        return encoded;
      }
      case 'DefaultGraph': {
        if (!this.dictionaryDefaultGraph) {
          this.dictionaryDefaultGraph = true;
          this.reverseDictionary[4] = term;
        }
        return 4;
      }
      case 'Variable': { throw new Error('Encoding of Variables is not supported'); }
      case 'Quad': { throw new Error('Encoding of Quads is not supported'); }
    }
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    switch (term.termType) {
      case 'NamedNode': {
        return this.dictionaryNamedNode[term.value];
      }
      case 'BlankNode': {
        return this.dictionaryBlankNode[term.value];
      }
      case 'Literal': {
        if (term.language) {
          const map = this.dictionaryLiteralLanguage[term.language];
          return map ? map[term.value] : undefined;
        }
        const map = this.dictionaryLiteralDatatype[term.datatype.value];
        return map ? map[term.value] : undefined;
      }
      case 'DefaultGraph': {
        if (this.dictionaryDefaultGraph) {
          return 4;
        }
        return undefined;
      }
      case 'Variable': { throw new Error('Encoding of Variables is not supported'); }
      case 'Quad': { throw new Error('Encoding of Quads is not supported'); }
    }
  }

  public decode(encoding: number): RDF.Term {
    const term = this.reverseDictionary[encoding];
    if (term === undefined) {
      throw new Error(`The value ${encoding} is not present in this dictionary`);
    }
    return term;
  }

  public decodeTermType(encoding: number): 'NamedNode' | 'BlankNode' | 'Literal' | 'DefaultGraph' {
    const masked = encoding & 7;
    switch (masked) {
      case 0: return 'NamedNode';
      case 1: return 'BlankNode';
      case 2:
      case 3: return 'Literal';
      case 4: return 'DefaultGraph';
      default:
        throw new Error(`The value ${encoding} is of an unknown term type`);
    }
  }

  public * encodings(): IterableIterator<number> {
    for (const key of Object.keys(this.reverseDictionary)) {
      yield Number.parseInt(key, 10);
    }
  }

  public findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    throw new Error('findQuotedTriples is not supported');
  }

  public findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<number> {
    throw new Error('findQuotedTriplesEncoded is not supported');
  }
}
