/* eslint-disable no-console */
import * as assert from 'assert';
import type * as RDF from '@rdfjs/types';
import { Store } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';
import { RdfStore } from '../lib/RdfStore';

/**
 * Run a set of performance tests over a set of storage approaches.
 * These tests have been based on https://github.com/rdfjs/N3.js/blob/main/perf/N3Store-perf.js
 */
export class PerformanceTest {
  public constructor(
    public readonly approaches: {
      name: string;
      options: {
        type: 'rdfstore';
        options: IRdfStoreOptions<any, any>;
      } | {
        type: 'n3';
      };
    }[],
    public readonly dimension = 256,
    public readonly prefix = 'http://example.org/#',
    public readonly dataFactory: RDF.DataFactory = new DataFactory(),
  ) {}

  public run(): void {
    for (const approach of this.approaches) {
      console.log(`\n# ${approach.name}\n`);

      let store = approach.options.type === 'n3' ? new Store() : new RdfStore(approach.options.options);
      this.addTriplesToDefaultGraph(this.dimension, store);
      this.findTriplesNoVariables(this.dimension, store);
      this.findTriples1Variable(this.dimension, store);
      this.findTriples2Variables(this.dimension, store);
      console.log();

      store = approach.options.type === 'n3' ? new Store() : new RdfStore(approach.options.options);
      this.addQuadsToGraphs(this.dimension / 4, store);
      this.findQuadsInGraphs(this.dimension / 4, store);
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
}
/* eslint-enable no-console */
