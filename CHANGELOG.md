# Changelog
All notable changes to this project will be documented in this file.

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
