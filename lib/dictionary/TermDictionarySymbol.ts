import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { stringToTerm, termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes and decodes using symbols.
 */
export class TermDictionarySymbol implements ITermDictionary<symbol> {
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: false };

  public constructor(dataFactory: RDF.DataFactory = new DataFactory()) {
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): symbol {
    return Symbol.for(`rdf::${termToString(term)}`);
  }

  public encodeOptional(term: RDF.Term): symbol {
    return this.encode(term);
  }

  public decode(encoding: symbol): RDF.Term {
    const string = Symbol.keyFor(encoding);
    if (string === undefined) {
      throw new Error(`The value ${String(encoding)} is not present in this dictionary`);
    }
    return stringToTerm(string.slice(5), this.dataFactory);
  }

  public encodings(): IterableIterator<symbol> {
    throw new Error('encodings is not supported');
  }

  public findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    throw new Error('findQuotedTriples is not supported');
  }

  public findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<symbol> {
    throw new Error('findQuotedTriplesEncoded is not supported');
  }
}
