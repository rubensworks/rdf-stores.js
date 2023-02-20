import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes to numbers, and stores the dictionary in memory in a Record.
 * The reverse dictionary will store full RDF term objects,
 * resulting in slightly better query performance at the cost of slightly higher memory usage.
 */
export class TermDictionaryNumberRecordFullTerms implements ITermDictionary<number> {
  private lastId = 0;
  private readonly dictionary: Record<string, number> = {};
  private readonly reverseDictionary: Record<number, RDF.Term> = {};
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
      this.reverseDictionary[encoded] = term;
    }
    return encoded;
  }

  public decode(encoding: number): RDF.Term {
    const string = this.reverseDictionary[encoding];
    if (string === undefined) {
      throw new Error(`The value ${encoding} is not present in this dictionary`);
    }
    return string;
  }
}
