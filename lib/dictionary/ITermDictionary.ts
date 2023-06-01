import type * as RDF from '@rdfjs/types';

/**
 * A term dictionary is able to encode RDF terms into values of type E,
 * and decode values of type E into RDF terms.
 */
export interface ITermDictionary<E> {
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
  encode: (term: RDF.Term) => E;
  /**
   * Return the encoding of the given RDF term, but do not create a new encoding if it doesn't exist,
   * but return undefined.
   * @param term An RDF term.
   */
  encodeOptional: (term: RDF.Term) => E | undefined;
  /**
   * Decode the given encoded value into an RDF term.
   * Multiple invocations of this method with the same term MUST return the same value.
   * @param encoding An encoded RDF term.
   */
  decode: (encoding: E) => RDF.Term;
  /**
   * Find all quoted triples in this dictionary that match with the given triple pattern.
   * @param quotedTriplePattern A triple pattern to match with quoted triples.
   */
  findQuotedTriples: (quotedTriplePattern: RDF.Quad) => IterableIterator<RDF.Term>;
  /**
   * Find all encoded quoted triples in this dictionary that match with the given triple pattern.
   * @param quotedTriplePattern A triple pattern to match with quoted triples.
   */
  findQuotedTriplesEncoded: (quotedTriplePattern: RDF.Quad) => IterableIterator<E>;
}
