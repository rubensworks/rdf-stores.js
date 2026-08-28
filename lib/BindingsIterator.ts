import type * as RDF from '@rdfjs/types';
import { AsyncIterator } from 'asynciterator';
import type { BindingsProducer } from './BindingsProducer';

/**
 * An async iterator over the bindings produced by a single store lookup.
 *
 * `RdfStore#matchBindings` used to wrap the `readBindings` generator using `wrap()`,
 * which routes every single binding through a generator resume, an iterator result object,
 * and the read method of a `WrappingIterator`.
 * Reading straight from a {@link BindingsProducer} removes all three.
 *
 * A lookup that can not produce any results gets this iterator without a producer, rather than
 * asynciterator's `empty()`. An `EmptyIterator` has already ended by the time it is constructed and
 * schedules its only `end` event immediately, so a consumer that subscribes a tick later never sees
 * it and waits forever. This iterator starts out open and ends on its first read, just like the
 * wrapped generator did.
 */
export class BindingsIterator extends AsyncIterator<RDF.Bindings> {
  private producer: BindingsProducer<any> | undefined;

  public constructor(producer?: BindingsProducer<any>) {
    super();
    this.producer = producer;
    this.readable = true;
  }

  public override read(): RDF.Bindings | null {
    const producer = this.producer;
    if (producer !== undefined) {
      const bindings = producer.read();
      if (bindings !== null) {
        return bindings;
      }
      this.producer = undefined;
    }
    this.close();
    return null;
  }

  // eslint-disable-next-line ts/naming-convention
  protected override _destroy(cause: Error | undefined, callback: (error?: Error) => void): void {
    if (this.producer !== undefined) {
      this.producer.close();
      this.producer = undefined;
    }
    callback();
  }
}
