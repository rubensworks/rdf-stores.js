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

Note that this library only focuses on triple storage and provide triple pattern query access.
If you want to execute more complex queries over this store (such as SPARQL queries), engines such as [Comunica](https://comunica.dev/) may be used:

```typescript
import { QueryEngine } from '@comunica/query-sparql';

const bindingsStream = await myEngine.queryBindings(`SELECT * WHERE { ?s ?p ?o }`, {
  sources: [store],
});
bindingsStream.on('data', (binding) => {
    console.log(binding.toString());
});
```
Learn more about using Comunica: https://comunica.dev/docs/query/getting_started/query_app/

## Usage

All public getters and methods of an `RdfStore` are illustrated below.
The examples assume the following imports and objects:
```typescript
import { DataFactory } from 'rdf-data-factory';
import { BindingsFactory } from '@comunica/utils-bindings-factory'; // Only necessary when requesting bindings
const streamifyArray = require('streamify-array');
const DF = new DataFactory();
const BF = new BindingsFactory(DF);
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

### `readBindings`

Returns an iterable iterator producing all [bindings](https://rdf.js.org/query-spec/#bindings-interface) matching the given pattern:

```typescript
for (const bindings of store.readBindings(BF, DF.namedNode('ex:s1'), DF.variable('p'), DF.namedNode('ex:o1'), DF.variable('g'))) {
  console.log(bindings.toString());
  console.log(bindings.get('p'));
  console.log(bindings.get('g'));
}
```

### `getBindings`

Returns an array containing all bindings matching the given pattern:

```typescript
const array = store.getBindings(BF, DF.namedNode('ex:s1'), DF.variable('p'), DF.namedNode('ex:o1'), DF.variable('g'));
console.log(array);
```

### `matchBindings`

Returns a stream producing all bindings matching the given pattern:

```typescript
const stream = store.match(DF.namedNode('ex:s1'), DF.variable('p'), DF.namedNode('ex:o1'), DF.variable('g'));

stream.on('data', (bindings) => {
  console.log(bindings.toString());
});
stream.on('end', () => {
  console.log('Done!');
});
```

### `countDistinctTerms`

Count the given distinct terms that exist in the store.

```typescript
store.countDistinctTerms([ 'subject', 'predicate' ]);
```

An optional `filters` array (in SPOG order) can be passed to count only those distinct terms
that originate from quads matching the given components.
Each entry in the array corresponds to `subject`, `predicate`, `object`, and `graph` respectively,
where `undefined` means that component is unconstrained.

```typescript
// Count distinct subjects that appear in the default graph
store.countDistinctTerms([ 'subject' ], [ undefined, undefined, undefined, DF.defaultGraph() ]);

// Count distinct subject–predicate pairs with a specific predicate
store.countDistinctTerms([ 'subject', 'predicate' ], [ undefined, DF.namedNode('ex:p1'), undefined, undefined ]);
```

### `readDistinctTerms`

Returns an iterable iterator producing distinct arrays of terms that exist in the store.
Each returned array corresponds to the terms specified by given quad term names.

```typescript
for (const [ subjectTerm ] of store.readDistinctTerms([ 'subject' ])) {
  console.log(subjectTerm);
}
```

```typescript
for (const [ subjectTerm, predicateTerm ] of store.readDistinctTerms([ 'subject', 'predicate' ])) {
  console.log(subjectTerm.value);
  console.log(predicateTerm.value);
}
```

An optional `filters` array (in SPOG order) can be passed to return only those distinct terms
that originate from quads matching the given components.
Each entry in the array corresponds to `subject`, `predicate`, `object`, and `graph` respectively,
where `undefined` means that component is unconstrained.

```typescript
// Iterate over all distinct subjects that appear in the default graph
for (const [ subjectTerm ] of store.readDistinctTerms([ 'subject' ], [ undefined, undefined, undefined, DF.defaultGraph() ])) {
  console.log(subjectTerm.value);
}

// Iterate over distinct subject–predicate pairs for a specific predicate
for (const [ subjectTerm, predicateTerm ] of store.readDistinctTerms([ 'subject', 'predicate' ], [ undefined, DF.namedNode('ex:p1'), undefined, undefined ])) {
  console.log(subjectTerm.value);
  console.log(predicateTerm.value);
}
```

### `getDistinctTerms`

Returns an array containing distinct arrays of terms that exist in the store.
Each returned array corresponds to the terms specified by given quad term names.

```typescript
const array = store.getDistinctTerms([ 'subject', 'predicate' ]);
console.log(array);
```

An optional `filters` array (in SPOG order) can be passed to return only those distinct terms
that originate from quads matching the given components.
Each entry in the array corresponds to `subject`, `predicate`, `object`, and `graph` respectively,
where `undefined` means that component is unconstrained.

```typescript
// All distinct subjects in the default graph
const subjects = store.getDistinctTerms([ 'subject' ], [ undefined, undefined, undefined, DF.defaultGraph() ]);
console.log(subjects);
```

### `matchDistinctTerms`

Returns a stream producing distinct arrays of terms that exist in the store.
Each returned array corresponds to the terms specified by given quad term names.

```typescript
const stream = store.matchDistinctTerms([ 'subject', 'predicate' ]);

stream.on('data', ([ subjectTerm, predicateTerm ]) => {
  console.log(subjectTerm.value);
  console.log(predicateTerm.value);
});
stream.on('end', () => {
  console.log('Done!');
});
```

An optional `filters` array (in SPOG order) can be passed to return only those distinct terms
that originate from quads matching the given components.
Each entry in the array corresponds to `subject`, `predicate`, `object`, and `graph` respectively,
where `undefined` means that component is unconstrained.

```typescript
// Stream all distinct subjects in the default graph
const stream = store.matchDistinctTerms([ 'subject' ], [ undefined, undefined, undefined, DF.defaultGraph() ]);

stream.on('data', ([ subjectTerm ]) => {
  console.log(subjectTerm.value);
});
stream.on('end', () => {
  console.log('Done!');
});
```

### `countNodes`

Returns the number of nodes in the given graph (can be a variable).
Nodes are all terms that are either a subject or object within the store.

This method can only be called when the store is constructed with `indexNodes: true`.

This can for example be useful for optimizing the Nodes function in SPARQL's property paths:
https://www.w3.org/TR/sparql12-query/#defn_nodeSet

```typescript
const amount = store.countNodes(DF.namedNode('g1'));
```

### `readNodes`

Returns a generator producing all nodes in the given graph (can be a variable).
Nodes are all terms that are either a subject or object within the store.

This method can only be called when the store is constructed with `indexNodes: true`.

It returns a generator of tuples containing the named graph as first element and the node term as second element.

This can for example be useful for optimizing the Nodes function in SPARQL's property paths:
https://www.w3.org/TR/sparql12-query/#defn_nodeSet

```typescript
for (const [ graph, term ] of store.readNodes(DF.namedNode('g1'))) {
  console.log(term.value);
}
```

### `getNodes`

Returns an array containing all nodes in the given graph (can be a variable).
Nodes are all terms that are either a subject or object within the store.

This method can only be called when the store is constructed with `indexNodes: true`.

It returns an array of tuples containing the named graph as first element and the node term as second element.

This can for example be useful for optimizing the Nodes function in SPARQL's property paths:
https://www.w3.org/TR/sparql12-query/#defn_nodeSet

```typescript
const array = store.getNodes(DF.namedNode('g1'));
console.log(array);
```

### `matchNodes`

Returns a stream containing all nodes in the given graph (can be a variable).
Nodes are all terms that are either a subject or object within the store.

This method can only be called when the store is constructed with `indexNodes: true`.

It returns a stream of tuples containing the named graph as first element and the node term as second element.

This can for example be useful for optimizing the Nodes function in SPARQL's property paths:
https://www.w3.org/TR/sparql12-query/#defn_nodeSet

```typescript
const stream = store.matchNodes(DF.namedNode('g1'));

stream.on('data', (term) => {
  console.log(term.value);
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
  indexNodes: false,
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

- Adding 2097152 triples to the default graph: 479.468ms
* Memory usage for triples: 163MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.080s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 520.912ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 473.104ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 822.414ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 67.228ms

- Adding 1048576 quads: 322.286ms
* Memory usage for quads: 216MB
- Finding all 1048576 quads 131072 times: 353.68ms


# 3 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 993.74ms
* Memory usage for triples: 363MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 692.184ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 302.466ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 315.857ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.081s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 623.16ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 18.616ms

- Adding 1048576 quads: 540.963ms
* Memory usage for quads: 1112MB
- Finding all 1048576 quads 131072 times: 231.622ms

- Adding 262144 quoted triples: 173.918ms
* Memory usage for quoted triples: 1114MB
- Finding all 262144 quoted triples 192 times: 2.982s

- Adding 1048576 quads: 541.148ms
* Memory usage for quads: 1116MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 379.793ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 369.534ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 312.157ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 302.747ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.820s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.573s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.534s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 3.975ms
- Finding all 32 terms (1) filtered by graph 1024 times: 13.343ms
- Counting all 32 terms (1) filtered by graph 1024 times: 7.258ms


# 3 Map indexes (number) OPT-QUERY-NODES

- Adding 2097152 triples to the default graph: 1.016s
* Memory usage for triples: 2322MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 742.367ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 339.297ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 364.055ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.452s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 658.299ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 18.681ms

- Adding 1048576 quads: 604.757ms
* Memory usage for quads: 2469MB
- Finding all 1048576 quads 131072 times: 255.933ms

- Adding 262144 quoted triples: 199.202ms
* Memory usage for quoted triples: 2470MB
- Finding all 262144 quoted triples 192 times: 3.365s

- Adding 1048576 quads: 632.966ms
* Memory usage for quads: 2448MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 374.012ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 369.216ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 311.077ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 294.657ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.767s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.589s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 4.919s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 3.96ms
- Finding all 32 terms (1) filtered by graph 1024 times: 7.729ms
- Counting all 32 terms (1) filtered by graph 1024 times: 7.132ms

- Adding 1048576 quads: 593.714ms
* Memory usage for quads: 2595MB
- Finding all 32 nodes 1024 times: 2.49ms


# 3 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 704.897ms
* Memory usage for triples: 2595MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 721.551ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 392.97ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 412.528ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.439s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 669.816ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 51.149ms

- Adding 1048576 quads: 401.141ms
* Memory usage for quads: 2468MB
- Finding all 1048576 quads 131072 times: 312.373ms

- Adding 262144 quoted triples: 330.667ms
* Memory usage for quoted triples: 2477MB
- Finding all 262144 quoted triples 192 times: 3.712s

- Adding 1048576 quads: 380.579ms
* Memory usage for quads: 2455MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 399.33ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 393.108ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 327.06ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 322.799ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.874s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.684s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.199s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 113.794ms
- Finding all 32 terms (1) filtered by graph 1024 times: 13.547ms
- Counting all 32 terms (1) filtered by graph 1024 times: 9.3ms


# 1 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 640.779ms
* Memory usage for triples: 2457MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 752.861ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 598.053ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 682.667ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 3.316s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 923.685ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 174.326ms

- Adding 1048576 quads: 317.839ms
* Memory usage for quads: 2571MB
- Finding all 1048576 quads 131072 times: 356.356ms

- Adding 262144 quoted triples: 120.659ms
* Memory usage for quoted triples: 2572MB
- Finding all 262144 quoted triples 192 times: 3.304s


# 1 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 479.673ms
* Memory usage for triples: 2572MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 667.883ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 582.248ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 490.551ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.583s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 833.394ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 91.41ms

- Adding 1048576 quads: 268.963ms
* Memory usage for quads: 2571MB
- Finding all 1048576 quads 131072 times: 336.225ms

- Adding 262144 quoted triples: 109.26ms
* Memory usage for quoted triples: 2582MB
- Finding all 262144 quoted triples 192 times: 3.459s


# 3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 997.98ms
* Memory usage for triples: 2582MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 722.365ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 346.636ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 360.259ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.176s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 670.417ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 22.467ms

- Adding 1048576 quads: 620.876ms
* Memory usage for quads: 2571MB
- Finding all 1048576 quads 131072 times: 256.611ms

- Adding 262144 quoted triples: 204.503ms
* Memory usage for quoted triples: 2575MB
- Finding all 262144 quoted triples 192 times: 107.511ms

- Adding 1048576 quads: 582.532ms
* Memory usage for quads: 2578MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 379.241ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 375.543ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 316.82ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 308.27ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.840s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.662s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.571s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 4.165ms
- Finding all 32 terms (1) filtered by graph 1024 times: 12.802ms
- Counting all 32 terms (1) filtered by graph 1024 times: 8.11ms


# 3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 675.351ms
* Memory usage for triples: 2742MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 858.682ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 445.961ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 474.445ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 3.006s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 710.319ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 52.664ms

- Adding 1048576 quads: 378.553ms
* Memory usage for quads: 2589MB
- Finding all 1048576 quads 131072 times: 338.85ms

- Adding 262144 quoted triples: 434.371ms
* Memory usage for quoted triples: 2609MB
- Finding all 262144 quoted triples 192 times: 130.165ms

- Adding 1048576 quads: 433.213ms
* Memory usage for quads: 2611MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 431.746ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 418.886ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 352.263ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 339.848ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.982s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.823s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.695s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 111.741ms
- Finding all 32 terms (1) filtered by graph 1024 times: 10.42ms
- Counting all 32 terms (1) filtered by graph 1024 times: 8.45ms
```

Note that memory usage measurements are inaccurate due to all stores running in the same process,
and no garbage collection occurring.

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
