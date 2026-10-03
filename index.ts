export * from './lib/dataset/DatasetCoreWrapper';
export * from './lib/dictionary/ITermDictionary';
export * from './lib/dictionary/TermDictionaryNumberMap';
export * from './lib/dictionary/TermDictionaryNumberRecord';
export * from './lib/dictionary/TermDictionaryNumberRecordFullTerms';
export * from './lib/dictionary/TermDictionaryQuoted';
export * from './lib/dictionary/TermDictionaryQuotedIndexed';
export * from './lib/dictionary/TermDictionaryQuotedReferential';
export * from './lib/dictionary/TermDictionarySymbol';
export * from './lib/index/IRdfStoreIndex';
export * from './lib/index/RdfStoreIndexSortedBlocks';
export * from './lib/index/RdfStoreIndexSortedBlocksIterator';
export * from './lib/index/RdfStoreIndexNestedMap';
export * from './lib/index/RdfStoreIndexNestedMapQuoted';
export * from './lib/index/RdfStoreIndexNestedMapRecursive';
export * from './lib/index/RdfStoreIndexNestedMapRecursiveQuoted';
export * from './lib/index/RdfStoreIndexNestedRecord';
export * from './lib/index/RdfStoreIndexNestedRecordQuoted';
export * from './lib/IRdfStoreOptions';
export * from './lib/OrderUtils';
export * from './lib/PatternTerm';
export * from './lib/RdfStore';
export * from './lib/TermOrder';

export {
  /**
   * @deprecated Use {@link RdfStoreIndexSortedBlocks} instead.
   */
  RdfStoreIndexSortedBlocks as RdfStoreIndexBTree,
  /**
   * @deprecated Use {@link IRdfStoreIndexSortedBlocksOptions} instead.
   */
  type IRdfStoreIndexSortedBlocksOptions as IRdfStoreIndexBTreeOptions,
  /**
   * @deprecated Use {@link ISortedBlocksCursor} instead.
   */
  type ISortedBlocksCursor as IBTreeCursor,
  /**
   * @deprecated Use {@link ISortedBlocksCandidates} instead.
   */
  type ISortedBlocksCandidates as IBTreeCandidates,
} from './lib/index/RdfStoreIndexSortedBlocks';
export {
  /**
   * @deprecated Use {@link RdfStoreIndexSortedBlocksIterator} instead.
   */
  RdfStoreIndexSortedBlocksIterator as RdfStoreIndexBTreeIterator,
} from './lib/index/RdfStoreIndexSortedBlocksIterator';
