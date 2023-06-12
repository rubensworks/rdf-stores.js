import { DataFactory } from 'rdf-data-factory';
import { hideBin } from 'yargs/helpers';
import { TermDictionaryNumberMap } from '../lib/dictionary/TermDictionaryNumberMap';
import { TermDictionaryNumberRecord } from '../lib/dictionary/TermDictionaryNumberRecord';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuoted } from '../lib/dictionary/TermDictionaryQuoted';
import { TermDictionaryQuotedIndexed } from '../lib/dictionary/TermDictionaryQuotedIndexed';
import { TermDictionaryQuotedReferential } from '../lib/dictionary/TermDictionaryQuotedReferential';
import { TermDictionarySymbol } from '../lib/dictionary/TermDictionarySymbol';
import { RdfStoreIndexNestedMap } from '../lib/index/RdfStoreIndexNestedMap';
import { RdfStoreIndexNestedMapQuoted } from '../lib/index/RdfStoreIndexNestedMapQuoted';
import { RdfStoreIndexNestedMapRecursive } from '../lib/index/RdfStoreIndexNestedMapRecursive';
import { RdfStoreIndexNestedMapRecursiveQuoted } from '../lib/index/RdfStoreIndexNestedMapRecursiveQuoted';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { RdfStoreIndexNestedRecordQuoted } from '../lib/index/RdfStoreIndexNestedRecordQuoted';
import { RdfStore } from '../lib/RdfStore';
import type { IPerformanceTestApproach } from './PerformanceTest';
import { PerformanceTest } from './PerformanceTest';

const argv = require('yargs/yargs')(hideBin(process.argv))
  .options({
    dimension: {
      type: 'number',
      alias: 'd',
      describe: 'Dimension of ingested dataset',
      default: 256,
    },
    optimal: {
      type: 'boolean',
      alias: 'o',
      describe: 'If only the most optimal approaches must be evaluated',
      default: false,
    },
    tests: {
      type: 'string',
      alias: 't',
      choices: [ 'all', 'triples', 'quads', 'quoted' ],
      describe: 'Which tests must be executed',
      default: 'all',
    },
  }).argv;

const test = new PerformanceTest([
  ...!argv.optimal ?
    <IPerformanceTestApproach[]> [
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
        name: '1 Record index (Record<number> FT)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
            indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
            dictionary: new TermDictionaryNumberRecordFullTerms(),
            dataFactory: new DataFactory(),
          },
        },
      },
      {
        name: '3 Record indexes (Record<number> FT)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
            dictionary: new TermDictionaryNumberRecordFullTerms(),
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
        name: '1 Map index recursive (Map<number>)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
            indexConstructor: subOptions => new RdfStoreIndexNestedMapRecursive(subOptions),
            dictionary: new TermDictionaryNumberMap(),
            dataFactory: new DataFactory(),
          },
        },
      },
      {
        name: '3 Map indexes recursive (Map<number>)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedMapRecursive(subOptions),
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

      // Quoted triples approaches
      {
        name: '3 Nested Map Recursive Quoted indexes with indexed quoted dict (number)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedMapRecursiveQuoted(subOptions),
            dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms(), new DataFactory()),
            dataFactory: new DataFactory(),
          },
        },
      },
      {
        name: '3 Nested Map Quoted indexes with separated quoted dict (number)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedMapQuoted(subOptions),
            dictionary: new TermDictionaryQuoted(
              new TermDictionaryNumberRecordFullTerms(),
              new TermDictionaryNumberRecordFullTerms(),
            ),
            dataFactory: new DataFactory(),
          },
        },
      },
      {
        name: '3 Nested Record Quoted indexes with separated quoted dict (number)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedRecordQuoted(subOptions),
            dictionary: new TermDictionaryQuoted(
              new TermDictionaryNumberRecordFullTerms(),
              new TermDictionaryNumberRecordFullTerms(),
            ),
            dataFactory: new DataFactory(),
          },
        },
      },
      {
        name: '3 Nested Map Quoted indexes with separated referential quoted dict (number)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedMapQuoted(subOptions),
            dictionary: new TermDictionaryQuotedReferential(new TermDictionaryNumberRecordFullTerms()),
            dataFactory: new DataFactory(),
          },
        },
      },
      {
        name: '3 Nested Record Quoted indexes with separated referential quoted dict (number)',
        options: {
          type: 'rdfstore',
          options: {
            indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
            indexConstructor: subOptions => new RdfStoreIndexNestedRecordQuoted(subOptions),
            dictionary: new TermDictionaryQuotedReferential(new TermDictionaryNumberRecordFullTerms()),
            dataFactory: new DataFactory(),
          },
        },
      },
    ] :
    [],

  {
    name: 'N3Store',
    options: {
      type: 'n3',
    },
  },
  {
    name: '3 Record indexes (number) OPT-INGEST',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecordFullTerms(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '1 Record indexes (number) OPT-INGEST',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
        dictionary: new TermDictionaryNumberRecordFullTerms(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Map indexes (number) OPT-QUERY',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberRecordFullTerms(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '1 Map indexes (number) OPT-QUERY',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: [[ 'graph', 'subject', 'predicate', 'object' ]],
        indexConstructor: subOptions => new RdfStoreIndexNestedMap(subOptions),
        dictionary: new TermDictionaryNumberRecordFullTerms(),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedRecordQuoted(subOptions),
        dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms(), new DataFactory()),
        dataFactory: new DataFactory(),
      },
    },
  },
  {
    name: '3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY',
    options: {
      type: 'rdfstore',
      options: {
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => new RdfStoreIndexNestedMapQuoted(subOptions),
        dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms(), new DataFactory()),
        dataFactory: new DataFactory(),
      },
    },
  },
], argv.dimension);
// eslint-disable-next-line @typescript-eslint/no-floating-promises
test.run(argv.tests);
