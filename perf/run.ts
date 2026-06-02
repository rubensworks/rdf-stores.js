import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { PerformanceTest } from './PerformanceTest';
import { makeTests } from './tests';

const argv = yargs(hideBin(process.argv))
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
      choices: [ 'all', 'triples', 'quads', 'quoted', 'terms', 'nodes' ],
      describe: 'Which tests must be executed',
      default: 'all',
    },
  }).parseSync();

const test = new PerformanceTest(makeTests(argv.optimal), argv.dimension);
// eslint-disable-next-line ts/no-unsafe-argument, no-console
test.run(<any>argv.tests).catch(console.error);
