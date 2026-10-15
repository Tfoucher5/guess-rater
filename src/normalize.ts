import type { NormalizeOptions, StripRule } from './types.js';

export type Normalizer = (text: string) => string;

const LIGATURES: Readonly<Record<string, string>> = {
  œ: 'oe', Œ: 'OE', æ: 'ae', Æ: 'AE', ß: 'ss', ẞ: 'SS', ø: 'o', Ø: 'O',
  đ: 'd', Đ: 'D', ł: 'l', Ł: 'L', ħ: 'h', Ħ: 'H', ı: 'i', þ: 'th', Þ: 'TH',
};
const LIGATURE_RE = /[œŒæÆßẞøØđĐłŁħĦıþÞ]/g;
const MARKS_RE = /\p{M}+/gu;
const APOSTROPHES_RE = /['’‘`´ʼ]/g;
const PUNCTUATION_RE = /[^\p{L}\p{N}\s]+/gu;
const SPACES_RE = /\s+/g;
const NON_ASCII_RE = /[^\x00-\x7f]/;

const VERSION_WORDS =
  'remaster(?:ed)?|live|version|edit|mix|remix|mono|stereo|acoustic|acoustique|demo|instrumental|deluxe|bonus|single|radio|extended|unplugged|explicit|clean|original|reprise|edition|session|take|bande originale|from';

const STRIP_PATTERNS: Readonly<Record<StripRule, readonly RegExp[]>> = {
  featuring: [
    /[([{]?\s*\b(?:feat|ft|featuring)\b\.?\s.*$/iu,
    /[([{]\s*(?:with|avec|con)\s[^)\]}]*[)\]}]/giu,
  ],
  version: [
    new RegExp(`[([{][^)\\]}]*\\b(?:${VERSION_WORDS})\\b[^)\\]}]*[)\\]}]`, 'giu'),
    new RegExp(`\\s[-–—/|]\\s.*\\b(?:${VERSION_WORDS})\\b.*$`, 'iu'),
  ],
  brackets: [/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g],
  articles: [
    /^\s*(?:the|an?|le|la|les|un|une|des|el|los|las|il|lo|gli|die|der|das|l)\s+/iu,
    /^\s*l['’]\s*/iu,
  ],
};
const STRIP_ORDER: readonly StripRule[] = ['featuring', 'version', 'brackets', 'articles'];

function foldAccents(text: string): string {
  if (!NON_ASCII_RE.test(text)) return text;
  return text.normalize('NFD').replace(MARKS_RE, '').replace(LIGATURE_RE, (c) => LIGATURES[c]!);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a reusable normalization function. All regular expressions are
 * compiled once, here.
 */
export function compileNormalizer(options: NormalizeOptions = {}): Normalizer {
  const {
    caseSensitive = false,
    accentSensitive = false,
    punctuation = 'space',
    strip = [],
    ignoreWords = [],
    replace = {},
  } = options;

  const prepare = (text: string): string => {
    let out = caseSensitive ? text : text.toLowerCase();
    return accentSensitive ? out : foldAccents(out);
  };

  const stripRules = STRIP_ORDER.filter((rule) => strip.includes(rule)).flatMap(
    (rule) => STRIP_PATTERNS[rule],
  );

  const replacements = new Map<string, string>();
  for (const [from, to] of Object.entries(replace)) {
    const key = prepare(from).trim();
    if (key) replacements.set(key, ` ${prepare(String(to))} `);
  }
  const replaceRe =
    replacements.size > 0
      ? new RegExp(
          `(?<![\\p{L}\\p{N}])(?:${[...replacements.keys()]
            .sort((a, b) => b.length - a.length)
            .map(escapeRegExp)
            .join('|')})(?![\\p{L}\\p{N}])`,
          caseSensitive ? 'gu' : 'giu',
        )
      : null;

  // Ignored words go through the same pipeline, so `L'` or `Café` still match.
  let ignored: Set<string> | null = null;
  const normalizer: Normalizer = (input) => {
    if (input == null) return '';
    let text = prepare(String(input));

    for (const re of stripRules) {
      re.lastIndex = 0;
      const stripped = text.replace(re, ' ');
      // Never strip a text down to nothing: "(Intro)" stays "intro".
      if (/[\p{L}\p{N}]/u.test(stripped)) text = stripped;
    }

    if (replaceRe) {
      text = text.replace(replaceRe, (m) => replacements.get(caseSensitive ? m : m.toLowerCase()) ?? m);
    }

    if (punctuation !== 'keep') {
      text = text
        .replace(APOSTROPHES_RE, '')
        .replace(PUNCTUATION_RE, punctuation === 'remove' ? '' : ' ');
    }

    text = text.replace(SPACES_RE, ' ').trim();

    if (ignored && ignored.size > 0) {
      text = text
        .split(' ')
        .filter((word) => !ignored!.has(word))
        .join(' ');
    }
    return text;
  };

  if (ignoreWords.length > 0) {
    const base = compileNormalizer({ caseSensitive, accentSensitive, punctuation });
    ignored = new Set(ignoreWords.flatMap((word) => base(word).split(' ')).filter(Boolean));
  }

  return normalizer;
}

const defaultNormalizer = compileNormalizer();

/**
 * Cleans up a text the way guess-rater does before comparing: lower case,
 * no accents, no punctuation, single spaces.
 *
 * @example
 * normalize('  Saint-Étienne !! ')                       // 'saint etienne'
 * normalize('Hey Jude - Remastered 2015', { strip: ['version'] }) // 'hey jude'
 */
export function normalize(text: string, options?: NormalizeOptions): string {
  return options ? compileNormalizer(options)(text) : defaultNormalizer(text);
}
