import type * as RDF from '@rdfjs/types';
import { RdfStore } from '../RdfStore';

/**
 * A DatasetCoreWrapper exposes an RdfStore inside an RDF.DatasetCore.
 */
export class DatasetCoreWrapper<TE = any, TQ extends RDF.BaseQuad = RDF.Quad> implements RDF.DatasetCore<TQ> {
  public constructor(
    public readonly store: RdfStore<TE, TQ>,
  ) {}

  public get size(): number {
    return this.store.size;
  }

  public add(quad: TQ): this {
    this.store.addQuad(quad);
    return this;
  }

  public delete(quad: TQ): this {
    this.store.removeQuad(quad);
    return this;
  }

  public has(quad: TQ): boolean {
    return !this.store.readQuads(quad.subject, quad.predicate, quad.object, quad.graph).next().done;
  }

  public match(
    subject?: RDF.Term | null,
    predicate?: RDF.Term | null,
    object?: RDF.Term | null,
    graph?: RDF.Term | null,
  ): DatasetCoreWrapper<TE, TQ> {
    const newStore = new RdfStore<TE, TQ>(this.store.options);
    for (const quad of this.store.readQuads(subject, predicate, object, graph)) {
      newStore.addQuad(quad);
    }
    return new DatasetCoreWrapper(newStore);
  }

  public [Symbol.iterator](): Iterator<TQ> {
    return this.store.readQuads();
  }
}
