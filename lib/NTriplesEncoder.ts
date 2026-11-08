import type * as RDF from '@rdfjs/types';
import type { ITermDictionary } from './dictionary/ITermDictionary';

const TAB = 9;
const LF = 10;
const CR = 13;
const SPACE = 32;
const QUOTE = 34;
const HASH = 35;
const DOT = 46;
const LT = 60;
const GT = 62;
const AT = 64;
const BACKSLASH = 92;
const CARET = 94;
const UNDERSCORE = 95;

// eslint-disable-next-line no-control-regex
const IRI = /^(?:[^\u0000- <>"{}|^`\\]|\\u[\dA-Fa-f]{4}|\\U[\dA-Fa-f]{8})*$/u;
const STRING = /^(?:[^"\\\n\r]|\\[tbnrf"'\\]|\\u[\dA-Fa-f]{4}|\\U[\dA-Fa-f]{8})*$/u;
const LANGUAGE = /^([A-Za-z]+(?:-[\dA-Za-z]+)*)(?:--(ltr|rtl))?$/u;
// eslint-disable-next-line no-misleading-character-class
const BLANK_NODE_LABEL = /^[\p{L}\p{N}_](?:[\p{L}\p{N}_\-.·̀-ͯ‿⁀]*[\p{L}\p{N}_\-·̀-ͯ‿⁀])?$/u;
const ESCAPE = /\\(?:u([\dA-Fa-f]{4})|U([\dA-Fa-f]{8})|(.))/gu;
const ESCAPED_CHARACTERS = new Map<string, string>([
  [ 't', '\t' ],
  [ 'b', '\b' ],
  [ 'n', '\n' ],
  [ 'r', '\r' ],
  [ 'f', '\f' ],
  [ '"', '"' ],
  [ '\'', '\'' ],
  [ '\\', '\\' ],
]);

/**
 * Options for {@link NTriplesEncoder}.
 */
export interface INTriplesEncoderOptions {
  /**
   * A string to prepend to all blank node labels, so that blank nodes of different documents stay distinct.
   */
  blankNodePrefix?: string;
}

/**
 * Parses N-Triples or N-Quads bytes straight into dictionary encodings.
 *
 * Terms are looked up by their bytes in a hash table of their own,
 * so a term is only decoded, and an RDF term created for it, the first time its bytes occur.
 */
export class NTriplesEncoder {
  /**
   * The encoded quads, in SPOG order, four entries per quad.
   */
  public quads = new Int32Array(4096);
  /**
   * The number of encoded quads.
   */
  public count = 0;
  /**
   * If a blank node was encountered.
   */
  public hasBlankNodes = false;

  private readonly dictionary: ITermDictionary<number>;
  private readonly dataFactory: RDF.DataFactory;
  private readonly blankNodePrefix: string;
  private readonly decoder = new TextDecoder();
  private readonly defaultGraph: number;

  // Slots of four entries: hash, encoding, offset in the arena, and byte length (zero if empty).
  private table = new Int32Array(4 << 12);
  private tableMask = (1 << 12) - 1;
  private tableSize = 0;
  private arena = new Uint8Array(1 << 16);
  private arenaSize = 0;

  private remainder: Uint8Array | undefined;
  private line = 0;
  private lastSubjectBytes: Uint8Array | undefined;
  private lastSubjectStart = 0;
  private lastSubjectEnd = 0;
  private lastSubject = 0;

  public constructor(
    dictionary: ITermDictionary<number>,
    dataFactory: RDF.DataFactory,
    options: INTriplesEncoderOptions = {},
  ) {
    this.dictionary = dictionary;
    this.dataFactory = dataFactory;
    this.blankNodePrefix = options.blankNodePrefix ?? '';
    this.defaultGraph = dictionary.encode(dataFactory.defaultGraph());
  }

  /**
   * Encode the complete lines in the given chunk, and keep the rest for the next one.
   * @param chunk Bytes of an N-Triples or N-Quads document.
   */
  public push(chunk: Uint8Array): void {
    let start = 0;
    if (this.remainder) {
      // Complete the line that the previous chunk ended in.
      const lineEnd = chunk.indexOf(LF);
      if (lineEnd < 0) {
        const joined = new Uint8Array(this.remainder.length + chunk.length);
        joined.set(this.remainder);
        joined.set(chunk, this.remainder.length);
        this.remainder = joined;
        return;
      }
      const joined = new Uint8Array(this.remainder.length + lineEnd + 1);
      joined.set(this.remainder);
      joined.set(chunk.subarray(0, lineEnd + 1), this.remainder.length);
      this.remainder = undefined;
      this.encodeLines(joined, joined.length);
      start = lineEnd + 1;
    }
    const end = chunk.lastIndexOf(LF) + 1;
    if (end > start) {
      this.encodeLines(start === 0 ? chunk : chunk.subarray(start), end - start);
    }
    if (end < chunk.length) {
      this.remainder = chunk.slice(Math.max(start, end));
    }
  }

  /**
   * Encode the last line, which may not end in a line feed.
   */
  public end(): void {
    if (this.remainder) {
      const joined = new Uint8Array(this.remainder.length + 1);
      joined.set(this.remainder);
      joined[this.remainder.length] = LF;
      this.remainder = undefined;
      this.encodeLines(joined, joined.length);
    }
  }

  /**
   * Encode the lines in bytes [0, end), where the last byte is a line feed.
   * @param bytes Bytes of lines.
   * @param end The end of the last line.
   */
  protected encodeLines(bytes: Uint8Array, end: number): void {
    let position = 0;
    while (position < end) {
      this.line++;
      const lineEnd = bytes.indexOf(LF, position);
      position = this.skipSpace(bytes, position);
      const first = bytes[position];
      if (first === LF || first === HASH) {
        position = lineEnd + 1;
        continue;
      }

      if ((this.count + 1) * 4 > this.quads.length) {
        const grown = new Int32Array(this.quads.length * 2);
        grown.set(this.quads);
        this.quads = grown;
      }
      const offset = this.count * 4;

      // Subject, reusing the previous one if its bytes repeat, as consecutive lines often share it.
      if (first !== LT && first !== UNDERSCORE) {
        this.error('Expected an IRI or blank node as subject');
      }
      let termEnd = this.termEnd(bytes, position, lineEnd);
      if (bytes === this.lastSubjectBytes && this.equalBytes(bytes, position, termEnd, this.lastSubjectStart)) {
        this.quads[offset] = this.lastSubject;
      } else {
        this.quads[offset] = this.lastSubject = this.encode(bytes, position, termEnd);
        this.lastSubjectBytes = bytes;
        this.lastSubjectStart = position;
        this.lastSubjectEnd = termEnd;
      }

      // Predicate
      position = this.skipSpace(bytes, termEnd);
      if (bytes[position] !== LT) {
        this.error('Expected an IRI as predicate');
      }
      termEnd = this.termEnd(bytes, position, lineEnd);
      this.quads[offset + 1] = this.encode(bytes, position, termEnd);

      // Object
      position = this.skipSpace(bytes, termEnd);
      termEnd = this.termEnd(bytes, position, lineEnd);
      this.quads[offset + 2] = this.encode(bytes, position, termEnd);

      // Graph
      position = this.skipSpace(bytes, termEnd);
      const graphStart = bytes[position];
      if (graphStart === LT || graphStart === UNDERSCORE) {
        termEnd = this.termEnd(bytes, position, lineEnd);
        this.quads[offset + 3] = this.encode(bytes, position, termEnd);
        position = this.skipSpace(bytes, termEnd);
      } else {
        this.quads[offset + 3] = this.defaultGraph;
      }

      if (bytes[position] !== DOT) {
        this.error('Expected a dot at the end of the statement');
      }
      position = this.skipSpace(bytes, position + 1);
      if (bytes[position] !== LF && bytes[position] !== HASH) {
        this.error('Expected the end of the line after the dot');
      }
      this.count++;
      position = lineEnd + 1;
    }
  }

  protected skipSpace(bytes: Uint8Array, position: number): number {
    let byte = bytes[position];
    while (byte === SPACE || byte === TAB || byte === CR) {
      byte = bytes[++position];
    }
    return position;
  }

  protected equalBytes(bytes: Uint8Array, start: number, end: number, otherStart: number): boolean {
    if (end - start !== this.lastSubjectEnd - otherStart) {
      return false;
    }
    for (let i = end - 1, j = otherStart + end - start - 1; i >= start; i--, j--) {
      if (bytes[i] !== bytes[j]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine where the term that starts at the given position ends.
   * Terms are only validated when they are decoded, i.e., once per distinct byte sequence.
   * @param bytes Bytes of lines.
   * @param position The start of the term.
   * @param lineEnd The position of the line feed of the term's line.
   */
  protected termEnd(bytes: Uint8Array, position: number, lineEnd: number): number {
    const first = bytes[position];
    let end: number;
    if (first === LT) {
      end = bytes.indexOf(GT, position + 1) + 1;
    } else if (first === QUOTE) {
      end = bytes.indexOf(QUOTE, position + 1);
      // Skip escaped quotes, i.e., those preceded by an odd number of backslashes.
      while (end > 0 && end < lineEnd && bytes[end - 1] === BACKSLASH) {
        let backslashes = 1;
        while (bytes[end - 1 - backslashes] === BACKSLASH) {
          backslashes++;
        }
        if (backslashes % 2 === 0) {
          break;
        }
        end = bytes.indexOf(QUOTE, end + 1);
      }
      if (end < 0 || end > lineEnd) {
        this.error('Unterminated literal');
      }
      end++;
      if (bytes[end] === CARET) {
        if (bytes[end + 1] !== CARET || bytes[end + 2] !== LT) {
          this.error('Expected a datatype IRI');
        }
        end = bytes.indexOf(GT, end + 3) + 1;
      } else if (bytes[end] === AT) {
        end = this.wordEnd(bytes, end + 1);
        // A language tag can not contain a dot, so such a dot ends the statement.
        while (bytes[end - 1] === DOT) {
          end--;
        }
      }
    } else if (first === UNDERSCORE) {
      end = this.wordEnd(bytes, position + 1);
      // A blank node label can not end in a dot, so such a dot ends the statement.
      while (bytes[end - 1] === DOT) {
        end--;
      }
    } else {
      this.error('Expected an IRI, blank node, or literal');
    }
    if (end <= position || end > lineEnd) {
      this.error('Unterminated term');
    }
    return end;
  }

  /**
   * Find the end of a language tag or blank node label: the first space, tab, line ending, or term start.
   */
  protected wordEnd(bytes: Uint8Array, position: number): number {
    let byte = bytes[position];
    while (byte !== SPACE && byte !== TAB && byte !== LF && byte !== CR && byte !== LT && byte !== QUOTE &&
      byte !== HASH && byte !== undefined) {
      byte = bytes[++position];
    }
    return position;
  }

  /**
   * Encode the term in bytes [start, end).
   */
  protected encode(bytes: Uint8Array, start: number, end: number): number {
    const length = end - start;
    let hash = 0x811C9DC5;
    for (let i = start; i < end; i++) {
      hash = Math.imul(hash ^ bytes[i], 0x01000193);
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85EBCA6B);
    hash ^= hash >>> 13;

    const table = this.table;
    const mask = this.tableMask;
    let slot = hash & mask;
    for (let offset = slot * 4; table[offset + 3] !== 0; offset = (slot = (slot + 1) & mask) * 4) {
      if (table[offset] === hash && table[offset + 3] === length) {
        const arena = this.arena;
        let a = table[offset + 2];
        let i = start;
        while (i < end && arena[a] === bytes[i]) {
          a++;
          i++;
        }
        if (i === end) {
          return table[offset + 1];
        }
      }
    }

    // First occurrence of these bytes.
    const encoding = this.dictionary.encode(this.createTerm(this.decoder.decode(bytes.subarray(start, end))));
    if (this.arenaSize + length > this.arena.length) {
      const grown = new Uint8Array(Math.max(this.arena.length * 2, this.arenaSize + length));
      grown.set(this.arena.subarray(0, this.arenaSize));
      this.arena = grown;
    }
    this.arena.set(bytes.subarray(start, end), this.arenaSize);
    const offset = slot * 4;
    table[offset] = hash;
    table[offset + 1] = encoding;
    table[offset + 2] = this.arenaSize;
    table[offset + 3] = length;
    this.arenaSize += length;
    if (++this.tableSize * 2 > mask) {
      this.growTable();
    }
    return encoding;
  }

  protected growTable(): void {
    const old = this.table;
    this.table = new Int32Array(old.length * 2);
    this.tableMask = (this.tableMask << 1) | 1;
    for (let offset = 0; offset < old.length; offset += 4) {
      if (old[offset + 3] !== 0) {
        let slot = old[offset] & this.tableMask;
        while (this.table[(slot * 4) + 3] !== 0) {
          slot = (slot + 1) & this.tableMask;
        }
        this.table.set(old.subarray(offset, offset + 4), slot * 4);
      }
    }
  }

  /**
   * Create an RDF term from its N-Triples serialization.
   * @param text A term that {@link NTriplesEncoder#termEnd} delimited.
   */
  protected createTerm(text: string): RDF.Term {
    const first = text.codePointAt(0);
    if (first === LT) {
      return this.dataFactory.namedNode(this.iri(text.slice(1, -1)));
    }
    if (first === UNDERSCORE) {
      const label = text.slice(2);
      if (text.codePointAt(1) !== 58 || !BLANK_NODE_LABEL.test(label)) {
        this.error(`Invalid blank node ${text}`);
      }
      this.hasBlankNodes = true;
      return this.dataFactory.blankNode(this.blankNodePrefix + label);
    }
    const close = text.lastIndexOf('"');
    const value = text.slice(1, close);
    if (!STRING.test(value)) {
      this.error(`Invalid literal ${text}`);
    }
    const unescaped = value.includes('\\') ? NTriplesEncoder.unescape(value) : value;
    const suffix = text.codePointAt(close + 1);
    if (suffix === CARET) {
      return this.dataFactory.literal(unescaped, this.dataFactory.namedNode(this.iri(text.slice(close + 4, -1))));
    }
    if (suffix === AT) {
      const match = LANGUAGE.exec(text.slice(close + 2));
      if (!match) {
        this.error(`Invalid language tag in ${text}`);
      }
      return this.dataFactory.literal(
        unescaped,
        match[2] ? { language: match[1], direction: <'ltr' | 'rtl'> match[2] } : match[1],
      );
    }
    return this.dataFactory.literal(unescaped);
  }

  protected iri(value: string): string {
    if (!IRI.test(value)) {
      this.error(`Invalid IRI <${value}>`);
    }
    return value.includes('\\') ? NTriplesEncoder.unescape(value) : value;
  }

  public static unescape(value: string): string {
    return value.replaceAll(ESCAPE, (match, unicode4: string, unicode8: string, character: string) => {
      if (unicode4) {
        return String.fromCodePoint(Number.parseInt(unicode4, 16));
      }
      if (unicode8) {
        return String.fromCodePoint(Number.parseInt(unicode8, 16));
      }
      return ESCAPED_CHARACTERS.get(character)!;
    });
  }

  protected error(message: string): never {
    throw new Error(`${message} on line ${this.line}`);
  }
}
