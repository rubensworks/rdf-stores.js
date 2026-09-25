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
| Looking up a single quad                     | Faster                                      | About 1.8 times slower                                             |
| Counting quads of a pattern                  | Walks the matching maps                     | A few binary searches for bound prefixes                           |
| Finding and counting distinct terms          | Read off map sizes                          | 2 to 4 times slower: walks the range, and caches counts until the store changes |
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
* On the synthetic dataset below, `RdfStoreIndexBTree` scans patterns with one or two variables about as fast as the nested indexes,
  but is about 1.8 times slower on lookups without variables, 1.5 to 3 times slower on ingestion (also when adding in batches),
  and 2 to 4 times slower on finding and counting distinct terms of one or two components.
  It holds 2M triples in 126 MB, between `RdfStoreIndexNestedRecordQuoted` (81 MB) and `RdfStoreIndexNestedMapQuoted` (193 MB).
* This synthetic dataset only has 384 distinct terms, which nested indexes store compactly.
  On real data with many distinct terms, `RdfStoreIndexBTree` is smaller and loads faster:
  loading WatDiv (1.1M triples) through `import` into 3 indexes with node indexing takes 111 MB and 5.1s including parsing,
  against 420 MB and 7.8s for `RdfStoreIndexNestedMapQuoted`. Adding the same quads one by one takes 9.8s.

These conclusions are drawn from the measurements of the command `node --expose-gc perf/run.js -d 128 -o` (part of this repository).
With `--expose-gc`, memory usage is the heap and off-heap memory in use after garbage collection, which is what the store holds.
The measurements below were taken on a single machine with Node.js 22:

```text
# N3Store

- Adding 2097152 triples to the default graph: 992.997ms
* Memory usage for triples: 69MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 4.476s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 787.988ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 797.707ms
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.257s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 140.283ms

- Adding 1048576 quads: 878.401ms
* Memory usage for quads: 53MB
- Finding all 1048576 quads 131072 times: 664.448ms


# 3 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 2.429s
* Memory usage for triples: 183MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.409s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 548.771ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 669.158ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.192s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.262s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 40.704ms

- Adding 262144 triples to the default graph: 220.165ms
* Memory usage for triples: 32MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 397.021ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 351.689ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 126.707ms

- Adding 1048576 quads: 1.316s
* Memory usage for quads: 103MB
- Finding all 1048576 quads 131072 times: 383.164ms

- Adding 262144 quoted triples: 503.235ms
* Memory usage for quoted triples: 79MB
- Finding all 262144 quoted triples 192 times: 4.651s

- Adding 1048576 quads: 1.266s
* Memory usage for quads: 106MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 666.834ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 542ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 480.305ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 432.274ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.454s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.237s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 9.000s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 18.947ms
- Finding all 32 terms (1) filtered by graph 1024 times: 24.568ms
- Counting all 32 terms (1) filtered by graph 1024 times: 3.166ms

- Adding 1048576 quads: 1.385s
* Memory usage for quads: 106MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 39.865ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.643ms


# 3 Map indexes (number) OPT-QUERY-NODES

- Adding 2097152 triples to the default graph: 2.647s
* Memory usage for triples: 185MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.443s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 534.123ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 609.053ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.065s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.248s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 41.324ms

- Adding 262144 triples to the default graph: 247.43ms
* Memory usage for triples: 35MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 231.017ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 212.297ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 61.809ms

- Adding 1048576 quads: 1.385s
* Memory usage for quads: 106MB
- Finding all 1048576 quads 131072 times: 485.399ms

- Adding 262144 quoted triples: 590.417ms
* Memory usage for quoted triples: 82MB
- Finding all 262144 quoted triples 192 times: 5.671s

- Adding 1048576 quads: 1.335s
* Memory usage for quads: 108MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 653.959ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 547.062ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 429.944ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 407.218ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.425s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.225s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 9.060s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 18.902ms
- Finding all 32 terms (1) filtered by graph 1024 times: 17.381ms
- Counting all 32 terms (1) filtered by graph 1024 times: 0.743ms

- Adding 1048576 quads: 1.405s
* Memory usage for quads: 108MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 25.295ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.1ms

- Adding 1048576 quads: 1.331s
* Memory usage for quads: 108MB
- Finding all 32 nodes 1024 times: 4.55ms


# 3 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.295s
* Memory usage for triples: 71MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.131s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 528.369ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 586.514ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.520s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.057s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 81.683ms

- Adding 262144 triples to the default graph: 135.503ms
* Memory usage for triples: 23MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 264.358ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 255.901ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 81ms

- Adding 1048576 quads: 918.829ms
* Memory usage for quads: 55MB
- Finding all 1048576 quads 131072 times: 508.494ms

- Adding 262144 quoted triples: 858.895ms
* Memory usage for quoted triples: 486MB
- Finding all 262144 quoted triples 192 times: 6.537s

- Adding 1048576 quads: 918.818ms
* Memory usage for quads: 57MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 611.137ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 536.038ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 421.476ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 390.329ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.740s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.248s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.513s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 228.981ms
- Finding all 32 terms (1) filtered by graph 1024 times: 19.563ms
- Counting all 32 terms (1) filtered by graph 1024 times: 3.574ms

- Adding 1048576 quads: 1.092s
* Memory usage for quads: 57MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 45.736ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 12.973ms


# 1 Map indexes (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 1.032s
* Memory usage for triples: 74MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.399s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 1.254s
- Finding all 2097152 triples in the default graph 384 times (2 variables): 1.328s
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 5.136s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 2.212s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 432.52ms

- Adding 262144 triples to the default graph: 127.21ms
* Memory usage for triples: 24MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 354.266ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 341.32ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 49.398ms

- Adding 1048576 quads: 537.142ms
* Memory usage for quads: 48MB
- Finding all 1048576 quads 131072 times: 669.723ms

- Adding 262144 quoted triples: 217.617ms
* Memory usage for quoted triples: 25MB
- Finding all 262144 quoted triples 192 times: 5.413s


# 1 Record indexes (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 866.526ms
* Memory usage for triples: 37MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.252s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 769.24ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 759.798ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.803s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.369s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 203.982ms

- Adding 262144 triples to the default graph: 106.826ms
* Memory usage for triples: 21MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 291.9ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 259.797ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 73.405ms

- Adding 1048576 quads: 500.222ms
* Memory usage for quads: 32MB
- Finding all 1048576 quads 131072 times: 624.109ms

- Adding 262144 quoted triples: 245.509ms
* Memory usage for quoted triples: 23MB
- Finding all 262144 quoted triples 192 times: 5.886s


# 3 Nested Map Quoted indexes with indexed quoted dict (number) OPT-QUERY

- Adding 2097152 triples to the default graph: 2.682s
* Memory usage for triples: 193MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.555s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 678.922ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 627.967ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.783s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.328s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 47.458ms

- Adding 262144 triples to the default graph: 226.849ms
* Memory usage for triples: 43MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 251.075ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 271.753ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 52.675ms

- Adding 1048576 quads: 1.050s
* Memory usage for quads: 114MB
- Finding all 1048576 quads 131072 times: 411.409ms

- Adding 262144 quoted triples: 417.178ms
* Memory usage for quoted triples: 92MB
- Finding all 262144 quoted triples 192 times: 196.908ms

- Adding 1048576 quads: 1.287s
* Memory usage for quads: 118MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 490.65ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 509.874ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 396.929ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 411.391ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.365s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.033s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.995s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 20.542ms
- Finding all 32 terms (1) filtered by graph 1024 times: 20.9ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.704ms

- Adding 1048576 quads: 1.269s
* Memory usage for quads: 118MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 32.868ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 1.98ms


# 3 Nested Record Quoted indexes with indexed quoted dict (number) OPT-INGEST

- Adding 2097152 triples to the default graph: 1.271s
* Memory usage for triples: 81MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 1.421s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 598.952ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 654.462ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.698s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.124s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 87.196ms

- Adding 262144 triples to the default graph: 155.656ms
* Memory usage for triples: 33MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 298.078ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 338.067ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 71.303ms

- Adding 1048576 quads: 1.100s
* Memory usage for quads: 65MB
- Finding all 1048576 quads 131072 times: 659.028ms

- Adding 262144 quoted triples: 886.335ms
* Memory usage for quoted triples: 504MB
- Finding all 262144 quoted triples 192 times: 252.796ms

- Adding 1048576 quads: 1.023s
* Memory usage for quads: 68MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 633.636ms
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 662.748ms
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 489.03ms
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 554.949ms
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.605s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.272s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 8.931s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 170.493ms
- Finding all 32 terms (1) filtered by graph 1024 times: 14.263ms
- Counting all 32 terms (1) filtered by graph 1024 times: 1.551ms

- Adding 1048576 quads: 1.045s
* Memory usage for quads: 68MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 68.037ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 15.191ms


# 3 BTree indexes with indexed quoted dict (number) OPT-BULK

- Adding 2097152 triples to the default graph: 3.920s
* Memory usage for triples: 126MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 2.677s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 582.347ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 563.84ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.328s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.100s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 113.447ms

- Adding 262144 triples to the default graph: 405.514ms
* Memory usage for triples: 41MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 213.24ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 579.81ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 60.209ms

- Adding 1048576 quads: 1.816s
* Memory usage for quads: 78MB
- Finding all 1048576 quads 131072 times: 640.005ms

- Adding 262144 quoted triples: 787.011ms
* Memory usage for quoted triples: 44MB
- Finding all 262144 quoted triples 192 times: 232.652ms

- Adding 1048576 quads: 1.846s
* Memory usage for quads: 81MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 2.105s
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 2.073s
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.062s
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.115s
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.015s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.594s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 7.216s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 30.534ms
- Finding all 32 terms (1) filtered by graph 1024 times: 22.368ms
- Counting all 32 terms (1) filtered by graph 1024 times: 2.536ms

- Adding 1048576 quads: 2.092s
* Memory usage for quads: 81MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 60.975ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 12.807ms


# 3 BTree indexes with indexed quoted dict (number), added one by one

- Adding 2097152 triples to the default graph: 6.210s
* Memory usage for triples: 185MB
- Finding all 2097152 triples in the default graph 2097152 times (0 variables): 3.140s
- Finding all 2097152 triples in the default graph 32768 times (1 variable): 582.037ms
- Finding all 2097152 triples in the default graph 384 times (2 variables): 588.743ms
- Finding all 2097152 triples as bindings in the default graph 384 times (2 variables): 4.633s
- Finding all 2097152 triples in the default graph 32768 times (1 variable) via a stream: 1.138s
- Counting all 2097152 triples in the default graph 32768 times (1 variable): 175.921ms

- Adding 262144 triples to the default graph: 515.693ms
* Memory usage for triples: 51MB
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables): 285.752ms
- Finding all 262144 triples as bindings in the default graph 192 times (2 variables) via a stream: 635.023ms
- Finding all 262144 triples as bindings in the default graph 4096 times (1 variable): 60.104ms

- Adding 1048576 quads: 3.238s
* Memory usage for quads: 103MB
- Finding all 1048576 quads 131072 times: 666.983ms

- Adding 262144 quoted triples: 744.214ms
* Memory usage for quoted triples: 52MB
- Finding all 262144 quoted triples 192 times: 209.443ms

- Adding 1048576 quads: 3.179s
* Memory usage for quads: 107MB
- Finding all 32 terms (1) in the default graph 1024 times for each quad term (4): 2.167s
- Counting all 32 terms (1) in the default graph 1024 times for each quad term (4): 2.486s
- Finding all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.083s
- Counting all 1024 terms (2) in the default graph 32 times for each sequential quad term pair (4): 1.054s
- Finding all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 2.118s
- Counting all 32768 terms (3) in the default graph 8 times for each sequential quad term triple (4): 1.562s
- Finding all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 7.806s
- Counting all 1048576 terms (4) in the default graph 4 times for each sequential quad term quad (4): 33.389ms
- Finding all 32 terms (1) filtered by graph 1024 times: 23.151ms
- Counting all 32 terms (1) filtered by graph 1024 times: 2.287ms

- Adding 1048576 quads: 3.315s
* Memory usage for quads: 107MB
- Counting the 32 distinct objects of one predicate in one graph 32768 times: 57.162ms
- Counting the 1024 distinct predicate-object pairs of one graph 1024 times: 15.429ms
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
