import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecordFullTerms } from '../../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import 'jest-rdf';

const DF = new DataFactory();

describe('TermDictionaryNumberRecordFullTerms', () => {
  let dict: ITermDictionary<number>;

  beforeEach(() => {
    dict = new TermDictionaryNumberRecordFullTerms();
  });

  describe('features', () => {
    it('contains the expected entries', () => {
      expect(dict.features).toEqual({
        quotedTriples: false,
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
        DF.namedNode('g1'),
      ))).toBe(0);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g2'),
      ))).toBe(1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
        DF.namedNode('g'),
      ))).toBe(2);

      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g1'),
      ))).toBe(0);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g2'),
      ))).toBe(1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
        DF.namedNode('g'),
      ))).toBe(2);
    });

    it('should encode mixed terms nodes', () => {
      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);

      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);
    });
  });

  describe('encodeOptional', () => {
    it('should return undefined for non-encoded terms', () => {
      expect(dict.encode(DF.namedNode('ex:s1'))).toBe(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toBe(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toBe(2);

      expect(dict.encodeOptional(DF.namedNode('ex:s1'))).toBe(0);
      expect(dict.encodeOptional(DF.namedNode('ex:s2'))).toBe(1);
      expect(dict.encodeOptional(DF.namedNode('ex:s3'))).toBe(2);
      expect(dict.encodeOptional(DF.namedNode('ex:s4'))).toBeUndefined();
    });
  });

  describe('decode', () => {
    it('should throw when entry does not exist', () => {
      expect(() => dict.decode(0)).toThrow('The value 0 is not present in this dictionary');
    });

    it('should decode encoded terms', () => {
      expect(dict.encode(DF.namedNode('s'))).toBe(0);
      expect(dict.encode(DF.blankNode('s'))).toBe(1);
      expect(dict.encode(DF.literal('s'))).toBe(2);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'ltr' }))).toBe(3);
      expect(dict.encode(DF.literal('abc', { language: 'en_us', direction: 'rtl' }))).toBe(4);

      expect(dict.decode(0)).toEqualRdfTerm(DF.namedNode('s'));
      expect(dict.decode(1)).toEqualRdfTerm(DF.blankNode('s'));
      expect(dict.decode(2)).toEqualRdfTerm(DF.literal('s'));
      expect(dict.decode(3)).toEqualRdfTerm(DF.literal('abc', { language: 'en_us', direction: 'ltr' }));
      expect(dict.decode(4)).toEqualRdfTerm(DF.literal('abc', { language: 'en_us', direction: 'rtl' }));
    });
  });

  describe('encodings', () => {
    it('should be empty for an empty dictionary', () => {
      expect([ ...dict.encodings() ]).toEqual([]);
    });

    it('should return for a non-empty dictionary', () => {
      dict.encode(DF.namedNode('s'));
      dict.encode(DF.blankNode('s'));
      dict.encode(DF.literal('s'));

      expect([ ...dict.encodings() ]).toEqual([ 0, 1, 2 ]);
    });
  });

  describe('findQuotedTriples', () => {
    it('throws an error', () => {
      expect(() => dict.findQuotedTriples(DF.quad(DF.namedNode(''), DF.namedNode(''), DF.namedNode(''))))
        .toThrow('findQuotedTriples is not supported');
    });
  });

  describe('findQuotedTriplesEncoded', () => {
    it('throws an error', () => {
      expect(() => dict.findQuotedTriplesEncoded(DF.quad(DF.namedNode(''), DF.namedNode(''), DF.namedNode(''))))
        .toThrow('findQuotedTriplesEncoded is not supported');
    });
  });
});
