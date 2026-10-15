export {
  check,
  closest,
  compare,
  createIndex,
  createMatcher,
  dedupe,
  find,
  group,
  highlight,
  isMatch,
  search,
  similarity,
} from './matcher.js';
export type { Index, ItemsArgs, Matcher, MatcherCheckOptions, MatcherListOptions } from './matcher.js';
export { normalize } from './normalize.js';
export type { Found, Segment } from './text.js';
export { damerau, jaroWinkler, levenshtein } from './distance.js';
export type { ResolvedOptions } from './engine.js';
export type {
  Algorithm,
  CheckOptions,
  CheckResult,
  Comparison,
  GroupOptions,
  KeysOption,
  ListOptions,
  Match,
  MatchOptions,
  NormalizeOptions,
  Preset,
  StripRule,
  TextKey,
  Verdict,
  WeightedKey,
} from './types.js';
