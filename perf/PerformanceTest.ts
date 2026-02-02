/* eslint-disable no-console */
import * as assert from 'assert';
import { BindingsFactory } from '@comunica/utils-bindings-factory';
import type * as RDF from '@rdfjs/types';
import arrayifyStream from 'arrayify-stream';
import { Store } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';
import { RdfStore } from '../lib/RdfStore';

/**
 * Run a set of performance tests over a set of storage approaches.
 * These tests have been based on https://github.com/rdfjs/N3.js/blob/main/perf/N3Store-perf.js
 */
export class PerformanceTest {
  public constructor(
    public readonly approaches: IPerformanceTestApproach[],
    public readonly dimension = 256,
    public readonly prefix = 'http://example.org/#',
    public readonly dataFactory: RDF.DataFactory = new DataFactory(),
    public readonly bindingsFactory: RDF.BindingsFactory = new BindingsFactory(<any> this.dataFactory),
  ) {}

  public async run(scope: 'all' | 'triples' | 'quads' | 'quoted' | 'terms' | 'nodes'): Promise<void> {
    for (const approach of this.approaches) {
      console.log(`\n# ${approach.name}\n`);

      if (scope === 'all' || scope === 'triples') {
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
        console.log();
      }

      if (scope === 'all' || scope === 'quads') {
        const store = approach.options.type === 'n3' ? new Store() : new RdfStore(approach.options.options);
        this.addQuadsToGraphs(this.dimension / 4, store);
        this.findQuadsInGraphs(this.dimension / 4, store);
        console.log();
      }

      if ((scope === 'all' || scope === 'quoted') && approach.options.type !== 'n3') {
        const store = new RdfStore(approach.options.options);
        this.addQuotedTriplesToGraphs(this.dimension / 2, store);
        this.findQuotedTriplesInGraphs(this.dimension / 2, store);
        console.log();
      }

      if ((scope === 'all' || scope === 'terms') && approach.options.type !== 'n3' &&
        approach.options.options.indexCombinations.length >= 3) {
        const store = new RdfStore(approach.options.options);
        this.addQuadsToGraphs(this.dimension / 4, store);
        this.findTerms1(this.dimension / 4, store);
        this.findTerms2(this.dimension / 4, store);
        this.findTerms3(this.dimension / 4, store);
        this.findTerms4(this.dimension / 4, store);
        console.log();
      }

      if ((scope === 'all' || scope === 'nodes') && approach.options.type !== 'n3' &&
        approach.options.options.indexNodes) {
        const store = new RdfStore(approach.options.options);
        this.addQuadsToGraphs(this.dimension, store);
        this.findNodes(this.dimension, store);
        console.log();
      }
    }
  }

  public addTriplesToDefaultGraph(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Adding ${dimension * dimension * dimension} triples to the default graph`;
    console.time(TEST);
    for (let subjectIt = 0; subjectIt < dimension; subjectIt++) {
      for (let predicateIt = 0; predicateIt < dimension; predicateIt++) {
        for (let objectIt = 0; objectIt < dimension; objectIt++) {
          store.addQuad(this.dataFactory.quad(
            this.dataFactory.namedNode(`${this.prefix}${subjectIt}`),
            this.dataFactory.namedNode(`${this.prefix}${predicateIt}`),
            this.dataFactory.namedNode(`${this.prefix}${objectIt}`),
          ));
        }
      }
    }
    console.timeEnd(TEST);
    console.log(`* Memory usage for triples: ${Math.round(process.memoryUsage().rss / 1_024 / 1_024)}MB`);
  }

  public findTriplesNoVariables(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * dimension} times (0 variables)`;
    console.time(TEST);
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
    console.timeEnd(TEST);
  }

  public findTriples1Variable(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * 2} times (1 variable)`;
    console.time(TEST);
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
    console.timeEnd(TEST);
  }

  public findTriples2Variables(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * 3} times (2 variables)`;
    console.time(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getQuads(this.dataFactory.namedNode(`${this.prefix}${i}`), null, null, this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let j = 0; j < dimension; j++) {
      assert.equal(store.getQuads(null, this.dataFactory.namedNode(`${this.prefix}${j}`), null, this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let kCount = 0; kCount < dimension; kCount++) {
      assert.equal(store.getQuads(null, null, this.dataFactory.namedNode(`${this.prefix}${kCount}`), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    console.timeEnd(TEST);
  }

  public findBindings2Variables(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples as bindings in the default graph ${dimension * 3} times (2 variables)`;
    console.time(TEST);
    for (let i = 0; i < dimension; i++) {
      assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.namedNode(`${this.prefix}${i}`), this.dataFactory.variable!('p'), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let j = 0; j < dimension; j++) {
      assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.variable!('s'), this.dataFactory.namedNode(`${this.prefix}${j}`), this.dataFactory.variable!('o'), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    for (let kCount = 0; kCount < dimension; kCount++) {
      assert.equal(store.getBindings(this.bindingsFactory, this.dataFactory.variable!('s'), this.dataFactory.variable!('p'), this.dataFactory.namedNode(`${this.prefix}${kCount}`), this.dataFactory.defaultGraph()).length, dimension * dimension);
    }
    console.timeEnd(TEST);
  }

  public async findTriples1VariableStream(dimension: number, store: RdfStore): Promise<void> {
    const TEST = `- Finding all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * 2} times (1 variable) via a stream`;
    console.time(TEST);
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
    console.timeEnd(TEST);
  }

  public countTriples1Variable(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Counting all ${dimension * dimension * dimension} triples in the default graph ${dimension * dimension * 2} times (1 variable)`;
    console.time(TEST);
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
    console.timeEnd(TEST);
  }

  public addQuadsToGraphs(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Adding ${dimension * dimension * dimension * dimension} quads`;
    console.time(TEST);
    for (let subjectIt = 0; subjectIt < dimension; subjectIt++) {
      for (let predicateIt = 0; predicateIt < dimension; predicateIt++) {
        for (let objectIt = 0; objectIt < dimension; objectIt++) {
          for (let graphIt = 0; graphIt < dimension; graphIt++) {
            store.addQuad(this.dataFactory.quad(
              this.dataFactory.namedNode(`${this.prefix}${subjectIt}`),
              this.dataFactory.namedNode(`${this.prefix}${predicateIt}`),
              this.dataFactory.namedNode(`${this.prefix}${objectIt}`),
              this.dataFactory.namedNode(`${this.prefix}${graphIt}`),
            ));
          }
        }
      }
    }
    console.timeEnd(TEST);
    console.log(`* Memory usage for quads: ${Math.round(process.memoryUsage().rss / 1_024 / 1_024)}MB`);
  }

  public findQuadsInGraphs(dimension: number, store: RdfStore | Store): void {
    const TEST = `- Finding all ${dimension * dimension * dimension * dimension} quads ${dimension * dimension * dimension * 4} times`;
    console.time(TEST);
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
    console.timeEnd(TEST);
  }

  public addQuotedTriplesToGraphs(dimension: number, store: RdfStore): void {
    const TEST = `- Adding ${dimension * dimension * dimension} quoted triples`;
    console.time(TEST);
    for (let person1It = 0; person1It < dimension; person1It++) {
      for (let person2It = 0; person2It < dimension; person2It++) {
        for (let nameIt = 0; nameIt < dimension; nameIt++) {
          store.addQuad(this.dataFactory.quad(
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
    console.timeEnd(TEST);
    console.log(`* Memory usage for quoted triples: ${Math.round(process.memoryUsage().rss / 1_024 / 1_024)}MB`);
  }

  public findQuotedTriplesInGraphs(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} quoted triples ${dimension * 3} times`;
    console.time(TEST);
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
    console.timeEnd(TEST);
  }

  public findTerms1(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension} terms (1) in the default graph ${dimension * dimension} times for each quad term (4)`;
    console.time(TEST);
    for (const quadTermName of QUAD_TERM_NAMES) {
      for (let i = 0; i < dimension; i++) {
        for (let j = 0; j < dimension; j++) {
          assert.equal(store.getDistinctTerms([ quadTermName ]).length, dimension);
        }
      }
    }
    console.timeEnd(TEST);
  }

  public findTerms2(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension} terms (2) in the default graph ${dimension} times for each sequential quad term pair (4)`;
    console.time(TEST);
    // eslint-disable-next-line id-length
    for (let k = 0; k < QUAD_TERM_NAMES.length; k++) {
      const quadTerm1 = QUAD_TERM_NAMES[k];
      const quadTerm2 = QUAD_TERM_NAMES[(k + 1) % QUAD_TERM_NAMES.length];
      for (let i = 0; i < dimension; i++) {
        assert.equal(store.getDistinctTerms([ quadTerm1, quadTerm2 ]).length, dimension * dimension);
      }
    }
    console.timeEnd(TEST);
  }

  public findTerms3(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension} terms (3) in the default graph ${dimension / 4} times for each sequential quad term triple (4)`;
    console.time(TEST);
    // eslint-disable-next-line id-length
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
    console.timeEnd(TEST);
  }

  public findTerms4(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension * dimension * dimension * dimension} terms (4) in the default graph ${dimension / 8} times for each sequential quad term quad (4)`;
    console.time(TEST);
    // eslint-disable-next-line id-length
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
    console.timeEnd(TEST);
  }

  public findNodes(dimension: number, store: RdfStore): void {
    const TEST = `- Finding all ${dimension} nodes ${dimension * dimension} times`;
    console.time(TEST);
    for (let i = 0; i < dimension; i++) {
      for (let j = 0; j < dimension; j++) {
        assert.equal(store.getNodes().length, dimension);
      }
    }
    console.timeEnd(TEST);
  }
}
/* eslint-enable no-console */

export interface IPerformanceTestApproach {
  name: string;
  options: {
    type: 'rdfstore';
    options: IRdfStoreOptions<any, any>;
  } | {
    type: 'n3';
  };
}
