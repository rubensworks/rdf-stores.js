import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { matchPattern } from 'rdf-terms';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary for quoted triples.
 *
 * Plain terms and quoted triples are stored in separate dictionaries.
 *
 * Finding quoted triples is done by iterating over all quoted triples, and filtering by the matching ones.
 */
export class TermDictionaryQuoted implements ITermDictionary<number> {
  public static readonly BITMASK = 1 << 31;

  private readonly plainTermDictionary: ITermDictionary<number>;
  private readonly quotedTriplesDictionary: ITermDictionary<number>;
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: true };

  public constructor(
    plainTermDictionary: ITermDictionary<number>,
    quotedTriplesDictionary: ITermDictionary<number>,
    dataFactory: RDF.DataFactory = new DataFactory(),
  ) {
    this.plainTermDictionary = plainTermDictionary;
    this.quotedTriplesDictionary = quotedTriplesDictionary;
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): number {
    if (term.termType === 'Quad') {
      // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
      return TermDictionaryQuoted.BITMASK | (1 + this.quotedTriplesDictionary.encode(term));
    }
    return this.plainTermDictionary.encode(term);
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    if (term.termType === 'Quad') {
      const encoding = this.quotedTriplesDictionary.encodeOptional(term);
      if (encoding === undefined) {
        return encoding;
      }
      // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
      return TermDictionaryQuoted.BITMASK | (1 + encoding);
    }
    return this.plainTermDictionary.encodeOptional(term);
  }

  public decode(encoding: number): RDF.Term {
    if (TermDictionaryQuoted.BITMASK & encoding) {
      // Term comes from the quoted triples dictionary
      const encodingBase = (~TermDictionaryQuoted.BITMASK & encoding) - 1;
      return this.quotedTriplesDictionary.decode(encodingBase);
    }

    // Term comes from the plain terms dictionary
    return this.plainTermDictionary.decode(encoding);
  }

  public * encodings(): IterableIterator<number> {
    for (const encoding of this.plainTermDictionary.encodings()) {
      yield encoding;
    }
    for (const encoding of this.quotedTriplesDictionary.encodings()) {
      yield TermDictionaryQuoted.BITMASK | (1 + encoding);
    }
  }

  public * findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    for (const termEncoded of this.findQuotedTriplesEncoded(quotedTriplePattern)) {
      yield this.decode(termEncoded);
    }
  }

  public * findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<number> {
    for (let encodedQuotedTriple of this.quotedTriplesDictionary.encodings()) {
      encodedQuotedTriple = TermDictionaryQuoted.BITMASK | (1 + encodedQuotedTriple);
      const quotedTriple = this.decode(encodedQuotedTriple);
      if (matchPattern(
        <RDF.BaseQuad> quotedTriple,
        quotedTriplePattern.subject,
        quotedTriplePattern.predicate,
        quotedTriplePattern.object,
        quotedTriplePattern.graph,
      )) {
        yield encodedQuotedTriple;
      }
    }
  }
}
