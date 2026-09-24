import { BindingsFactory } from '@comunica/utils-bindings-factory';
import { DataFactory } from 'rdf-data-factory';
import { BindingsProducer } from '../lib/BindingsProducer';
import 'jest-rdf';

const DF = new DataFactory();
const BF = new BindingsFactory(DF);

describe('BindingsProducer seek', () => {
  // An index iterator is not required to be able to skip, so the producer has to tolerate one that
  // cannot. Every result is then still produced, just by reading through them.
  it('is ignored by a source that cannot skip', () => {
    const source: any = [[ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ]][Symbol.iterator]();
    const dictionary: any = { decode: (encoding: number) => DF.namedNode(`t${encoding}`) };
    const producer = new BindingsProducer<number>(
      BF,
      source,
      dictionary,
      [ DF.variable('s'), DF.namedNode('p'), DF.namedNode('o'), DF.defaultGraph() ],
      [ 0 ],
    );
    expect(source.seek).toBeUndefined();
    expect(() => producer.seek(0, () => true)).not.toThrow();
    expect(producer.read()!.get(DF.variable('s'))).toEqualRdfTerm(DF.namedNode('t1'));
    expect(producer.read()!.get(DF.variable('s'))).toEqualRdfTerm(DF.namedNode('t5'));
    expect(producer.read()).toBeNull();
  });
});
