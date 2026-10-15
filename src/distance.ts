/**
 * Raw edit-distance primitives.
 *
 * Strings of up to 32 UTF-16 units use bit-parallel algorithms (Myers 1999 for
 * Levenshtein, Hyyrö 2003 for Damerau/OSA): one pass, no allocation. Longer
 * strings fall back to a classic dynamic-programming loop on reusable buffers.
 */

/** Pattern-match bitmasks, indexed by UTF-16 code unit. Always reset after use. */
const peq = new Uint32Array(0x10000);

let rowA = new Int32Array(64);
let rowB = new Int32Array(64);
let rowC = new Int32Array(64);

function ensureRows(size: number): void {
  if (rowA.length >= size) return;
  const length = Math.max(size, rowA.length * 2);
  rowA = new Int32Array(length);
  rowB = new Int32Array(length);
  rowC = new Int32Array(length);
}

function fillPeq(pattern: string): void {
  for (let i = 0; i < pattern.length; i += 1) {
    peq[pattern.charCodeAt(i)]! |= 1 << i;
  }
}

function clearPeq(pattern: string): void {
  for (let i = 0; i < pattern.length; i += 1) {
    peq[pattern.charCodeAt(i)] = 0;
  }
}

function myers32(pattern: string, text: string): number {
  const m = pattern.length;
  const last = 1 << (m - 1);
  let pv = -1;
  let mv = 0;
  let score = m;

  fillPeq(pattern);
  for (let j = 0; j < text.length; j += 1) {
    const eq = peq[text.charCodeAt(j)]!;
    const xv = eq | mv;
    const xh = (((eq & pv) + pv) ^ pv) | eq;
    let ph = mv | ~(xh | pv);
    let mh = pv & xh;
    if (ph & last) score += 1;
    if (mh & last) score -= 1;
    ph = (ph << 1) | 1;
    mh <<= 1;
    pv = mh | ~(xv | ph);
    mv = ph & xv;
  }
  clearPeq(pattern);
  return score;
}

function osa32(pattern: string, text: string): number {
  const m = pattern.length;
  const last = 1 << (m - 1);
  let vp = -1;
  let vn = 0;
  let d0 = 0;
  let pmOld = 0;
  let score = m;

  fillPeq(pattern);
  for (let j = 0; j < text.length; j += 1) {
    const pm = peq[text.charCodeAt(j)]!;
    const tr = (((~d0) & pm) << 1) & pmOld;
    d0 = ((((pm & vp) + vp) ^ vp) | pm | vn) | tr;
    let hp = vn | ~(d0 | vp);
    let hn = d0 & vp;
    if (hp & last) score += 1;
    if (hn & last) score -= 1;
    hp = (hp << 1) | 1;
    hn <<= 1;
    vp = hn | ~(d0 | hp);
    vn = hp & d0;
    pmOld = pm;
  }
  clearPeq(pattern);
  return score;
}

function dp(a: string, b: string, transpositions: boolean): number {
  const n = a.length;
  ensureRows(n + 1);
  let prev2 = rowC;
  let prev = rowA;
  let curr = rowB;
  for (let i = 0; i <= n; i += 1) prev[i] = i;

  for (let j = 1; j <= b.length; j += 1) {
    const bj = b.charCodeAt(j - 1);
    curr[0] = j;
    for (let i = 1; i <= n; i += 1) {
      const ai = a.charCodeAt(i - 1);
      const cost = ai === bj ? 0 : 1;
      let value = Math.min(prev[i]! + 1, curr[i - 1]! + 1, prev[i - 1]! + cost);
      if (
        transpositions &&
        i > 1 &&
        j > 1 &&
        ai === b.charCodeAt(j - 2) &&
        a.charCodeAt(i - 2) === bj
      ) {
        value = Math.min(value, prev2[i - 2]! + 1);
      }
      curr[i] = value;
    }
    const tmp = prev2;
    prev2 = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[n]!;
}

function editDistance(a: string, b: string, transpositions: boolean): number {
  if (a === b) return 0;
  // Keep the shorter string as the pattern.
  if (a.length > b.length) [a, b] = [b, a];

  // Trim the common prefix and suffix: cheap and very common for near-matches.
  let start = 0;
  while (start < a.length && a.charCodeAt(start) === b.charCodeAt(start)) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && a.charCodeAt(endA - 1) === b.charCodeAt(endB - 1)) {
    endA -= 1;
    endB -= 1;
  }
  a = a.slice(start, endA);
  b = b.slice(start, endB);

  if (a.length === 0) return b.length;
  if (a.length <= 32) return transpositions ? osa32(a, b) : myers32(a, b);
  return dp(a, b, transpositions);
}

const bag = new Int32Array(0x10000);

let lastMissingLetters = 0;

/**
 * Bag distance: how many characters one text has that the other lacks,
 * ignoring order. A lower bound of every edit distance here, whatever the word
 * order. The same count without spaces is then available from
 * {@link bagMissingLetters}.
 */
export function bagDistance(a: string, b: string): number {
  for (let i = 0; i < a.length; i += 1) bag[a.charCodeAt(i)]! += 1;
  for (let i = 0; i < b.length; i += 1) bag[b.charCodeAt(i)]! -= 1;
  let extraA = 0;
  let extraB = 0;
  let spacesA = 0;
  let spacesB = 0;
  // Each character's net count is read once, then reset to zero.
  for (let pass = 0; pass < 2; pass += 1) {
    const text = pass === 0 ? a : b;
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i);
      const count = bag[code]!;
      if (count === 0) continue;
      if (count > 0) {
        extraA += count;
        if (code === 32) spacesA += count;
      } else {
        extraB -= count;
        if (code === 32) spacesB -= count;
      }
      bag[code] = 0;
    }
  }
  lastMissingLetters = Math.max(extraA - spacesA, extraB - spacesB);
  return Math.max(extraA, extraB);
}

/** {@link bagDistance} of the last call, spaces ignored. */
export function bagMissingLetters(): number {
  return lastMissingLetters;
}

/**
 * Levenshtein distance: minimum number of single-character insertions,
 * deletions and substitutions turning `a` into `b`.
 *
 * Operates on raw strings: no normalization is applied.
 *
 * @example
 * levenshtein('kitten', 'sitting') // 3
 */
export function levenshtein(a: string, b: string): number {
  return editDistance(String(a), String(b), false);
}

/**
 * Damerau-Levenshtein distance (optimal string alignment): like
 * {@link levenshtein}, but swapping two adjacent characters costs 1.
 * This is the distance that best models human typos.
 *
 * Operates on raw strings: no normalization is applied.
 *
 * @example
 * damerau('teh', 'the')     // 1
 * levenshtein('teh', 'the') // 2
 */
export function damerau(a: string, b: string): number {
  return editDistance(String(a), String(b), true);
}

/**
 * Smallest edit distance between `query` and any part of `text` that starts at
 * the beginning of a word. The end of the match is free, so prefixes match
 * perfectly: `partialDistance('stair', 'stairway to heaven') === 0`.
 *
 * Skipping characters at the start of a word costs 1 each, so mid-word
 * matches are possible but penalized.
 */
export function partialDistance(query: string, text: string): number {
  const m = query.length;
  const n = text.length;
  if (m === 0) return 0;
  if (n === 0) return m;

  // Columns = query positions, rows = text positions.
  ensureRows(m + 1);
  let prev2 = rowC;
  let prev = rowA;
  let curr = rowB;
  for (let i = 0; i <= m; i += 1) prev[i] = i;
  let best = prev[m]!;
  let sinceBoundary = 0;

  for (let j = 1; j <= n; j += 1) {
    const tj = text.charCodeAt(j - 1);
    sinceBoundary = tj === 32 ? 0 : sinceBoundary + 1;
    curr[0] = sinceBoundary;
    for (let i = 1; i <= m; i += 1) {
      const qi = query.charCodeAt(i - 1);
      let value = Math.min(prev[i]! + 1, curr[i - 1]! + 1, prev[i - 1]! + (qi === tj ? 0 : 1));
      if (i > 1 && j > 1 && qi === text.charCodeAt(j - 2) && query.charCodeAt(i - 2) === tj) {
        value = Math.min(value, prev2[i - 2]! + 1);
      }
      curr[i] = value;
    }
    if (curr[m]! < best) best = curr[m]!;
    const tmp = prev2;
    prev2 = prev;
    prev = curr;
    curr = tmp;
  }
  return best;
}

/**
 * Smallest Damerau (OSA) distance between `query` and any substring of `text`,
 * bit-parallel (Hyyrö) when `query` fits in 32 bits. A cheap lower bound of
 * {@link partialDistance} and {@link prefixDistance}.
 */
export function searchDistance(query: string, text: string): number {
  const m = query.length;
  if (m === 0) return 0;
  if (m > 32) {
    ensureRows(m + 1);
    let prev2 = rowC;
    let prev = rowA;
    let curr = rowB;
    for (let i = 0; i <= m; i += 1) prev[i] = i;
    let best = m;
    for (let j = 1; j <= text.length; j += 1) {
      const tj = text.charCodeAt(j - 1);
      curr[0] = 0;
      for (let i = 1; i <= m; i += 1) {
        const qi = query.charCodeAt(i - 1);
        let value = Math.min(prev[i]! + 1, curr[i - 1]! + 1, prev[i - 1]! + (qi === tj ? 0 : 1));
        if (i > 1 && j > 1 && qi === text.charCodeAt(j - 2) && query.charCodeAt(i - 2) === tj) {
          value = Math.min(value, prev2[i - 2]! + 1);
        }
        curr[i] = value;
      }
      if (curr[m]! < best) best = curr[m]!;
      const tmp = prev2;
      prev2 = prev;
      prev = curr;
      curr = tmp;
    }
    return best;
  }

  const last = 1 << (m - 1);
  let vp = -1;
  let vn = 0;
  let d0 = 0;
  let pmOld = 0;
  let score = m;
  let best = m;
  fillPeq(query);
  for (let j = 0; j < text.length; j += 1) {
    const pm = peq[text.charCodeAt(j)]!;
    const tr = (((~d0) & pm) << 1) & pmOld;
    d0 = ((((pm & vp) + vp) ^ vp) | pm | vn) | tr;
    let hp = vn | ~(d0 | vp);
    let hn = d0 & vp;
    if (hp & last) score += 1;
    if (hn & last) score -= 1;
    if (score < best) best = score;
    // Free start: the top row stays at zero, so nothing is shifted in.
    hp <<= 1;
    hn <<= 1;
    vp = hn | ~(d0 | hp);
    vn = hp & d0;
    pmOld = pm;
  }
  clearPeq(query);
  return best;
}

/** Damerau (OSA) distance between `query` and the best prefix of `word`. */
export function prefixDistance(query: string, word: string): number {
  const m = query.length;
  if (m === 0) return 0;
  ensureRows(m + 1);
  let prev2 = rowC;
  let prev = rowA;
  let curr = rowB;
  for (let i = 0; i <= m; i += 1) prev[i] = i;
  let best = m;
  for (let j = 1; j <= word.length; j += 1) {
    const wj = word.charCodeAt(j - 1);
    curr[0] = j;
    for (let i = 1; i <= m; i += 1) {
      const qi = query.charCodeAt(i - 1);
      let value = Math.min(prev[i]! + 1, curr[i - 1]! + 1, prev[i - 1]! + (qi === wj ? 0 : 1));
      if (i > 1 && j > 1 && qi === word.charCodeAt(j - 2) && query.charCodeAt(i - 2) === wj) {
        value = Math.min(value, prev2[i - 2]! + 1);
      }
      curr[i] = value;
    }
    if (curr[m]! < best) best = curr[m]!;
    const tmp = prev2;
    prev2 = prev;
    prev = curr;
    curr = tmp;
  }
  return best;
}

/**
 * Jaro-Winkler similarity between 0 and 1. Favors strings sharing a prefix,
 * which makes it a good fit for short strings such as names.
 *
 * Operates on raw strings: no normalization is applied.
 *
 * @example
 * jaroWinkler('martha', 'marhta') // 0.961
 */
export function jaroWinkler(a: string, b: string): number {
  a = String(a);
  b = String(b);
  if (a === b) return 1;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 || lenB === 0) return 0;

  const window = Math.max(Math.floor(Math.max(lenA, lenB) / 2) - 1, 0);
  const matchedA = new Uint8Array(lenA);
  const matchedB = new Uint8Array(lenB);
  let matches = 0;

  for (let i = 0; i < lenA; i += 1) {
    const start = Math.max(0, i - window);
    const end = Math.min(i + window + 1, lenB);
    const ca = a.charCodeAt(i);
    for (let j = start; j < end; j += 1) {
      if (matchedB[j] || b.charCodeAt(j) !== ca) continue;
      matchedA[i] = 1;
      matchedB[j] = 1;
      matches += 1;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < lenA; i += 1) {
    if (!matchedA[i]) continue;
    while (!matchedB[k]) k += 1;
    if (a.charCodeAt(i) !== b.charCodeAt(k)) transpositions += 1;
    k += 1;
  }

  const jaro =
    (matches / lenA + matches / lenB + (matches - transpositions / 2) / matches) / 3;

  let prefix = 0;
  const maxPrefix = Math.min(4, lenA, lenB);
  while (prefix < maxPrefix && a.charCodeAt(prefix) === b.charCodeAt(prefix)) prefix += 1;

  return jaro + prefix * 0.1 * (1 - jaro);
}
