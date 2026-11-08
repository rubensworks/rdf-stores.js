import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import * as Path from 'node:path';
import { parseArgs, promisify } from 'node:util';
import type * as RDF from '@rdfjs/types';
import type { IRdfStoreOptions } from '../lib/IRdfStoreOptions';
import type * as RdfStoreModule from '../lib/RdfStore';
import type * as PerformanceTestModule from './PerformanceTest';
import type * as TestsModule from './tests';

/**
 * Measures the memory that each store approach of `perf/tests` retains after ingesting a dataset,
 * and compares such measurements, as a pull request against its base commit.
 *
 * Every measurement runs in a fresh process, so stores cannot share or leave behind memory.
 * A measured tree is loaded from its own directory, so that a base commit can be measured with this script,
 * even if it does not have it yet.
 */

const USAGE = `Usage:
  sizes measure [<root>] [--dimension 64] [--runs 3] [--parallel <n>] [--optimal]
  sizes compare <head JSON> <base JSON> [<head sha> [<base sha> [<CI run URL> [<history URL>]]]]
`;

const MEASURE_FLAG = '--measure';

/**
 * The flags of a measuring process.
 * `--predictable` disables concurrent garbage collection and compilation in V8,
 * which makes most sizes identical across runs, where they would otherwise vary by up to 1.5%.
 */
const MEASURE_NODE_FLAGS = [ '--expose-gc', '--predictable' ];

/**
 * The dimension at which a dataset is ingested before measuring, to exclude compiled code and lazy initialization.
 */
const WARMUP_DIMENSION = 4;

/**
 * Changes below this fraction are not highlighted, as some sizes vary by up to that much between runs.
 */
const NOTABLE_CHANGE = 0.01;

const MIB = 1_024 * 1_024;

/**
 * The datasets, with the same names and scaling of the dimension as the scopes of `perf/run.ts`.
 */
const DATASETS = <const> {
  triples: { method: 'addTriplesToDefaultGraph', scale: (dimension: number) => dimension },
  quads: { method: 'addQuadsToGraphs', scale: (dimension: number) => dimension / 4 },
  quoted: { method: 'addQuotedTriplesToGraphs', scale: (dimension: number) => dimension / 2 },
  entities: { method: 'addEntities', scale: (dimension: number) => dimension },
};

type Dataset = keyof typeof DATASETS;

/**
 * A store size, in the format of the customSmallerIsBetter tool of github-action-benchmark.
 */
interface IStoreSizeEntry {
  name: string;
  unit: string;
  value: number;
  extra?: string;
}

/**
 * The memory retained by a store in one run, which is the memory in use after ingestion minus before,
 * both after garbage collection.
 */
interface IStoreSizeRun {
  quads: number;
  heapUsed: number;
  external: number;
}

/**
 * The parts of a measured tree that are used, which are loaded from that tree.
 */
interface IMeasuredTree {
  makeTests: typeof TestsModule.makeTests;
  createTest: (approach: PerformanceTestModule.IPerformanceTestApproach) => PerformanceTestModule.PerformanceTest;
  createStore: (options: IRdfStoreOptions<any, any>) => RdfStoreModule.RdfStore;
  canGenerate: (dataset: Dataset) => boolean;
}

async function loadTree(root: string): Promise<IMeasuredTree> {
  const tests = <typeof TestsModule> await import(Path.join(root, 'perf', 'tests'));
  const performanceTest = <typeof PerformanceTestModule> await import(Path.join(root, 'perf', 'PerformanceTest'));
  const rdfStore = <typeof RdfStoreModule> await import(Path.join(root, 'lib', 'RdfStore'));
  const prototype = <Record<string, unknown>> <unknown> performanceTest.PerformanceTest.prototype;
  return {
    makeTests: tests.makeTests,
    createTest: approach => new performanceTest.PerformanceTest([ approach ]),
    createStore: options => new rdfStore.RdfStore(options),
    canGenerate: dataset => typeof prototype[DATASETS[dataset].method] === 'function',
  };
}

function ingest(
  tree: IMeasuredTree,
  optimal: boolean,
  approachIndex: number,
  dataset: Dataset,
  dimension: number,
): RdfStoreModule.RdfStore {
  const approach = tree.makeTests(optimal)[approachIndex];
  if (approach.options.type !== 'rdfstore') {
    throw new Error(`Approach ${approach.name} is not an RdfStore`);
  }
  const test = tree.createTest(approach);
  test.quiet = true;
  const add = <(dimension: number, store: unknown) => void>
    (<Record<string, any>> test)[DATASETS[dataset].method].bind(test);
  const store = tree.createStore(approach.options.options);
  if (approach.options.batch) {
    const quads: RDF.Quad[] = [];
    add(dimension, { addQuad: (quad: RDF.Quad) => quads.push(quad) });
    store.addQuads(quads);
  } else {
    add(dimension, store);
  }
  return store;
}

/**
 * Collect garbage and determine the memory usage afterwards.
 * Collect twice with a pause in between, as V8 releases array buffer memory asynchronously.
 * @param gc The garbage collector.
 */
async function settleMemory(gc: () => void): Promise<NodeJS.MemoryUsage> {
  gc();
  await new Promise(resolve => setTimeout(resolve, 500));
  gc();
  return process.memoryUsage();
}

/**
 * Measure a single run in the current process.
 */
async function measureRun(
  root: string,
  optimal: boolean,
  approachIndex: number,
  dataset: Dataset,
  dimension: number,
): Promise<IStoreSizeRun> {
  const gc = (<{ gc?: () => void }> globalThis).gc;
  if (!gc) {
    throw new Error('Measuring store sizes requires the --expose-gc option');
  }
  const tree = await loadTree(root);
  ingest(tree, optimal, approachIndex, dataset, WARMUP_DIMENSION);
  const before = await settleMemory(gc);
  const store = ingest(tree, optimal, approachIndex, dataset, DATASETS[dataset].scale(dimension));
  const after = await settleMemory(gc);
  return {
    quads: store.size,
    heapUsed: after.heapUsed - before.heapUsed,
    external: after.external - before.external,
  };
}

/**
 * Apply an async function to all items, with at most the given number of calls at once.
 */
async function forEachConcurrently<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  async function work(): Promise<void> {
    while (next < items.length) {
      await fn(items[next++]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, work));
}

function toMebibytes(bytes: number): number {
  return Math.round(bytes / MIB * 100) / 100;
}

/**
 * Convert the runs of an approach on a dataset into an entry, using the run with the median size.
 */
function toEntry(approach: string, dataset: string, runs: IStoreSizeRun[]): IStoreSizeEntry {
  const sorted = [ ...runs ].sort((left, right) => left.heapUsed + left.external - right.heapUsed - right.external);
  const median = sorted[Math.floor((sorted.length - 1) / 2)];
  const size = median.heapUsed + median.external;
  return {
    name: `${approach} | ${dataset}`,
    unit: 'MiB',
    value: toMebibytes(size),
    extra: [
      `Quads: ${median.quads}`,
      `Per quad: ${median.quads > 0 ? Math.round(size / median.quads) : 'n/a'} bytes`,
      `Heap: ${toMebibytes(median.heapUsed)} MiB`,
      `External: ${toMebibytes(median.external)} MiB`,
      `Runs: [${runs.map(run => toMebibytes(run.heapUsed + run.external)).join(',')}]`,
    ].join('; '),
  };
}

async function measure(
  root: string,
  options: { dimension: number; runs: number; parallel: number; optimal: boolean },
): Promise<IStoreSizeEntry[]> {
  const tree = await loadTree(root);
  const datasets = (<Dataset[]> Object.keys(DATASETS)).filter((dataset) => {
    const supported = tree.canGenerate(dataset);
    if (!supported) {
      process.stderr.write(`Skipping the ${dataset} dataset, which ${root} cannot generate\n`);
    }
    return supported;
  });
  const approaches = tree.makeTests(options.optimal)
    .map((approach, index) => ({ name: approach.name, index, type: approach.options.type }))
    .filter(approach => approach.type === 'rdfstore');
  const tasks = Array.from({ length: options.runs }, () => approaches
    .flatMap(approach => datasets.map(dataset => ({ approach, dataset })))).flat();

  let done = 0;
  const runs = new Map<string, IStoreSizeRun[]>();
  await forEachConcurrently(tasks, options.parallel, async({ approach, dataset }) => {
    const { stdout } = await promisify(execFile)(process.execPath, [
      ...process.execArgv,
      ...MEASURE_NODE_FLAGS,
      __filename,
      MEASURE_FLAG,
      root,
      String(options.optimal),
      String(approach.index),
      dataset,
      String(options.dimension),
    ], { maxBuffer: 16 * MIB });
    // The last line, in case an older tree prints progress
    const run = <IStoreSizeRun> JSON.parse(stdout.trim().split('\n').pop()!);
    const key = `${approach.index} ${dataset}`;
    runs.set(key, [ ...runs.get(key) ?? [], run ]);
    process.stderr.write(`[${++done}/${tasks.length}] ${approach.name} | ${dataset}: ${toMebibytes(run.heapUsed + run.external)} MiB\n`);
  });

  return approaches.flatMap(approach => datasets
    .map(dataset => toEntry(approach.name, dataset, runs.get(`${approach.index} ${dataset}`)!)));
}

function formatMebibytes(mebibytes: number, signed = false): string {
  return `${signed && mebibytes > 0 ? '+' : ''}${mebibytes.toFixed(2)} MiB`;
}

function formatChange(head: number, base: number): string {
  const difference = head - base;
  if (difference === 0) {
    return '`0`';
  }
  const percentage = base === 0 ? '' : ` (${difference > 0 ? '+' : ''}${(difference * 100 / base).toFixed(2)}%)`;
  return `\`${formatMebibytes(difference, true)}\`${percentage}`;
}

function isNotable(head: IStoreSizeEntry | undefined, base: IStoreSizeEntry | undefined): boolean {
  if (!head || !base) {
    return true;
  }
  return base.value === 0 ? head.value !== 0 : Math.abs(head.value - base.value) / base.value >= NOTABLE_CHANGE;
}

function renderTable(rows: { name: string; head?: IStoreSizeEntry; base?: IStoreSizeEntry }[]): string {
  return [
    '| Approach | Dataset | Size | Change | Per quad |',
    '|-|-|-|-|-|',
    ...rows.map(({ name, head, base }) => {
      const separator = name.lastIndexOf(' | ');
      const perQuad = /Per quad: (\d+) bytes/u.exec(head?.extra ?? '')?.[1];
      return `| ${[
        name.slice(0, separator),
        name.slice(separator + 3),
        head ? `\`${formatMebibytes(head.value)}\`` : 'removed',
        head ? base ? formatChange(head.value, base.value) : 'new' : '',
        perQuad ? `${perQuad} B` : '',
      ].join(' | ')} |`;
    }),
  ].join('\n');
}

/**
 * Render the store size comparison comment of a pull request.
 */
function renderComparison(
  headEntries: IStoreSizeEntry[],
  baseEntries: IStoreSizeEntry[],
  options: { headSha?: string; baseSha?: string; runUrl?: string; historyUrl?: string },
): string {
  const head = new Map(headEntries.map(entry => [ entry.name, entry ]));
  const base = new Map(baseEntries.map(entry => [ entry.name, entry ]));
  const rows = [ ...new Set([ ...head.keys(), ...base.keys() ]) ]
    .map(name => ({ name, head: head.get(name), base: base.get(name) }));
  const notable = rows.filter(row => isNotable(row.head, row.base));
  const percentage = NOTABLE_CHANGE * 100;
  const lines = [
    '<!-- store-size-comparison -->\n\n# Store sizes\n\n',
    notable.length === 0 ?
      `No store sizes changed by ${percentage}% or more.\n\n` :
      `${notable.length} of ${rows.length} store sizes changed by ${percentage}% or more.\n\n${renderTable(notable)}\n\n`,
    `<details>\n<summary>All store sizes</summary>\n\n${renderTable(rows)}\n\n</details>\n\n`,
    'Sizes are the heap and off-heap memory that a store retains after ingesting a dataset, ',
    `measured for ${options.headSha ?? 'the head commit'}, `,
    `and changes are relative to the base commit${options.baseSha ? ` ${options.baseSha}` : ''}. `,
    `Changes below ${percentage}% are not highlighted, as some sizes vary by up to that much between runs.\n`,
  ];
  if (options.historyUrl ?? options.runUrl) {
    lines.push('\n');
    if (options.historyUrl) {
      lines.push(`See the [history of the base branch](${options.historyUrl}). `);
    }
    if (options.runUrl) {
      lines.push(`Measured by [this CI run](${options.runUrl}).`);
    }
    lines.push('\n');
  }
  return lines.join('');
}

function parseInteger(value: string | undefined, fallback: number, name: string): number {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer`);
  }
  return parsed;
}

async function main(argv: string[]): Promise<void> {
  if (argv[0] === MEASURE_FLAG) {
    const [ root, optimal, approachIndex, dataset, dimension ] = argv.slice(1);
    const run = await measureRun(root, optimal === 'true', Number(approachIndex), <Dataset> dataset, Number(dimension));
    process.stdout.write(`${JSON.stringify(run)}\n`);
    return;
  }

  const { positionals: [ command, ...args ], values } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      dimension: { type: 'string', short: 'd' },
      runs: { type: 'string' },
      parallel: { type: 'string' },
      optimal: { type: 'boolean', default: false },
    },
  });
  if (command === 'measure' && args.length <= 1) {
    const entries = await measure(Path.resolve(args[0] ?? Path.join(__dirname, '..')), {
      dimension: parseInteger(values.dimension, 64, 'dimension'),
      runs: parseInteger(values.runs, 3, 'runs'),
      parallel: parseInteger(values.parallel, availableParallelism(), 'parallel'),
      optimal: values.optimal,
    });
    process.stdout.write(`${JSON.stringify(entries, null, 2)}\n`);
  } else if (command === 'compare' && args.length >= 2 && args.length <= 6) {
    const [ headFile, baseFile, headSha, baseSha, runUrl, historyUrl ] = args;
    process.stdout.write(renderComparison(
      <IStoreSizeEntry[]> JSON.parse(readFileSync(headFile, 'utf8')),
      <IStoreSizeEntry[]> JSON.parse(readFileSync(baseFile, 'utf8')),
      { headSha, baseSha, runUrl, historyUrl },
    ));
  } else {
    process.stderr.write(USAGE);
    process.exitCode = 1;
  }
}

main(process.argv.slice(2)).catch((error: Error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exitCode = 1;
});
