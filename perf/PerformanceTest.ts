/* eslint-disable no-console */
/* eslint-disable ts/no-unsafe-argument */
import * as assert from 'node:assert';
import { BindingsFactory } from '@comunica/utils-bindings-factory';
import type * as RDF from '@rdfjs/types';
import { arrayifyStream } from 'arrayify-stream';
import { Store } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';
import { RdfStore } from '../lib/RdfStore';
import { defaultTermComparator } from '../lib/TermOrder';

/**
 * Run a set of performance tests over a set of storage approaches.
 * These tests have been based on https://github.com/rdfjs/N3.js/blob/main/perf/N3Store-perf.js
 */
/**
 * The number of properties of each entity in the entities scope.
 */
const ENTITY_PROPERTIES = 16;

export class PerformanceTest {
  /**
   * If all progress reporting must be suppressed.
   *
   * This is needed when a benchmark runner measures these tests itself:
   * the console I/O and the `process.memoryUsage()` calls below would otherwise
   * end up inside the measured region and show up as part of the results.
   */
  public quiet = false;
  /**
   * Quads that are waiting to be added in one batch, if the current approach adds quads in batches.
   */
  protected pending: RDF.Quad[] | undefined;

  public readonly approaches: IPerformanceTestApproach[];
  /**
   * Creates the approaches anew, so that every scope gets its own dictionary and indexes.
   */
  protected readonly makeApproaches: () => IPerformanceTestApproach[];

  /**
   * @param approaches The approaches to test, or a function that creates them. Only with a function, every scope
   *                   gets its own dictionary, instead of sharing the one in the approach, which keeps the terms
   *                   of earlier scopes, and of other approaches, in the memory that is measured.
   * @param dimension The dimension of the datasets.
   * @param prefix The prefix of the IRIs in the datasets.
   * @param dataFactory The data factory.
   * @param bindingsFactory The bindings factory.
   */
  public constructor(
    approaches: IPerformanceTestApproach[] | (() => IPerformanceTestApproach[]),
    public readonly dimension = 256,
    public readonly prefix = 'http://example.org/#',
    public readonly dataFactory: RDF.DataFactory = new DataFactory(),
    public readonly bindingsFactory: RDF.BindingsFactory = new BindingsFactory(<any> this.dataFactory),
  ) {
    this.makeApproaches = typeof approaches === 'function' ? approaches : () => approaches;
    this.approaches = this.makeApproaches();
  }

  /**
   * The options for a new store of an approach.
   * @param index The index of the approach.
   */
  protected storeOptions(index: number): IRdfStoreOptions<any, any> {
    const approach = this.makeApproaches()[index];
    return approach.options.type === 'rdfstore' ? approach.options.options : <IRdfStoreOptions<any, any>> {};
  }

  protected timeStart(label: string): void {
    if (!this.quiet) {
      console.time(label);
    }
  }

  protected timeEnd(label: string): void {
    if (!this.quiet) {
      console.timeEnd(label);
    }
  }

  protected print(message = ''): void {
    if (!this.quiet) {
      console.log(message);
    }
  }

  /**
   * Add a quad to the store, or hold it until the batch is flushed.
   * @param store The store.
   * @param quad The quad to add.
   */
  protected add(store: RdfStore | Store, quad: RDF.Quad): void {
    if (this.pending) {
      this.pending.push(quad);
    } else {
      store.addQuad(quad);
    }
  }

  /**
   * Add all held quads to the store at once.
   * @param store The store.
   */
  protected flush(store: RdfStore | Store): void {
    if (this.pending && this.pending.length > 0) {
      (<RdfStore> store).addQuads(this.pending);
      this.pending = [];
    }
  }

  /**
   * Print the memory in use. When garbage collection can be triggered (`node --expose-gc`), this is the heap
   * in use right after collecting, plus memory outside the heap such as the buffers of typed arrays, which is
   * what the current store holds, as the stores of earlier scopes are garbage by then. Otherwise, it is the
   * resident set size, which also includes memory that is no longer in use but was not returned to the
   * operating system.
   * @param label What was just added.
   */
  protected printMemory(label: string): void {
    if (!this.quiet) {
      const gc = (<{ gc?: () => void }> globalThis).gc;
      let bytes = process.memoryUsage().rss;
      if (gc) {
        // The buffers of garbage typed arrays are only released by the collection after the one that finds them.
        gc();
        gc();
        const usage = process.memoryUsage();
        bytes = usage.heapUsed + usage.external;
      }
      console.log(`* Memory usage for ${label}: ${Math.round(bytes / 1_024 / 1_024)}MB`);
    }
  }

  public async run(
    scope: 'all' | 'triples' | 'bindings' | 'quads' | 'quoted' | 'terms' | 'terms-filtered' | 'nodes' | 'entities',
  ): Promise<void> {
    for (const [ index, approach ] of this.approaches.entries()) {
      this.print(`\n# ${approach.name}\n`);
      this.pending = approach.options.type === 'rdfstore' && approach.options.batch ? [] : undefined;

      if (scope === 'all' || scope === 'triples') {
        await this.inScope(async() => {
          const store = approach.options.type === 'n3' ? new Store() : new RdfStore(approach.options.options);
          this.addTriplesToDefaultGraph(this.dimension, store);
          this.findTriplesNoVariables(this.dimension, store);
          this.findTriples1Variable(this.dimension, store);
          this.findTriples2Variables(this.dimension, store);
          if (approach.options.type !== 'n3') {
            this.findBindings2Variables(this.dimension, <any> store);
          }
          await this.findTriples1VariableStream(this.dimension, <any>store);
          this.countTriples1Variable(this.dimension, store);
          this.print();
        });
      }

      // Reading bindings has its own scope, so that adding a case to it does not change what the
      // `triples` scope measures. It runs at half the dimension, like the `quoted` scope, to keep
      // the cost of the extra ingestion down. The N3 store has no bindings API, so it is skipped.
      // Data about entities, which unlike the other scopes has as many distinct terms as triples,
      // as real data tends to, which nested indexes are least suited to.
      if (scope === 'all' || scope === 'entities') {
        await this.inScope(async() => {
          const store = approach.options.type === 'n3' ? new Store() : new RdfStore(this.storeOptions(index));
          this.addEntities(this.dimension, store);
          this.countEntityProperties(this.dimension, store);
          await this.findEntityPropertiesSorted(this.dimension, store);
          this.print();
        });
      }

      if ((scope === 'all' || scope === 'bindings') && approach.options.type !== 'n3') {
        await this.inScope(async() => {
          const store = new RdfStore(this.storeOptions(index));
          this.addTriplesToDefaultGraph(this.dimension / 2, store);
          this.findBindings2Variables(this.dimension / 2, store);
          await this.findBindings2VariablesStream(this.dimension / 2, store);
          this.findBindings1Variable(this.dimension / 2, store);
          this.print();
        });
      }

      if (scope === 'all' || scope === 'quads') {
        await this.inScope(async() => {
          const store = approach.options.type === 'n3' ? new Store() : new RdfStore(approach.options.options);
          this.addQuadsToGraphs(this.dimension / 4, store);
          this.findQuadsInGraphs(this.dimension / 4, store);
          this.print();
        });
      }

      if ((scope === 'all' || scope === 'quoted') && approach.options.type !== 'n3') {
        await this.inScope(async() => {
          const store = new RdfStore(this.storeOptions(index));
          this.addQuotedTriplesToGraphs(this.dimension / 2, store);
          this.findQuotedTriplesInGraphs(this.dimension / 2, store);
          this.print();
        });
      }

      if ((scope === 'all' || scope === 'terms') && approach.options.type !== 'n3' &&
        approach.options.options.indexCombinations.length >= 3) {
        await this.inScope(async() => {
          const store = new RdfStore(this.storeOptions(index));
          this.addQuadsToGraphs(this.dimension / 4, store);
          this.findTerms1(this.dimension / 4, store);
          this.countTerms1(this.dimension / 4, store);
          this.findTerms2(this.dimension / 4, store);
          this.countTerms2(this.dimension / 4, store);
          this.findTerms3(this.dimension / 4, store);
          this.countTerms3(this.dimension / 4, store);
          this.findTerms4(this.dimension / 4, store);
          this.countTerms4(this.dimension / 4, store);
          this.findTerms1WithFilter(this.dimension / 4, store);
          this.countTerms1WithFilter(this.dimension / 4, store);
          this.print();
        });
      }

      // Counting distinct terms under filters has its own scope, because inside the `terms` scope
      // its cost is dwarfed by the ingestion and the unfiltered cases, which hides changes to it.
      if ((scope === 'all' || scope === 'terms-filtered') && approach.options.type !== 'n3' &&
        approach.options.options.indexCombinations.length >= 3) {
        await this.inScope(async() => {
          const store = new RdfStore(this.storeOptions(index));
          this.addQuadsToGraphs(this.dimension / 4, store);
          this.countTerms1WithFilters(this.dimension / 4, store);
          this.countTerms2WithFilters(this.dimension / 4, store);
          this.print();
        });
      }

      if ((scope === 'all' || scope === 'nodes') && approach.options.type !== 'n3' &&
        approach.options.options.indexNodes) {
        await this.inScope(async() => {
          const store = new RdfStore(this.storeOptions(index));
          this.addQuadsToGraphs(this.dimension / 4, store);
          this.findNodes(this.dimension / 4, store);
          this.print();
        });
      }
    }
  }

  /**
   * Run a scope in its own function, so that its store is garbage once the scope ends,
   * and is not counted in the memory usage that later scopes report.
   * @param body The scope.
   */
  private async inScope(body: () => Promise<void>): Promise<void> {
    await body();
  }

  /**
   * Add triples about `dimension^2 * 8` entities, each with a distinct literal value for each of 16 properties.
   * @param dimension The dimension.
   * @param store The store.
   */
  public addEntities(dimension: number, store: RdfStore | Store): void {
    const entities = dimension * dimension * 8;
    const properties = ENTITY_PROPERTIES;
    const TEST = `- Adding ${entities * properties} triples about ${entities} entities, with distinct values`;
    this.timeStart(TEST);
    for (let entity = 0; entity < entities; entity++) {
      const subject = this.dataFactory.namedNode(`${this.prefix}entity${entity}`);
      for (let property = 0; property < properties; property++) {
        this.add(store, this.dataFactory.quad(
          subject,
          this.dataFactory.namedNode(`${this.prefix}property${property}`),
          this.dataFactory.literal(`value ${entity} ${property}`),
        ));
      }
    }
    this.flush(store);
    this.timeEnd(TEST);
    this.printMemory('entities');
  }

  /**
   * Count the triples of each property, as query engines do to estimate the cardinality of a pattern.
   * @param dimension The dimension.
   * @param store The store.
   */
  public countEntityProperties(dimension: number, store: RdfStore | Store): void {
    const entities = dimension * dimension * 8;
    const properties = ENTITY_PROPERTIES;
    const TEST = `- Counting the ${entities} triples of each of ${properties} properties 64 times`;
    this.timeStart(TEST);
    for (let i = 0; i < 64; i++) {
      for (let property = 0; property < properties; property++) {
        const count = store.countQuads(
          null,
          this.dataFactory.namedNode(`${this.prefix}property${property}`),
          null,
          this.dataFactory.defaultGraph(),
        );
        assert.equal(count, entities);
      }
    }
    this.timeEnd(TEST);
  }

  /**
   * Find the triples of a property sorted on their value, as for an ORDER BY or a merge join.
   * A store whose scan reports that it produces this order is read as is, and the results of others are sorted.
   * @param dimension The dimension.
   * @param store The store.
   */
  public async findEntityPropertiesSorted(dimension: number, store: RdfStore | Store): Promise<void> {
    const entities = dimension * dimension * 8;
    const TEST = `- Finding the ${entities} triples of a property sorted on their value, for 4 properties`;
    this.timeStart(TEST);
    const subject = this.dataFactory.variable!('s');
    const object = this.dataFactory.variable!('o');
    for (let property = 0; property < 4; property++) {
      const predicate = this.dataFactory.namedNode(`${this.prefix}property${property}`);
      let values: RDF.Term[];
      if (store instanceof RdfStore) {
        const graph = this.dataFactory.defaultGraph();
        const stream = store.matchBindings(this.bindingsFactory, subject, predicate, object, graph);
        const sorted = (<{ resultOrder?: string[] }> <unknown> stream).resultOrder?.[0] === 'object';
        const bindings = await arrayifyStream<RDF.Bindings>(stream);
        values = bindings.map(binding => binding.get(object)!);
        if (!sorted) {
          values.sort(defaultTermComparator);
        }
      } else {
        values = store.getQuads(null, predicate, null, this.dataFactory.defaultGraph()).map(quad => quad.object);
        values.sort(defaultTermComparator);
      }
      assert.equal(values.length, entities);
    }
    this.timeEnd(TEST);
  }

  public addTriplesToDefaultGraph(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Adding ${dimension * dimension * dimension} triples to the default graph`;
    this.timeStart(TEST);
    for (let subjectIt = 0; subjectIt < dimension; subjectIt++) {
      for (let predicateIt = 0; predicateIt < dimension; predicateIt++) {
        for (let objectIt = 0; objectIt < dimension; objectIt++) {
          this.add(store, this.dataFactory.quad(
            this.dataFactory.namedNode(`${this.prefix}${subjectIt}`),
            this.dataFactory.namedNode(`${this.prefix}${predicateIt}`),
            this.dataFactory.namedNode(`${this.prefix}${objectIt}`),
          ));
        }
      }
    }
    this.flush(store);
    this.timeEnd(TEST);
    this.printMemory('triples');
  }

  public findTriplesNoVariables(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * dimension} times (0 variables)`;
    this.timeStart(TEST);
    for (let subjectIt = 0; subjectIt < dimension; subjectIt++) {
      for (let predicateIt = 0; predicateIt < dimension; predicateIt++) {
        for (let objectIt = 0; objectIt < dimension; objectIt++) {
          assert.equal(store.getQuads(
            this.dataFactory.namedNode(`${this.prefix}${subjectIt}`),
            this.dataFactory.namedNode(`${this.prefix}${predicateIt}`),
            this.dataFactory.namedNode(`${this.prefix}${objectIt}`),
            this.dataFactory.defaultGraph(),
          ).length, 1);
        }
      }
    }
    this.timeEnd(TEST);
  }

  public findTriples1Variable(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * 2} times (1 variable)`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.getQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), null, this.dataFactory.defaultGraph()).length, dimension);
      }
    }
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.getQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), null, this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.defaultGraph()).length, dimension);
      }
    }
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.getQuads(null, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.defaultGraph()).length, dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public findTriples2Variables(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * 3} times (2 variables)`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), null, null, this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let j = 0; j < dimension; j++) {
      assert.equal(store.getQuads(null, this.dataFactory.namedNode(`${this.prefix}${j}`), null, this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let kCount = 0; kCount < dimension; kCount++) {
      assert.equal(store.getQuads(null, null, this.dataFactory.namedNode(`${this.prefix}${kCount}`), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    this.timeEnd(TEST);
  }

  public findBindings2Variables(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples as bindings in the default graph ${dimension * 3} times (2 variables)`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.variable!('p'), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let j = 0; j < dimension; j++) {
      assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.variable!('s'), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let kCount = 0; kCount < dimension; kCount++) {
      assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.variable!('s'), this.dataFactory.variable!('p'), this.dataFactory.namedNode(`${this.prefix}${kCount}`), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    this.timeEnd(TEST);
  }

  public async findBindings2VariablesStream(dimension: number, store: RdfStore): Promise<void> {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples as bindings in the default graph ${dimension * 3} times (2 variables) via a stream`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal((await arrayifyStream(store.matchBindings(this.bindingsFactory, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.variable!('p'), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()))).length, dimension * dimension);
    }
    for (let j = 0; j < dimension; j++) {
      assert.equal((await arrayifyStream(store.matchBindings(this.bindingsFactory, this.dataFactory.variable!('s'), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()))).length, dimension * dimension);
    }
    for (let kCount = 0; kCount < dimension; kCount++) {
      assert.equal((await arrayifyStream(store.matchBindings(this.bindingsFactory, this.dataFactory.variable!('s'), this.dataFactory.variable!('p'), this.dataFactory.namedNode(`${this.prefix}${kCount}`), this.dataFactory.defaultGraph()))).length, dimension * dimension);
    }
    this.timeEnd(TEST);
  }

  public findBindings1Variable(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples as bindings in the default graph ${dimension * dimension} times (1 variable)`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()).length, dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public async findTriples1VariableStream(dimension: number, store: RdfStore): Promise<void> {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * 2} times (1 variable) via a stream`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal((await arrayifyStream(store.match(this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), null, this.dataFactory.defaultGraph()))).length, dimension);
      }
    }
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal((await arrayifyStream(store.match(this.dataFactory.namedNode(`${this.prefix}${i}`), null, this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.defaultGraph()))).length, dimension);
      }
    }
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal((await arrayifyStream(store.match(null, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.defaultGraph()))).length, dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public countTriples1Variable(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Counting all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * 2} times (1 variable)`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.countQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), null, this.dataFactory.defaultGraph()), dimension);
      }
    }
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.countQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), null, this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.defaultGraph()), dimension);
      }
    }
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.countQuads(null, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.defaultGraph()), dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public addQuadsToGraphs(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Adding ${dimension * dimension * dimension * dimension} quads`;
    this.timeStart(TEST);
    for (let subjectIt = 0; subjectIt < dimension; subjectIt++) {
      for (let predicateIt = 0; predicateIt < dimension; predicateIt++) {
        for (let objectIt = 0; objectIt < dimension; objectIt++) {
          for (let graphIt = 0; graphIt < dimension; graphIt++) {
            this.add(store, this.dataFactory.quad(
              this.dataFactory.namedNode(`${this.prefix}${subjectIt}`),
              this.dataFactory.namedNode(`${this.prefix}${predicateIt}`),
              this.dataFactory.namedNode(`${this.prefix}${objectIt}`),
              this.dataFactory.namedNode(`${this.prefix}${graphIt}`),
            ));
          }
        }
      }
    }
    this.flush(store);
    this.timeEnd(TEST);
    this.printMemory('quads');
  }

  public findQuadsInGraphs(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension * dimension} quads ${dimension * dimension * dimension * 4} times`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), null, null, null).length, dimension * dimension * dimension);
    }
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(null, this.dataFactory.namedNode(`${this.prefix}${i}`), null, null).length, dimension * dimension * dimension);
    }
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(null, null, this.dataFactory.namedNode(`${this.prefix}${i}`), null).length, dimension * dimension * dimension);
    }
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(null, null, null, this.dataFactory.namedNode(`${this.prefix}${i}`)).length, dimension * dimension * dimension);
    }
    this.timeEnd(TEST);
  }

  public addQuotedTriplesToGraphs(dimension: number, store: RdfStore): void {
    const TEST = `- Adding ${dimension * dimension * dimension} quoted triples`;
    this.timeStart(TEST);
    for (let person1It = 0; person1It < dimension; person1It++) {
      for (let person2It = 0; person2It < dimension; person2It++) {
        for (let nameIt = 0; nameIt < dimension; nameIt++) {
          this.add(store, this.dataFactory.quad(
            this.dataFactory.namedNode(`${this.prefix}person-${person1It}`),
            this.dataFactory.namedNode(`${this.prefix}says`),
            this.dataFactory.quad(
              this.dataFactory.namedNode(`${this.prefix}person-${person2It}`),
              this.dataFactory.namedNode(`${this.prefix}name`),
              this.dataFactory.literal(`${this.prefix}${nameIt}`),
            ),
          ));
        }
      }
    }
    this.flush(store);
    this.timeEnd(TEST);
    this.printMemory('quoted triples');
  }

  public findQuotedTriplesInGraphs(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} quoted triples ${dimension * 3} times`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(
        this.dataFactory.namedNode(`${this.prefix}person-${i}`),
        this.dataFactory.namedNode(`${this.prefix}says`),
        this.dataFactory.quad(
          this.dataFactory.variable!('person2'),
          this.dataFactory.namedNode(`${this.prefix}name`),
          this.dataFactory.variable!('name'),
        ),
      ).length, dimension * dimension);
    }
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(
        this.dataFactory.variable!('person1'),
        this.dataFactory.namedNode(`${this.prefix}says`),
        this.dataFactory.quad(
          this.dataFactory.namedNode(`${this.prefix}person-${i}`),
          this.dataFactory.namedNode(`${this.prefix}name`),
          this.dataFactory.variable!('name'),
        ),
      ).length, dimension * dimension);
    }
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(
        this.dataFactory.variable!('person1'),
        this.dataFactory.namedNode(`${this.prefix}says`),
        this.dataFactory.quad(
          this.dataFactory.variable!('person1'),
          this.dataFactory.namedNode(`${this.prefix}name`),
          this.dataFactory.literal(`${this.prefix}${i}`),
        ),
      ).length, dimension * dimension);
    }
    this.timeEnd(TEST);
  }

  public findTerms1(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension} terms (1) in the default graph ${dimension * dimension} times for each quad term (4)`;
    this.timeStart(TEST);
    for (const quadTermName of QUAD_TERM_NAMES) {
      for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
          assert.equal(store.getDistinctTerms([ quadTermName ]).length, dimension);
        }
      }
    }
    this.timeEnd(TEST);
  }

  public countTerms1(dimension: number, store: RdfStore): void {
    const TEST = `- Counting all ${dimension} terms (1) in the default graph ${dimension * dimension} times for each quad term (4)`;
    this.timeStart(TEST);
    for (const quadTermName of QUAD_TERM_NAMES) {
      for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
          assert.equal(store.countDistinctTerms([ quadTermName ]), dimension);
        }
      }
    }
    this.timeEnd(TEST);
  }

  public findTerms2(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension} terms (2) in the default graph ${dimension} times for each sequential quad term pair (4)`;
    this.timeStart(TEST);

    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension; i++) {
        assert.equal(store.getDistinctTerms([ quadTerm1, quadTerm2 ]).length, dimension * dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public countTerms2(dimension: number, store: RdfStore): void {
    const TEST = `- Counting all ${dimension * dimension} terms (2) in the default graph ${dimension} times for each sequential quad term pair (4)`;
    this.timeStart(TEST);

    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension; i++) {
        assert.equal(store.countDistinctTerms([ quadTerm1, quadTerm2 ]), dimension * dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public findTerms3(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} terms (3) in the default graph ${dimension / 4} times for each sequential quad term triple (4)`;
    this.timeStart(TEST);

    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      const quadTerm3 = QUAD_TERM_NAMES[(k + 2) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension / 4; i++) {
        assert.equal(
          store.getDistinctTerms([ quadTerm1, quadTerm2, quadTerm3 ]).length,
          dimension * dimension * dimension,
        );
      }
    }
    this.timeEnd(TEST);
  }

  public countTerms3(dimension: number, store: RdfStore): void {
    const TEST = `- Counting all ${dimension * dimension * dimension} terms (3) in the default graph ${dimension / 4} times for each sequential quad term triple (4)`;
    this.timeStart(TEST);

    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      const quadTerm3 = QUAD_TERM_NAMES[(k + 2) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension / 4; i++) {
        assert.equal(
          store.countDistinctTerms([ quadTerm1, quadTerm2, quadTerm3 ]),
          dimension * dimension * dimension,
        );
      }
    }
    this.timeEnd(TEST);
  }

  public findTerms4(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension * dimension} terms (4) in the default graph ${dimension / 8} times for each sequential quad term quad (4)`;
    this.timeStart(TEST);

    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      const quadTerm3 = QUAD_TERM_NAMES[(k + 2) % QUAD_TERM_NAMES.length];
      const quadTerm4 = QUAD_TERM_NAMES[(k + 3) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension / 8; i++) {
        assert.equal(
          store.getDistinctTerms([ quadTerm1, quadTerm2, quadTerm3, quadTerm4 ]).length,
          dimension * dimension * dimension * dimension,
        );
      }
    }
    this.timeEnd(TEST);
  }

  public countTerms4(dimension: number, store: RdfStore): void {
    const TEST = `- Counting all ${dimension * dimension * dimension * dimension} terms (4) in the default graph ${dimension / 8} times for each sequential quad term quad (4)`;
    this.timeStart(TEST);

    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      const quadTerm3 = QUAD_TERM_NAMES[(k + 2) % QUAD_TERM_NAMES.length];
      const quadTerm4 = QUAD_TERM_NAMES[(k + 3) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension / 8; i++) {
        assert.equal(
          store.countDistinctTerms([ quadTerm1, quadTerm2, quadTerm3, quadTerm4 ]),
          dimension * dimension * dimension * dimension,
        );
      }
    }
    this.timeEnd(TEST);
  }

  public findNodes(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension} nodes ${dimension * dimension} times`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.getNodes(this.dataFactory.namedNode(`${this.prefix}${i}`)).length, dimension);
      }
    }
    this.timeEnd(TEST);
  }

  public findTerms1WithFilter(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension} terms (1) filtered by graph ${dimension * dimension} times`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        const graphFilter = this.dataFactory.namedNode(`${this.prefix}${i}`);
        assert.ok(
          store.getDistinctTerms([ 'subject' ], [ undefined, undefined, undefined, graphFilter ]).length <= dimension,
        );
      }
    }
    this.timeEnd(TEST);
  }

  public countTerms1WithFilter(dimension: number, store: RdfStore): void {
    const TEST = `- Counting all ${dimension} terms (1) filtered by graph ${dimension * dimension} times`;
    this.timeStart(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        const graphFilter = this.dataFactory.namedNode(`${this.prefix}${i}`);
        assert.ok(
          store.countDistinctTerms([ 'subject' ], [ undefined, undefined, undefined, graphFilter ]) <= dimension,
        );
      }
    }
    this.timeEnd(TEST);
  }

  /**
   * The filters here bind every component that precedes the counted term in an available index,
   * so this can be answered from the index instead of by materializing the matching terms.
   */
  public countTerms1WithFilters(dimension: number, store: RdfStore): void {
    const TEST = `- Counting the ${dimension} distinct objects of one predicate in one graph ${dimension * dimension * dimension} times`;
    this.timeStart(TEST);
    for (let repeatIt = 0; repeatIt < dimension; repeatIt++) {
      for (let predicateIt = 0; predicateIt < dimension; predicateIt++) {
        for (let graphIt = 0; graphIt < dimension; graphIt++) {
          assert.equal(store.countDistinctTerms([ 'object' ], [
            undefined,
            this.dataFactory.namedNode(`${this.prefix}${predicateIt}`),
            undefined,
            this.dataFactory.namedNode(`${this.prefix}${graphIt}`),
          ]), dimension);
        }
      }
    }
    this.timeEnd(TEST);
  }

  public countTerms2WithFilters(dimension: number, store: RdfStore): void {
    const TEST = `- Counting the ${dimension * dimension} distinct predicate-object pairs of one graph ${dimension * dimension} times`;
    this.timeStart(TEST);
    for (let repeatIt = 0; repeatIt < dimension; repeatIt++) {
      for (let graphIt = 0; graphIt < dimension; graphIt++) {
        assert.equal(store.countDistinctTerms([ 'predicate', 'object' ], [
          undefined,
          undefined,
          undefined,
          this.dataFactory.namedNode(`${this.prefix}${graphIt}`),
        ]), dimension * dimension);
      }
    }
    this.timeEnd(TEST);
  }
}
/* eslint-enable no-console */

export interface IPerformanceTestApproach {
  name: string;
  options: {
    type: 'rdfstore';
    options: IRdfStoreOptions<any, any>;
    /**
     * If quads must be added to the store in one batch with `addQuads`, rather than one by one.
     */
    batch?: boolean;
  } | {
    type: 'n3';
  };
}
