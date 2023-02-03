import { DataFactory } from 'rdf-data-factory';
import { TermDictionaryNumberMap } from '../lib/dictionary/TermDictionaryNumberMap';
import { TermDictionaryNumberRecord } from '../lib/dictionary/TermDictionaryNumberRecord';
import { TermDictionarySymbol } from '../lib/dictionary/TermDictionarySymbol';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStore } from '../lib/RdfStore';
import { PerformanceTest } from './PerformanceTest';

const test = new PerformanceTest([
  {
    name: '1 Record index (Map<number>)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Record indexes (Map<number>)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '1 Record index (Record<number>)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecord(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Record indexes (Record<number>)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecord(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '1 Map index (Map<number>)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Map indexes (Map<number>)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberMap(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '1 Map index (symbol)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionarySymbol(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Map indexes (symbol)',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionarySymbol(),
        dataFactory: new DataFactory(),
      },
    },
  },

  {
    name: 'N3Store',
    options: {
      type: 'n3',
    },
  },
  {
    name: '3 Record indexes (number) OPT',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecord(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '1 Record indexes (number) OPT',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecord(),
        dataFactory: new DataFactory(),
      },
    },
  },
], Number.parseInt(process.argv[2], 10) || 256);
test.run();
