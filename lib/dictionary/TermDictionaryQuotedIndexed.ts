import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { RdfStoreIndexNestedMap } from '../index/RdfStoreIndexNestedMap';
import type { IRdfStoreOptions } from '../IRdfStoreOptions';
import { encodeOptionalTerms, quadToPattern } from '../OrderUtils';
import type { EncodedQuadTerms, QuadPatternTerms, PatternTerm } from '../PatternTerm';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary for quoted triples.
 *
 * Plain terms are stored in a regular dictionary.
 * Quoted triples are stored separately using an index, which is backed the same dictionary.
 *
 * Finding quoted triples is done through indexed lookups.
 */
export class TermDictionaryQuotedIndexed implements ITermDictionary<number> {
  public static readonly BITMASK = 1 << 31;

  private readonly plainTermDictionary: ITermDictionary<number>;
  private readonly quotedTriplesDictionary: number[][] = [];
  // The indexes below are sorted in SPO, POS, and OSP order
  private readonly quotedTriplesReverseDictionaries: RdfStoreIndexNestedMap<number, number>[];
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: true };

  public constructor(
    rawTermDictionary: ITermDictionary<number>,
    dataFactory: RDF.DataFactory = new DataFactory(),
  ) {
    this.plainTermDictionary = rawTermDictionary;
    const subIndexOpts: IRdfStoreOptions<number> = {
      // Not required
      indexCombinations: [],
      // Not required
      indexConstructor: <any> undefined,
      dictionary: this,
      dataFactory,
    };
    this.quotedTriplesReverseDictionaries = [
      new RdfStoreIndexNestedMap(subIndexOpts),
      new RdfStoreIndexNestedMap(subIndexOpts),
      new RdfStoreIndexNestedMap(subIndexOpts),
    ];
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
      this.quotedTriplesReverseDictionaries[0].getEncoded(<EncodedQuadTerms<number>> encodedTripleOptional) :
      undefined;

    // Return the encoding if we found one
    if (id !== undefined || optional) {
      // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
      return <O extends true ? number | undefined : number>
        (id === undefined ? undefined : TermDictionaryQuotedIndexed.BITMASK | id);
    }

    // If the quad was not encoded yet, add a new entry for it in the dictionary.
    const encodedTriple = [
      this.encode(quad.subject),
      this.encode(quad.predicate),
      this.encode(quad.object),
    ];
    const encodingBase = this.quotedTriplesDictionary.length + 1;
    this.quotedTriplesDictionary.push(encodedTriple);
    const encodedGraph = this.encode(this.dataFactory.defaultGraph());
    this.quotedTriplesReverseDictionaries[0].set(<EncodedQuadTerms<number>> [
      encodedTriple[0],
      encodedTriple[1],
      encodedTriple[2],
      encodedGraph,
    ], encodingBase);
    this.quotedTriplesReverseDictionaries[1].set(<EncodedQuadTerms<number>> [
      encodedTriple[1],
      encodedTriple[2],
      encodedTriple[0],
      encodedGraph,
    ], encodingBase);
    this.quotedTriplesReverseDictionaries[2].set(<EncodedQuadTerms<number>> [
      encodedTriple[2],
      encodedTriple[0],
      encodedTriple[1],
      encodedGraph,
    ], encodingBase);

    // Mask MSB to indicate that the encoding should refer to the quoted triples dictionary.
    return TermDictionaryQuotedIndexed.BITMASK | encodingBase;
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    if (term.termType === 'Quad') {
      return this.encodeQuotedTriple(term, true);
    }
    return this.plainTermDictionary.encodeOptional(term);
  }

  public decode(encoding: number): RDF.Term {
    if (TermDictionaryQuotedIndexed.BITMASK & encoding) {
      // Term comes from the quoted triples dictionary
      const encodingBase = (~TermDictionaryQuotedIndexed.BITMASK & encoding) - 1;
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
      yield TermDictionaryQuotedIndexed.BITMASK | (1 + encoding);
    }
  }

  public * findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    for (const termEncoded of this.findQuotedTriplesEncoded(quotedTriplePattern)) {
      yield this.decode(termEncoded);
    }
  }

  public * findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<number> {
    const [ patternIn, requireQuotedTripleFiltering ] = quadToPattern(
      quotedTriplePattern.subject,
      quotedTriplePattern.predicate,
      quotedTriplePattern.object,
      quotedTriplePattern.graph,
      true,
    );

    // Find all matching terms iteratively
    for (const termS of this.patternToIterable(patternIn[0])) {
      for (const termP of this.patternToIterable(patternIn[1])) {
        for (const termO of this.patternToIterable(patternIn[2])) {
          for (const termG of this.patternToIterable(patternIn[3])) {
            // Find all terms matching the pattern from the reverse indexes
            // We select the reverse index according to the current triple pattern
            if ((termS && termP) || (!termP && !termO)) {
              // SPO
              const pattern: EncodedQuadTerms<number | undefined> = [ termS, termP, termO, termG ];
              for (const termEncoded of this.quotedTriplesReverseDictionaries[0].findEncoded(pattern, patternIn)) {
                yield TermDictionaryQuotedIndexed.BITMASK |
                this.quotedTriplesReverseDictionaries[0].getEncoded(termEncoded)!;
              }
            } else if (!termS && termP) {
              // POS
              const pattern: EncodedQuadTerms<number | undefined> = [ termP, termO, termS, termG ];
              for (const termEncoded of this.quotedTriplesReverseDictionaries[1].findEncoded(pattern, patternIn)) {
                yield TermDictionaryQuotedIndexed.BITMASK |
                this.quotedTriplesReverseDictionaries[1].getEncoded(termEncoded)!;
              }
            } else {
              // OSP
              const pattern: EncodedQuadTerms<number | undefined> = [ termO, termS, termP, termG ];
              for (const termEncoded of this.quotedTriplesReverseDictionaries[2].findEncoded(pattern, patternIn)) {
                yield TermDictionaryQuotedIndexed.BITMASK |
                this.quotedTriplesReverseDictionaries[2].getEncoded(termEncoded)!;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Helper function to convert a term to an iterator over encoded terms.
   * @param patternTerm A term.
   * @protected
   */
  protected * patternToIterable(patternTerm: PatternTerm): IterableIterator<number | undefined> {
    // If the term is another quoted quad, recursively find other quoted triples
    if (patternTerm?.termType === 'Quad') {
      yield * this.findQuotedTriplesEncoded(patternTerm);
      return;
    }

    // Undefined terms indicate a variable
    if (patternTerm === undefined) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      yield undefined;
      return;
    }

    // Defined terms indicate a precise match
    const enc = this.encodeOptional(patternTerm);
    if (enc === undefined) {
      return;
    }
    yield enc;
  }
}
