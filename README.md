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

- Adding 2097152 triples to the default graph: 469.447ms
* Memory usage for triples: 165MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.048s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 510.216ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 463.075ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 797.207ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 65.534ms

- Adding 1048576 quads: 316.429ms
* Memory usage for quads: 227MB
- Finding all 1048576 quads 131072 times: 346.913ms


# 3 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 952.481ms
* Memory usage for triples: 365MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 665.723ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 297.259ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 293.228ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.066s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 596.537ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 19.298ms

- Adding 1048576 quads: 536.853ms
* Memory usage for quads: 1105MB
- Finding all 1048576 quads 131072 times: 214.833ms

- Adding 262144 quoted triples: 174.591ms
* Memory usage for quoted triples: 1107MB
- Finding all 262144 quoted triples 192 times: 2.854s

- Adding 1048576 quads: 544.122ms
* Memory usage for quads: 1109MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 376.075ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 371.407ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 311.503ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 300.178ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.784s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.550s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.190s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 3.987ms
- Finding all 32 terms (1) filtered by graph 1024 times: 13.012ms
- Counting all 32 terms (1) filtered by graph 1024 times: 7.314ms


# 3 Map indexes (number) OPT-QUERY-NODES

- Adding 2097152 triples to the default graph: 1.012s
* Memory usage for triples: 2305MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 739.364ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 331.6ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 328.532ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.478s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 630.409ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 18.766ms

- Adding 1048576 quads: 584.324ms
* Memory usage for quads: 2462MB
- Finding all 1048576 quads 131072 times: 236.608ms

- Adding 262144 quoted triples: 193.003ms
* Memory usage for quoted triples: 2463MB
- Finding all 262144 quoted triples 192 times: 3.208s

- Adding 1048576 quads: 661.448ms
* Memory usage for quads: 2440MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 362.33ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 368.646ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 297.924ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 287.383ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.750s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.561s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 4.845s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 3.932ms
- Finding all 32 terms (1) filtered by graph 1024 times: 7.585ms
- Counting all 32 terms (1) filtered by graph 1024 times: 6.966ms

- Adding 1048576 quads: 580.961ms
* Memory usage for quads: 2580MB
- Finding all 32 nodes 1024 times: 2.351ms


# 3 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 671.975ms
* Memory usage for triples: 2580MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 701.878ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 381.241ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 410.961ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.393s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 661.393ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 39.711ms

- Adding 1048576 quads: 391.849ms
* Memory usage for quads: 2455MB
- Finding all 1048576 quads 131072 times: 291.827ms

- Adding 262144 quoted triples: 311.105ms
* Memory usage for quoted triples: 2464MB
- Finding all 262144 quoted triples 192 times: 3.598s

- Adding 1048576 quads: 416.086ms
* Memory usage for quads: 2464MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 412.925ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 397.132ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 331.395ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 315.327ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.959s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.599s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.130s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 101.193ms
- Finding all 32 terms (1) filtered by graph 1024 times: 9.095ms
- Counting all 32 terms (1) filtered by graph 1024 times: 7.067ms


# 1 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 544.088ms
* Memory usage for triples: 2475MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 787.506ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 682.324ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 710.618ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 3.815s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.024s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 193.583ms

- Adding 1048576 quads: 322.029ms
* Memory usage for quads: 2577MB
- Finding all 1048576 quads 131072 times: 462.123ms

- Adding 262144 quoted triples: 126.364ms
* Memory usage for quoted triples: 2586MB
- Finding all 262144 quoted triples 192 times: 3.079s


# 1 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 482.111ms
* Memory usage for triples: 2586MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 669.852ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 546.804ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 467.683ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.625s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 828.14ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 78.115ms

- Adding 1048576 quads: 270.422ms
* Memory usage for quads: 2577MB
- Finding all 1048576 quads 131072 times: 343.494ms

- Adding 262144 quoted triples: 112.214ms
* Memory usage for quoted triples: 2588MB
- Finding all 262144 quoted triples 192 times: 3.503s


# 3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 1.078s
* Memory usage for triples: 2570MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 712.367ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 345.123ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 361.83ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.237s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 622.327ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 21.117ms

- Adding 1048576 quads: 574.894ms
* Memory usage for quads: 2579MB
- Finding all 1048576 quads 131072 times: 253.503ms

- Adding 262144 quoted triples: 200.185ms
* Memory usage for quoted triples: 2582MB
- Finding all 262144 quoted triples 192 times: 113.968ms

- Adding 1048576 quads: 591.424ms
* Memory usage for quads: 2584MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 389.214ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 380.599ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 309.703ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 303.848ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.826s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.683s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.540s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 4.095ms
- Finding all 32 terms (1) filtered by graph 1024 times: 12.714ms
- Counting all 32 terms (1) filtered by graph 1024 times: 8.769ms


# 3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 650.012ms
* Memory usage for triples: 2799MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 806.702ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 433.938ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 449.254ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 2.523s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 701.009ms
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 44.774ms

- Adding 1048576 quads: 381.385ms
* Memory usage for quads: 2592MB
- Finding all 1048576 quads 131072 times: 335.648ms

- Adding 262144 quoted triples: 349.226ms
* Memory usage for quoted triples: 2615MB
- Finding all 262144 quoted triples 192 times: 128.903ms

- Adding 1048576 quads: 475.484ms
* Memory usage for quads: 2596MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 394.51ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 384.203ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 318.691ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 309.164ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.879s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.677s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 5.604s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 104.021ms
- Finding all 32 terms (1) filtered by graph 1024 times: 9.483ms
- Counting all 32 terms (1) filtered by graph 1024 times: 7.615ms
```

Note that memory usage measurements are inaccurate due to all stores running in the same process,
and no garbage collection occurring.

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
