import { hideBin } from 'yargs/helpers';
import { PerformanceTest } from './PerformanceTest';
import { makeTests } from './tests';

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

const test = new PerformanceTest(makeTests(argv.optimal), argv.dimension);
// eslint-disable-next-line @typescript-eslint/no-floating-promises
test.run(argv.tests);
