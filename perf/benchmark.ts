import { withCodSpeed } from '@codspeed/tinybench-plugin';
import { Bench } from 'tinybench';
import { PerformanceTest } from './PerformanceTest';
import { makeTests } from './tests';

/**
 * The CodSpeed runner does not simply invoke a registered benchmark once.
 * It first calls it a number of times to get the function optimized by V8,
 * and only the call *after* those is measured.
 *
 * That means every invocation has to perform the same work, so the store,
 * its indexes and its dictionary are rebuilt from scratch on each call by
 * re-creating the approach. Reusing state across invocations would leave the
 * measured call with nothing left to do.
 *
 * Because every benchmark is executed several times, the dataset is kept small
 * enough for that to remain affordable, and the workload is split per scope so
 * that a regression points at a specific group of operations.
 */
const dimension = 24;

const bench = withCodSpeed(new Bench({
  // These only apply when this file is run outside of CodSpeed (`node perf/benchmark.js`),
  // where they keep a local sanity run short. Under CodSpeed, the plugin drives the
  // invocations itself and these options are not used.
  iterations: 1,
  time: 0,
  warmup: false,
}));

const approaches = makeTests(true);
for (const [ approachId, approach ] of approaches.entries()) {
  if (approach.name === 'N3Store' || approach.options.type === 'n3') {
    continue;
  }

  // Only register the scopes that this approach actually executes,
  // so that no benchmark ends up measuring an empty function.
  const scopes: ('triples' | 'bindings' | 'quads' | 'quoted' | 'terms' | 'nodes')[] =
    [ 'triples', 'bindings', 'quads', 'quoted' ];
  if (approach.options.options.indexCombinations.length >= 3) {
    scopes.push('terms');
  }
  if (approach.options.options.indexNodes) {
    scopes.push('nodes');
  }

  for (const scope of scopes) {
    bench.add(`${approach.name} | ${scope}`, async() => {
      const test = new PerformanceTest([ makeTests(true)[approachId] ], dimension);
      test.quiet = true;
      await test.run(scope);
    });
  }
}

(async function() {
  await bench.run();
  // eslint-disable-next-line no-console
  console.table(bench.table());
// eslint-disable-next-line no-console
})().catch(console.error);
