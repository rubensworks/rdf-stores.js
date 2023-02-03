import
  type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { stringToTerm, termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes and decodes using symbols.
 */
export class TermDictionarySymbol implements ITermDictionary<symbol> {
  private readonly dataFactory: RDF.DataFactory;

  public constructor(dataFactory: RDF.DataFactory = new DataFactory()) {
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): symbol {
    return Symbol.for(`rdf::${termToString(term)}`);
  }

  public decode(encoding: symbol): RDF.Term {
    const string = Symbol.keyFor(encoding);
    if (string === undefined) {
      throw new Error(`The value ${String(encoding)} is not present in this dictionary`);
    }
    return stringToTerm(string.slice(5), this.dataFactory);
  }
}
