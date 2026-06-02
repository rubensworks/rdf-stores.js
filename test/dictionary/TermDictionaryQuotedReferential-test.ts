import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuotedReferential } from '../../lib/dictionary/TermDictionaryQuotedReferential';
import 'jest-rdf';

const DF = new DataFactory();

describe('TermDictionaryQuotedReferential', () => {
  let dict: ITermDictionary<number>;

  beforeEach(() => {
    dict = new TermDictionaryQuotedReferential(new TermDictionaryNumberRecordFullTerms());
  });

  describe('features', () => {
    it('contains the expected entries', () => {
      expect(dict.features).toEqual({
        quotedTriples: true,
      });
    });
  });

  describe('encode', () => {
    it('should encode named nodes', () => {
      expect(dict.encode(DF.namedNode('ex:s1'))).toBe(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toBe(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toBe(2);

      expect(dict.encode(DF.namedNode('ex:s1'))).toBe(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toBe(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toBe(2);
    });

    it('should encode blank nodes', () => {
      expect(dict.encode(DF.blankNode('bs1'))).toBe(0);
      expect(dict.encode(DF.blankNode('bs2'))).toBe(1);
      expect(dict.encode(DF.blankNode('bs3'))).toBe(2);

      expect(dict.encode(DF.blankNode('bs1'))).toBe(0);
      expect(dict.encode(DF.blankNode('bs2'))).toBe(1);
      expect(dict.encode(DF.blankNode('bs3'))).toBe(2);
    });

    it('should encode literals', () => {
      expect(dict.encode(DF.literal('abc'))).toBe(0);
      expect(dict.encode(DF.literal('def'))).toBe(1);
      expect(dict.encode(DF.literal('abc', DF.namedNode('ex:d')))).toBe(2);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'ltr' }))).toBe(3);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'rtl' }))).toBe(4);

      expect(dict.encode(DF.literal('abc'))).toBe(0);
      expect(dict.encode(DF.literal('def'))).toBe(1);
      expect(dict.encode(DF.literal('abc', DF.namedNode('ex:d')))).toBe(2);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'ltr' }))).toBe(3);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'rtl' }))).toBe(4);
    });

    it('should encode variables', () => {
      expect(dict.encode(DF.variable('v1'))).toBe(0);
      expect(dict.encode(DF.variable('v2'))).toBe(1);
      expect(dict.encode(DF.variable('v3'))).toBe(2);

      expect(dict.encode(DF.variable('v1'))).toBe(0);
      expect(dict.encode(DF.variable('v2'))).toBe(1);
      expect(dict.encode(DF.variable('v3'))).toBe(2);
    });

    it('should encode the default graph', () => {
      expect(dict.encode(DF.defaultGraph())).toBe(0);
      expect(dict.encode(DF.defaultGraph())).toBe(0);
    });

    it('should encode quoted quads', () => {
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);

      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);

      expect(dict.encodeOptional(DF.namedNode('s'))).toBe(0);
      expect(dict.encodeOptional(DF.namedNode('p'))).toBe(1);
      expect(dict.encodeOptional(DF.namedNode('o'))).toBe(2);
      expect(dict.encodeOptional(DF.namedNode('s3'))).toBe(3);
      expect(dict.encodeOptional(DF.namedNode('p3'))).toBe(4);
      expect(dict.encodeOptional(DF.namedNode('o3'))).toBe(5);
      expect(dict.encodeOptional(DF.namedNode('s2'))).toBe(6);
      expect(dict.encodeOptional(DF.namedNode('p2'))).toBe(7);
      expect(dict.encodeOptional(DF.namedNode('o2'))).toBe(8);
    });

    it('should encode nested quoted quads', () => {
      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);

      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);

      // Validate encoding of internal terms
      expect(dict.encodeOptional(DF.namedNode('ex:alice'))).toBe(0);
      expect(dict.encodeOptional(DF.namedNode('ex:says'))).toBe(1);
      expect(dict.encodeOptional(DF.namedNode('ex:bob'))).toBe(2);
      expect(dict.encodeOptional(DF.namedNode('ex:carol'))).toBe(3);
      expect(dict.encodeOptional(DF.literal('Hello'))).toBe(4);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:carol'),
        DF.namedNode('ex:says'),
        DF.literal('Hello'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 1);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:bob'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:carol'),
          DF.namedNode('ex:says'),
          DF.literal('Hello'),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 2);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);
    });

    it('should encode mixed terms nodes', () => {
      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);

      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);
    });

    it('should throw for a quoted quad in the non-default graph', () => {
      expect(() => dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('othergraph'),
      ))).toThrow('Encoding of quoted quads outside of the default graph is not allowed');
    });
  });

  describe('encodeOptional', () => {
    it('should return undefined for non-encoded terms', () => {
      expect(dict.encode(DF.namedNode('ex:s1'))).toBe(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toBe(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toBe(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);

      expect(dict.encodeOptional(DF.namedNode('ex:s1'))).toBe(0);
      expect(dict.encodeOptional(DF.namedNode('ex:s2'))).toBe(1);
      expect(dict.encodeOptional(DF.namedNode('ex:s3'))).toBe(2);
      expect(dict.encodeOptional(DF.namedNode('ex:s4'))).toBeUndefined();
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 3);
    });
  });

  describe('decode', () => {
    it('should throw when entry does not exist', () => {
      expect(() => dict.decode(0)).toThrow('The value 0 is not present in this dictionary');
      expect(() => dict.decode(TermDictionaryQuotedReferential.BITMASK | 1))
        .toThrow('The value -2147483647 is not present in the quoted triples range of the dictionary');
      expect(() => dict.decode(TermDictionaryQuotedReferential.BITMASK | 10))
        .toThrow('The value -2147483638 is not present in the quoted triples range of the dictionary');
    });

    it('should decode encoded terms', () => {
      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 5);

      expect(dict.decode(0)).toEqualRdfTerm(DF.namedNode('s'));
      expect(dict.decode(1)).toEqualRdfTerm(DF.blankNode('s'));
      expect(dict.decode(2)).toEqualRdfTerm(DF.literal('s'));
      expect(dict.decode(TermDictionaryQuotedReferential.BITMASK | 1)).toEqualRdfTerm(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ));
      expect(dict.decode(TermDictionaryQuotedReferential.BITMASK | 2)).toEqualRdfTerm(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ));
      expect(dict.decode(TermDictionaryQuotedReferential.BITMASK | 5)).toEqualRdfTerm(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ));
    });
  });

  describe('encodings', () => {
    it('should be empty for an empty dictionary', () => {
      expect([ ...dict.encodings() ]).toEqual([]);
    });

    it('should return for a non-empty dictionary', () => {
      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('ex:alice'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:bob'),
          DF.namedNode('ex:says'),
          DF.quad(
            DF.namedNode('ex:carol'),
            DF.namedNode('ex:says'),
            DF.literal('Hello'),
          ),
        ),
      ))).toEqual(TermDictionaryQuotedReferential.BITMASK | 5);

      expect([ ...dict.encodings() ]).toEqual([
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        TermDictionaryQuotedReferential.BITMASK | 1,
        TermDictionaryQuotedReferential.BITMASK | 2,
        TermDictionaryQuotedReferential.BITMASK | 3,
        TermDictionaryQuotedReferential.BITMASK | 4,
        TermDictionaryQuotedReferential.BITMASK | 5,
      ]);
    });
  });

  describe('findQuotedTriples', () => {
    beforeEach(() => {
      dict.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')));
      dict.encode(DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')));
      dict.encode(DF.quad(
        DF.namedNode('Alice'),
        DF.namedNode('says'),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
      ));
      dict.encode(DF.quad(
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Brown')),
        DF.namedNode('isSaidBy'),
        DF.namedNode('Alice'),
      ));
    });

    it('handles a pattern without matches', () => {
      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Red')),
      ) ]).toEqual([]);
      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveThing'), DF.variable('color')),
      ) ]).toEqual([]);
    });

    it('handles a one-level pattern with matches', () => {
      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Brown')),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.variable('predicate'), DF.variable('color')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Brown')),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.variable('thing'), DF.namedNode('haveColor'), DF.variable('color')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Brown')),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color'), DF.variable('graph')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Brown')),
      ]);
    });

    it('handles a two-level pattern with matches', () => {
      expect([ ...dict.findQuotedTriples(
        DF.quad(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
        ),
      ) ]).toEqual([
        DF.quad(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
        ),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
          DF.namedNode('isSaidBy'),
          DF.namedNode('Alice'),
        ),
      ) ]).toEqual([
        DF.quad(
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Brown')),
          DF.namedNode('isSaidBy'),
          DF.namedNode('Alice'),
        ),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(
          DF.namedNode('Alice'),
          <any> DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
          DF.namedNode('Dummy'),
        ),
      ) ]).toEqual([]);
      expect([ ...dict.findQuotedTriples(
        DF.quad(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.namedNode('Dummy'),
          <any> DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
        ),
      ) ]).toEqual([]);
      expect([ ...dict.findQuotedTriples(
        DF.quad(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.namedNode('Dummy'),
          DF.variable('graphs'),
        ),
      ) ]).toEqual([]);
    });
  });
});
