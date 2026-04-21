# 🎯 Guess-Rater

[![npm version](https://img.shields.io/npm/v/guess-rater?logo=npm)](https://www.npmjs.com/package/guess-rater)
[![npm downloads](https://img.shields.io/npm/dm/guess-rater?logo=npm)](https://www.npmjs.com/package/guess-rater)
[![CI](https://img.shields.io/github/actions/workflow/status/Tfoucher5/guess-rater/ci.yml?branch=master&label=CI)](https://github.com/Tfoucher5/guess-rater/actions/workflows/ci.yml)
[![publish](https://img.shields.io/github/actions/workflow/status/Tfoucher5/guess-rater/publish.yml?branch=master&label=publish)](https://github.com/Tfoucher5/guess-rater/actions/workflows/publish.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![module: ESM](https://img.shields.io/badge/module-ESM-1f6feb)](./package.json)
[![GitHub stars](https://img.shields.io/github/stars/Tfoucher5/guess-rater?style=social)](https://github.com/Tfoucher5/guess-rater)
[![issues](https://img.shields.io/github/issues/Tfoucher5/guess-rater)](https://github.com/Tfoucher5/guess-rater/issues)

`guess-rater` est un moteur de comparaison de chaînes de caractères léger, modulaire et sans dépendance pour JavaScript.

Il permet de :

- normaliser des chaînes,
- calculer des scores de similarité,
- vérifier si deux chaînes correspondent,
- classer une liste de candidats,
- trouver la meilleure correspondance,
- combiner plusieurs stratégies de matching.

---

## ✨ Pourquoi Guess-Rater ?

- **Léger** : aucune dépendance externe
- **Flexible** : plusieurs algorithmes selon le contexte
- **Pratique** : API simple pour les cas courants, configurable pour les cas avancés
- **Polyvalent** : recherche tolérante, quiz, validation de formulaires, dédoublonnage, matching de produits, etc.
- **Rétrocompatible** : `getSimilarityScore(...)` reste disponible

---

## 📦 Installation

```bash
npm install guess-rater
```

---

## 🚀 Quick start

```js
import { rate, isMatch } from 'guess-rater';

const score = rate('Molière', 'Moliere');
console.log(score); // 100

console.log(isMatch('Saint-Nazaire', 'saint nazaire', 85)); // true
```

---

## 📚 API

### `rate(a, b, options?)`

Retourne un score de similarité sur 100.

```js
import { rate } from 'guess-rater';

const score = rate('Molière', 'Moliere');
console.log(score); // 100
```

---

### `getSimilarityScore(a, b, options?)`

Alias rétrocompatible de `rate`.

```js
import { getSimilarityScore } from 'guess-rater';

const score = getSimilarityScore(
  'Jean-Baptiste Poquelin',
  'jean baptiste poquelin'
);

console.log(score); // 100
```

---

### `isMatch(a, b, thresholdOrOptions?)`

Retourne `true` ou `false`.

```js
import { isMatch } from 'guess-rater';

console.log(isMatch('Molière', 'Moliere', 85)); // true
```

---

### `rankCandidates(input, candidates, options?)`

Classe les candidats du meilleur au moins bon.

```js
import { rankCandidates } from 'guess-rater';

const results = rankCandidates(
  'peugeot 208',
  [
    'Peugeot 308',
    '208 Peugeot',
    'Renault Clio'
  ],
  {
    algorithm: 'tokenSort'
  }
);

console.log(results);
/*
[
  { value: '208 Peugeot', score: 100, index: 1 },
  { value: 'Peugeot 308', score: 63.64, index: 0 },
  { value: 'Renault Clio', score: 8.33, index: 2 }
]
*/
```

---

### `findBestMatch(input, candidates, options?)`

Retourne la meilleure correspondance.

```js
import { findBestMatch } from 'guess-rater';

const best = findBestMatch(
  'moliere',
  [
    'Voltaire',
    'Moliere',
    'Victor Hugo'
  ]
);

console.log(best);
/*
{
  value: 'Moliere',
  score: 100,
  index: 1
}
*/
```

---

### `createMatcher(baseOptions)`

Crée une instance préconfigurée.

```js
import { createMatcher } from 'guess-rater';

const matcher = createMatcher({
  algorithm: 'jaroWinkler',
  threshold: 88,
  normalize: {
    removeAccents: true,
    removePunctuation: true
  }
});

console.log(matcher.rate('Molière', 'Moliere'));
console.log(matcher.isMatch('Saint-Nazaire', 'st nazaire'));
```

---

## 🧹 Normalisation

```js
import { normalize } from 'guess-rater';

const result = normalize('Jean-Baptiste Poquelin');
console.log(result); // "jean baptiste poquelin"
```

### Options de normalisation

```js
{
  caseSensitive: false,
  removeAccents: true,
  removePunctuation: true,
  punctuationStrategy: 'space',
  trim: true,
  collapseWhitespace: true,
  replacements: {},
  removeWords: [],
  sortTokens: false
}
```

### Exemple avec options avancées

```js
import { normalize } from 'guess-rater';

const result = normalize('La ville de Saint-Nazaire', {
  removeWords: ['la', 'de'],
  replacements: {
    st: 'saint'
  }
});

console.log(result); // "ville saint nazaire"
```

---

## 🔍 Algorithmes disponibles

### `levenshtein`
Bon choix pour les comparaisons générales caractère par caractère.

### `jaroWinkler`
Très utile pour les noms, prénoms et fautes légères.

### `tokenSort`
Pratique quand les mots sont les mêmes mais dans un ordre différent.

Exemple :
- `peugeot 208 active`
- `208 peugeot active`

### `tokenSet`
Utile quand une chaîne contient des mots supplémentaires.

Exemple :
- `Peugeot 208`
- `Peugeot 208 Active`

### `hybrid`
Combine plusieurs algorithmes avec des poids personnalisés.

---

## ⚙️ Exemple avancé

```js
import { rate } from 'guess-rater';

const result = rate('peugeot 208 active', '208 peugeot active', {
  algorithm: 'hybrid',
  explain: true,
  hybrid: {
    levenshtein: 0.2,
    jaroWinkler: 0.2,
    tokenSet: 0.6
  }
});

console.log(result);
/*
{
  score: 95.45,
  match: true,
  threshold: 80,
  algorithm: 'hybrid',
  input: 'peugeot 208 active',
  target: '208 peugeot active',
  normalizedLeft: 'peugeot 208 active',
  normalizedRight: '208 peugeot active',
  details: {
    normalize: { ... },
    hybrid: {
      levenshtein: { score: 52.94, weight: 0.2 },
      jaroWinkler: { score: 88.38, weight: 0.2 },
      tokenSet: { score: 100, weight: 0.6 }
    }
  }
}
*/
```

---

## 💡 Cas d’usage

`guess-rater` peut être utilisé pour :

- la validation de formulaires,
- la recherche tolérante,
- les quiz / jeux de saisie,
- le matching de noms de personnes,
- le rapprochement de produits,
- le nettoyage de données,
- les imports CSV,
- les bots et assistants,
- le dédoublonnage de listes.

---

## 🔄 Compatibilité

Le package conserve l’ancienne API :

- `getSimilarityScore(...)`
- `isMatch(...)`

Tu peux donc migrer progressivement vers la nouvelle API sans casser l’existant.

---

## 🛣️ Roadmap

Idées pour les prochaines versions :

- ajout de `damerauLevenshtein`
- presets (`personName`, `cityName`, `productTitle`, `quizAnswer`)
- `filterMatches(...)`
- mode batch / comparaison de listes
- typages TypeScript
- benchmarks et documentation avancée

---

## 🤝 Contribution

Les issues et suggestions sont les bienvenues :

- ouvrir une issue
- proposer une amélioration
- partager un cas d’usage concret

---

## 📄 Licence

MIT
