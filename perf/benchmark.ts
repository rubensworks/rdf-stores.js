import { withCodSpeed } from '@codspeed/tinybench-plugin';
import { Bench } from 'tinybench';
import { PerformanceTest } from './PerformanceTest';
import { makeTests } from './tests';

const bench = withCodSpeed(new Bench({
  iterations: 1,
}));
const dimension = 64;
const scope = 'all';

for (const test of makeTests(true)) {
  if (test.name !== 'N3Store') {
    bench.add(test.name, async() => {
      if ((<any> test.options).options.dictionary.encodings().next().value === undefined) {
        await new PerformanceTest([ test ], dimension).run(scope);
      }
    });
  }
}

(async function() {
  await bench.run();
  // eslint-disable-next-line no-console
  console.table(bench.table());
// eslint-disable-next-line no-console
})().catch(console.error);
