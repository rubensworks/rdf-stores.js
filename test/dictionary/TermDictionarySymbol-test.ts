import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionarySymbol } from '../../lib/dictionary/TermDictionarySymbol';
import 'jest-rdf';

const DF = new DataFactory();

describe('TermDictionarySymbol', () => {
  let dict: ITermDictionary<symbol>;

  beforeEach(() => {
    dict = new TermDictionarySymbol();
  });

  describe('encode', () => {
    it('should encode named nodes', () => {
      const s1 = dict.encode(DF.namedNode('ex:s1'));
      const s2 = dict.encode(DF.namedNode('ex:s2'));
      const s3 = dict.encode(DF.namedNode('ex:s3'));

      expect(s1).not.toBe(s2);
      expect(s2).not.toBe(s3);

      expect(dict.encode(DF.namedNode('ex:s1'))).toBe(s1);
      expect(dict.encode(DF.namedNode('ex:s2'))).toBe(s2);
      expect(dict.encode(DF.namedNode('ex:s3'))).toBe(s3);
    });

    it('should encode mixed terms nodes', () => {
      const s1 = dict.encode(DF.namedNode('ex:s1'));
      const s2 = dict.encode(DF.blankNode('ex:s2'));
      const s3 = dict.encode(DF.literal('ex:s3'));

      expect(s1).not.toBe(s2);
      expect(s2).not.toBe(s3);

      expect(dict.encode(DF.namedNode('ex:s1'))).toBe(s1);
      expect(dict.encode(DF.blankNode('ex:s2'))).toBe(s2);
      expect(dict.encode(DF.literal('ex:s3'))).toBe(s3);
    });
  });

  describe('encodeOptional', () => {
    it('should not return undefined for non-encoded terms', () => {
      const s1 = dict.encode(DF.namedNode('ex:s1'));
      const s2 = dict.encode(DF.namedNode('ex:s2'));
      const s3 = dict.encode(DF.namedNode('ex:s3'));

      expect(s1).not.toBe(s2);
      expect(s2).not.toBe(s3);

      expect(dict.encodeOptional(DF.namedNode('ex:s1'))).toBe(s1);
      expect(dict.encodeOptional(DF.namedNode('ex:s2'))).toBe(s2);
      expect(dict.encodeOptional(DF.namedNode('ex:s3'))).toBe(s3);
      expect(dict.encodeOptional(DF.namedNode('ex:s4'))).not.toBe(s3);
    });
  });

  describe('decode', () => {
    it('should throw when entry does not exist', () => {
      // eslint-disable-next-line symbol-description
      expect(() => dict.decode(Symbol())).toThrow('The value Symbol() is not present in this dictionary');
    });

    it('should decode encoded terms', () => {
      const s1 = dict.encode(DF.namedNode('ex:s1'));
      const s2 = dict.encode(DF.blankNode('ex:s1'));
      const s3 = dict.encode(DF.literal('ex:s1'));

      expect(dict.decode(s1)).toEqualRdfTerm(DF.namedNode('ex:s1'));
      expect(dict.decode(s2)).toEqualRdfTerm(DF.blankNode('ex:s1'));
      expect(dict.decode(s3)).toEqualRdfTerm(DF.literal('ex:s1'));
    });
  });
});
