import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberRecord } from '../../lib/dictionary/TermDictionaryNumberRecord';
import 'jest-rdf';

const DF = new DataFactory();

describe('TermDictionaryNumberRecord', () => {
  let dict: ITermDictionary<number>;

  beforeEach(() => {
    dict = new TermDictionaryNumberRecord();
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

      expect(dict.encode(DF.literal('abc'))).toEqual(0);
      expect(dict.encode(DF.literal('def'))).toEqual(1);
      expect(dict.encode(DF.literal('abc', DF.namedNode('ex:d')))).toEqual(2);
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
        DF.namedNode('g1'),
      ))).toEqual(0);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g2'),
      ))).toEqual(1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
        DF.namedNode('g'),
      ))).toEqual(2);

      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g1'),
      ))).toEqual(0);
      expect(dict.encode(DF.quad(
        DF.namedNode('s'),
        DF.namedNode('p'),
        DF.namedNode('o'),
        DF.namedNode('g2'),
      ))).toEqual(1);
      expect(dict.encode(DF.quad(
        DF.namedNode('s2'),
        DF.namedNode('p2'),
        DF.namedNode('o2'),
        DF.namedNode('g'),
      ))).toEqual(2);
    });

    it('should encode mixed terms nodes', () => {
      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);

      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);
    });
  });

  describe('encodeOptional', () => {
    it('should return undefined for non-encoded terms', () => {
      expect(dict.encode(DF.namedNode('ex:s1'))).toEqual(0);
      expect(dict.encode(DF.namedNode('ex:s2'))).toEqual(1);
      expect(dict.encode(DF.namedNode('ex:s3'))).toEqual(2);

      expect(dict.encodeOptional(DF.namedNode('ex:s1'))).toEqual(0);
      expect(dict.encodeOptional(DF.namedNode('ex:s2'))).toEqual(1);
      expect(dict.encodeOptional(DF.namedNode('ex:s3'))).toEqual(2);
      expect(dict.encodeOptional(DF.namedNode('ex:s4'))).toEqual(undefined);
    });
  });

  describe('decode', () => {
    it('should throw when entry does not exist', () => {
      expect(() => dict.decode(0)).toThrow('The value 0 is not present in this dictionary');
    });

    it('should decode encoded terms', () => {
      expect(dict.encode(DF.namedNode('s'))).toEqual(0);
      expect(dict.encode(DF.blankNode('s'))).toEqual(1);
      expect(dict.encode(DF.literal('s'))).toEqual(2);

      expect(dict.decode(0)).toEqualRdfTerm(DF.namedNode('s'));
      expect(dict.decode(1)).toEqualRdfTerm(DF.blankNode('s'));
      expect(dict.decode(2)).toEqualRdfTerm(DF.literal('s'));
    });
  });
});
