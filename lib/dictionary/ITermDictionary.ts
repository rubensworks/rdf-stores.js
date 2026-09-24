import type * as RDF from '@rdfjs/types';

/**
 * A term dictionary is able to encode RDF terms into values of type E,
 * and decode values of type E into RDF terms.
 */
export interface ITermDictionary<TE> {
  /**
   * A record indicating supported features of this index.
   */
  features: {
    /**
     * If true, this dictionary implements the `findQuotedTriples` method.
     */
    quotedTriples?: boolean;
  };
  /**
   * Encode the given RDF term.
   * Multiple invocations of this method with the same term MUST return the same value.
   * @param term An RDF term.
   */
  encode: (term: RDF.Term) => TE;
  /**
   * Return the encoding of the given RDF term, but do not create a new encoding if it doesn't exist,
   * but return undefined.
   * @param term An RDF term.
   */
  encodeOptional: (term: RDF.Term) => TE | undefined;
  /**
   * Decode the given encoded value into an RDF term.
   * Multiple invocations of this method with the same term MUST return the same value.
   * @param encoding An encoded RDF term.
   */
  decode: (encoding: TE) => RDF.Term;
  /**
   * Return all encoded terms.
   */
  encodings: () => IterableIterator<TE>;
  /**
   * Find all quoted triples in this dictionary that match with the given triple pattern.
   * @param quotedTriplePattern A triple pattern to match with quoted triples.
   */
  findQuotedTriples: (quotedTriplePattern: RDF.Quad) => IterableIterator<RDF.Term>;
  /**
   * Find all encoded quoted triples in this dictionary that match with the given triple pattern.
   * @param quotedTriplePattern A triple pattern to match with quoted triples.
   */
  findQuotedTriplesEncoded: (quotedTriplePattern: RDF.Quad) => IterableIterator<TE>;
  /**
   * Renumber the encodings of this dictionary, so that the given encodings get increasing new encodings,
   * in the given order. This is optional: a dictionary that can not renumber itself omits it.
   *
   * Anything else that holds encodings of this dictionary must apply the returned mapping to them.
   * @param encodings Every encoding of this dictionary, each exactly once, in the desired order.
   * @return A function mapping each old encoding to its new one,
   *         or undefined if this dictionary can not be renumbered in its current state.
   */
  reorder?: (encodings: TE[]) => ((encoding: TE) => TE) | undefined;
}
