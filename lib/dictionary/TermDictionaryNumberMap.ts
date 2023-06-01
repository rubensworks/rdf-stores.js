import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { stringToTerm, termToString } from 'rdf-string';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that encodes to numbers, and stores the dictionary in memory in a Map.
 */
export class TermDictionaryNumberMap implements ITermDictionary<number> {
  private lastId = 0;
  private readonly dictionary: Map<string, number> = new Map();
  private readonly reverseDictionary: Map<number, string> = new Map();
  private readonly dataFactory: RDF.DataFactory;
  public readonly features = { quotedTriples: false };

  public constructor(dataFactory: RDF.DataFactory = new DataFactory()) {
    this.dataFactory = dataFactory;
  }

  public encode(term: RDF.Term): number {
    const key = termToString(term);
    let encoded = this.dictionary.get(key);
    if (encoded === undefined) {
      encoded = this.lastId++;
      this.dictionary.set(key, encoded);
      this.reverseDictionary.set(encoded, key);
    }
    return encoded;
  }

  public encodeOptional(term: RDF.Term): number | undefined {
    const key = termToString(term);
    return this.dictionary.get(key);
  }

  public decode(encoding: number): RDF.Term {
    const string = this.reverseDictionary.get(encoding);
    if (string === undefined) {
      throw new Error(`The value ${encoding} is not present in this dictionary`);
    }
    return stringToTerm(string, this.dataFactory);
  }

  public encodings(): IterableIterator<number> {
    return this.reverseDictionary.keys();
  }

  public findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    throw new Error('findQuotedTriples is not supported');
  }

  public findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<number> {
    throw new Error('findQuotedTriplesEncoded is not supported');
  }
}
