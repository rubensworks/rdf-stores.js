import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuotedIndexed } from '../../lib/dictionary/TermDictionaryQuotedIndexed';
import 'jest-rdf';

const DF = new DataFactory();

describe('TermDictionaryQuotedIndexed', () => {
  let dict: ITermDictionary<number>;

  beforeEach(() => {
    dict = new TermDictionaryQuotedIndexed(new TermDictionaryNumberRecordFullTerms());
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
      expect(dict.encode(DF.namedNode('ex:s1'))).toEqual(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toEqual(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toEqual(2);

      expect(dict.encode(DF.namedNode('ex:s1'))).toEqual(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toEqual(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toEqual(2);
    });

    it('should encode blank nodes', () => {
      expect(dict.encode(DF.blankNode('bs1'))).toEqual(0);
      expect(dict.encode(DF.blankNode('bs2'))).toEqual(1);
      expect(dict.encode(DF.blankNode('bs3'))).toEqual(2);

      expect(dict.encode(DF.blankNode('bs1'))).toEqual(0);
      expect(dict.encode(DF.blankNode('bs2'))).toEqual(1);
      expect(dict.encode(DF.blankNode('bs3'))).toEqual(2);
    });

    it('should encode literals', () => {
      expect(dict.encode(DF.literal('abc'))).toEqual(0);
      expect(dict.encode(DF.literal('def'))).toEqual(1);
      expect(dict.encode(DF.literal('abc', DF.namedNode('ex:d')))).toEqual(2);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'ltr' }))).toEqual(3);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'rtl' }))).toEqual(4);

      expect(dict.encode(DF.literal('abc'))).toEqual(0);
      expect(dict.encode(DF.literal('def'))).toEqual(1);
      expect(dict.encode(DF.literal('abc', DF.namedNode('ex:d')))).toEqual(2);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'ltr' }))).toEqual(3);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'rtl' }))).toEqual(4);
    });

    it('should encode variables', () => {
      expect(dict.encode(DF.variable('v1'))).toEqual(0);
      expect(dict.encode(DF.variable('v2'))).toEqual(1);
      expect(dict.encode(DF.variable('v3'))).toEqual(2);

      expect(dict.encode(DF.variable('v1'))).toEqual(0);
      expect(dict.encode(DF.variable('v2'))).toEqual(1);
      expect(dict.encode(DF.variable('v3'))).toEqual(2);
    });

    it('should encode the default graph', () => {
      expect(dict.encode(DF.defaultGraph())).toEqual(0);
      expect(dict.encode(DF.defaultGraph())).toEqual(0);
    });

    it('should encode quoted quads', () => {
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);

      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);

      expect(dict.encodeOptional(DF.namedNode('s'))).toEqual(0);
      expect(dict.encodeOptional(DF.namedNode('p'))).toEqual(1);
      expect(dict.encodeOptional(DF.namedNode('o'))).toEqual(2);
      expect(dict.encodeOptional(DF.defaultGraph())).toEqual(3);
      expect(dict.encodeOptional(DF.namedNode('s3'))).toEqual(4);
      expect(dict.encodeOptional(DF.namedNode('p3'))).toEqual(5);
      expect(dict.encodeOptional(DF.namedNode('o3'))).toEqual(6);
      expect(dict.encodeOptional(DF.namedNode('s2'))).toEqual(7);
      expect(dict.encodeOptional(DF.namedNode('p2'))).toEqual(8);
      expect(dict.encodeOptional(DF.namedNode('o2'))).toEqual(9);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);

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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);

      // Validate encoding of internal terms
      expect(dict.encodeOptional(DF.namedNode('ex:alice'))).toEqual(0);
      expect(dict.encodeOptional(DF.namedNode('ex:says'))).toEqual(1);
      expect(dict.encodeOptional(DF.namedNode('ex:bob'))).toEqual(2);
      expect(dict.encodeOptional(DF.namedNode('ex:carol'))).toEqual(3);
      expect(dict.encodeOptional(DF.literal('Hello'))).toEqual(4);
      expect(dict.encodeOptional(DF.defaultGraph())).toEqual(5);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:carol'),
        DF.namedNode('ex:says'),
        DF.literal('Hello'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 1);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:bob'),
        DF.namedNode('ex:says'),
        DF.quad(
          DF.namedNode('ex:carol'),
          DF.namedNode('ex:says'),
          DF.literal('Hello'),
        ),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 2);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);
    });

    it('should encode mixed terms nodes', () => {
      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);

      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);
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
      expect(dict.encode(DF.namedNode('ex:s1'))).toEqual(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toEqual(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toEqual(2);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);

      expect(dict.encodeOptional(DF.namedNode('ex:s1'))).toEqual(0);
      expect(dict.encodeOptional(DF.namedNode('ex:s2'))).toEqual(1);
      expect(dict.encodeOptional(DF.namedNode('ex:s3'))).toEqual(2);
      expect(dict.encodeOptional(DF.namedNode('ex:s4'))).toEqual(undefined);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 3);
    });
  });

  describe('decode', () => {
    it('should throw when entry does not exist', () => {
      expect(() => dict.decode(0)).toThrow('The value 0 is not present in this dictionary');
      expect(() => dict.decode(TermDictionaryQuotedIndexed.BITMASK | 1))
        .toThrow('The value -2147483647 is not present in the quoted triples range of the dictionary');
      expect(() => dict.decode(TermDictionaryQuotedIndexed.BITMASK | 10))
        .toThrow('The value -2147483638 is not present in the quoted triples range of the dictionary');
    });

    it('should decode encoded terms', () => {
      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 2);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 5);

      expect(dict.decode(0)).toEqualRdfTerm(DF.namedNode('s'));
      expect(dict.decode(1)).toEqualRdfTerm(DF.blankNode('s'));
      expect(dict.decode(2)).toEqualRdfTerm(DF.literal('s'));
      expect(dict.decode(TermDictionaryQuotedIndexed.BITMASK | 1)).toEqualRdfTerm(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ));
      expect(dict.decode(TermDictionaryQuotedIndexed.BITMASK | 2)).toEqualRdfTerm(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ));
      expect(dict.decode(TermDictionaryQuotedIndexed.BITMASK | 5)).toEqualRdfTerm(DF.quad(
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
      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 2);
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
      ))).toEqual(TermDictionaryQuotedIndexed.BITMASK | 5);

      expect([ ...dict.encodings() ]).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
        TermDictionaryQuotedIndexed.BITMASK | 1,
        TermDictionaryQuotedIndexed.BITMASK | 2,
        TermDictionaryQuotedIndexed.BITMASK | 3,
        TermDictionaryQuotedIndexed.BITMASK | 4,
        TermDictionaryQuotedIndexed.BITMASK | 5,
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
