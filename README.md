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
// Or, for data that is loaded in bulk and then mainly queried, a store that keeps quads sorted
// const store = RdfStore.createOrdered();

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

Use `createOrdered` when data is loaded at once, with `import` or `addQuads`, and then mainly queried:
for data with many distinct terms, it uses several times less memory, and it returns sorted results, but adds quads one by one more slowly.
See [`createDefault` vs `createOrdered`](#createdefault-vs-createordered) for the differences.

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

### `addQuads`

Adding several quads to the store at once, which returns how many of them were not yet present:

```typescript
const added = store.addQuads([
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o1')),
  DF.quad(DF.namedNode('ex:s1'), DF.namedNode('ex:p1'), DF.namedNode('ex:o2')),
]);
```

If every index supports batches, as [`RdfStoreIndexSortedBlocks`](#createdefault-vs-createordered) does,
the quads are sorted once per index and merged in, which is much faster than adding them one by one.
Otherwise, this is the same as calling `addQuad` for each of them.

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

If every index supports batches, as [`RdfStoreIndexSortedBlocks`](#createdefault-vs-createordered) does,
the quads are collected while the stream flows, and inserted as a single batch (like [`addQuads`](#addquads)) when it ends.
They only become visible in the store at that point.
The store listens for the end of the stream before `import` returns,
so listeners that are attached to the returned emitter afterwards (as above) are only called once all quads have been added.

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

### `resultOrder` and `seekTo`

When a pattern is served by an [ordered index](#createdefault-vs-createordered),
the iterator returned by [`matchBindings`](#matchbindings) carries two extra members.
Both are absent otherwise, so a consumer can check for them to find out whether they are supported.

`resultOrder` names the components the scan varies over, in the order it produces them:

```typescript
const stream = store.matchBindings(BF, DF.variable('s'), DF.namedNode('ex:p1'), DF.variable('o'), DF.defaultGraph());
console.log(stream.resultOrder); // [ 'subject', 'object' ] on a (graph, predicate, subject, object) index
```

`seekTo` drops what is still ahead of the scan and before the given term, using a binary search rather than reading through it.
This makes it useful for a merge join, which can skip to a term coming from the other side:

```typescript
stream.seekTo('subject', DF.namedNode('ex:s5'));
// The next result read has a subject that is not before ex:s5
```

The sought term does not have to occur in the store: the scan lands on the first term that is not before it.
A seek is applied right away and only drops what is ahead, so it can never rewind a scan or re-emit a result that was already produced.

### `indexOrders`

The orders a scan of this store can come back in, one entry per ordered index:

```typescript
console.log(store.indexOrders);
// [ [ 'graph', 'subject', 'object', 'predicate' ], [ 'graph', 'predicate', 'subject', 'object' ], ... ]
```

This is empty for stores without ordered indexes, since the other indexes iterate in insertion order.
The order a given pattern actually gets is the entry for the index that serves it,
with the components the pattern binds removed, since those do not vary across the scan.

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
* `RdfStoreIndexSortedBlocks`: Stores quads in a sorted array of packed integers split into fixed-capacity blocks, and supports quoted triples. This is inspired by concepts of the B-Tree, but optimized for in-memory storage. (**Ordered scans that can skip ahead, and compact for data with many distinct terms**) See [`createDefault` vs `createOrdered`](#createdefault-vs-createordered).

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

### `createDefault` vs `createOrdered`

`RdfStore.createDefault()` and `RdfStore.createOrdered()` create stores with the same dictionary and data factory,
but with a different index type and index combinations:

|                                              | `createDefault()`                           | `createOrdered()`                                                  |
|----------------------------------------------|---------------------------------------------|--------------------------------------------------------------------|
| Index type                                   | `RdfStoreIndexNestedMapQuoted` (nested `Map` objects) | `RdfStoreIndexSortedBlocks` (sorted leaves of packed 32-bit integers) |
| Index combinations                           | `GSPO`, `GPOS`, `GOSP`                      | `GSOP`, `GPSO`, `GOPS`, see `RdfStore.ORDERED_INDEX_COMBINATIONS` |
| Memory                                       | Grows with the number of distinct terms: 435 MB for WatDiv (1.1M triples) | 16 bytes per quad per index: 114 MB for WatDiv |
| Loading a batch with `import` or `addQuads` | Quad by quad: 6.9s for WatDiv               | Sorted once and merged in: 3.6s for WatDiv                         |
| Adding quads one by one                      | Faster                                      | Slower: each insert shifts quads within a leaf                     |
| Order of results                             | Insertion order                             | Sorted on the term order, reported by [`resultOrder`](#resultorder-and-seekto) |
| Skipping ahead in results                    | Not supported                               | [`seekTo`](#resultorder-and-seekto)                                 |
| Looking up a single quad                     | Faster                                      | 1.2 to 1.3 times slower                                            |
| Counting quads of a pattern                  | Walks the matching maps                     | A few binary searches for bound prefixes                           |
| Finding and counting distinct terms          | Read off map sizes                          | Caches counts until the store changes, so repeated counts are faster, but finding walks the range: about 14 times slower |
| Quoted triples                               | Supported                                   | Supported                                                          |

With both sets, the bound components of any pattern are a prefix of one of the indexes, so every pattern is a range in an index.
`createOrdered` focuses on the orders that are most useful for merge joins.
However, not all interesting orders are available, to save on memory usage.
Adding a `GPOS` index would make more orders available, at the cost of a third more memory for the indexes and a higher ingestion time.

So `createOrdered` suits data that is loaded in bulk and then mainly queried,
especially by engines that can make use of sorted results, such as merge joins.
`createDefault` remains the better choice for stores that are filled incrementally while being queried.

Components that `RdfStoreIndexSortedBlocks` has to match after an unbound one are matched with a skip-scan, which jumps over non-matching ranges.
It requires a dictionary that encodes terms as 32-bit integers, which all bundled number dictionaries do.
Quoted triple patterns are matched inside the index when the dictionary supports quoted triples, such as `TermDictionaryQuotedIndexed`.

All ordered indexes of a store share a single term order,
which is defined by the `termComparator` option, and defaults to ordering on term type, value, datatype, language and base direction.
`createOrdered` accepts the following options:

```typescript
const store = RdfStore.createOrdered({
  // Optional: the order to keep terms in
  termComparator: (termA, termB) => termA.value.localeCompare(termB.value) || termA.termType.localeCompare(termB.termType),
  // Optional: defaults to RdfStore.ORDERED_INDEX_COMBINATIONS (GSOP, GPSO, GOPS)
  indexCombinations: [
    [ 'graph', 'subject', 'predicate', 'object' ],
    [ 'graph', 'predicate', 'object', 'subject' ],
    [ 'graph', 'object', 'subject', 'predicate' ],
  ],
  // Optional: if nodes must be indexed
  nodes: true,
});
```

The same can be achieved through the regular constructor,
which also allows tuning the index, although its defaults should rarely need changing:

```typescript
const dictionary = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
new RdfStore<number>({
  indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
  indexConstructor: subOptions => new RdfStoreIndexSortedBlocks(subOptions, {
    // Optional: the maximum number of quads per leaf
    leafCapacity: 512,
    // Optional: batches with fewer than 1 in this many of the quads in the index are inserted one by one
    mergeThreshold: 32,
    // Optional: quads checked one by one when skipping a group, before searching instead
    linearProbes: 8,
  }),
  dictionary,
  dataFactory: new DataFactory(),
  termComparator: (termA, termB) => termA.value.localeCompare(termB.value),
});
```

A comparator that considers two different terms equal is allowed: such terms are then ordered on their encoding.

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
* The measurements below contain two kinds of synthetic data.
  Most scopes use data with only a few hundred distinct terms, which nested indexes store compactly.
  The entities scope has about as many distinct terms as triples, as real data tends to:
  2M triples about 131072 entities, each with a distinct value for each of 16 properties.
* On the data with few distinct terms, `RdfStoreIndexSortedBlocks` scans patterns with one or two variables about as fast as the nested indexes,
  but is 1.2 to 1.3 times slower on lookups without variables, and up to 2.4 times slower on ingestion in batches (up to 3.2 times when adding quads one by one).
  It counts the distinct terms of one to three components 10 to 30 times faster, as it caches counts until the store changes,
  but finds the distinct values of a single component about 14 times slower, as it walks the matching range.
  It holds 2M triples in 109 MB, between `RdfStoreIndexNestedRecordQuoted` (67 MB) and `RdfStoreIndexNestedMapQuoted` (183 MB).
* On the entities data, `RdfStoreIndexSortedBlocks` holds the 2M triples in 474 MB, against 1951 MB for `RdfStoreIndexNestedMapQuoted`
  and 2708 MB for `RdfStoreIndexNestedRecordQuoted`, and loads them in a batch in 9.3s, against 9.1s and 14.6s.
  It counts the triples of a property with a few binary searches instead of a walk over them (21ms against 16s for 1024 counts),
  and reads the triples of a property in the order of their values without sorting them (0.9s against 1.1s).
* Adding the entities data one quad at a time to `RdfStoreIndexSortedBlocks` is slow (over 2 minutes), because every new term that finds no room
  between the labels of its neighbours in the term order makes all terms be relabelled. So for data with many distinct terms,
  load in batches through `import` or `addQuads`, or use nested indexes for stores that are filled one quad at a time.
* On real data, loading WatDiv (1.1M triples) through `import` with node indexing takes 114 MB and 3.6s including parsing
  into the 3 `RdfStoreIndexSortedBlocks` indexes of `createOrdered`,
  against 435 MB and 6.9s into the 3 `RdfStoreIndexNestedMapQuoted` indexes of `createDefault`.

These conclusions are drawn from the measurements of the command `node --expose-gc --max-old-space-size=8192 perf/run.js -d 128 -o` (part of this repository).
The larger heap is needed for the entities data of `N3Store` and the record indexes.
With `--expose-gc`, memory usage is the heap and off-heap memory in use after garbage collection, which is what the store holds.
The measurements below were taken on a single machine with Node.js 22:

```text
# N3Store

- Adding 2097152 triples to the default graph: 1.091s
* Memory usage for triples: 69MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 5.567s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 888.113ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 894.645ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.481s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 170.338ms

- Adding 2097152 triples about 131072 entities, with distinct values: 15.077s
* Memory usage for entities: 2648MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:02.923 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 871.841ms

- Adding 1048576 quads: 1.206s
* Memory usage for quads: 52MB
- Finding all 1048576 quads 131072 times: 683.723ms


# 3 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 2.612s
* Memory usage for triples: 182MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.649s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 684.643ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 788.245ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.428s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.409s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 51.152ms

- Adding 2097152 triples about 131072 entities, with distinct values: 9.849s
* Memory usage for entities: 1950MB
- Counting the 131072 triples of each of 16 properties 64 times: 16.421s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.006s

- Adding 262144 triples to the default graph: 262.63ms
* Memory usage for triples: 32MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 324.286ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 333.73ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 79.533ms

- Adding 1048576 quads: 1.277s
* Memory usage for quads: 104MB
- Finding all 1048576 quads 131072 times: 537.909ms

- Adding 262144 quoted triples: 525.118ms
* Memory usage for quoted triples: 80MB
- Finding all 262144 quoted triples 192 times: 5.334s

- Adding 1048576 quads: 1.315s
* Memory usage for quads: 104MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 682.406ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 623.211ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 534.377ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 488.984ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.815s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.484s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 10.627s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 15.933ms
- Finding all 32 terms (1) filtered by graph 1024 times: 26.727ms
- Counting all 32 terms (1) filtered by graph 1024 times: 2.341ms

- Adding 1048576 quads: 1.347s
* Memory usage for quads: 104MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 31.864ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.744ms


# 3 Map indexes (number) OPT-QUERY-NODES

- Adding 2097152 triples to the default graph: 2.591s
* Memory usage for triples: 183MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.628s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 573.7ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 741.908ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 6.083s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.296s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 48.876ms

- Adding 2097152 triples about 131072 entities, with distinct values: 10.649s
* Memory usage for entities: 2030MB
- Counting the 131072 triples of each of 16 properties 64 times: 16.185s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.129s

- Adding 262144 triples to the default graph: 341.34ms
* Memory usage for triples: 32MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 318.492ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 374.962ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 100.333ms

- Adding 1048576 quads: 1.429s
* Memory usage for quads: 104MB
- Finding all 1048576 quads 131072 times: 464.675ms

- Adding 262144 quoted triples: 680.724ms
* Memory usage for quoted triples: 80MB
- Finding all 262144 quoted triples 192 times: 5.099s

- Adding 1048576 quads: 1.224s
* Memory usage for quads: 104MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 642.258ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 578.425ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 501.521ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 458.897ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.930s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.655s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 10.488s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 22.27ms
- Finding all 32 terms (1) filtered by graph 1024 times: 12.897ms
- Counting all 32 terms (1) filtered by graph 1024 times: 0.651ms

- Adding 1048576 quads: 1.425s
* Memory usage for quads: 104MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 23.972ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.011ms

- Adding 1048576 quads: 1.389s
* Memory usage for quads: 104MB
- Finding all 32 nodes 1024 times: 4.702ms


# 3 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.302s
* Memory usage for triples: 67MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.439s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 606.08ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 687.068ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.462s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.098s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 77.133ms

- Adding 2097152 triples about 131072 entities, with distinct values: 14.298s
* Memory usage for entities: 2707MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:04.162 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.550s

- Adding 262144 triples to the default graph: 190.698ms
* Memory usage for triples: 19MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 299.715ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 338.233ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 89.455ms

- Adding 1048576 quads: 980.923ms
* Memory usage for quads: 51MB
- Finding all 1048576 quads 131072 times: 608.854ms

- Adding 262144 quoted triples: 617.765ms
* Memory usage for quoted triples: 96MB
- Finding all 262144 quoted triples 192 times: 6.235s

- Adding 1048576 quads: 965.077ms
* Memory usage for quads: 51MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 607.865ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 608.744ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 543.184ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 483.344ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.798s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.386s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 9.808s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 233.431ms
- Finding all 32 terms (1) filtered by graph 1024 times: 16.904ms
- Counting all 32 terms (1) filtered by graph 1024 times: 3.461ms

- Adding 1048576 quads: 982.241ms
* Memory usage for quads: 51MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 42.952ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 13.774ms


# 1 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 911.883ms
* Memory usage for triples: 68MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.465s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.222s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.598s
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.957s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.703s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 470.806ms

- Adding 2097152 triples about 131072 entities, with distinct values: 4.452s
* Memory usage for entities: 734MB
- Counting the 131072 triples of each of 16 properties 64 times: 56.203s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.137s

- Adding 262144 triples to the default graph: 120.658ms
* Memory usage for triples: 18MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 378.477ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 390.709ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 72.541ms

- Adding 1048576 quads: 570.816ms
* Memory usage for quads: 42MB
- Finding all 1048576 quads 131072 times: 920.024ms

- Adding 262144 quoted triples: 265.258ms
* Memory usage for quoted triples: 20MB
- Finding all 262144 quoted triples 192 times: 5.519s


# 1 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 941.711ms
* Memory usage for triples: 29MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.472s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 925.631ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 794.478ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.254s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.477s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 183.215ms

- Adding 2097152 triples about 131072 entities, with distinct values: 5.275s
* Memory usage for entities: 777MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:49.347 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.612s

- Adding 262144 triples to the default graph: 132.712ms
* Memory usage for triples: 13MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 377.039ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 409.184ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 86.195ms

- Adding 1048576 quads: 523.599ms
* Memory usage for quads: 24MB
- Finding all 1048576 quads 131072 times: 789.969ms

- Adding 262144 quoted triples: 254.191ms
* Memory usage for quoted triples: 15MB
- Finding all 262144 quoted triples 192 times: 5.802s


# 3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 2.417s
* Memory usage for triples: 183MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.687s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 623.577ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 693.943ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.224s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.247s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 55.91ms

- Adding 2097152 triples about 131072 entities, with distinct values: 9.105s
* Memory usage for entities: 1951MB
- Counting the 131072 triples of each of 16 properties 64 times: 15.546s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.103s

- Adding 262144 triples to the default graph: 276.88ms
* Memory usage for triples: 33MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 295.795ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 317.173ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 73.836ms

- Adding 1048576 quads: 1.158s
* Memory usage for quads: 104MB
- Finding all 1048576 quads 131072 times: 474.713ms

- Adding 262144 quoted triples: 525.72ms
* Memory usage for quoted triples: 82MB
- Finding all 262144 quoted triples 192 times: 218.632ms

- Adding 1048576 quads: 1.338s
* Memory usage for quads: 104MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 600.7ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 580.008ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 501.271ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 449.108ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.728s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.394s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 10.024s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 17.088ms
- Finding all 32 terms (1) filtered by graph 1024 times: 19.806ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.627ms

- Adding 1048576 quads: 1.372s
* Memory usage for quads: 104MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 31.5ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 0.902ms


# 3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.374s
* Memory usage for triples: 67MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.580s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 728.898ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 733.328ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.559s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.300s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 93.117ms

- Adding 2097152 triples about 131072 entities, with distinct values: 14.643s
* Memory usage for entities: 2708MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:04.312 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.565s

- Adding 262144 triples to the default graph: 202.556ms
* Memory usage for triples: 19MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 335.286ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 323.369ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 85.269ms

- Adding 1048576 quads: 945.413ms
* Memory usage for quads: 51MB
- Finding all 1048576 quads 131072 times: 640.101ms

- Adding 262144 quoted triples: 640.562ms
* Memory usage for quoted triples: 96MB
- Finding all 262144 quoted triples 192 times: 275.198ms

- Adding 1048576 quads: 990.028ms
* Memory usage for quads: 51MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 611.842ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 618.094ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 521.895ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 483.592ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.886s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.432s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 10.264s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 229.246ms
- Finding all 32 terms (1) filtered by graph 1024 times: 18.945ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.97ms

- Adding 1048576 quads: 985.56ms
* Memory usage for quads: 51MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 42.9ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 14.168ms


# 3 sorted-blocks indexes with indexed quoted dict (number) OPT-BULK

- Adding 2097152 triples to the default graph: 3.321s
* Memory usage for triples: 109MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.080s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 593.871ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 689.69ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.928s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.120s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 73.444ms

- Adding 2097152 triples about 131072 entities, with distinct values: 9.264s
* Memory usage for entities: 474MB
- Counting the 131072 triples of each of 16 properties 64 times: 20.718ms
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 865.757ms

- Adding 262144 triples to the default graph: 260.68ms
* Memory usage for triples: 24MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 223.811ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 561.712ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 66.19ms

- Adding 1048576 quads: 1.429s
* Memory usage for quads: 61MB
- Finding all 1048576 quads 131072 times: 632.453ms

- Adding 262144 quoted triples: 669.452ms
* Memory usage for quoted triples: 27MB
- Finding all 262144 quoted triples 192 times: 222.741ms

- Adding 1048576 quads: 1.463s
* Memory usage for quads: 61MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 8.394s
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 20.245ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.070s
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 34.661ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.213s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 223.881ms
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.056s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 32.911ms
- Finding all 32 terms (1) filtered by graph 1024 times: 25.694ms
- Counting all 32 terms (1) filtered by graph 1024 times: 3.169ms

- Adding 1048576 quads: 1.365s
* Memory usage for quads: 61MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 55.835ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 11.353ms


# 3 sorted-blocks indexes with indexed quoted dict (number), added one by one

- Adding 2097152 triples to the default graph: 4.327s
* Memory usage for triples: 165MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.076s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 672.551ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 760.444ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.146s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.273s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 82.807ms

- Adding 2097152 triples about 131072 entities, with distinct values: 2:17.403 (m:ss.mmm)
* Memory usage for entities: 553MB
- Counting the 131072 triples of each of 16 properties 64 times: 1.885ms
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 933.748ms

- Adding 262144 triples to the default graph: 408.274ms
* Memory usage for triples: 30MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 324.218ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 663.48ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 84.86ms

- Adding 1048576 quads: 2.478s
* Memory usage for quads: 83MB
- Finding all 1048576 quads 131072 times: 734.981ms

- Adding 262144 quoted triples: 767.261ms
* Memory usage for quoted triples: 31MB
- Finding all 262144 quoted triples 192 times: 260.993ms

- Adding 1048576 quads: 2.577s
* Memory usage for quads: 83MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 10.369s
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 18.969ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.310s
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 38.916ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.467s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 322.033ms
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 10.544s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 41.621ms
- Finding all 32 terms (1) filtered by graph 1024 times: 21.04ms
- Counting all 32 terms (1) filtered by graph 1024 times: 3.998ms

- Adding 1048576 quads: 2.304s
* Memory usage for quads: 83MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 44.377ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 14.332ms
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
