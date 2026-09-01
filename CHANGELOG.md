# Changelog
All notable changes to this project will be documented in this file.

<a name="v2.5.0"></a>
## [v2.5.0](https://github.com/rubensworks/rdf-stores.js/compare/v2.4.0...v2.5.0) - 2026-09-01

### Changed
* Improve performance of bindings-related methods
  * [Build bindings entries with a literal per pattern arity](https://github.com/rubensworks/rdf-stores.js/commit/a90c155f9e9c783583c94b56be2fae47484e77d2)
  * [Traverse nested map indexes without a generator](https://github.com/rubensworks/rdf-stores.js/commit/c964f55b0a62b21da504cba38db77cff4594e98b)
  * [Read bindings without intermediate generator layers](https://github.com/rubensworks/rdf-stores.js/commit/f61ad2671aefd3474daf5ca4ef4d901316fe71a0)

<a name="v2.4.0"></a>
## [v2.4.0](https://github.com/rubensworks/rdf-stores.js/compare/v2.3.0...v2.4.0) - 2026-08-27

### Changed
* Improve overall performance
  * [Keep the original nested map loops for patterns that produce many results](https://github.com/rubensworks/rdf-stores.js/commit/2dd27c5609006c7df1c3ac9072402a778becfb03)
  * [Apply the direct lookup and traversal fixes to the record-based indexes too](https://github.com/rubensworks/rdf-stores.js/commit/2b16075f863d5039db17910bbe76de5dca617175)
  * [Stop updating the remaining indexes when a quad is already present](https://github.com/rubensworks/rdf-stores.js/commit/f3898e5b74a9fb511bdcd5f33ad4b95117c868d0)
  * [Remove closure and array allocations from the shared lookup helpers](https://github.com/rubensworks/rdf-stores.js/commit/f8dbd481b267acbdf95ddd6a8b5c8d2001fa148c)
  * [Reduce per-call and per-result overhead of reading bindings](https://github.com/rubensworks/rdf-stores.js/commit/cc5c33c44e46a12a20f0969e19ef27f8abdb0bda)
  * [Stop allocating intermediate arrays and distinctness strings for distinct terms](https://github.com/rubensworks/rdf-stores.js/commit/fcd8bc1048b337da5a0c971029885f07d3c9c651)
  * [Resolve fully defined patterns by direct lookup in the nested map indexes](https://github.com/rubensworks/rdf-stores.js/commit/a339c570f70432abaf0dbe95e379cc974a2c329c)
  * [Build getQuads results directly instead of spreading a generator](https://github.com/rubensworks/rdf-stores.js/commit/7a7121c4cf3a190bf5d831bbf4e93529aab4d2eb)
  * [Precompute query planning metadata instead of recomputing it per operation](https://github.com/rubensworks/rdf-stores.js/commit/7d0664a836d3075b5436819a066ed99a1d7b5c77)

<a name="v2.3.0"></a>
## [v2.3.0](https://github.com/rubensworks/rdf-stores.js/compare/v2.2.0...v2.3.0) - 2026-08-13

### Added
* [Add optional argument to distinctTerms methods to filter by terms](https://github.com/rubensworks/rdf-stores.js/commit/fe991b00c9bdba66426850a6e69c3018bb3b8a2c)

<a name="v2.2.0"></a>
## [v2.2.0](https://github.com/rubensworks/rdf-stores.js/compare/v2.1.1...v2.2.0) - 2026-03-03

### Added
* [Add methods for looking up distinct terms](https://github.com/rubensworks/rdf-stores.js/commit/4ab384ca2c404aaa01d1594a6f8d8a8bb3d20ebb)
* [Add countDistinctTerms method](https://github.com/rubensworks/rdf-stores.js/commit/ee020448faaf92a828d6d68b33c71a3e192556b5)
* [Add methods for looking up nodes](https://github.com/rubensworks/rdf-stores.js/commit/12038af924a80abe48956b2338860c5ad9d85dfa)
* [Add countNodes method](https://github.com/rubensworks/rdf-stores.js/commit/4497d4a0ba7812adbfd56458d1dda2e9f1ac6b3c)

<a name="v2.1.1"></a>
## [v2.1.1](https://github.com/rubensworks/rdf-stores.js/compare/v2.1.0...v2.1.1) - 2025-02-13

### Fixed
* [Fix handling of reused variables across quoted patterns in matchBindings](https://github.com/rubensworks/rdf-stores.js/commit/405824aad64e4882409fd560f0acca4f6de911a2)

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/rubensworks/rdf-stores.js/compare/v2.0.0...v2.1.0) - 2025-02-13

### Added
* [Add methods for bindings-based reading](https://github.com/rubensworks/rdf-stores.js/commit/06f9dc0a9ecdf1eec082da2ccf09ad9b9a808771)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rubensworks/rdf-stores.js/compare/v1.0.0...v2.0.0) - 2025-01-08

### BREAKING CHANGES
* [Update to rdf-data-factory v2](https://github.com/rubensworks/rdf-stores.js/commit/83ca4776c2f1eb0ef0d6adee94bc2abb88dadb80)
    This includes a bump to @rdfjs/types@2.0.0, which requires TypeScript 5 and Node 14+.
    This allows literals with a different base direction to be properly stored and queried.

<a name="v1.0.0"></a>
## [v1.0.0](https://github.com/rubensworks/rdf-stores.js/compare/v1.0.0-beta.2...v1.0.0) - 2023-06-27

### Fixed
* [Fix countQuads not being selective enough for quoted triples](https://github.com/rubensworks/rdf-stores.js/commit/060f27b0c04990e5d78912a6bd2cccc27ccc8b43)

<a name="v1.0.0-beta.2"></a>
## [v1.0.0-beta.2](https://github.com/rubensworks/rdf-stores.js/compare/v1.0.0-beta.1...v1.0.0-beta.2) - 2023-06-15

### Added
* [Expose quotedTriples feature flag in RdfStore](https://github.com/rubensworks/rdf-stores.js/commit/72f0f1b3dd0d2f8b6a425af43792b96224630683)

### Changed
* [Optimize TermDictionaryQuotedIndexed for all quoted pattern combinations](https://github.com/rubensworks/rdf-stores.js/commit/583acdacadc14ed24c1c5e27acfaffb3733f1886)
* [Use more efficient RdfStoreIndexNestedMap in TermDictionaryQuotedIndexed](https://github.com/rubensworks/rdf-stores.js/commit/cfec33892e94ab88d6363c49d2aa77a76e4ff154)

<a name="v1.0.0-beta.1"></a>
## [v1.0.0-beta.1](https://github.com/rubensworks/rdf-stores.js/compare/v1.0.0-beta.0...v1.0.0-beta.1) - 2023-06-13

Rename package to `rdf-stores`.

<a name="v1.0.0-beta.0"></a>
## [v1.0.0-beta.0] - 2023-06-13

Initial beta release
