import { DataFactory } from 'rdf-data-factory';
import { TermDictionaryNumber } from '../lib/dictionary/TermDictionaryNumber';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStore } from '../lib/RdfStore';
import { PerformanceTest } from './PerformanceTest';

const test = new PerformanceTest([
  {
    name: '1 index',
    options: {
      indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
      indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
      dictionary: new TermDictionaryNumber(),
      dataFactory: new DataFactory(),
    },
  },
  {
    name: '3 indexes',
    options: {
      indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
      indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
      dictionary: new TermDictionaryNumber(),
      dataFactory: new DataFactory(),
    },
  },
], Number.parseInt(process.argv[2], 10) || 256);
test.run();
