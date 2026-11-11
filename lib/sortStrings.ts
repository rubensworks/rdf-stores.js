/**
 * Sort indices on the strings they point to, in code unit order (as `<` compares strings).
 *
 * This is a multikey quicksort (Bentley and Sedgewick), which compares strings one code unit at a time,
 * so the prefixes that many strings share, such as the namespace of IRIs, are only compared once.
 * @param indices Indices into `strings`, sorted in place.
 * @param strings The strings to sort on.
 */
export function sortIndicesByStrings(indices: Int32Array, strings: string[]): void {
  // Ranges [low, high) still to sort, from the given depth on.
  const stack: number[] = [ 0, indices.length, 0 ];
  while (stack.length > 0) {
    const depth = stack.pop()!;
    const high = stack.pop()!;
    const low = stack.pop()!;
    if (high - low < 16) {
      insertionSort(indices, strings, low, high, depth);
      continue;
    }

    // The median of three code units as pivot.
    const first = codeAt(strings[indices[low]], depth);
    const middle = codeAt(strings[indices[(low + high) >>> 1]], depth);
    const last = codeAt(strings[indices[high - 1]], depth);
    const pivot = first < middle ?
        (middle < last ? middle : (first < last ? last : first)) :
        (first < last ? first : (middle < last ? last : middle));

    // Partition into code units below, equal to, and above the pivot.
    let lessEnd = low;
    let greaterStart = high - 1;
    let i = low;
    while (i <= greaterStart) {
      const code = codeAt(strings[indices[i]], depth);
      if (code < pivot) {
        const swap = indices[lessEnd];
        indices[lessEnd++] = indices[i];
        indices[i++] = swap;
      } else if (code > pivot) {
        const swap = indices[greaterStart];
        indices[greaterStart--] = indices[i];
        indices[i] = swap;
      } else {
        i++;
      }
    }
    stack.push(low, lessEnd, depth);
    // Strings that end at this depth are equal, so they need no further sorting.
    if (pivot >= 0) {
      stack.push(lessEnd, greaterStart + 1, depth + 1);
    }
    stack.push(greaterStart + 1, high, depth);
  }
}

// Code units rather than code points, as `<` compares those.
/* eslint-disable unicorn/prefer-code-point */
function codeAt(string: string, depth: number): number {
  return depth < string.length ? string.charCodeAt(depth) : -1;
}

function insertionSort(indices: Int32Array, strings: string[], low: number, high: number, depth: number): void {
  for (let i = low + 1; i < high; i++) {
    const index = indices[i];
    const string = strings[index];
    let j = i - 1;
    while (j >= low && compareFrom(strings[indices[j]], string, depth) > 0) {
      indices[j + 1] = indices[j];
      j--;
    }
    indices[j + 1] = index;
  }
}

function compareFrom(left: string, right: string, depth: number): number {
  const length = Math.min(left.length, right.length);
  for (let i = depth; i < length; i++) {
    const difference = left.charCodeAt(i) - right.charCodeAt(i);
    if (difference !== 0) {
      return difference;
    }
  }
  return left.length - right.length;
}
/* eslint-enable unicorn/prefer-code-point */
