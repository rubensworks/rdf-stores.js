import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';

/**
 * An encoded term.
 */
export class TermEncoded<E> {
  private readonly dictionary: ITermDictionary<E>;
  public readonly encoding: E;

  private termDecoded: RDF.Term | undefined;

  public constructor(
    dictionary: ITermDictionary<E>,
    encoding: E,
    termDecoded?: RDF.Term,
  ) {
    this.dictionary = dictionary;
    this.encoding = encoding;
    this.termDecoded = termDecoded;
  }

  protected decode(): RDF.Term {
    console.trace(); // TODO
    // eslint-disable-next-line no-return-assign
    return this.termDecoded || (this.termDecoded = this.dictionary.decode(this.encoding));
  }

  public get termType(): string {
    // TODO: cleanup
    return (<any> this.dictionary).plainTermDictionary.decodeTermType(this.encoding);
    // console.trace(); // TODO
    // return this.decode().termType;
  }

  public get value(): string {
    // console.trace(); // TODO
    return this.decode().value;
  }

  public get language(): string | undefined {
    const decoded = this.decode();
    if (decoded.termType === 'Literal') {
      return decoded.language;
    }
    return undefined;
  }

  public get datatype(): RDF.NamedNode | undefined {
    const decoded = this.decode();
    if (decoded.termType === 'Literal') {
      return decoded.datatype;
    }
    return undefined;
  }

  public get subject(): RDF.Term | undefined {
    const decoded = this.decode();
    if (decoded.termType === 'Quad') {
      return decoded.subject;
    }
    return undefined;
  }

  public get predicate(): RDF.Term | undefined {
    const decoded = this.decode();
    if (decoded.termType === 'Quad') {
      return decoded.predicate;
    }
    return undefined;
  }

  public get object(): RDF.Term | undefined {
    const decoded = this.decode();
    if (decoded.termType === 'Quad') {
      return decoded.object;
    }
    return undefined;
  }

  public get graph(): RDF.Term | undefined {
    const decoded = this.decode();
    if (decoded.termType === 'Quad') {
      return decoded.graph;
    }
    return undefined;
  }

  public equals(other?: RDF.Term | null): boolean {
    if (!other) {
      return false;
    }
    // if (other.termType !== 'Variable' && !(<any> other).dictionary) {
    //   console.log(other); // TODO
    // }
    // if (!(<any> other).dictionary) {
    //   // console.log(other); // TODO
    // } else if ((<any> other).dictionary !== this.dictionary) {
    //   console.log('NPPPP'); // TODO
    //   console.log((<any> other).dictionary.constructor); // TODO
    //   console.log(this.dictionary.constructor); // TODO
    // }
    // if ((<any> other).dictionary === this.dictionary) {
    //   // console.log((<TermEncoded<E>> other).encoding === this.encoding); // TODO
    // } else {
    //   console.log('NOOOOOO'); // TODO
    //   console.log((<any> other).dictionary?.constructor); // TODO
    //   console.log((<any> this).dictionary.constructor); // TODO
    // }
    // return (<TermEncoded<E>> other).encoding === this.encoding;

    return (<any> other).dictionary === this.dictionary ?
      (<TermEncoded<E>> other).encoding === this.encoding :
      (other.termType !== 'Variable' && this.termType === other.termType && this.decode().equals(other));
  }
}
