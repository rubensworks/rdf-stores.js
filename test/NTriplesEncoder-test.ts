import type * as RDF from '@rdfjs/types';
import { Parser } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { RdfStoreIndexNestedRecord } from '../lib/index/RdfStoreIndexNestedRecord';
import { NTriplesEncoder } from '../lib/NTriplesEncoder';
import { RdfStore } from '../lib/RdfStore';
import 'jest-rdf';

const DF = new DataFactory();
const encoder = new TextEncoder();

function decodeQuads(dictionary: TermDictionaryNumberRecordFullTerms, nTriplesEncoder: NTriplesEncoder): RDF.Quad[] {
  const quads: RDF.Quad[] = [];
  for (let offset = 0; offset < nTriplesEncoder.count * 4; offset += 4) {
    quads.push(DF.quad(
      <RDF.Quad_Subject> dictionary.decode(nTriplesEncoder.quads[offset]),
      <RDF.Quad_Predicate> dictionary.decode(nTriplesEncoder.quads[offset + 1]),
      <RDF.Quad_Object> dictionary.decode(nTriplesEncoder.quads[offset + 2]),
      <RDF.Quad_Graph> dictionary.decode(nTriplesEncoder.quads[offset + 3]),
    ));
  }
  return quads;
}

function encode(text: string, chunkSize = text.length, blankNodePrefix?: string): {
  quads: RDF.Quad[];
  nTriplesEncoder: NTriplesEncoder;
} {
  const dictionary = new TermDictionaryNumberRecordFullTerms();
  const nTriplesEncoder = new NTriplesEncoder(dictionary, DF, { blankNodePrefix });
  const bytes = encoder.encode(text);
  for (let i = 0; i < bytes.length; i += Math.max(chunkSize, 1)) {
    nTriplesEncoder.push(bytes.subarray(i, i + Math.max(chunkSize, 1)));
  }
  nTriplesEncoder.end();
  return { quads: decodeQuads(dictionary, nTriplesEncoder), nTriplesEncoder };
}

function parse(text: string): RDF.Quad[] {
  return new Parser({ format: 'N-Quads', factory: DF, blankNodePrefix: '' }).parse(text);
}

const document = `# A comment
<http://ex.org/s> <http://ex.org/p> <http://ex.org/o> .
<http://ex.org/s> <http://ex.org/p> "plain" .
<http://ex.org/s> <http://ex.org/p> "typed"^^<http://ex.org/dt> .
<http://ex.org/s> <http://ex.org/p> "string"^^<http://www.w3.org/2001/XMLSchema#string> .
<http://ex.org/s> <http://ex.org/p> "tagged"@en-US .

\t<http://ex.org/s2>\t<http://ex.org/p>\t_:b1\t.\t# trailing comment
_:b1 <http://ex.org/p> "esc\\t\\"\\\\\\u00E9\\U0001F600" <http://ex.org/g> .
_:b1 <http://ex.org/p> <http://ex.org/\\u00E9> _:g .
<http://ex.org/s3><http://ex.org/p>"no spaces".
<http://ex.org/s3> <http://ex.org/p> "ünïcödé €" .
<http://ex.org/s3> <http://ex.org/p> "a\\\\" .
<http://ex.org/s3> <http://ex.org/p> "" .\r
<http://ex.org/s3> <http://ex.org/p> _:b.2.
<http://ex.org/s3> <http://ex.org/p> "dotted"@nl.
<http://ex.org/s3> <http://ex.org/p> "ö"@de <http://ex.org/g> .
`;

describe('NTriplesEncoder', () => {
  it('encodes like N3 parses', () => {
    const { quads, nTriplesEncoder } = encode(document);
    expect(quads).toBeRdfIsomorphic(parse(document));
    expect(quads).toHaveLength(15);
    expect(nTriplesEncoder.hasBlankNodes).toBe(true);
  });

  it('encodes equal terms to the same encoding', () => {
    const { nTriplesEncoder } = encode(document);
    expect(nTriplesEncoder.quads[0]).toBe(nTriplesEncoder.quads[4]);
    expect(nTriplesEncoder.quads[1]).toBe(nTriplesEncoder.quads[5]);
    // A literal with datatype xsd:string is a plain literal
    const { nTriplesEncoder: other } = encode(`<ex:s> <ex:p> "a" .
<ex:s> <ex:p> "a"^^<http://www.w3.org/2001/XMLSchema#string> .
<ex:s> <ex:p> "\\u0061" .
`);
    expect(other.quads[2]).toBe(other.quads[6]);
    expect(other.quads[2]).toBe(other.quads[10]);
  });

  it('encodes the same in chunks of any size', () => {
    const expected = parse(document);
    for (const chunkSize of [ 1, 2, 3, 7, 16, 64 ]) {
      expect(encode(document, chunkSize).quads).toBeRdfIsomorphic(expected);
    }
  });

  it('encodes a last line without line feed', () => {
    expect(encode('<ex:s> <ex:p> <ex:o> .').quads).toEqualRdfQuadArray([
      DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p'), DF.namedNode('ex:o')),
    ]);
    expect(encode('<ex:s> <ex:p> <ex:o> .', 5).quads).toHaveLength(1);
  });

  it('encodes directional language tags', () => {
    expect(encode('<ex:s> <ex:p> "a"@en--rtl .\n').quads).toEqualRdfQuadArray([
      DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p'), DF.literal('a', { language: 'en', direction: 'rtl' })),
    ]);
  });

  it('prefixes blank node labels', () => {
    const { quads, nTriplesEncoder } = encode('_:a <ex:p> _:b .\n', undefined, 'x_');
    expect(quads).toEqualRdfQuadArray([
      DF.quad(DF.blankNode('x_a'), DF.namedNode('ex:p'), DF.blankNode('x_b')),
    ]);
    expect(nTriplesEncoder.hasBlankNodes).toBe(true);
  });

  it('reports no blank nodes if there are none', () => {
    expect(encode('<ex:s> <ex:p> <ex:o> .\n').nTriplesEncoder.hasBlankNodes).toBe(false);
  });

  it('encodes empty documents', () => {
    expect(encode('').quads).toHaveLength(0);
    expect(encode('\n\n# comment\n   \n').quads).toHaveLength(0);
  });

  it('encodes many distinct and long terms', () => {
    const long = 'x'.repeat(100_000);
    let text = `<ex:${long}> <ex:p> "${long}" .\n`;
    for (let i = 0; i < 10_000; i++) {
      text += `<ex:s${i % 7}> <ex:p${i % 3}> "${i}" .\n`;
    }
    const { quads } = encode(text, 4096);
    expect(quads).toHaveLength(10_001);
    expect(quads).toBeRdfIsomorphic(parse(text));
  });

  it('does not reuse a subject with the same length', () => {
    const { quads } = encode('<ex:a> <ex:p> <ex:o> .\n<ex:b> <ex:p> <ex:o> .\n<ex:bb> <ex:p> <ex:o> .\n');
    expect(quads.map(quad => quad.subject.value)).toEqual([ 'ex:a', 'ex:b', 'ex:bb' ]);
  });

  it('distinguishes terms whose hashes collide', () => {
    // Find two IRIs of the same length with the same hash, as the encoder computes it.
    function hash(bytes: Uint8Array): number {
      let value = 0x811C9DC5;
      for (const byte of bytes) {
        value = Math.imul(value ^ byte, 0x01000193);
      }
      value ^= value >>> 16;
      value = Math.imul(value, 0x85EBCA6B);
      return value ^ (value >>> 13);
    }
    const seen = new Map<number, string>();
    let pair: string[] | undefined;
    for (let i = 0; !pair; i++) {
      const iri = `<ex:${String(i).padStart(8, '0')}>`;
      const value = hash(encoder.encode(iri));
      const other = seen.get(value);
      if (other) {
        pair = [ other, iri ];
      }
      seen.set(value, iri);
    }
    const { quads } = encode(`${pair[0]} <ex:p> ${pair[1]} .\n${pair[1]} <ex:p> ${pair[0]} .\n`);
    expect(quads.map(quad => [ quad.subject.value, quad.object.value ])).toEqual([
      [ pair[0].slice(1, -1), pair[1].slice(1, -1) ],
      [ pair[1].slice(1, -1), pair[0].slice(1, -1) ],
    ]);
  });

  it('has default options', () => {
    const nTriplesEncoder = new NTriplesEncoder(new TermDictionaryNumberRecordFullTerms(), DF);
    nTriplesEncoder.push(encoder.encode('_:a <ex:p> <ex:o> .\n'));
    expect(nTriplesEncoder.count).toBe(1);
  });

  describe('errors', () => {
    it.each([
      [ '"s" <ex:p> <ex:o> .', 'Expected an IRI or blank node as subject on line 1' ],
      [ '<ex:s> _:p <ex:o> .', 'Expected an IRI as predicate on line 1' ],
      [ '<ex:s> <ex:p> ?o .', 'Expected an IRI, blank node, or literal on line 1' ],
      [ '<ex:s> <ex:p> <ex:o>', 'Expected a dot at the end of the statement on line 1' ],
      [ '<ex:s> <ex:p> <ex:o> "g" .', 'Expected a dot at the end of the statement on line 1' ],
      [ '<ex:s> <ex:p> <ex:o> . <ex:o>', 'Expected the end of the line after the dot on line 1' ],
      [ '<ex:s> <ex:p> "o .\n<ex:s> <ex:p> "o" .', 'Unterminated literal on line 1' ],
      [ '<ex:s> <ex:p> "o\\" .', 'Unterminated literal on line 1' ],
      [ '<ex:s> <ex:p> "o"^<ex:dt> .', 'Expected a datatype IRI on line 1' ],
      [ '<ex:s> <ex:p> "o"^^ex:dt .', 'Expected a datatype IRI on line 1' ],
      [ '<ex:s> <ex:p> <ex:o .\n<ex:s> <ex:p> <ex:o> .', 'Unterminated term on line 1' ],
      [ '<ex:s> <ex:p> "o"^^<ex:dt .', 'Unterminated term on line 1' ],
      [ '<ex:s> <ex:p> <ex:o> .\n<ex:a b> <ex:p> <ex:o> .', 'Invalid IRI <ex:a b> on line 2' ],
      [ '<ex:s> <ex:p> "o"^^<ex:a b> .', 'Invalid IRI <ex:a b> on line 1' ],
      [ '<ex:s> <ex:p> _:-a .', 'Invalid blank node _:-a on line 1' ],
      [ '<ex:s> <ex:p> _-a .', 'Invalid blank node _-a on line 1' ],
      [ '<ex:s> <ex:p> "\\x" .', 'Invalid literal "\\x" on line 1' ],
      [ '<ex:s> <ex:p> "o"x .', 'Expected a dot at the end of the statement on line 1' ],
      [ '<ex:s> <ex:p> "o"@1 .', 'Invalid language tag in "o"@1 on line 1' ],
    ])('for %j', (text, message) => {
      expect(() => encode(text)).toThrow(message);
    });
  });

  describe('unescape', () => {
    it('replaces all escapes', () => {
      expect(NTriplesEncoder.unescape('\\t\\b\\n\\r\\f\\"\\\'\\\\\\u0041\\U0001F600')).toBe('\t\b\n\r\f"\'\\A😀');
    });
  });
});

describe('RdfStore#importNTriples', () => {
  it('imports into an ordered store', async() => {
    const store = RdfStore.createOrdered();
    await expect(store.importNTriples([ encoder.encode(document) ])).resolves.toBe(15);
    expect(store.size).toBe(15);
    expect(store.hasBlankNodes).toBe(true);
    expect(store.getQuads()).toBeRdfIsomorphic(parse(document));
    // Importing the same again adds nothing
    await expect(store.importNTriples([ encoder.encode(document) ])).resolves.toBe(0);
  });

  it('imports from an async iterable', async() => {
    const store = RdfStore.createOrdered();
    async function* chunks(): AsyncIterable<Uint8Array> {
      yield encoder.encode('<ex:s> <ex:p> ');
      yield encoder.encode('<ex:o> .\n');
    }
    await expect(store.importNTriples(chunks())).resolves.toBe(1);
    expect(store.hasBlankNodes).toBe(false);
  });

  it('imports into a store that can not insert batches', async() => {
    const store = new RdfStore<number>({
      indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
      indexConstructor: subOptions => new RdfStoreIndexNestedRecord(subOptions),
      dictionary: new TermDictionaryNumberRecordFullTerms(),
      dataFactory: DF,
    });
    const text = `${document}<ex:s> <ex:p> <ex:o> .\n<ex:s> <ex:p> <ex:o> .\n`;
    await expect(store.importNTriples([ encoder.encode(text) ])).resolves.toBe(16);
    expect(store.getQuads()).toBeRdfIsomorphic([
      ...parse(document),
      DF.quad(DF.namedNode('ex:s'), DF.namedNode('ex:p'), DF.namedNode('ex:o')),
    ]);
  });
});
