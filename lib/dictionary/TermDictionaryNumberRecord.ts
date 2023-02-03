import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { stringToTerm, termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes to numbers, and stores the dictionary in memory in a Record.
 */
export class TermDictionaryNumberRecord implements ITermDictionary<number> {
  private lastId = 0;
  private readonly dictionary: Record<string, number> = {};
  private readonly reverseDictionary: Record<number, string> = {};
  private readonly dataFactory: RDF.DataFactory;

  public constructor(dataFactory: RDF.DataFactory = new DataFactory()) {
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): number {
    const key = termToString(term);
    let encoded = this.dictionary[key];
    if (encoded === undefined) {
      encoded = this.lastId++;
      this.dictionary[key] = encoded;
      this.reverseDictionary[encoded] = key;
    }
    return encoded;
  }

  public decode(encoding: number): RDF.Term {
    const string = this.reverseDictionary[encoding];
    if (string === undefined) {
      throw new Error(`The value ${encoding} is not present in this dictionary`);
    }
    return stringToTerm(string, this.dataFactory);
  }
}
