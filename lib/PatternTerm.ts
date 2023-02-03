import type * as RDF from '@rdfjs/types';

/**
 * A term that can be used for lookup in an index.
 */
export type PatternTerm = RDF.NamedNode | RDF.BlankNode | RDF.Literal | RDF.DefaultGraph | undefined;

/**
 * Four pattern terms.
 */
export type QuadPatternTerms = [ PatternTerm, PatternTerm, PatternTerm, PatternTerm ];
