/**
 * Sort indices on the strings they point to, in code unit order (as `<` compares strings).
 *
 * The strings are first joined into one, which is much faster to read than many strings spread over the heap.
 * They are then sorted with a multikey quicksort (Bentley and Sedgewick), which compares strings one code unit
 * at a time, so the prefixes that many strings share, such as the namespace of IRIs, are only compared once.
 * @param indices Indices into `strings`, sorted in place.
 * @param strings The strings to sort on.
 * @return For each position in the sorted indices, 1 if its string equals the one before it, and 0 otherwise.
 */
export function sortIndicesByStrings(indices: Int32Array, strings: string[]): Uint8Array {
  const offsets = new Int32Array(strings.length + 1);
  for (let i = 0; i < strings.length; i++) {
    offsets[i + 1] = offsets[i] + strings[i].length;
  }
  // Where the string at each position starts and ends in the joined string, which moves along with the indices.
  const count = indices.length;
  const bounds = new Int32Array(count * 2);
  for (let i = 0; i < count; i++) {
    bounds[i * 2] = offsets[indices[i]];
    bounds[(i * 2) + 1] = offsets[indices[i] + 1];
  }
  const joined = strings.join('');
  const equal = new Uint8Array(count);

  // Ranges [low, high) still to sort, from the given depth on.
  const stack: number[] = [ 0, count, 0 ];
  while (stack.length > 0) {
    const depth = stack.pop()!;
    const high = stack.pop()!;
    const low = stack.pop()!;
    if (high - low < 16) {
      insertionSort(indices, bounds, joined, equal, low, high, depth);
      continue;
    }

    // The median of three code units as pivot.
    const first = codeAt(bounds, joined, low, depth);
    const middle = codeAt(bounds, joined, (low + high) >>> 1, depth);
    const last = codeAt(bounds, joined, high - 1, depth);
    const pivot = first < middle ?
        (middle < last ? middle : (first < last ? last : first)) :
        (first < last ? first : (middle < last ? last : middle));

    // Partition into code units below, equal to, and above the pivot.
    let lessEnd = low;
    let greaterStart = high - 1;
    let i = low;
    while (i <= greaterStart) {
      const code = codeAt(bounds, joined, i, depth);
      if (code < pivot) {
        swap(indices, bounds, lessEnd++, i++);
      } else if (code > pivot) {
        swap(indices, bounds, greaterStart--, i);
      } else {
        i++;
      }
    }
    stack.push(low, lessEnd, depth);
    if (pivot >= 0) {
      stack.push(lessEnd, greaterStart + 1, depth + 1);
    } else {
      // Strings that end at this depth are equal, and already at their final positions.
      for (let position = lessEnd + 1; position <= greaterStart; position++) {
        equal[position] = 1;
      }
    }
    stack.push(greaterStart + 1, high, depth);
  }
  return equal;
}

// Code units rather than code points, as `<` compares those.
/* eslint-disable unicorn/prefer-code-point */
function codeAt(bounds: Int32Array, joined: string, position: number, depth: number): number {
  const at = bounds[position * 2] + depth;
  return at < bounds[(position * 2) + 1] ? joined.charCodeAt(at) : -1;
}

function swap(indices: Int32Array, bounds: Int32Array, left: number, right: number): void {
  const index = indices[left];
  indices[left] = indices[right];
  indices[right] = index;
  const start = bounds[left * 2];
  const end = bounds[(left * 2) + 1];
  bounds[left * 2] = bounds[right * 2];
  bounds[(left * 2) + 1] = bounds[(right * 2) + 1];
  bounds[right * 2] = start;
  bounds[(right * 2) + 1] = end;
}

function insertionSort(
  indices: Int32Array,
  bounds: Int32Array,
  joined: string,
  equal: Uint8Array,
  low: number,
  high: number,
  depth: number,
): void {
  for (let i = low + 1; i < high; i++) {
    for (let j = i; j > low && compareFrom(bounds, joined, j - 1, j, depth) > 0; j--) {
      swap(indices, bounds, j - 1, j);
    }
  }
  for (let i = low + 1; i < high; i++) {
    if (compareFrom(bounds, joined, i - 1, i, depth) === 0) {
      equal[i] = 1;
    }
  }
}

/**
 * Compare the strings at two positions, from the given depth on.
 */
function compareFrom(bounds: Int32Array, joined: string, left: number, right: number, depth: number): number {
  const leftStart = bounds[left * 2];
  const rightStart = bounds[right * 2];
  const leftLength = bounds[(left * 2) + 1] - leftStart;
  const rightLength = bounds[(right * 2) + 1] - rightStart;
  const length = Math.min(leftLength, rightLength);
  for (let i = depth; i < length; i++) {
    const difference = joined.charCodeAt(leftStart + i) - joined.charCodeAt(rightStart + i);
    if (difference !== 0) {
      return difference;
    }
  }
  return leftLength - rightLength;
}
/* eslint-enable unicorn/prefer-code-point */
