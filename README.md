# RDF Stores

[![Build status](https://github.com/rubensworks/rdf-stores.js/workflows/CI/badge.svg)](https://github.com/rubensworks/rdf-stores.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-stores.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-stores.js?branch=master)
[![npm version](https://badge.fury.io/js/rdf-stores.svg)](https://www.npmjs.com/package/rdf-stores)

This package provides an in-memory triple/quad store with triple/quad pattern access.
It allows you to configure indexes to tune performance for specific cases.
It works in both JavaScript and TypeScript.

Main features:
* 🧠 In-memory indexing
* ⚙️ Full configurability of indexes and dictionaries
* 🔮 Quoted triples support (RDF-star / RDF 1.2)
* 🚀 Highly performant: [Fastest](#performance) JavaScript store in terms of query speed
* ✅ Extensively tested (39.331 unit tests)
* 👥 Implements the [RDF/JS Store](https://rdf.js.org/stream-spec/#store-interface) and [RDF/JS DatasetCore](https://rdf.js.org/dataset-spec/#datasetcore-interface) interfaces

If using TypeScript, it is recommended to use this in conjunction with [`@rdfjs/types`](https://www.npmjs.com/package/@rdfjs/types).

## Installation

```bash
$ npm install rdf-stores
```
or
```bash
$ yarn add rdf-stores
```

This package also works out-of-the-box in browsers via tools such as [webpack](https://webpack.js.org/) and [browserify](http://browserify.org/).

## Quick start

The example below shows how to create a new store with default settings,
adding two quads, and querying it.

```typescript
import { RdfStore } from 'rdf-stores';
import { DataFactory } from 'rdf-data-factory';

// Create a new store with default settings
const store = RdfStore.createDefault();

// Ingest manually defined data
const DF = new DataFactory();
store.addQuad(
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')),
);
store.addQuad(
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p2'), DF.namedNode('ex:o2')),
);

// Find data matching '<ex:s1> ?p ?o'
const stream = store.match(DF.namedNode('ex:s1'), undefined, undefined);
stream.on('data', (quad) => {
  console.log(quad);
});
stream.on('end', () => {
  console.log('Done!');
});

// Interacting with the store as a DatasetCore object
const dataset = store.asDataset();
console.log(dataset.size);
dataset.add(DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')));
console.log(dataset.has(DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1'))));
```

## Usage

All public getters and methods of an `RdfStore` are illustrated below.
The examples assume the following imports and objects:
```typescript
import { DataFactory } from 'rdf-data-factory';
const streamifyArray = require('streamify-array');
const DF = new DataFactory();
```

### `size`

Determining the number of (asserted) quads inside the store:

```typescript
console.log(store.size);
```

### `addQuad`

Adding a quad to the store:

```typescript
store.addQuad(
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')),
);
```

### `removeQuad`

Removing a quad from the store:

```typescript
store.removeQuad(
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')),
);
```

### `remove`

Remove a stream of quads from the store:

```typescript
const result = store.remove(streamifyArray([
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')),
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o2')),
]));
result.on('end', () => {
  console.log('Done!');
});
```

### `removeMatches`

Remove all quads matching the given quad pattern from the store:

```typescript
const result = store.remove(DF.namedNode('ex:s1'), undefined, DF.namedNode('ex:o1'), undefined);
result.on('end', () => {
  console.log('Done!');
});
```

### `deleteGraph`

Remove all quads with the given graph element from the store:

```typescript
const result = store.deleteGraph('ex:g1');
result.on('end', () => {
  console.log('Done!');
});
```

### `import`

Add a stream of quads into the store:

```typescript
const result = store.import(streamifyArray([
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')),
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o2')),
]));
result.on('end', () => {
  console.log('Done!');
});
```

### `readQuads`

Returns an iterable iterator producing all quads matching the given pattern:

```typescript
for (const quad of store.readQuads(DF.namedNode('ex:s1'), undefined, DF.namedNode('ex:o1'), undefined)) {
  console.log(quad);
}
```

### `getQuads`

Returns an array containing all quads matching the given pattern:

```typescript
const array = store.getQuads(DF.namedNode('ex:s1'), undefined, DF.namedNode('ex:o1'), undefined)''
console.log(array);
```

### `match`

Returns a stream producing all quads matching the given pattern:

```typescript
const stream = store.match(DF.namedNode('ex:s1'), undefined, DF.namedNode('ex:o1'), undefined);

stream.on('data', (quad) => {
  console.log(quad);
});
stream.on('end', () => {
  console.log('Done!');
});
```

### `countQuads`

Count the number of quads matching the given pattern:

```typescript
const count = store.countQuads(DF.namedNode('ex:s1'), undefined, DF.namedNode('ex:o1'), undefined);
```

### `asDataset`

Interact with this store using the [RDF/JS `DatasetCore` interface](https://rdf.js.org/dataset-spec/#datasetcore-interface).

```typescript
const dataset = store.asDataset();

console.log(dataset.size);
dataset.add(DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')));
console.log(dataset.has(DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1'))));
```

## Configuring a store

Instead of using the default settings, you may optionally decide to configure the following aspects of a store:

* **Index combinations**: In what orders quads should be stored, which will determine storage size, and query efficiency.
* **Index type**: The type of index datastructure that will be used for each index combination.
* **Dictionary**: The dictionary that will be used for encoding RDF terms.
* **Data Factory**: The [RDF/JS data factory](https://rdf.js.org/data-model-spec/#datafactory-interface) for creating quads and terms.

Below, you can learn more about each of these aspects.

### Default settings

When creating a new store using `RdfStore.createDefault()`,
a store with the following settings will be created:

* **Index combinations**: `GSPO`, `GPOS`, `GOSP`.
* **Index type**: `RdfStoreIndexNestedRecord`
* **Dictionary**: `TermDictionaryQuotedIndexed` with `TermDictionaryNumberRecordFullTerms`.
* **Data factory**: `DataFactory` from [`rdf-data-factory`](https://www.npmjs.com/package/rdf-data-factory).

These default settings correspond to the following invocation:
```typescript
const store = new RdfStore<number>({
  indexCombinations: [
    [ 'graph', 'subject', 'predicate', 'object' ],
    [ 'graph', 'predicate', 'object', 'subject' ],
    [ 'graph', 'object', 'subject', 'predicate' ],
  ],
  indexConstructor: subOptions => new RdfStoreIndexNestedMapQuoted(subOptions),
  dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms()),
  dataFactory: new DataFactory(),
});
```

**Note:** These default settings are considered the "best" for average usage.
It is possible that future updates may tweak these default settings.
Therefore, if you want more predictable performance across updates,
it may be safer to manually configure your store.

### Index combinations

The `indexCombinations` option inside the `RdfStore` constructor allows you
to configure in what orders quads should be stored.
The value of this option must always be an array containing one or more representations of quad component orders,
where each order must always contain the following 4 elements in any order:
`'subject'`, `'predicate'`, `'object'`, `'graph'`.

For example, the following will store all triples in a single index using `GSPO` order:
```typescript
{
  indexCombinations: [
    [ 'graph', 'subject', 'predicate', 'object' ],
  ]
}
```

The following will contain 2 indexes, the first in `GPOS` order, and the second in `GOSP` order:
```typescript
{
  indexCombinations: [
    [ 'graph', 'predicate', 'object', 'subject' ],
    [ 'graph', 'object', 'subject', 'predicate' ],
  ]
}
```

These indexes enable a trade-off between storage size and query performance.
The more indexes, the higher the storage requirements, but the faster query performance.
Therefore, if memory is limited, it is better to pick fewer (at least one) indexes,
but if query performance is more important, then more indexes could be configured.
If the order of the returned triples is not important, then the default index combinations
(`GSPO`, `GPOS`, `GOSP`) should provide sufficient level of performance,
as all triple pattern queries can efficiently be resolved using these indexes.

### Index types

This library implements different approaches for storing indexes.

* `RdfStoreIndexNestedRecord`: Stores quads inside nested `Record` objects. (**Fastest ingestion**)
* `RdfStoreIndexNestedRecordQuoted`: Stores quads inside nested `Record` objects, and supports quoted triples.
* `RdfStoreIndexNestedMap`: Stores quads inside nested `Map` objects. (**Fastest querying**)
* `RdfStoreIndexNestedMapQuoted`: Stores quads inside nested `Map` objects, and supports quoted triples. (**Fastest querying and ingestion for quoted triples**)

The following types also exist, but are mainly for illustration purposes,
as they are always outperformed by other approaches:
* `RdfStoreIndexNestedMapRecursive`: Stores quads inside nested `Map` objects, and traverses the tree using recursive methods.
* `RdfStoreIndexNestedMapRecursiveQuoted`: Stores quads inside nested `Map` objects, supports quoted triples, and traverses the tree using recursive methods.

Different JavaScript engine implementations may lead to different levels of performance across these index types.

For example, the following will use `RdfStoreIndexNestedRecord` for all indexes:
```typescript
{
  indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions)
}
```

### Dictionaries

This library implements different approaches for dictionary encoding.

* `TermDictionaryNumberMap`: Encodes stringified representations of terms to `number` using `Map` objects.
* `TermDictionaryNumberRecord`: Encodes stringified representations of terms to `number` using `Record` objects.
* `TermDictionaryNumberRecordFullTerms`: Encodes stringified representations of terms to `number` using `Record` objects, but keeps track of original term objects during decoding. (**Fastest when not requiring quoted triples**)
* `TermDictionaryQuoted`: Delegates quoted triples and other RDF terms to separate dictionaries.
* `TermDictionaryQuotedIndexed`: Stores quoted triples inside an index structure, and other RDF terms using a separate dictionary. (**Fastest when requiring quoted triples**)
* `TermDictionaryQuotedReferential`: Delegates quoted triples and other RDF terms to separate dictionaries, but terms inside quoted triples are stored in the plain terms dictionary.
* `TermDictionarySymbol`: Encodes stringified representations of terms to `Symbol` using `Map` objects.

For example, the following will use `TermDictionaryNumberRecordFullTerms`:
```typescript
{
  dictionary: new TermDictionaryNumberRecordFullTerms()
}
```

For example, the following will use `TermDictionaryQuotedIndexed` with a `TermDictionaryNumberRecordFullTerms` for non-quoted-triple terms:
```typescript
{
  dictionary: new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms())
}
```

### Data Factory

When terms are decoded from indexes,
a dictionary is used to construct terms and quads.
Any [RDF/JS data factory](https://rdf.js.org/data-model-spec/#datafactory-interface)
implementation can be used for this.

## Performance

Experimental results show the following:

* A single `RdfStoreIndexNestedRecord` in `GSPO` order with `TermDictionaryNumberRecordFullTerms` achieves similar ingestion speeds as `N3Store`.
* Storing multiple indexes improves query performance, at the cost of slower ingestion.
* `RdfStoreIndexNestedMap` outperforms `RdfStoreIndexNestedRecord` and `N3Store` on query performance.
* `TermDictionaryNumberRecordFullTerms` is generally the most efficient dictionary implementation, and it can be used in combination with `TermDictionaryQuotedIndexed` if quoted triples are to be used.
* `RdfStoreIndexNestedMapQuoted` and `RdfStoreIndexNestedRecordQuoted` have a small overhead (~10%) on ingestion and query performance compared to their non-quoted index variants.

These conclusions are draw from the measurements of the command `node perf/run.js -d 128 -o` (part of this repository):

```text
# N3Store

- Adding 2097152 triples to the default graph: 1.676s
* Memory usage for triples: 141MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 5.523s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.114s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.057s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.745s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 194.804ms

- Adding 1048576 quads: 1.126s
* Memory usage for quads: 180MB
- Finding all 1048576 quads 131072 times: 724.579ms

# 3 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 3.247s
* Memory usage for triples: 277MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 3.267s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.037s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.032s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.365s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 96.452ms

- Adding 1048576 quads: 2.044s
* Memory usage for quads: 366MB
- Finding all 1048576 quads 131072 times: 828.931ms

- Adding 262144 quoted triples: 563.647ms
* Memory usage for quoted triples: 448MB
- Finding all 262144 quoted triples 192 times: 9.132s

# 3 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 2.148s
* Memory usage for triples: 262MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 3.098s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.016s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.062s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.513s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 165.439ms

- Adding 1048576 quads: 1.501s
* Memory usage for quads: 181MB
- Finding all 1048576 quads 131072 times: 907.828ms

- Adding 262144 quoted triples: 1.213s
* Memory usage for quoted triples: 668MB
- Finding all 262144 quoted triples 192 times: 9.048s

# 1 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 1.966s
* Memory usage for triples: 451MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 3.560s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.463s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 2.019s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 2.026s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 382.02ms

- Adding 1048576 quads: 1.099s
* Memory usage for quads: 454MB
- Finding all 1048576 quads 131072 times: 1.174s

- Adding 262144 quoted triples: 344.364ms
* Memory usage for quoted triples: 309MB
- Finding all 262144 quoted triples 192 times: 8.755s

# 1 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.801s
* Memory usage for triples: 727MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 3.502s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.733s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.491s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 2.851s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 240.031ms

- Adding 1048576 quads: 1.068s
* Memory usage for quads: 634MB
- Finding all 1048576 quads 131072 times: 1.386s

- Adding 262144 quoted triples: 414.742ms
* Memory usage for quoted triples: 641MB
- Finding all 262144 quoted triples 192 times: 10.448s

# 3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 3.309s
* Memory usage for triples: 829MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 4.469s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.071s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.057s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.494s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 110.942ms

- Adding 1048576 quads: 1.952s
* Memory usage for quads: 881MB
- Finding all 1048576 quads 131072 times: 856.267ms

- Adding 262144 quoted triples: 663.763ms
* Memory usage for quoted triples: 1046MB
- Finding all 262144 quoted triples 192 times: 252.158ms

# 3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 2.338s
* Memory usage for triples: 188MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 3.840s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.022s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.116s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.743s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 190.12ms

- Adding 1048576 quads: 1.607s
* Memory usage for quads: 239MB
- Finding all 1048576 quads 131072 times: 984.885ms

- Adding 262144 quoted triples: 1.713s
* Memory usage for quoted triples: 670MB
- Finding all 262144 quoted triples 192 times: 321.245ms
```

Note that memory usage measurements are inaccurate due to all stores running in the same process,
and no garbage collection occurring.

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
