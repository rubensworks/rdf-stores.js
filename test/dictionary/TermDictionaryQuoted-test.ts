import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuoted } from '../../lib/dictionary/TermDictionaryQuoted';
import 'jest-rdf';

const DF = new DataFactory();

describe('TermDictionaryQuoted', () => {
  let dict: ITermDictionary<number>;

  beforeEach(() => {
    dict = new TermDictionaryQuoted(
      new TermDictionaryNumberRecordFullTerms(),
      new TermDictionaryNumberRecordFullTerms(),
    );
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 3);

      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('s3'),
        DF.namedNode('p3'),
        DF.namedNode('o3'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 3);
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);

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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);

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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);

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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);

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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
      expect(dict.encodeOptional(DF.quad(
        DF.namedNode('ex:bob'),
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
      ))).toEqual(undefined);
    });
  });

  describe('decode', () => {
    it('should throw when entry does not exist', () => {
      expect(() => dict.decode(0)).toThrow('The value 0 is not present in this dictionary');
      expect(() => dict.decode(TermDictionaryQuoted.BITMASK | 1))
        .toThrow('The value 0 is not present in this dictionary');
      expect(() => dict.decode(TermDictionaryQuoted.BITMASK | 10))
        .toThrow('The value 9 is not present in this dictionary');
    });

    it('should decode encoded terms', () => {
      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 2);
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 3);

      expect(dict.decode(0)).toEqualRdfTerm(DF.namedNode('s'));
      expect(dict.decode(1)).toEqualRdfTerm(DF.blankNode('s'));
      expect(dict.decode(2)).toEqualRdfTerm(DF.literal('s'));
      expect(dict.decode(TermDictionaryQuoted.BITMASK | 3)).toEqualRdfTerm(DF.quad(
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o2'),
      ))).toEqual(TermDictionaryQuoted.BITMASK | 2);
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
      ))).toEqual(TermDictionaryQuoted.BITMASK | 3);

      expect([ ...dict.encodings() ]).toEqual([ 0, 1, 2,
        TermDictionaryQuoted.BITMASK | 1,
        TermDictionaryQuoted.BITMASK | 2,
        TermDictionaryQuoted.BITMASK | 3,
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
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.variable('predicate'), DF.variable('color')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.variable('thing'), DF.namedNode('haveColor'), DF.variable('color')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
      ]);

      expect([ ...dict.findQuotedTriples(
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color'), DF.variable('graph')),
      ) ]).toEqual([
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
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
