import each from 'jest-each';
import { DataFactory } from 'rdf-data-factory';
import type { ITermDictionary } from '../../lib/dictionary/ITermDictionary';
import { TermDictionaryNumberMap } from '../../lib/dictionary/TermDictionaryNumberMap';
import { ITermsCardinalitySet } from '../../lib/index/ITermsCardinalitySet';
import { TermsCardinalitySet } from '../../lib/index/TermsCardinalitySet';

const DF = new DataFactory();

describe('TermsCardinalitySets', () => {
  let index: ITermsCardinalitySet<number>;
  let dictionary: ITermDictionary<number>;

  describe('...', () => {
    beforeEach(() => {
      dictionary = new TermDictionaryNumberMap();
      index = new TermsCardinalitySet();
    });

    describe('that is empty', () => {
      describe('get', () => {
        it('should produce no results', () => {
          expect(index.count(
            dictionary.encode(DF.namedNode('s'))
          )).toEqual(0);
        });
      });
      describe('remove', () => {
        it('should be unable to remove non-existing terms', () => {
          expect(index.remove(
            dictionary.encode(DF.namedNode('s'))
          )).toEqual(0);
        });
      });
      describe('It should give an empty array of terms', () => {
        it('should be unable to remove non-existing terms', () => {
          expect(index.getTerms()).toEqual([]);
        });
      });
    });

    describe('that has one term', () => {
      beforeEach(() => {
        index.add(dictionary.encode(DF.namedNode('s')));
      });

      describe('add', () => {
        it('should increase when adding the same term', () => {
          expect(index.add(dictionary.encode(DF.namedNode('s')))).toEqual(2);
        });
      });

      describe('getTerms', () => {
        it('should produce results', () => {
          expect(index.getTerms()).toEqual([dictionary.encode(DF.namedNode('s'))]);
        });
      });
    });
  })
});