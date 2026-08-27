import type * as RDF from '@rdfjs/types';
import { matchPatternMappings } from 'rdf-terms';
import type { ITermDictionary } from './dictionary/ITermDictionary';
import type { EncodedQuadTerms } from './PatternTerm';

/**
 * Converts the encoded results of an index lookup into bindings objects.
 *
 * This is a plain class with a `read` method instead of a generator function,
 * because the bindings of a single lookup are consumed in three different ways:
 * into an array by `RdfStore#getBindings`, through a generator by `RdfStore#readBindings`,
 * and through an async iterator by `RdfStore#matchBindings`.
 * Expressing the conversion as a generator would add a suspend/resume and an
 * iterator result object per produced binding to each of those,
 * on top of the ones the index iterator itself already produces.
 *
 * This class handles patterns without quoted triple patterns and without overlapping variables,
 * which is the case for virtually every pattern a query engine produces.
 * {@link FilteringBindingsProducer} handles the remaining cases.
 */
export class BindingsProducer<TE> {
  protected readonly bindingsFactory: RDF.BindingsFactory;
  protected readonly source: Iterator<EncodedQuadTerms<TE>>;
  protected readonly dictionary: ITermDictionary<TE>;
  /**
   * The pattern terms, ordered in the component order of the index that is being read.
   */
  protected readonly terms: RDF.Term[];
  /**
   * The positions within {@link BindingsProducer#terms} that must be bound.
   */
  protected readonly variableIndexes: number[];
  protected readonly variableCount: number;
  /**
   * The last encoding and decoding that was seen for each entry of
   * {@link BindingsProducer#variableIndexes}.
   */
  private readonly memoIds: (TE | undefined)[];
  private readonly memoTerms: RDF.Term[];

  public constructor(
    bindingsFactory: RDF.BindingsFactory,
    source: Iterator<EncodedQuadTerms<TE>>,
    dictionary: ITermDictionary<TE>,
    terms: RDF.Term[],
    variableIndexes: number[],
  ) {
    this.bindingsFactory = bindingsFactory;
    this.source = source;
    this.dictionary = dictionary;
    this.terms = terms;
    this.variableIndexes = variableIndexes;
    this.variableCount = variableIndexes.length;
    this.memoIds = [];
    this.memoTerms = [];
    for (let variableI = 0; variableI < this.variableCount; variableI++) {
      this.memoIds.push(undefined);
      // eslint-disable-next-line ts/no-unsafe-argument
      this.memoTerms.push(<any> undefined);
    }
  }

  /**
   * Decode the term for the given variable slot, reusing the previous decoding when possible.
   *
   * Indexes emit their results in nested-map order, so consecutive results share their leading
   * components: a component that only changes once every N results is decoded once instead of
   * N times.
   *
   * @param variableI The offset within {@link BindingsProducer#variableIndexes}.
   * @param encodedTerm The encoded term to decode.
   */
  protected decodeMemoized(variableI: number, encodedTerm: TE): RDF.Term {
    if (encodedTerm === this.memoIds[variableI]) {
      return this.memoTerms[variableI];
    }
    const decodedTerm = this.dictionary.decode(encodedTerm);
    this.memoIds[variableI] = encodedTerm;
    this.memoTerms[variableI] = decodedTerm;
    return decodedTerm;
  }

  /**
   * Produce the next bindings object, or `null` if no results remain.
   */
  public read(): RDF.Bindings | null {
    const next = this.source.next();
    if (next.done === true) {
      return null;
    }
    const decomposedQuadEncoded = next.value;
    const variableCount = this.variableCount;
    const bindingsEntries: [RDF.Variable, RDF.Term][] = [];
    for (let variableI = 0; variableI < variableCount; variableI++) {
      const i = this.variableIndexes[variableI];
      bindingsEntries.push([
        <RDF.Variable> this.terms[i],
        this.decodeMemoized(variableI, decomposedQuadEncoded[i]),
      ]);
    }
    return this.bindingsFactory.bindings(bindingsEntries);
  }

  /**
   * Stop reading from the underlying index.
   */
  public close(): void {
    this.source.return?.();
  }
}

/**
 * A {@link BindingsProducer} for patterns that contain quoted triple patterns
 * and/or overlapping variables, which require results to be post-filtered.
 */
export class FilteringBindingsProducer<TE> extends BindingsProducer<TE> {
  private readonly dataFactory: RDF.DataFactory<any>;
  /**
   * For each entry of {@link BindingsProducer#variableIndexes},
   * whether the corresponding pattern term is a quoted triple pattern.
   */
  private readonly variableIsQuad: boolean[];
  /**
   * For each component that occurs more than once within the pattern,
   * the other component positions that must have an equal value.
   */
  private readonly filterIndexes: number[][] | undefined;

  public constructor(
    bindingsFactory: RDF.BindingsFactory,
    source: Iterator<EncodedQuadTerms<TE>>,
    dictionary: ITermDictionary<TE>,
    terms: RDF.Term[],
    variableIndexes: number[],
    dataFactory: RDF.DataFactory<any>,
    variableIsQuad: boolean[],
    filterIndexes: number[][] | undefined,
  ) {
    super(bindingsFactory, source, dictionary, terms, variableIndexes);
    this.dataFactory = dataFactory;
    this.variableIsQuad = variableIsQuad;
    this.filterIndexes = filterIndexes;
  }

  public override read(): RDF.Bindings | null {
    // Results that conflict on overlapping variables are skipped, so this keeps
    // pulling from the index until an acceptable result or the end is reached.
    for (;;) {
      const next = this.source.next();
      if (next.done === true) {
        return null;
      }
      const bindingsEntries = this.createBindingsEntries(next.value);
      if (bindingsEntries !== undefined) {
        return this.bindingsFactory.bindings(bindingsEntries);
      }
    }
  }

  /**
   * Create the bindings entries for a single index result,
   * or `undefined` if the result must be skipped.
   * @param decomposedQuadEncoded An encoded quad, ordered in the index's component order.
   */
  private createBindingsEntries(
    decomposedQuadEncoded: EncodedQuadTerms<TE>,
  ): [RDF.Variable, RDF.Term][] | undefined {
    const terms = this.terms;
    const filterIndexes = this.filterIndexes;
    const variableCount = this.variableCount;
    let checkForBindingConflicts = false;
    const bindingsEntries: [RDF.Variable, RDF.Term][] = [];
    for (let variableI = 0; variableI < variableCount; variableI++) {
      const i = this.variableIndexes[variableI];
      // If we had overlapping variables, potentially exclude this binding if values for variable are unequal
      if (filterIndexes) {
        const filterI = filterIndexes[i];
        if (filterI !== undefined) {
          for (const j of filterI) {
            if (decomposedQuadEncoded[i] !== decomposedQuadEncoded[j]) {
              return undefined;
            }
          }
        }
      }

      const decodedTerm = this.dictionary.decode(decomposedQuadEncoded[i]);

      // Handle quoted triples
      // TODO: it may be possible to implement a more efficient of findEncoded if requireQuotedTripleFiltering is
      //  false that would return bindings instead of quads. The following could then be skipped.
      //  variableIndexes would also need to be changed to check requireQuotedTripleFiltering (see readQuads).
      if (this.variableIsQuad[variableI]) {
        // If the term is a quad, it may also contain nested variables,
        // so we need to extract those additional bindings.
        const additionalBindings =
          matchPatternMappings(<RDF.Quad> decodedTerm, <RDF.Quad> terms[i], { returnMappings: true });
        if (!additionalBindings) {
          return undefined;
        }
        checkForBindingConflicts = true;
        for (const [ key, value ] of Object.entries(additionalBindings)) {
          const variable = this.dataFactory.variable!(key);
          if (bindingsEntries.some(entry => entry[0].equals(variable) && !entry[1].equals(value))) {
            // Skip this binding if we find conflicting variable bindings
            return undefined;
          }
          bindingsEntries.push([ variable, value ]);
        }
        continue;
      }

      // If for the current bindings object, we previously found a quoted quad term that bound variables within it,
      // make sure that later bindings to this variable from other terms don't conflict.
      if (checkForBindingConflicts && bindingsEntries
        .some(entry => entry[0].equals(terms[i]) && !entry[1].equals(decodedTerm))) {
        // Skip this binding if we find conflicting variable bindings
        return undefined;
      }

      bindingsEntries.push([ <RDF.Variable> terms[i], decodedTerm ]);
    }
    return bindingsEntries;
  }
}
