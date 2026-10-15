/**
 * Rewrites numbers written in words (English and French) and roman numerals
 * as digits, so `two become one`, `2 Become 1` and `II` / `2` compare equal.
 * Works on normalized text: lower case, single spaces.
 */

const EN_UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const EN_ORDINALS = [
  '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth',
];
const FR_UNITS = [
  'zero', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
];
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

function table(words: readonly string[], step = 1): Map<string, number> {
  const map = new Map<string, number>();
  words.forEach((word, i) => word && map.set(word, i * step));
  return map;
}

const enUnits = table(EN_UNITS);
const enTens = table(EN_TENS, 10);
const enOrdinals = table(EN_ORDINALS);
const frUnits = table(FR_UNITS);
frUnits.set('une', 1);
const frTens = table(FR_TENS, 10);
const frOrdinals = table([
  '', 'premier', 'deuxieme', 'troisieme', 'quatrieme', 'cinquieme', 'sixieme', 'septieme', 'huitieme',
  'neuvieme', 'dixieme', 'onzieme', 'douzieme',
]);
frOrdinals.set('premiere', 1);
frOrdinals.set('seconde', 2);
const SUFFIX = ['th', 'st', 'nd', 'rd'];

/** Every word that can start a number, to skip texts without any quickly. */
const STARTERS = new Set([...enUnits.keys(), ...enTens.keys(), ...enOrdinals.keys(), ...frUnits.keys(), ...frTens.keys(), ...frOrdinals.keys()]);
/** Quick test: does the text contain anything that may be a number? */
const MAYBE_RE = new RegExp(
  `(?:^| )(?:${[...STARTERS].join('|')}|[ivx]{2,}|\\d+(?:e|eme|er|ere|re))(?= |$)`,
  'i',
);
const ROMAN_RE = /^(x{0,3})(ix|iv|v?i{0,3})$/;
const ROMAN = { i: 1, v: 5, x: 10 } as const;
const FR_ORDINAL_RE = /^(\d+)(?:e|eme|er|ere|re)$/;

function roman(word: string): number | undefined {
  if (word.length < 2 || !ROMAN_RE.test(word)) return undefined;
  let total = 0;
  for (let i = 0; i < word.length; i += 1) {
    const value = ROMAN[word[i] as keyof typeof ROMAN];
    const next = ROMAN[word[i + 1] as keyof typeof ROMAN] ?? 0;
    total += value < next ? -value : value;
  }
  return total;
}

function enOrdinal(n: number): string {
  const last = n % 100 >= 11 && n % 100 <= 13 ? 0 : n % 10;
  return `${n}${SUFFIX[last] ?? 'th'}`;
}

/** French 0 to 19, possibly as two words (`dix sept`). */
function frSmall(words: readonly string[], i: number): [number, number] | undefined {
  const value = frUnits.get(words[i]!);
  if (value === undefined) return undefined;
  if (value === 10) {
    const unit = frUnits.get(words[i + 1] ?? '');
    if (unit !== undefined && unit >= 7 && unit <= 9) return [10 + unit, 2];
  }
  return [value, 1];
}

/** A French number from 0 to 99 starting at `i`: [value, words used]. */
function frNumber(words: readonly string[], i: number): [number, number] | undefined {
  let base: number | undefined;
  let j = i + 1;
  if (words[i] === 'quatre' && (words[i + 1] === 'vingt' || words[i + 1] === 'vingts')) {
    base = 80;
    j = i + 2;
  } else {
    base = frTens.get(words[i]!);
  }
  if (base === undefined) return frSmall(words, i);
  // 60 and 80 take 10 to 19 after them (soixante-dix, quatre-vingt-onze).
  const max = base === 60 || base === 80 ? 19 : 9;
  if (words[j] === 'et' && base !== 80) {
    const after = words[j + 1];
    if (after === 'un' || after === 'une') return [base + 1, j + 2 - i];
    if (after === 'onze' && base === 60) return [71, j + 2 - i];
    return [base, j - i];
  }
  const rest = frSmall(words, j);
  if (rest && rest[0] >= 1 && rest[0] <= max) return [base + rest[0], j + rest[1] - i];
  return [base, j - i];
}

/** An English number from 0 to 99 starting at `i`: [value, words used]. */
function enNumber(words: readonly string[], i: number): [number, number] | undefined {
  const tens = enTens.get(words[i]!);
  if (tens !== undefined) {
    const unit = enUnits.get(words[i + 1] ?? '');
    return unit !== undefined && unit >= 1 && unit <= 9 ? [tens + unit, 2] : [tens, 1];
  }
  const unit = enUnits.get(words[i]!);
  return unit === undefined ? undefined : [unit, 1];
}

/** Replaces numbers written in words or roman numerals with digits. */
export function wordsToDigits(text: string): string {
  if (!MAYBE_RE.test(text)) return text;
  const words = text.split(' ');
  const lowered = words.map((w) => w.toLowerCase());
  let changed = false;
  const out: string[] = [];
  for (let i = 0; i < words.length; ) {
    const word = lowered[i]!;
    let replacement: string | undefined;
    let used = 1;

    if (STARTERS.has(word)) {
      const ordinal = enOrdinals.get(word) ?? frOrdinals.get(word);
      if (ordinal !== undefined) {
        replacement = frOrdinals.has(word) ? (ordinal === 1 ? '1er' : `${ordinal}e`) : enOrdinal(ordinal);
      } else {
        const en = enNumber(lowered, i);
        const fr = frNumber(lowered, i);
        // French numbers can span more words (quatre vingt dix): keep the longest read.
        const best = en && (!fr || en[1] >= fr[1]) ? en : fr!;
        replacement = String(best[0]);
        used = best[1];
      }
    } else {
      const value = roman(word);
      const fr = value === undefined ? FR_ORDINAL_RE.exec(word) : null;
      if (value !== undefined) replacement = String(value);
      else if (fr) replacement = fr[1] === '1' ? '1er' : `${fr[1]}e`;
    }

    if (replacement === undefined) {
      out.push(words[i]!);
    } else {
      out.push(replacement);
      changed = true;
    }
    i += used;
  }
  return changed ? out.join(' ') : text;
}
