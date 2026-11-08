import { sortIndicesByStrings } from '../lib/sortStrings';

function sorted(strings: string[]): string[] {
  const indices = new Int32Array(strings.length);
  for (let i = 0; i < indices.length; i++) {
    indices[i] = i;
  }
  sortIndicesByStrings(indices, strings);
  return [ ...indices ].map(index => strings[index]);
}

function random(seed: number): () => number {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

describe('sortIndicesByStrings', () => {
  it('sorts nothing', () => {
    expect(sorted([])).toEqual([]);
  });

  it('sorts a few strings', () => {
    expect(sorted([ 'b', 'a', 'c' ])).toEqual([ 'a', 'b', 'c' ]);
  });

  it('sorts strings that are prefixes of each other, and equal and empty strings', () => {
    const strings = [ 'ab', '', 'a', 'abc', 'a', '', 'b', 'abc', 'ab' ];
    expect(sorted(strings)).toEqual([ ...strings ].sort());
  });

  it('sorts many strings like the default sort, which compares code units', () => {
    const next = random(42);
    const alphabet = [ 'a', 'b', 'z', '0', '9', '/', 'é', '￿', '\u{1F600}', '\u0000' ];
    const prefixes = [ '', 'http://example.org/', 'http://example.org/resource/', 'urn:' ];
    const strings: string[] = [];
    for (let i = 0; i < 5000; i++) {
      let string = prefixes[Math.floor(next() * prefixes.length)];
      const length = Math.floor(next() * 12);
      for (let j = 0; j < length; j++) {
        string += alphabet[Math.floor(next() * alphabet.length)];
      }
      strings.push(string);
    }
    expect(sorted(strings)).toEqual([ ...strings ].sort());
  });

  it('sorts many equal strings', () => {
    const strings = Array.from({ length: 1000 }, (value, i) => i % 3 === 0 ? 'b' : 'a');
    expect(sorted(strings)).toEqual([ ...strings ].sort());
  });
});
