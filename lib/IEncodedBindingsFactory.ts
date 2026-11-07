import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from './dictionary/ITermDictionary';
import type { EncodedQuadTerms } from './PatternTerm';

/**
 * Creates bindings from encoded quads, binding a fixed set of variables.
 */
export interface IEncodedBindingsCreator<TE> {
  /**
   * Create bindings from an encoded quad.
   * @param encodedQuad An encoded quad, of which the configured positions are bound.
   *                    It must not be retained, as it may be reused.
   */
  create: (encodedQuad: EncodedQuadTerms<TE>) => RDF.Bindings;
}

/**
 * A bindings factory that can also create bindings directly from encoded terms,
 * so that a store does not have to decode terms that may never be read.
 *
 * Such bindings decode their encodings with the store's dictionary when they are read,
 * and may compare two encodings of the same dictionary directly, as every term has a single encoding.
 */
export interface IEncodedBindingsFactory<TE> extends RDF.BindingsFactory {
  /**
   * Prepare creating bindings from encoded quads.
   * @param dictionary The dictionary of the encodings.
   * @param variables The variables to bind.
   * @param indexes For each variable, the position of its encoding within an encoded quad.
   * @return A creator, or undefined if the factory can not create bindings this way.
   */
  createEncodedBindingsCreator?: (
    dictionary: ITermDictionary<TE>,
    variables: RDF.Variable[],
    indexes: readonly number[],
  ) => IEncodedBindingsCreator<TE> | undefined;
}
