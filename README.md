# 🎯 Guess-Rater

Un comparateur de chaînes de caractères ultra-rapide et tolérant aux fautes de frappe, idéal pour les blind tests, les quiz et les formulaires. Agnostique (Vanilla JS) et sans dépendances.

## 📦 Installation

```bash
npm install guess-rater
```

# 🚀 Utilisation rapide

```JavaScript
import { isMatch, getSimilarityScore } from 'guess-rater';

// 1. Obtenir un pourcentage de similarité
const score = getSimilarityScore("Architects", "architcts");
console.log(score); // 90

// 2. Vérifier une correspondance avec tolérance (défaut: 80%)
const match = isMatch("PLK", "pplk", 60);
console.log(match); // true
```

# ⚙️ Options avancées

Le package gère intelligemment la ponctuation et les accents par défaut, mais vous gardez le contrôle :

```JavaScript
isMatch("AC/DC", "ac dc"); // true (La ponctuation est gérée par défaut)

// Forcer la ponctuation stricte
isMatch("AC/DC", "ac dc", 80, { removePunctuation: false }); // false
```

# 📄 Licence

MIT