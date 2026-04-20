// test.js
import { isMatch, getSimilarityScore } from './src/index.js';

// Couleurs pour la console (pour faire propre)
const COLORS = { green: '\x1b[32m', red: '\x1b[31m', reset: '\x1b[0m', yellow: '\x1b[33m' };

let testsPassed = 0;
let testsFailed = 0;

// Fonction utilitaire pour exécuter un test et vérifier le résultat attendu
function assertTest(testName, execution, expectedResult) {
    try {
        const result = execution();
        if (result === expectedResult) {
        console.log(`${COLORS.green}✔ [SUCCÈS]${COLORS.reset} ${testName}`);
        testsPassed++;
        } else {
        console.error(`${COLORS.red}✖ [ÉCHEC]${COLORS.reset} ${testName}`);
        console.error(`    Attendu : ${expectedResult} | Reçu : ${result}`);
        testsFailed++;
        }
    } catch (error) {
        console.error(`${COLORS.red}✖ [CRASH]${COLORS.reset} ${testName}`);
        console.error(`    Erreur : ${error.message}`);
        testsFailed++;
    }
    }

    // Fonction pour tester qu'une erreur est bien déclenchée
    function assertThrows(testName, execution, expectedErrorType) {
    try {
        execution();
        console.error(`${COLORS.red}✖ [ÉCHEC]${COLORS.reset} ${testName}`);
        console.error(`    Le code aurait dû crasher mais ne l'a pas fait.`);
        testsFailed++;
    } catch (error) {
        if (error instanceof expectedErrorType) {
        console.log(`${COLORS.green}✔ [SUCCÈS]${COLORS.reset} ${testName} (Erreur correctement interceptée)`);
        testsPassed++;
        } else {
        console.error(`${COLORS.red}✖ [ÉCHEC]${COLORS.reset} ${testName}`);
        console.error(`    Mauvais type d'erreur. Attendu: ${expectedErrorType.name}, Reçu: ${error.name}`);
        testsFailed++;
        }
    }
}

console.log(`${COLORS.yellow}=== DÉMARRAGE DES TESTS : GUESS-RATER v1.0.0 ===${COLORS.reset}\n`);

// 1. Tests de Base (Scores)
assertTest("Score parfait: Mots identiques", () => getSimilarityScore("Minecraft", "Minecraft"), 100);
assertTest("Score parfait: Différence de casse", () => getSimilarityScore("mInEcRaFt", "Minecraft"), 100);
assertTest("Distance Levenshtein 1 faute", () => getSimilarityScore("PLK", "pl"), 66.67); // 1 erreur sur 3 lettres

// 2. Tests de la fonction isMatch (Tolérance)
assertTest("Match accepté (Seuil 80%, Score 90%)", () => isMatch("Architects", "Architcts", 80), true);
assertTest("Match refusé (Seuil 91%, Score 90%)", () => isMatch("Architects", "Architcts", 91), false);
assertTest("Match avec espaces bizarres", () => isMatch("Holy Priest", "  holy    priest  "), true);

// 3. Tests des Options (Ponctuation)
assertTest("Options: Suppression de la ponctuation (Défaut)", () => isMatch("AC/DC", "ac dc"), true);
assertTest("Options: Ponctuation stricte (Désactivé)", () => isMatch("AC/DC", "ac dc", 85, { removePunctuation: false }), false);

// 4. Tests de GESTION D'ERREURS (Robustesse)
assertThrows("Erreur: Le paramètre 'expected' est null", () => getSimilarityScore(null, "test"), TypeError);
assertThrows("Erreur: Le paramètre 'input' est un nombre", () => getSimilarityScore("test", 123), TypeError);
assertThrows("Erreur: Le seuil (threshold) est invalide", () => isMatch("a", "a", 150), RangeError);
assertThrows("Erreur: Le seuil (threshold) est un texte", () => isMatch("a", "a", "quatre-vingt"), RangeError);

// Résumé
console.log(`\n${COLORS.yellow}=== RÉSUMÉ ===${COLORS.reset}`);
console.log(`Passés: ${COLORS.green}${testsPassed}${COLORS.reset} | Échoués: ${COLORS.red}${testsFailed}${COLORS.reset}`);