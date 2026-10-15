import { prefixDistance } from './distance.js';
import { scorePrepared, type Engine } from './engine.js';

/** A fuzzy occurrence of a query inside a longer text. */
export interface Found {
  /** The matching part, as written in the original text. */
  text: string;
  /** Position of the first character in the original text. */
  start: number;
  /** Position just after the last character (`text.slice(start, end)`). */
  end: number;
  /** Similarity score between the query and this part, from 0 to 100. */
  score: number;
}

/** A piece of text, highlighted or not. Concatenated, pieces give the original text. */
export interface Segment {
  text: string;
  /** Whether this piece matches the query. */
  match: boolean;
}

interface Token {
  start: number;
  end: number;
  normalized: string;
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

function tokenize(text: string, engine: Engine): Token[] {
  const tokens: Token[] = [];
  for (const m of text.matchAll(WORD_RE)) {
    const normalized = engine.normalize(m[0]);
    if (normalized !== '') tokens.push({ start: m.index!, end: m.index! + m[0].length, normalized });
  }
  return tokens;
}

/** Typos tolerated in a word of `length` letters when highlighting. */
function allowance(length: number): number {
  return length <= 3 ? 0 : Math.floor(length / 4);
}

export function findIn(text: string, query: string, engine: Engine, threshold: number): Found[] {
  const q = engine.read(query);
  if (q.text === '' || text === '') return [];
  const tokens = tokenize(text, engine);
  const k = q.words.length;

  const candidates: Found[] = [];
  for (const size of new Set([Math.max(1, k - 1), k, k + 1])) {
    for (let i = 0; i + size <= tokens.length; i += 1) {
      const start = tokens[i]!.start;
      const end = tokens[i + size - 1]!.end;
      // Normalize the window as a whole: "twenty one" reads as "21", "the beatles" loses its article.
      const candidate = engine.read(text.slice(start, end));
      const score = scorePrepared(q, candidate, engine, undefined, threshold);
      if (score < threshold) continue;
      candidates.push({ text: text.slice(start, end), start, end, score });
    }
  }

  // Best first, then keep only parts that do not overlap a better one.
  candidates.sort((a, b) => b.score - a.score || a.end - a.start - (b.end - b.start) || a.start - b.start);
  const kept: Found[] = [];
  for (const c of candidates) {
    if (kept.every((k2) => c.end <= k2.start || c.start >= k2.end)) kept.push(c);
  }
  return kept.sort((a, b) => a.start - b.start);
}

export function highlightIn(text: string, query: string, engine: Engine, threshold: number): Segment[] {
  const ranges: [number, number][] = findIn(text, query, engine, threshold).map((f) => [f.start, f.end]);

  // Word by word too, so "bohem" lights up the start of "Bohemian".
  const words = engine.read(query).words;
  if (words.length > 0) {
    for (const token of tokenize(text, engine)) {
      for (const word of words) {
        const typos = allowance(word.length);
        if (prefixDistance(word, token.normalized) > typos) continue;
        const whole = word.length >= token.normalized.length - typos;
        const length = whole ? token.end - token.start : Math.min(word.length, token.end - token.start);
        ranges.push([token.start, token.start + length]);
        break;
      }
    }
  }

  ranges.sort((a, b) => a[0] - b[0]);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (end <= cursor) continue;
    const from = Math.max(start, cursor);
    if (from > cursor) segments.push({ text: text.slice(cursor, from), match: false });
    const last = segments[segments.length - 1];
    if (last?.match && from === cursor) last.text += text.slice(from, end);
    else segments.push({ text: text.slice(from, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
