import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { matchPattern } from 'rdf-terms';
import { encodeOptionalTerms } from '../OrderUtils';
import type { QuadPatternTerms } from '../PatternTerm';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary for quoted triples.
 *
 * Plain terms and quoted triples are stored in separate dictionaries,
 * but quoted triples are encoded using encodings from the plain term dictionary.
 *
 * Finding quoted triples is done by iterating over all quoted triples, and filtering by the matching ones.
 */
export class TermDictionaryQuotedReferential implements ITermDictionary<number> {
  public static readonly BITMASK = 1 << 31;
  public static readonly SEPARATOR = '_';

  private readonly plainTermDictionary: ITermDictionary<number>;
  private readonly quotedTriplesDictionary: number[][] = [];
  private readonly quotedTriplesReverseDictionary: Record<string, number> = {};
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: true };

  public constructor(
    plainTermDictionary: ITermDictionary<number>,
    dataFactory: RDF.DataFactory = new DataFactory(),
  ) {
    this.plainTermDictionary = plainTermDictionary;
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): number {
    if (term.termType === 'Quad') {
      return this.encodeQuotedTriple(term, false);
    }
    return this.plainTermDictionary.encode(term);
  }

  private encodeQuotedTriple<O extends boolean>(
    quad: RDF.BaseQuad,
    optional: O,
  ): O extends true ? number | undefined : number {
    // Only quoted triples are supported
    if (quad.graph.termType !== 'DefaultGraph') {
      throw new Error('Encoding of quoted quads outside of the default graph is not allowed');
    }

    // Check if the quad was already encoded
    const encodedTripleOptional = encodeOptionalTerms(
      <QuadPatternTerms> [ quad.subject, quad.predicate, quad.object, undefined ],
      this,
    )?.slice(0, 3);
    const id = encodedTripleOptional && encodedTripleOptional.every(encoded => encoded !== undefined) ?
      this.quotedTriplesReverseDictionary[encodedTripleOptional.join(TermDictionaryQuotedReferential.SEPARATOR)] :
      undefined;

    // Return the encoding if we found one
    if (id !== undefined || optional) {
      // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
      return <O extends true ? number | undefined : number>
        (id === undefined ? undefined : TermDictionaryQuotedReferential.BITMASK | id);
    }

    // If the quad was not encoded yet, add a new entry for it in the dictionary.
    const encodedTriple = [
      this.encode(quad.subject),
      this.encode(quad.predicate),
      this.encode(quad.object),
    ];
    const encodingBase = this.quotedTriplesDictionary.length + 1;
    this.quotedTriplesDictionary.push(encodedTriple);
    this.quotedTriplesReverseDictionary[encodedTriple.join(TermDictionaryQuotedReferential.SEPARATOR)] = encodingBase;

    // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
    return TermDictionaryQuotedReferential.BITMASK | encodingBase;
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    if (term.termType === 'Quad') {
      return this.encodeQuotedTriple(term, true);
    }
    return this.plainTermDictionary.encodeOptional(term);
  }

  public decode(encoding: number): RDF.Term {
    if (TermDictionaryQuotedReferential.BITMASK & encoding) {
      // Term comes from the quoted triples dictionary
      const encodingBase = (~TermDictionaryQuotedReferential.BITMASK & encoding) - 1;
      if (encodingBase >= this.quotedTriplesDictionary.length) {
        throw new Error(`The value ${encoding} is not present in the quoted triples range of the dictionary`);
      }
      const encodedTerms = this.quotedTriplesDictionary[encodingBase];
      return this.dataFactory.quad(
        <RDF.Quad['subject']> this.decode(encodedTerms[0]),
        <RDF.Quad['predicate']> this.decode(encodedTerms[1]),
        <RDF.Quad['object']> this.decode(encodedTerms[2]),
      );
    }

    // Term comes from the plain terms dictionary
    return this.plainTermDictionary.decode(encoding);
  }

  public * encodings(): IterableIterator<number> {
    for (const encoding of this.plainTermDictionary.encodings()) {
      yield encoding;
    }
    for (const encoding of this.quotedTriplesDictionary.keys()) {
      yield TermDictionaryQuotedReferential.BITMASK | (1 + encoding);
    }
  }

  public * findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    for (const termEncoded of this.findQuotedTriplesEncoded(quotedTriplePattern)) {
      yield this.decode(termEncoded);
    }
  }

  public * findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<number> {
    for (let encodedQuotedTriple of this.quotedTriplesDictionary.keys()) {
      encodedQuotedTriple = TermDictionaryQuotedReferential.BITMASK | (1 + encodedQuotedTriple);
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
