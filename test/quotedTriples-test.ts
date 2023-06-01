import arrayifyStream from 'arrayify-stream';
import each from 'jest-each';
import { DataFactory } from 'rdf-data-factory';
import { TermDictionaryNumberRecordFullTerms } from '../lib/dictionary/TermDictionaryNumberRecordFullTerms';
import { TermDictionaryQuoted } from '../lib/dictionary/TermDictionaryQuoted';
import { RdfStore } from '../lib/RdfStore';
import { indexClazzToInstance } from './testUtil';

const DF = new DataFactory();

describe('Quoted triples', () => {
  let store: RdfStore<number>;

  each(Object.keys(indexClazzToInstance)).describe('%s', clazz => {
  // Describe('RdfStoreIndexNestedMapQuoted', () => {
  //   let clazz = 'RdfStoreIndexNestedMapQuoted';
    beforeEach(() => {
      store = new RdfStore<number>({
        indexCombinations: RdfStore.DEFAULT_INDEX_COMBINATIONS,
        indexConstructor: subOptions => indexClazzToInstance[clazz](subOptions),
        dictionary: new TermDictionaryQuoted(new TermDictionaryNumberRecordFullTerms(), DF),
        dataFactory: DF,
      });
    });

    describe('with quoted triples', () => {
      beforeEach(() => {
        store.addQuad(DF.quad(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        ));
        store.addQuad(DF.quad(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
        ));
        store.addQuad(DF.quad(
          DF.namedNode('Bob'),
          DF.namedNode('says'),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
          ),
        ));
      });

      it('should handle regular the empty triple pattern', async() => {
        expect(await arrayifyStream(store.match())).toEqual([
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
          ),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
          ),
          DF.quad(
            DF.namedNode('Bob'),
            DF.namedNode('says'),
            DF.quad(
              DF.namedNode('Alice'),
              DF.namedNode('says'),
              DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
            ),
          ),
        ]);
      });

      it('should handle regular unquoted triple patterns', async() => {
        expect(await arrayifyStream(store.match(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
          ),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
          ),
        ]);

        expect(await arrayifyStream(store.match(
          DF.namedNode('Bob'),
          DF.namedNode('says'),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Bob'),
            DF.namedNode('says'),
            DF.quad(
              DF.namedNode('Alice'),
              DF.namedNode('says'),
              DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
            ),
          ),
        ]);
      });

      it('should handle quoted triple patterns without variables', async() => {
        expect(await arrayifyStream(store.match(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
          ),
        ]);

        expect(await arrayifyStream(store.match(
          DF.namedNode('Bob'),
          DF.namedNode('says'),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
          ),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Bob'),
            DF.namedNode('says'),
            DF.quad(
              DF.namedNode('Alice'),
              DF.namedNode('says'),
              DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
            ),
          ),
        ]);
      });

      it('should handle quoted triple patterns', async() => {
        expect(await arrayifyStream(store.match(
          DF.namedNode('Alice'),
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
          ),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
          ),
        ]);
      });

      it('should handle nested quoted triple patterns', async() => {
        expect(await arrayifyStream(store.match(
          DF.namedNode('Bob'),
          DF.namedNode('says'),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
          ),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Bob'),
            DF.namedNode('says'),
            DF.quad(
              DF.namedNode('Alice'),
              DF.namedNode('says'),
              DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Yellow')),
            ),
          ),
        ]);
      });

      it('should handle nested quoted triple patterns with an outer variable', async() => {
        expect(await arrayifyStream(store.match(
          undefined,
          DF.namedNode('says'),
          DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.variable('color')),
        ))).toEqual([
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('Blue')),
          ),
          DF.quad(
            DF.namedNode('Alice'),
            DF.namedNode('says'),
            DF.quad(DF.namedNode('Violets'), DF.namedNode('haveColor'), DF.namedNode('DarkBlue')),
          ),
        ]);
      });
    });
  });
});
