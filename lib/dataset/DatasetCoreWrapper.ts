import type * as RDF from '@rdfjs/types';
import { RdfStore } from '../RdfStore';

/**
 * A DatasetCoreWrapper exposes an RdfStore inside an RDF.DatasetCore.
 */
export class DatasetCoreWrapper<E = any, Q extends RDF.BaseQuad = RDF.Quad> implements RDF.DatasetCore<Q> {
  public constructor(
    public readonly store: RdfStore<E, Q>,
  ) {}

  public get size(): number {
    return this.store.size;
  }

  public add(quad: Q): this {
    this.store.addQuad(quad);
    return this;
  }

  public delete(quad: Q): this {
    this.store.removeQuad(quad);
    return this;
  }

  public has(quad: Q): boolean {
    // eslint-disable-next-line no-unreachable-loop
    for (const result of this.store.readQuads(quad.subject, quad.predicate, quad.object, quad.graph)) {
      return true;
    }
    return false;
  }

  public match(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): DatasetCoreWrapper<E, Q> {
    const newStore = new RdfStore<E, Q>(this.store.options);
    for (const quad of this.store.readQuads(subject, predicate, object, graph)) {
      newStore.addQuad(quad);
    }
    return new DatasetCoreWrapper(newStore);
  }

  public [Symbol.iterator](): Iterator<Q> {
    return this.store.readQuads();
  }
}
