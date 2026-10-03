import {
  RdfStoreIndexBTree,
  RdfStoreIndexBTreeIterator,
  RdfStoreIndexSortedBlocks,
  RdfStoreIndexSortedBlocksIterator,
} from '../../index';

describe('deprecated B-tree aliases', () => {
  it('resolve to the sorted blocks classes', () => {
    expect(RdfStoreIndexBTree).toBe(RdfStoreIndexSortedBlocks);
    expect(RdfStoreIndexBTreeIterator).toBe(RdfStoreIndexSortedBlocksIterator);
  });
});
