import type { QuadTermName } from 'rdf-terms';
import type { ITermOrderRankTables } from '../TermOrder';

/**
 * Reorder unique quads that are sorted in one component order into another component order,
 * if the other order moves a single component forward, such as from GSOP to GPSO, or from GPSO to GOPS.
 *
 * This takes stable counting sorts on the term ranks of the moved component,
 * and of the components before it that not all quads share, which is much cheaper than sorting the quads again.
 * @param sorted Quads in the `from` component order, four entries per quad, sorted in that order.
 * @param count The number of quads.
 * @param from The component order of `sorted`.
 * @param to The component order to derive.
 * @param ranks The rank tables of the term order of the quads.
 * @param rankCount The number of ranks.
 * @return The quads in the `to` component order, sorted in that order, or undefined if it can not be derived.
 */
export function deriveSortedOrder(
  sorted: Int32Array,
  count: number,
  from: QuadTermName[],
  to: QuadTermName[],
  ranks: ITermOrderRankTables,
  rankCount: number,
): Int32Array | undefined {
  let moved = 0;
  while (moved < 4 && from[moved] === to[moved]) {
    moved++;
  }
  const expected = [ ...from.slice(0, moved), to[moved], ...from.slice(moved).filter(name => name !== to[moved]) ];
  if (moved === 4 || expected.some((name, i) => name !== to[i])) {
    return undefined;
  }

  // Least significant first: the moved component, then the components before it that not all quads share.
  const passes = [ moved ];
  for (let position = moved - 1; position >= 0; position--) {
    for (let offset = 4; offset < count * 4; offset += 4) {
      if (sorted[offset + position] !== sorted[position]) {
        passes.push(position);
        break;
      }
    }
  }

  // The first pass also permutes the components from the `from` order into the `to` order.
  const permutation = to.map(name => from.indexOf(name));
  let input: Int32Array = sorted;
  let output: Int32Array = new Int32Array(count * 4);
  const keys = new Int32Array(count);
  const histogram = new Int32Array(rankCount + 1);
  for (const [ pass, position ] of passes.entries()) {
    const source = pass === 0 ? from.indexOf(to[position]) : position;
    histogram.fill(0);
    for (let i = 0; i < count; i++) {
      const encoding = input[(i * 4) + source];
      const rank = encoding >= 0 ? ranks.plainRanks[encoding] : ranks.quotedRanks[encoding & 0x7FFFFFFF];
      keys[i] = rank;
      histogram[rank + 1]++;
    }
    for (let rank = 1; rank <= rankCount; rank++) {
      histogram[rank] += histogram[rank - 1];
    }
    for (let i = 0; i < count; i++) {
      const target = histogram[keys[i]]++ * 4;
      const offset = i * 4;
      if (pass === 0) {
        output[target] = input[offset + permutation[0]];
        output[target + 1] = input[offset + permutation[1]];
        output[target + 2] = input[offset + permutation[2]];
        output[target + 3] = input[offset + permutation[3]];
      } else {
        output[target] = input[offset];
        output[target + 1] = input[offset + 1];
        output[target + 2] = input[offset + 2];
        output[target + 3] = input[offset + 3];
      }
    }
    const swap = input === sorted ? new Int32Array(count * 4) : input;
    input = output;
    output = swap;
  }
  return input;
}
