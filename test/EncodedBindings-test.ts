import { BindingsFactory } from '@comunica/utils-bindings-factory';
import type * as RDF from '@rdfjs/types';
import { arrayifyStream } from 'arrayify-stream';
import { DataFactory } from 'rdf-data-factory';
import { BindingsProducer } from '../lib/BindingsProducer';
import type { ITermDictionary } from '../lib/dictionary/ITermDictionary';
import type { IEncodedBindingsCreator, IEncodedBindingsFactory } from '../lib/IEncodedBindingsFactory';
import { RdfStore } from '../lib/RdfStore';
import 'jest-rdf';
import '@comunica/utils-jest';

const DF = new DataFactory();
const BF = new BindingsFactory(DF);

function key(bindings: RDF.Bindings): string {
  return [ ...bindings ].map(([ variable, term ]) => `${variable.value}=${term.value}`).sort().join(',');
}

function sorted(bindings: RDF.Bindings[]): RDF.Bindings[] {
  return [ ...bindings ].sort((left, right) => key(left).localeCompare(key(right)));
}

/**
 * A factory that creates bindings from encodings by decoding them right away, and records how it is used.
 */
class RecordingEncodedBindingsFactory implements IEncodedBindingsFactory<number> {
  public readonly prepared: { variables: string[]; indexes: readonly number[] }[] = [];
  public readonly encodedQuads: number[][] = [];
  public refuse = false;

  public bindings(entries?: [RDF.Variable, RDF.Term][]): RDF.Bindings {
    return BF.bindings(entries);
  }

  public fromBindings(bindings: RDF.Bindings): RDF.Bindings {
    return BF.fromBindings(bindings);
  }

  public createEncodedBindingsCreator(
    dictionary: ITermDictionary<number>,
    variables: RDF.Variable[],
    indexes: readonly number[],
  ): IEncodedBindingsCreator<number> | undefined {
    if (this.refuse) {
      return undefined;
    }
    this.prepared.push({ variables: variables.map(variable => variable.value), indexes });
    return {
      create: (encodedQuad) => {
        this.encodedQuads.push([ ...encodedQuad ]);
        return BF.bindings(variables.map((variable, i) => [ variable, dictionary.decode(encodedQuad[indexes[i]]) ]));
      },
    };
  }
}

describe('Encoded bindings', () => {
  let factory: RecordingEncodedBindingsFactory;

  beforeEach(() => {
    factory = new RecordingEncodedBindingsFactory();
  });

  describe('BindingsProducer', () => {
    it('uses the encoded creator instead of decoding', () => {
      const source: any = [[ 1, 2, 3, 4 ]][Symbol.iterator]();
      const dictionary: any = { decode: jest.fn() };
      const bindings = BF.bindings([[ DF.variable('s'), DF.namedNode('t1') ]]);
      const creator = { create: jest.fn(() => bindings) };
      const producer = new BindingsProducer<number>(
        BF,
        source,
        dictionary,
        [ DF.variable('s'), DF.namedNode('p'), DF.namedNode('o'), DF.defaultGraph() ],
        [ 0 ],
        creator,
      );
      expect(producer.read()).toBe(bindings);
      expect(creator.create).toHaveBeenCalledWith([ 1, 2, 3, 4 ]);
      expect(dictionary.decode).not.toHaveBeenCalled();
      expect(producer.read()).toBeNull();
    });
  });

  describe.each([
    [ 'createDefault', () => RdfStore.createDefault() ],
    [ 'createOrdered', () => RdfStore.createOrdered() ],
  ])('in a store from %s', (_name, createStore) => {
    let store: RdfStore<number>;

    beforeEach(() => {
      store = createStore();
      store.addQuad(DF.quad(DF.namedNode('s1'), DF.namedNode('p1'), DF.namedNode('o1')));
      store.addQuad(DF.quad(DF.namedNode('s1'), DF.namedNode('p1'), DF.namedNode('o2')));
      store.addQuad(DF.quad(DF.namedNode('s2'), DF.namedNode('p1'), DF.namedNode('s2')));
    });

    it('creates bindings from encoded quads with getBindings', () => {
      expect(store.getBindings(
        factory,
        DF.namedNode('s1'),
        DF.namedNode('p1'),
        DF.variable('o'),
        DF.defaultGraph(),
      )).toEqualBindingsArray([
        BF.fromRecord({ o: DF.namedNode('o1') }),
        BF.fromRecord({ o: DF.namedNode('o2') }),
      ]);
      expect(factory.prepared).toHaveLength(1);
      expect(factory.prepared[0].variables).toEqual([ 'o' ]);
      expect(factory.encodedQuads).toHaveLength(2);
      for (const encodedQuad of factory.encodedQuads) {
        expect(store.dictionary.decode(encodedQuad[factory.prepared[0].indexes[0]]).termType).toBe('NamedNode');
      }
    });

    it('creates bindings from encoded quads with readBindings', () => {
      expect(sorted([ ...store.readBindings(
        factory,
        DF.variable('s'),
        DF.namedNode('p1'),
        DF.variable('o'),
        DF.defaultGraph(),
      ) ])).toEqualBindingsArray(sorted([
        BF.fromRecord({ s: DF.namedNode('s1'), o: DF.namedNode('o1') }),
        BF.fromRecord({ s: DF.namedNode('s1'), o: DF.namedNode('o2') }),
        BF.fromRecord({ s: DF.namedNode('s2'), o: DF.namedNode('s2') }),
      ]));
      expect(factory.prepared).toHaveLength(1);
      expect([ ...factory.prepared[0].variables ].sort()).toEqual([ 'o', 's' ]);
    });

    it('creates bindings from encoded quads with matchBindings', async() => {
      expect(sorted(await arrayifyStream(store.matchBindings(
        factory,
        DF.namedNode('s1'),
        DF.variable('p'),
        DF.variable('o'),
        DF.variable('g'),
      )))).toEqualBindingsArray(sorted([
        BF.fromRecord({ p: DF.namedNode('p1'), o: DF.namedNode('o1'), g: DF.defaultGraph() }),
        BF.fromRecord({ p: DF.namedNode('p1'), o: DF.namedNode('o2'), g: DF.defaultGraph() }),
      ]));
      expect(factory.prepared).toHaveLength(1);
    });

    it('decodes terms itself if the factory refuses', () => {
      factory.refuse = true;
      expect(store.getBindings(
        factory,
        DF.namedNode('s1'),
        DF.namedNode('p1'),
        DF.variable('o'),
        DF.defaultGraph(),
      )).toEqualBindingsArray([
        BF.fromRecord({ o: DF.namedNode('o1') }),
        BF.fromRecord({ o: DF.namedNode('o2') }),
      ]);
      expect(factory.encodedQuads).toHaveLength(0);
    });

    it('decodes terms itself for patterns with overlapping variables', () => {
      expect(store.getBindings(
        factory,
        DF.variable('x'),
        DF.namedNode('p1'),
        DF.variable('x'),
        DF.defaultGraph(),
      )).toEqualBindingsArray([
        BF.fromRecord({ x: DF.namedNode('s2') }),
      ]);
      expect(factory.prepared).toHaveLength(0);
    });

    it('does not prepare creating bindings for patterns that are not in the dictionary', () => {
      expect(store.getBindings(
        factory,
        DF.namedNode('s-none'),
        DF.namedNode('p1'),
        DF.variable('o'),
        DF.defaultGraph(),
      )).toEqual([]);
      expect(factory.prepared).toHaveLength(0);
    });
  });

  it('decodes terms itself for quoted triple patterns', () => {
    const store = RdfStore.createDefault();
    store.addQuad(DF.quad(
      DF.quad(DF.namedNode('s1'), DF.namedNode('p1'), DF.namedNode('o1')),
      DF.namedNode('p2'),
      DF.namedNode('o2'),
    ));
    expect(store.getBindings(
      factory,
      DF.quad(DF.variable('a'), DF.namedNode('p1'), DF.namedNode('o1')),
      DF.namedNode('p2'),
      DF.variable('o'),
      DF.defaultGraph(),
    )).toEqualBindingsArray([
      BF.fromRecord({ a: DF.namedNode('s1'), o: DF.namedNode('o2') }),
    ]);
    expect(factory.prepared).toHaveLength(0);
  });
});
