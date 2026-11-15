import { COMPACT_LITERAL_KINDS, NumberMap } from '../../lib/dictionary/CompactLiterals';

const XSD = 'http://www.w3.org/2001/XMLSchema#';

describe('CompactLiterals', () => {
  describe('COMPACT_LITERAL_KINDS', () => {
    it('should parse and format integers', () => {
      const kind = COMPACT_LITERAL_KINDS.get(`${XSD}integer`)!;
      expect(kind.parse('42')).toBe(42);
      expect(kind.parse('-42')).toBe(-42);
      expect(kind.parse('042')).toBeUndefined();
      expect(kind.parse('4.2')).toBeUndefined();
      expect(kind.format(42)).toBe('42');
    });

    it('should parse and format dates and date-times', () => {
      const dateTime = COMPACT_LITERAL_KINDS.get(`${XSD}dateTime`)!;
      expect(dateTime.parse('1970-01-01T00:00:01.000Z')).toBe(1000);
      expect(dateTime.format(1000)).toBe('1970-01-01T00:00:01.000Z');
      expect(dateTime.parse('1970-01-01T00:00:01.000+00')).toBeUndefined();
      const date = COMPACT_LITERAL_KINDS.get(`${XSD}date`)!;
      expect(date.parse('1970-01-02')).toBe(86_400_000);
      expect(date.format(86_400_000)).toBe('1970-01-02');
    });

    it('should parse and format booleans', () => {
      const kind = COMPACT_LITERAL_KINDS.get(`${XSD}boolean`)!;
      expect(kind.parse('true')).toBe(1);
      expect(kind.parse('false')).toBe(0);
      expect(kind.parse('0')).toBeUndefined();
      expect(kind.format(1)).toBe('true');
      expect(kind.format(0)).toBe('false');
    });

    it('should not have kinds for other datatypes', () => {
      expect(COMPACT_LITERAL_KINDS.get(`${XSD}decimal`)).toBeUndefined();
      expect(COMPACT_LITERAL_KINDS.get('constructor')).toBeUndefined();
    });
  });

  describe('NumberMap', () => {
    it('should be empty initially', () => {
      const map = new NumberMap();
      expect(map.size).toBe(0);
      expect(map.get(0)).toBeUndefined();
    });

    it('should set and get many keys', () => {
      const map = new NumberMap();
      const keys: number[] = [];
      for (let i = 0; i < 10_000; i++) {
        keys.push(i % 3 === 0 ? -i : i * 1_000_003.5);
      }
      for (const [ i, key ] of keys.entries()) {
        map.set(key, i);
      }
      expect(map.size).toBe(keys.length);
      for (const [ i, key ] of keys.entries()) {
        expect(map.get(key)).toBe(i);
      }
      expect(map.get(0.25)).toBeUndefined();
    });

    it('should overwrite the value of a key', () => {
      const map = new NumberMap();
      map.set(7, 1);
      map.set(7, 2);
      expect(map.size).toBe(1);
      expect(map.get(7)).toBe(2);
    });
  });
});
