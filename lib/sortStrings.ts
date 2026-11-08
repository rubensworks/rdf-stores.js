/**
 * From how many strings on they are joined into one before sorting.
 * Many strings are spread over a large heap, so reading them is then dominated by memory accesses,
 * which joining them avoids. Fewer strings are cheaper to read where they are.
 */
const JOIN_FROM = 1 << 18;

/**
 * Sort indices on the strings they point to, in code unit order (as `<` compares strings).
 *
 * This is a multikey quicksort (Bentley and Sedgewick), which compares strings one code unit at a time,
 * so the prefixes that many strings share, such as the namespace of IRIs, are only compared once.
 * @param indices Indices into `strings`, sorted in place.
 * @param strings The strings to sort on.
 * @param joinFrom From how many indices on the strings are joined into one before sorting.
 * @return For each position in the sorted indices, 1 if its string equals the one before it, and 0 otherwise.
 */
export function sortIndicesByStrings(indices: Int32Array, strings: string[], joinFrom = JOIN_FROM): Uint8Array {
  return indices.length < joinFrom ? sortInPlace(indices, strings) : sortJoined(indices, strings);
}

// Code units rather than code points, as `<` compares those.
/* eslint-disable unicorn/prefer-code-point */

function sortInPlace(indices: Int32Array, strings: string[]): Uint8Array {
  const equal = new Uint8Array(indices.length);
  // Ranges [low, high) still to sort, from the given depth on.
  const stack: number[] = [ 0, indices.length, 0 ];
  while (stack.length > 0) {
    const depth = stack.pop()!;
    const high = stack.pop()!;
    const low = stack.pop()!;
    if (high - low < 16) {
      insertionSortInPlace(indices, strings, equal, low, high, depth);
      continue;
    }

    // The median of three code units as pivot.
    const first = codeAtInPlace(strings[indices[low]], depth);
    const middle = codeAtInPlace(strings[indices[(low + high) >>> 1]], depth);
    const last = codeAtInPlace(strings[indices[high - 1]], depth);
    const pivot = first < middle ?
        (middle < last ? middle : (first < last ? last : first)) :
        (first < last ? first : (middle < last ? last : middle));

    // Partition into code units below, equal to, and above the pivot.
    let lessEnd = low;
    let greaterStart = high - 1;
    let i = low;
    while (i <= greaterStart) {
      const code = codeAtInPlace(strings[indices[i]], depth);
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
    pushPartitions(stack, equal, low, lessEnd, greaterStart, high, depth, pivot);
  }
  return equal;
}

function codeAtInPlace(string: string, depth: number): number {
  return depth < string.length ? string.charCodeAt(depth) : -1;
}

function insertionSortInPlace(
  indices: Int32Array,
  strings: string[],
  equal: Uint8Array,
  low: number,
  high: number,
  depth: number,
): void {
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
  for (let i = low + 1; i < high; i++) {
    if (compareFrom(strings[indices[i - 1]], strings[indices[i]], depth) === 0) {
      equal[i] = 1;
    }
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

function sortJoined(indices: Int32Array, strings: string[]): Uint8Array {
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

  const stack: number[] = [ 0, count, 0 ];
  while (stack.length > 0) {
    const depth = stack.pop()!;
    const high = stack.pop()!;
    const low = stack.pop()!;
    if (high - low < 16) {
      insertionSortJoined(indices, bounds, joined, equal, low, high, depth);
      continue;
    }

    const first = codeAtJoined(bounds, joined, low, depth);
    const middle = codeAtJoined(bounds, joined, (low + high) >>> 1, depth);
    const last = codeAtJoined(bounds, joined, high - 1, depth);
    const pivot = first < middle ?
        (middle < last ? middle : (first < last ? last : first)) :
        (first < last ? first : (middle < last ? last : middle));

    let lessEnd = low;
    let greaterStart = high - 1;
    let i = low;
    while (i <= greaterStart) {
      const at = bounds[i * 2] + depth;
      const code = at < bounds[(i * 2) + 1] ? joined.charCodeAt(at) : -1;
      if (code === pivot) {
        i++;
        continue;
      }
      const other = code < pivot ? lessEnd++ : greaterStart--;
      const index = indices[other];
      indices[other] = indices[i];
      indices[i] = index;
      const start = bounds[other * 2];
      const end = bounds[(other * 2) + 1];
      bounds[other * 2] = bounds[i * 2];
      bounds[(other * 2) + 1] = bounds[(i * 2) + 1];
      bounds[i * 2] = start;
      bounds[(i * 2) + 1] = end;
      if (code < pivot) {
        i++;
      }
    }
    pushPartitions(stack, equal, low, lessEnd, greaterStart, high, depth, pivot);
  }
  return equal;
}

function codeAtJoined(bounds: Int32Array, joined: string, position: number, depth: number): number {
  const at = bounds[position * 2] + depth;
  return at < bounds[(position * 2) + 1] ? joined.charCodeAt(at) : -1;
}

function insertionSortJoined(
  indices: Int32Array,
  bounds: Int32Array,
  joined: string,
  equal: Uint8Array,
  low: number,
  high: number,
  depth: number,
): void {
  for (let i = low + 1; i < high; i++) {
    const index = indices[i];
    const start = bounds[i * 2];
    const end = bounds[(i * 2) + 1];
    let j = i - 1;
    while (j >= low && compareJoined(bounds, joined, j, start, end, depth) > 0) {
      indices[j + 1] = indices[j];
      bounds[(j + 1) * 2] = bounds[j * 2];
      bounds[((j + 1) * 2) + 1] = bounds[(j * 2) + 1];
      j--;
    }
    indices[j + 1] = index;
    bounds[(j + 1) * 2] = start;
    bounds[((j + 1) * 2) + 1] = end;
  }
  for (let i = low + 1; i < high; i++) {
    if (compareJoined(bounds, joined, i - 1, bounds[i * 2], bounds[(i * 2) + 1], depth) === 0) {
      equal[i] = 1;
    }
  }
}

/**
 * Compare the string at a position with the string between the given bounds, from the given depth on.
 */
function compareJoined(
  bounds: Int32Array,
  joined: string,
  position: number,
  rightStart: number,
  rightEnd: number,
  depth: number,
): number {
  const leftStart = bounds[position * 2];
  const leftLength = bounds[(position * 2) + 1] - leftStart;
  const rightLength = rightEnd - rightStart;
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

/**
 * Push the ranges that a partition leaves to sort, and mark the strings that end at this depth as equal.
 */
function pushPartitions(
  stack: number[],
  equal: Uint8Array,
  low: number,
  lessEnd: number,
  greaterStart: number,
  high: number,
  depth: number,
  pivot: number,
): void {
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
