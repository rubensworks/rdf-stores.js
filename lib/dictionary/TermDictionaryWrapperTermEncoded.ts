import type * as RDF from '@rdfjs/types';
import { TermEncoded } from '../datafactory/TermEncoded';
import type { ITermDictionary } from './ITermDictionary';

/**
 * A term dictionary that lazily decodes encodings.
 *
 * During decoding, it will return a `TermEncoded` that contains the encoding value.
 * During encoding, it will first check if we're encoding a `TermEncoded`.
 * If so, the stored encoding value is returned.
 * Otherwise, the inner dictionary is consulted for encoding.
 */
export class TermDictionaryWrapperTermEncoded<E> implements ITermDictionary<E> {
  private readonly innerDictionary: ITermDictionary<E>;

  public constructor(
    innerDictionary: ITermDictionary<E>,
  ) {
    this.innerDictionary = innerDictionary;
  }

  public get features(): { quotedTriples?: boolean | undefined } {
    return this.innerDictionary.features;
  }

  public encode(term: RDF.Term): E {
    const encoding: E | undefined = (<TermEncoded<E>> term).encoding;
    if (encoding !== undefined) {
      return encoding;
    }

    return this.innerDictionary.encode(term);
  }

  public encodeOptional(term: RDF.Term): E | undefined {
    const encoding: E | undefined = (<TermEncoded<E>> term).encoding;
    if (encoding !== undefined) {
      return encoding;
    }

    return this.innerDictionary.encodeOptional(term);
  }

  public decode(encoding: E): RDF.Term {
    return <RDF.Term> new TermEncoded(this.innerDictionary, encoding);
  }

  public encodings(): IterableIterator<E> {
    return this.innerDictionary.encodings();
  }

  public findQuotedTriples(quotedTriplePattern: RDF.Quad): IterableIterator<RDF.Term> {
    return this.innerDictionary.findQuotedTriples(quotedTriplePattern);
  }

  public findQuotedTriplesEncoded(quotedTriplePattern: RDF.Quad): IterableIterator<E> {
    return this.innerDictionary.findQuotedTriplesEncoded(quotedTriplePattern);
  }
}
