# 🎯 Guess-Rater

`guess-rater` est un moteur de comparaison de chaînes de caractères léger et performant. Il permet de calculer la similarité entre deux entrées en appliquant des algorithmes de distance (Levenshtein) combinés à une normalisation configurable.

## ✨ Points forts

* 🚀 **Ultra-léger** : Aucune dépendance externe.
* 🛠 **Flexible** : Conçu pour être étendu avec de nouveaux paramètres de normalisation.
* 🧩 **Agnostique** : Fonctionne partout (Navigateur, Node.js, SvelteKit, React, etc.).

## 🚀 Installation

```bash
npm install guess-rater
```

## 📖 Exemples d'utilisation

Comparaison standard

```JavaScript
import { getSimilarityScore } from 'guess-rater';

// Idéal pour la validation de formulaires ou la recherche intuitive
const score = getSimilarityScore("Jean-Baptiste Poquelin", "jean baptiste poquelin");
console.log(score); // 100 (grâce à la normalisation par défaut)
Logique de correspondance (Match)
JavaScript
import { isMatch } from 'guess-rater';

// Vérifie si l'entrée utilisateur est assez proche de la référence
if (isMatch("Molière", "Moliere", 85)) {
  console.log("Correspondance trouvée !");
}
```