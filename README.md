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

If every index supports batches, as [`RdfStoreIndexBTree`](#createdefault-vs-createordered) does,
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

If every index supports batches, as [`RdfStoreIndexBTree`](#createdefault-vs-createordered) does,
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
// [ [ 'graph', 'subject', 'predicate', 'object' ], [ 'graph', 'predicate', 'object', 'subject' ], ... ]
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
* `RdfStoreIndexBTree`: Stores quads sorted in a B+tree of packed integer arrays, and supports quoted triples. (**Ordered scans that can skip ahead, and compact for data with many distinct terms**) See [`createDefault` vs `createOrdered`](#createdefault-vs-createordered).

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

`RdfStore.createDefault()` and `RdfStore.createOrdered()` create stores with the same index combinations (`GSPO`, `GPOS`, `GOSP`), dictionary and data factory,
but with a different index type:

|                                              | `createDefault()`                           | `createOrdered()`                                                  |
|----------------------------------------------|---------------------------------------------|--------------------------------------------------------------------|
| Index type                                   | `RdfStoreIndexNestedMapQuoted` (nested `Map` objects) | `RdfStoreIndexBTree` (sorted leaves of packed 32-bit integers) |
| Memory                                       | Grows with the number of distinct terms: 420 MB for WatDiv (1.1M triples) | 16 bytes per quad per index: 111 MB for WatDiv |
| Loading a batch with `import` or `addQuads` | Quad by quad: 7.8s for WatDiv               | Sorted once and merged in: 5.1s for WatDiv                         |
| Adding quads one by one                      | Faster                                      | Slower: each insert shifts quads within a leaf                     |
| Order of results                             | Insertion order                             | Sorted on the term order, reported by [`resultOrder`](#resultorder-and-seekto) |
| Skipping ahead in results                    | Not supported                               | [`seekTo`](#resultorder-and-seekto)                                 |
| Looking up a single quad                     | Faster                                      | 1.7 to 2 times slower                                              |
| Counting quads of a pattern                  | Walks the matching maps                     | A few binary searches for bound prefixes                           |
| Finding and counting distinct terms          | Read off map sizes                          | 2 to 3 times slower: walks the range, and caches counts until the store changes |
| Quoted triples                               | Supported                                   | Supported                                                          |

So `createOrdered` suits data that is loaded in bulk and then mainly queried,
especially by engines that can make use of sorted results, such as merge joins.
`createDefault` remains the better choice for stores that are filled incrementally while being queried.

Components that `RdfStoreIndexBTree` has to match after an unbound one are matched with a skip-scan, which jumps over non-matching ranges.
It requires a dictionary that encodes terms as 32-bit integers, which all bundled number dictionaries do.
Quoted triple patterns are matched inside the index when the dictionary supports quoted triples, such as `TermDictionaryQuotedIndexed`.

All ordered indexes of a store share a single term order,
which is defined by the `termComparator` option, and defaults to ordering on term type, value, datatype, language and base direction.
`createOrdered` accepts the following options:

```typescript
const store = RdfStore.createOrdered({
  // Optional: the order to keep terms in
  termComparator: (termA, termB) => termA.value.localeCompare(termB.value) || termA.termType.localeCompare(termB.termType),
  // Optional: defaults to GSPO, GPOS, GOSP
  indexCombinations: [
    [ 'graph', 'predicate', 'subject', 'object' ],
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
  indexConstructor: subOptions => new RdfStoreIndexBTree(subOptions, {
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
* On the data with few distinct terms, `RdfStoreIndexBTree` scans patterns with one or two variables about as fast as the nested indexes,
  but is 1.7 to 2 times slower on lookups without variables, 1.5 to 3 times slower on ingestion (also when adding in batches),
  and 2 to 3 times slower on finding and counting distinct terms of one or two components.
  It holds 2M triples in 109 MB, between `RdfStoreIndexNestedRecordQuoted` (67 MB) and `RdfStoreIndexNestedMapQuoted` (183 MB).
* On the entities data, `RdfStoreIndexBTree` holds the 2M triples in 609 MB, against 2126 MB for `RdfStoreIndexNestedMapQuoted`
  and 2883 MB for `RdfStoreIndexNestedRecordQuoted`, and loads them in a batch in 9.1s, against 9.9s and 15.5s.
  It counts the triples of a property with a few binary searches instead of a walk over them (13ms against 17s for 1024 counts),
  and reads the triples of a property in the order of their values without sorting them (0.6s against 1.1s).
* Adding the entities data one quad at a time to `RdfStoreIndexBTree` takes 13.9s, against 9.1s in a batch and 9.9s for `RdfStoreIndexNestedMapQuoted`.
  So for data with many distinct terms, load in batches through `import` or `addQuads` where possible.
* On real data, loading WatDiv (1.1M triples) through `import` into 3 indexes with node indexing takes 111 MB and 5.1s including parsing
  with `RdfStoreIndexBTree`, against 420 MB and 7.8s for `RdfStoreIndexNestedMapQuoted`.

These conclusions are drawn from the measurements of the command `node --expose-gc perf/run.js -d 128 -o` (part of this repository).
With `--expose-gc`, memory usage is the heap and off-heap memory in use after garbage collection, which is what the store holds.
The measurements below were taken on a single machine with Node.js 22:

```text
# N3Store

- Adding 2097152 triples to the default graph: 896.432ms
* Memory usage for triples: 69MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 4.940s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 879.241ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 858.826ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.547s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 179.343ms

- Adding 2097152 triples about 131072 entities, with distinct values: 21.483s
* Memory usage for entities: 2649MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:57.382 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.306s

- Adding 1048576 quads: 1.227s
* Memory usage for quads: 52MB
- Finding all 1048576 quads 131072 times: 700.621ms


# 3 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 2.466s
* Memory usage for triples: 182MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.726s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 524.31ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 662.621ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.051s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.255s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 31.981ms

- Adding 2097152 triples about 131072 entities, with distinct values: 10.010s
* Memory usage for entities: 2125MB
- Counting the 131072 triples of each of 16 properties 64 times: 15.698s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 936.018ms

- Adding 262144 triples to the default graph: 304.824ms
* Memory usage for triples: 32MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 239.541ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 249.566ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 54.759ms

- Adding 1048576 quads: 1.152s
* Memory usage for quads: 103MB
- Finding all 1048576 quads 131072 times: 429.721ms

- Adding 262144 quoted triples: 467.61ms
* Memory usage for quoted triples: 80MB
- Finding all 262144 quoted triples 192 times: 5.033s

- Adding 1048576 quads: 1.287s
* Memory usage for quads: 104MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 620.214ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 510.179ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 485.932ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 422.807ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.329s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.334s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.873s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 17.947ms
- Finding all 32 terms (1) filtered by graph 1024 times: 29.489ms
- Counting all 32 terms (1) filtered by graph 1024 times: 3ms

- Adding 1048576 quads: 1.174s
* Memory usage for quads: 104MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 26.901ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.427ms


# 3 Map indexes (number) OPT-QUERY-NODES

- Adding 2097152 triples to the default graph: 2.264s
* Memory usage for triples: 183MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.231s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 480.4ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 652.75ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.427s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.084s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 33.808ms

- Adding 2097152 triples about 131072 entities, with distinct values: 10.733s
* Memory usage for entities: 2205MB
- Counting the 131072 triples of each of 16 properties 64 times: 15.365s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.290s

- Adding 262144 triples to the default graph: 287.549ms
* Memory usage for triples: 32MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 233.272ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 243.624ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 57.363ms

- Adding 1048576 quads: 1.351s
* Memory usage for quads: 104MB
- Finding all 1048576 quads 131072 times: 352.736ms

- Adding 262144 quoted triples: 536.532ms
* Memory usage for quoted triples: 80MB
- Finding all 262144 quoted triples 192 times: 4.805s

- Adding 1048576 quads: 1.306s
* Memory usage for quads: 104MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 562.172ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 523.233ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 550.206ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 460.894ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.430s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.280s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 9.252s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 17.725ms
- Finding all 32 terms (1) filtered by graph 1024 times: 11.606ms
- Counting all 32 terms (1) filtered by graph 1024 times: 0.647ms

- Adding 1048576 quads: 1.276s
* Memory usage for quads: 104MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 22.451ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 0.943ms

- Adding 1048576 quads: 1.380s
* Memory usage for quads: 104MB
- Finding all 32 nodes 1024 times: 4.433ms


# 3 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.278s
* Memory usage for triples: 66MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.298s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 621.901ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 576.163ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.842s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.023s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 89.262ms

- Adding 2097152 triples about 131072 entities, with distinct values: 13.865s
* Memory usage for entities: 2882MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:31.940 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 2.376s

- Adding 262144 triples to the default graph: 245.998ms
* Memory usage for triples: 19MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 319.766ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 286.664ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 72.285ms

- Adding 1048576 quads: 837.046ms
* Memory usage for quads: 51MB
- Finding all 1048576 quads 131072 times: 698.727ms

- Adding 262144 quoted triples: 572.197ms
* Memory usage for quoted triples: 95MB
- Finding all 262144 quoted triples 192 times: 6.339s

- Adding 1048576 quads: 885.23ms
* Memory usage for quads: 51MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 621.173ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 654.899ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 518.019ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 508.884ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.704s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.370s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.266s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 192.279ms
- Finding all 32 terms (1) filtered by graph 1024 times: 15.385ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.606ms

- Adding 1048576 quads: 956.09ms
* Memory usage for quads: 51MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 38.431ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 14.803ms


# 1 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 932.592ms
* Memory usage for triples: 68MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.313s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.197s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.260s
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.541s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.940s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 456.312ms

- Adding 2097152 triples about 131072 entities, with distinct values: 4.897s
* Memory usage for entities: 910MB
- Counting the 131072 triples of each of 16 properties 64 times: 50.358s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.081s

- Adding 262144 triples to the default graph: 136.807ms
* Memory usage for triples: 18MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 338.236ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 364.876ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 53.574ms

- Adding 1048576 quads: 492.125ms
* Memory usage for quads: 42MB
- Finding all 1048576 quads 131072 times: 775.604ms

- Adding 262144 quoted triples: 220.17ms
* Memory usage for quoted triples: 19MB
- Finding all 262144 quoted triples 192 times: 5.465s


# 1 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 738.458ms
* Memory usage for triples: 29MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.197s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 709.906ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 659.367ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.939s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.468s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 200.548ms

- Adding 2097152 triples about 131072 entities, with distinct values: 5.353s
* Memory usage for entities: 952MB
- Counting the 131072 triples of each of 16 properties 64 times: 2:22.625 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.837s

- Adding 262144 triples to the default graph: 154.032ms
* Memory usage for triples: 13MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 316.857ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 332.859ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 60.922ms

- Adding 1048576 quads: 494.442ms
* Memory usage for quads: 24MB
- Finding all 1048576 quads 131072 times: 743.185ms

- Adding 262144 quoted triples: 303.036ms
* Memory usage for quoted triples: 15MB
- Finding all 262144 quoted triples 192 times: 5.560s


# 3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 2.231s
* Memory usage for triples: 183MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.400s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 679.925ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 730.314ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.309s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.219s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 57.242ms

- Adding 2097152 triples about 131072 entities, with distinct values: 9.850s
* Memory usage for entities: 2126MB
- Counting the 131072 triples of each of 16 properties 64 times: 16.952s
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 1.108s

- Adding 262144 triples to the default graph: 325.635ms
* Memory usage for triples: 33MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 290.228ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 405.458ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 71.758ms

- Adding 1048576 quads: 1.332s
* Memory usage for quads: 104MB
- Finding all 1048576 quads 131072 times: 471.385ms

- Adding 262144 quoted triples: 488.437ms
* Memory usage for quoted triples: 82MB
- Finding all 262144 quoted triples 192 times: 244.781ms

- Adding 1048576 quads: 1.402s
* Memory usage for quads: 104MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 575.792ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 557.989ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 418.991ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 491.759ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.608s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.139s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.861s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 18.513ms
- Finding all 32 terms (1) filtered by graph 1024 times: 19.122ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.371ms

- Adding 1048576 quads: 1.345s
* Memory usage for quads: 104MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 25.287ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.263ms


# 3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.193s
* Memory usage for triples: 67MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.242s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 610.92ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 643.465ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.181s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.177s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 97.903ms

- Adding 2097152 triples about 131072 entities, with distinct values: 15.466s
* Memory usage for entities: 2883MB
- Counting the 131072 triples of each of 16 properties 64 times: 1:32.261 (m:ss.mmm)
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 2.174s

- Adding 262144 triples to the default graph: 224.721ms
* Memory usage for triples: 19MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 268.113ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 308.249ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 79.793ms

- Adding 1048576 quads: 878.911ms
* Memory usage for quads: 51MB
- Finding all 1048576 quads 131072 times: 631.065ms

- Adding 262144 quoted triples: 617.598ms
* Memory usage for quoted triples: 96MB
- Finding all 262144 quoted triples 192 times: 196.731ms

- Adding 1048576 quads: 712.276ms
* Memory usage for quads: 51MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 592.919ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 495.088ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 497.046ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 453.546ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.941s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.502s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 9.256s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 217.883ms
- Finding all 32 terms (1) filtered by graph 1024 times: 18.396ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.741ms

- Adding 1048576 quads: 926.556ms
* Memory usage for quads: 51MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 41.968ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 12.916ms


# 3 BTree indexes with indexed quoted dict (number) OPT-BULK

- Adding 2097152 triples to the default graph: 3.391s
* Memory usage for triples: 109MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.420s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 650.569ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 668.24ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.319s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.209s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 132.175ms

- Adding 2097152 triples about 131072 entities, with distinct values: 9.076s
* Memory usage for entities: 609MB
- Counting the 131072 triples of each of 16 properties 64 times: 13.426ms
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 585.511ms

- Adding 262144 triples to the default graph: 396.331ms
* Memory usage for triples: 23MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 261.556ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 563.314ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 59.663ms

- Adding 1048576 quads: 2.021s
* Memory usage for quads: 60MB
- Finding all 1048576 quads 131072 times: 625.513ms

- Adding 262144 quoted triples: 612.037ms
* Memory usage for quoted triples: 27MB
- Finding all 262144 quoted triples 192 times: 294.106ms

- Adding 1048576 quads: 2.096s
* Memory usage for quads: 60MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 1.739s
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 1.726s
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.035s
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.046s
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.928s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.440s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 7.219s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 34.167ms
- Finding all 32 terms (1) filtered by graph 1024 times: 22.566ms
- Counting all 32 terms (1) filtered by graph 1024 times: 2.567ms

- Adding 1048576 quads: 1.660s
* Memory usage for quads: 60MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 48.689ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 15.094ms


# 3 BTree indexes with indexed quoted dict (number), added one by one

- Adding 2097152 triples to the default graph: 5.133s
* Memory usage for triples: 160MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.248s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 631.97ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 600.471ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 3.590s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.911s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 143.386ms

- Adding 2097152 triples about 131072 entities, with distinct values: 13.917s
* Memory usage for entities: 650MB
- Counting the 131072 triples of each of 16 properties 64 times: 12.436ms
- Finding the 131072 triples of a property sorted on their value, for 4 properties: 584.218ms

- Adding 262144 triples to the default graph: 643.07ms
* Memory usage for triples: 27MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 309.445ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 567.437ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 53.923ms

- Adding 1048576 quads: 3.327s
* Memory usage for quads: 79MB
- Finding all 1048576 quads 131072 times: 605.24ms

- Adding 262144 quoted triples: 736.467ms
* Memory usage for quoted triples: 28MB
- Finding all 262144 quoted triples 192 times: 236.81ms

- Adding 1048576 quads: 3.318s
* Memory usage for quads: 79MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 2.439s
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 2.519s
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.087s
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 908.803ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.178s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.648s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 7.386s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 36.11ms
- Finding all 32 terms (1) filtered by graph 1024 times: 29.577ms
- Counting all 32 terms (1) filtered by graph 1024 times: 4.574ms

- Adding 1048576 quads: 3.282s
* Memory usage for quads: 79MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 57.794ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 15.062ms
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
