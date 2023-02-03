import type * as RDF from '@rdfjs/types';

/**
 * A term dictionary is able to encode RDF terms into values of type E,
 * and decode values of type E into RDF terms.
 */
export interface ITermDictionary<E> {
  /**
   * Encode the given RDF term.
   * Multiple invocations of this method with the same term MUST return the same value.
   * @param term An RDF term.
   */
  encode: (term: RDF.Term) => E;
  /**
   * Decode the given encoded value into an RDF term.
   * Multiple invocations of this method with the same term MUST return the same value.
   * @param encoding An encoded RDF term.
   */
  decode: (encoding: E) => RDF.Term;
}
