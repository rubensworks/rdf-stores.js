import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from '../dictionary/ITermDictionary';
import { TermEncoded } from './TermEncoded';

/**
 * A factory for instantiating RDF terms and quads.
 */
export class DataFactoryDictionary<E, Q extends RDF.BaseQuad = RDF.Quad> implements RDF.DataFactory<Q> {
  public readonly dictionary: ITermDictionary<E>;
  private readonly dataFactoryDirect: RDF.DataFactory<Q>;
  private readonly defaultGraphEncoding: E;

  public constructor(options: IDataFactoryOptions<E, Q>) {
    this.dictionary = options.dictionary;
    this.dataFactoryDirect = options.dataFactoryDirect;
    this.defaultGraphEncoding = this.dictionary.encode(this.dataFactoryDirect.defaultGraph());
  }

  protected asTermEncoded<T extends RDF.Term>(term: T): T {
    return <T> <any> new TermEncoded(this.dictionary, this.dictionary.encode(term), term);
  }

  /**
   * @param value The IRI for the named node.
   * @return A new instance of TermEncoded.
   * @see NamedNode
   */
  public namedNode<Iri extends string = string>(value: Iri): RDF.NamedNode<Iri> {
    return this.asTermEncoded(this.dataFactoryDirect.namedNode(value));
  }

  /**
   * @param value The optional blank node identifier.
   * @return A new instance of BlankNode.
   *         If the `value` parameter is undefined a new identifier
   *         for the blank node is generated for each call.
   * @see BlankNode
   */
  public blankNode(value?: string): RDF.BlankNode {
    return this.asTermEncoded(this.dataFactoryDirect.blankNode(value));
  }

  /**
   * @param value              The literal value.
   * @param languageOrDatatype The optional language, datatype, or directional language.
   *                           If `languageOrDatatype` is a TermEncoded,
   *                           then it is used for the value of `TermEncoded.datatype`.
   *                           If `languageOrDatatype` is a TermEncoded, it is used for the value
   *                           of `TermEncoded.language`.
   *                           Otherwise, it is used as a directional language,
   *                           from which the language is set to `languageOrDatatype.language`
   *                           and the direction to `languageOrDatatype.direction`.
   * @return A new instance of Literal.
   * @see Literal
   */
  public literal(value: string, languageOrDatatype?: string | RDF.NamedNode): RDF.Literal {
    return this.asTermEncoded(this.dataFactoryDirect.literal(value, languageOrDatatype));
  }

  /**
   * This method is optional.
   * @param value The variable name
   * @return A new instance of Variable.
   * @see Variable
   */
  public variable(value: string): RDF.Variable {
    return this.dataFactoryDirect.variable!(value);
  }

  /**
   * @return An instance of DefaultGraph.
   */
  public defaultGraph(): RDF.DefaultGraph {
    return <RDF.DefaultGraph> <any> new TermEncoded(
      this.dictionary,
      this.defaultGraphEncoding,
      this.dataFactoryDirect.defaultGraph(),
    );
  }

  /**
   * @param subject   The quad subject term.
   * @param predicate The quad predicate term.
   * @param object    The quad object term.
   * @param graph     The quad graph term.
   * @return A new instance of Quad.
   * @see Quad
   */
  public quad(
    subject: Q['subject'],
    predicate: Q['predicate'],
    object: Q['object'],
    graph?: Q['graph'],
  ): Q & RDF.Quad {
    return <Q & RDF.Quad> this.dataFactoryDirect.quad(
      subject.termType === 'Variable' ?
        subject :
        (subject instanceof TermEncoded ?
          subject :
          <RDF.Term> new TermEncoded<E>(this.dictionary, this.dictionary.encode(subject), subject)),
      predicate.termType === 'Variable' ?
        predicate :
        (predicate instanceof TermEncoded ?
          predicate :
          <RDF.Term> new TermEncoded<E>(this.dictionary, this.dictionary.encode(predicate), predicate)),
      object.termType === 'Variable' ?
        object :
        (object instanceof TermEncoded ?
          object :
          <RDF.Term> new TermEncoded<E>(this.dictionary, this.dictionary.encode(object), object)),
      !graph || graph.termType === 'DefaultGraph' ?
<RDF.Term> new TermEncoded<E>(this.dictionary, this.defaultGraphEncoding, this.dataFactoryDirect.defaultGraph()) :
        (graph.termType === 'Variable' ?
          graph :
          (graph instanceof TermEncoded ?
            graph :
            <RDF.Term> new TermEncoded<E>(this.dictionary, this.dictionary.encode(graph), graph))),
    );
  }

  /**
   * Create a deep copy of the given term using this data factory.
   * @param original An RDF term.
   * @return A deep copy of the given term.
   */
  public fromTerm<T extends RDF.Term>(original: T):
  (T extends RDF.NamedNode ? RDF.NamedNode
    : (T extends RDF.BlankNode ? RDF.BlankNode
      : (T extends RDF.Literal ? RDF.Literal
        : (T extends RDF.Variable ? RDF.Variable
          : (T extends RDF.DefaultGraph ? RDF.DefaultGraph
            : (T extends Q ? Q : unknown)))))) {
    if (original instanceof TermEncoded) {
      return <any> original;
    }
    return <any> this.asTermEncoded(original);
  }

  /**
   * Create a deep copy of the given quad using this data factory.
   * @param original An RDF quad.
   * @return A deep copy of the given quad.
   */
  public fromQuad(original: Q): Q {
    return <Q> this.fromTerm(original);
  }
}

export interface IDataFactoryOptions<E, Q extends RDF.BaseQuad = RDF.Quad> {
  dictionary: ITermDictionary<E>;
  dataFactoryDirect: RDF.DataFactory<Q>;
}
