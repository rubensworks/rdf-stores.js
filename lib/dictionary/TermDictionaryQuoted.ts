import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { RdfStoreIndexNestedRecord } from '../index/RdfStoreIndexNestedRecord';
import { encodeOptionalTerms } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms } from '../PatternTerm';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary for quoted triples.
 *
 * Plain terms are stored in a regular dictionary.
 * Quoted triples are stored separately using an index, which is backed the same dictionary.
 */
export class TermDictionaryQuoted implements ITermDictionary<number> {
  public static readonly BITMASK = 1 << 31;

  private readonly plainTermDictionary: ITermDictionary<number>;
  private readonly quotedTriplesDictionary: number[][] = [];
  private readonly quotedTriplesReverseDictionary: RdfStoreIndexNestedRecord<number, number>;
  private readonly dataFactory: RDF.DataFactory;

  public constructor(
    rawTermDictionary: ITermDictionary<number>,
    dataFactory: RDF.DataFactory = new DataFactory(),
  ) {
    this.plainTermDictionary = rawTermDictionary;
    this.quotedTriplesReverseDictionary = new RdfStoreIndexNestedRecord({
      indexCombinations: [[ 'subject', 'predicate', 'object' ]],
      // Not required
      indexConstructor: <any> undefined,
      dictionary: this.plainTermDictionary,
      dataFactory,
    });
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
      <QuadPatternTerms> [ quad.subject, quad.predicate, quad.object, quad.graph ],
      this,
    );
    const id = encodedTripleOptional && encodedTripleOptional.every(encoded => encoded !== undefined) ?
      this.quotedTriplesReverseDictionary.getEncoded(<EncodedQuadTerms<number>> encodedTripleOptional) :
      undefined;

    // Return the encoding if we found one
    if (id !== undefined || optional) {
      // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
      return <O extends true ? number | undefined : number>
        (id === undefined ? undefined : TermDictionaryQuoted.BITMASK | id);
    }

    // If the quad was not encoded yet, add a new entry for it in the dictionary.
    const encodedTriple = [
      this.encode(quad.subject),
      this.encode(quad.predicate),
      this.encode(quad.object),
    ];
    const encodingBase = this.quotedTriplesDictionary.length + 1;
    this.quotedTriplesDictionary.push(encodedTriple);
    this.quotedTriplesReverseDictionary.set(<EncodedQuadTerms<number>> [
      ...encodedTriple,
      this.encode(this.dataFactory.defaultGraph()),
    ], encodingBase);

    // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
    return TermDictionaryQuoted.BITMASK | encodingBase;
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    if (term.termType === 'Quad') {
      return this.encodeQuotedTriple(term, true);
    }
    return this.plainTermDictionary.encodeOptional(term);
  }

  public decode(encoding: number): RDF.Term {
    if (TermDictionaryQuoted.BITMASK & encoding) {
      // Term comes from the quoted triples dictionary
      const encodingBase = (~TermDictionaryQuoted.BITMASK & encoding) - 1;
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
}
