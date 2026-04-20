/**
 * Calcule la distance de Levenshtein entre deux chaînes.
 * @param {string} a - La première chaîne.
 * @param {string} b - La deuxième chaîne.
 * @returns {number} Le nombre minimum d'opérations pour passer de 'a' à 'b'.
 */
export function getLevenshteinDistance(a, b) {
    // 1. Les cas de base (si un des mots est vide)
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // 2. Création de la matrice (le tableau à deux dimensions)
    const matrix = [];

    // 3. Initialisation de la première ligne et de la première colonne
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // 4. Remplissage de la matrice pour calculer les coûts
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
        
        // Si les deux lettres sont identiques, ça ne coûte rien (0 opération)
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
        } else {
            // Si les lettres sont différentes, on cherche l'opération la moins coûteuse
            matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Coût d'une SUBSTITUTION (remplacer une lettre)
            matrix[i][j - 1] + 1,     // Coût d'une INSERTION (ajouter une lettre)
            matrix[i - 1][j] + 1      // Coût d'une SUPPRESSION (enlever une lettre)
            );
        }
        }
    }

    // 5. Le résultat final se trouve dans la toute dernière case de la matrice
    return matrix[b.length][a.length];
}