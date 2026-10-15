# Contribuer à guess-rater

Merci de l'intérêt que vous portez au projet !

## Installation locale

1. Forkez le repo puis clonez votre fork.
2. Installez les dépendances : `npm install`.

## Structure

- `src/` : sources TypeScript (`distance.ts` pour les algorithmes bruts, `normalize.ts` pour le nettoyage du texte, `engine.ts` pour le calcul des scores, `matcher.ts` pour l'API publique).
- `tests/` : tests `node:test` exécutés sur le build (`dist/`), plus `types.ts` pour les tests de types.
- `bench/` : micro-benchmarks (`npm run bench`).
- `docs/` : documentation VitePress (`npm run docs:dev`).

## Avant d'ouvrir une PR

```sh
npm run typecheck
npm test
```

`npm test` reconstruit `dist/` (ESM + CommonJS) avant de lancer les tests.

## Pull Requests

1. Créez une branche pour votre changement.
2. Décrivez ce qui change pour l'utilisateur du package.
3. Ajoutez une entrée dans `docs/guide/changelog.md`.
