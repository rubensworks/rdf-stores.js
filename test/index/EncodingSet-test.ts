import { EncodingSet } from '../../lib/index/EncodingSet';

describe('EncodingSet', () => {
  it('adds each encoding once', () => {
    const set = new EncodingSet();
    expect(set.add(1)).toBe(true);
    expect(set.add(2)).toBe(true);
    expect(set.add(1)).toBe(false);
    expect(set.size).toBe(2);
  });

  it('adds the encoding that marks free slots', () => {
    const set = new EncodingSet();
    expect(set.add(-0x80000000)).toBe(true);
    expect(set.add(-0x80000000)).toBe(false);
    expect(set.add(0)).toBe(true);
    expect(set.size).toBe(2);
  });

  it('keeps its encodings when it grows', () => {
    const set = new EncodingSet();
    for (let i = 0; i < 10000; i++) {
      expect(set.add(i * 1024)).toBe(true);
    }
    for (let i = 0; i < 10000; i++) {
      expect(set.add(i * 1024)).toBe(false);
    }
    expect(set.add(-1)).toBe(true);
    expect(set.size).toBe(10001);
  });
});
