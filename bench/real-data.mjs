// Accuracy and speed on real public datasets. Run with `npm run bench:real`.
//
// Datasets (downloaded once into bench/.data/):
// - 32k Spotify tracks (TidyTuesday 2020-01-21)
// - 170k world cities (lutangar/cities.json, from GeoNames)
// - the 20k most frequent English words (Peter Norvig's count_1w.txt)
//
// Optional comparisons, if installed (`npm i --no-save fuse.js string-similarity`):
// Fuse.js for search, string-similarity for answer checking.
// Set GUESS_RATER_V1=/path/to/v1/src/index.js to compare with guess-rater 1.x.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { createIndex, createMatcher, closest } from '../dist/esm/index.js';

const DATA = new URL('./.data/', import.meta.url);
const SOURCES = {
  'spotify.csv':
    'https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2020/2020-01-21/spotify_songs.csv',
  'cities.json': 'https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json',
  'count_1w.txt': 'https://raw.githubusercontent.com/norvig/pytudes/main/data/text/count_1w.txt',
};

async function load(name) {
  const file = new URL(name, DATA);
  if (!existsSync(file)) {
    mkdirSync(DATA, { recursive: true });
    process.stdout.write(`Downloading ${name}... `);
    const response = await fetch(SOURCES[name]);
    if (!response.ok) throw new Error(`${response.status} for ${SOURCES[name]}`);
    writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    console.log('done');
  }
  return readFileSync(file, 'utf8');
}

async function optional(name) {
  try {
    const mod = await import(name);
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

// --- Helpers ----------------------------------------------------------------

let seed = 1;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (list) => list[Math.floor(random() * list.length)];
const sample = (list, n) => Array.from({ length: n }, () => pick(list));

const KEYBOARD = 'azertyuiopqsdfghjklmwxcvbn';
/** One realistic typo: missing, doubled, swapped or wrong letter. */
function typo(text) {
  const letters = [...text].map((c, i) => (/\p{L}/u.test(c) ? i : -1)).filter((i) => i >= 0);
  if (letters.length < 2) return text;
  const i = pick(letters);
  const kind = Math.floor(random() * 4);
  if (kind === 0) return text.slice(0, i) + text.slice(i + 1);
  if (kind === 1) return text.slice(0, i) + text[i] + text.slice(i);
  if (kind === 2 && i + 1 < text.length) return text.slice(0, i) + text[i + 1] + text[i] + text.slice(i + 2);
  return text.slice(0, i) + pick(KEYBOARD) + text.slice(i + 1);
}

function time(fn) {
  const start = performance.now();
  const result = fn();
  return { ms: performance.now() - start, result };
}

const pct = (n, total) => `${((100 * n) / total).toFixed(1)} %`;
const us = (ms, n) => `${((1000 * ms) / n).toFixed(1)} µs`;
const rows = [];
function report(dataset, metric, value) {
  rows.push({ dataset, metric, value });
  console.log(`  ${metric.padEnd(52)} ${value}`);
}

function parseCsv(text) {
  const out = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); out.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  return out;
}

// --- 1. Blind test on Spotify tracks ------------------------------------------

async function blindTest() {
  const [header, ...lines] = parseCsv(await load('spotify.csv'));
  const col = (name) => header.indexOf(name);
  const seen = new Set();
  const songs = [];
  for (const line of lines) {
    const title = line[col('track_name')];
    const artist = line[col('track_artist')];
    const key = `${title}|${artist}`;
    if (!title || !artist || seen.has(key)) continue;
    seen.add(key);
    songs.push({ title, artist });
  }
  console.log(`\nBlind test: ${songs.length} Spotify tracks`);

  // What a player would type: the core title, as remembered, with typos.
  const core = (title) => title.split(/\s[-–]\s|\s?[([]/)[0].trim();
  const guessOf = (title) => {
    let guess = core(title).toLowerCase();
    if (random() < 0.5) guess = guess.normalize('NFD').replace(/\p{M}/gu, '');
    if (random() < 0.5) guess = guess.replace(/[^\p{L}\p{N}\s]/gu, '');
    const typos = guess.length < 6 ? 0 : guess.length < 12 ? (random() < 0.6 ? 1 : 0) : Math.floor(random() * 3);
    for (let t = 0; t < typos; t += 1) guess = typo(guess);
    return guess;
  };

  const games = sample(songs, 3000).map((song) => ({
    song,
    guess: guessOf(song.title),
    other: pick(songs),
  }));
  const quiz = createMatcher({ preset: 'music' });

  const right = time(() => games.filter((g) => quiz.check(g.guess, g.song.title).correct).length);
  const close = games.filter((g) => quiz.check(g.guess, g.song.title).verdict === 'close').length;
  const wrong = games.filter((g) => g.other.title !== g.song.title && core(g.other.title).toLowerCase() !== core(g.song.title).toLowerCase());
  const falsePositives = wrong.filter((g) => quiz.check(g.guess, g.other.title).correct).length;

  report('Spotify', 'guesses accepted (typos, accents, no "feat", no "Remaster")', pct(right.result, games.length));
  report('Spotify', 'guesses rated "close"', pct(close, games.length));
  report('Spotify', 'wrong songs accepted (random other title)', pct(falsePositives, wrong.length));
  report('Spotify', 'check() per guess', us(right.ms, games.length));

  const v1 = process.env.GUESS_RATER_V1 ? await import(process.env.GUESS_RATER_V1) : null;
  if (v1) {
    const accepted = games.filter((g) => v1.isMatch(g.guess, g.song.title)).length;
    const fp = wrong.filter((g) => v1.isMatch(g.guess, g.other.title)).length;
    report('Spotify', 'guess-rater 1.x isMatch(): guesses accepted', pct(accepted, games.length));
    report('Spotify', 'guess-rater 1.x isMatch(): wrong songs accepted', pct(fp, wrong.length));
  }
  const ss = await optional('string-similarity');
  if (ss) {
    const ok = (a, b) => ss.compareTwoStrings(a.toLowerCase(), b.toLowerCase()) >= 0.8;
    report('Spotify', 'string-similarity ≥ 0.8: guesses accepted', pct(games.filter((g) => ok(g.guess, g.song.title)).length, games.length));
    report('Spotify', 'string-similarity ≥ 0.8: wrong songs accepted', pct(wrong.filter((g) => ok(g.guess, g.other.title)).length, wrong.length));
  }

  // Search as you type over the whole catalog.
  const build = time(() => createIndex(songs, { keys: ['title', 'artist'], preset: 'search' }));
  const index = build.result;
  report('Spotify', `createIndex() on ${songs.length} songs`, `${build.ms.toFixed(0)} ms`);

  const queries = sample(songs, 300).map((s) => {
    const words = core(s.title).toLowerCase().split(' ');
    const prefix = words.slice(0, 2).join(' ');
    return { song: s, query: prefix.slice(0, Math.max(4, Math.ceil(prefix.length * 0.7))) };
  });
  const searched = time(() => queries.map((q) => index.search(q.query, { limit: 10 })));
  const found = queries.filter((q, i) => searched.result[i].some((m) => m.item.title === q.song.title)).length;
  report('Spotify', 'search(): wanted song in top 10 (partial query)', pct(found, queries.length));
  report('Spotify', 'search() per keystroke, whole catalog', `${(searched.ms / queries.length).toFixed(1)} ms`);

  const Fuse = await optional('fuse.js');
  if (Fuse) {
    const fuseBuild = time(() => new Fuse(songs, { keys: ['title', 'artist'] }));
    const fuseSearch = time(() => queries.map((q) => fuseBuild.result.search(q.query, { limit: 10 })));
    const fuseFound = queries.filter((q, i) => fuseSearch.result[i].some((r) => r.item.title === q.song.title)).length;
    report('Spotify', 'Fuse.js: wanted song in top 10', pct(fuseFound, queries.length));
    report('Spotify', 'Fuse.js: search per keystroke', `${(fuseSearch.ms / queries.length).toFixed(1)} ms`);
  }
}

// --- 2. World cities -----------------------------------------------------------

async function cities() {
  const all = JSON.parse(await load('cities.json')).map((c) => c.name);
  const names = [...new Set(all)];
  console.log(`\nCities: ${names.length} unique city names`);

  const build = time(() => createIndex(names, { preset: 'search' }));
  report('Cities', `createIndex() on ${names.length} names`, `${build.ms.toFixed(0)} ms`);

  const targets = sample(names.filter((n) => n.length >= 6), 200);
  const queries = targets.map((n) => typo(n.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')));
  const searched = time(() => queries.map((q) => build.result.search(q, { limit: 5 })));
  const found = targets.filter((t, i) => searched.result[i].some((m) => m.item === t)).length;
  report('Cities', 'typo + no accents: right city in top 5', pct(found, targets.length));
  report('Cities', 'search() per query, 170k names', `${(searched.ms / queries.length).toFixed(1)} ms`);
}

// --- 3. Spelling suggestions -----------------------------------------------------

async function spelling() {
  const words = (await load('count_1w.txt')).split('\n').slice(0, 20000).map((l) => l.split('\t')[0]).filter(Boolean);
  console.log(`\nSpelling: ${words.length} most frequent English words`);
  const index = createIndex(words, { threshold: 60 });
  const targets = sample(words.filter((w) => w.length >= 5 && /^[a-z]+$/.test(w)), 1000);
  const misspelled = targets.map(typo);
  const suggested = time(() => misspelled.map((m) => index.closest(m)?.item));
  const top1 = targets.filter((t, i) => suggested.result[i] === t).length;
  const top3 = targets.filter((t, i) => index.search(misspelled[i], { limit: 3 }).some((m) => m.item === t)).length;
  report('Spelling', 'one typo: right word first ("did you mean")', pct(top1, targets.length));
  report('Spelling', 'one typo: right word in top 3', pct(top3, targets.length));
  report('Spelling', 'closest() per word, 20k words', `${(suggested.ms / targets.length).toFixed(2)} ms`);
  report('Spelling', 'closest() without an index, 20k words', `${time(() => closest(misspelled[0], words, { threshold: 60 })).ms.toFixed(1)} ms`);
}

await blindTest();
await cities();
await spelling();

if (process.env.BENCH_JSON) writeFileSync(process.env.BENCH_JSON, JSON.stringify(rows, null, 2));
console.log(`\nNode ${process.version}, ${process.platform} ${process.arch}`);
