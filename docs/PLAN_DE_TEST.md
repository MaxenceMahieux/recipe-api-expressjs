# Plan de test — Recipe API

Document de référence pour la stratégie de tests **unitaires** de l'API de gestion de recettes.

---

## 1. Objectifs

- Vérifier que chaque module fonctionne correctement **en isolation**.
- Couvrir les chemins nominaux **et** les cas limites (entrées invalides, ressources absentes).
- Atteindre et maintenir une **couverture de code de 100 %** (lignes, branches, fonctions, instructions).
- Servir de filet de sécurité contre les régressions lors des évolutions.

## 2. Périmètre

### Dans le périmètre (tests unitaires)

| Module | Fichier | Responsabilité |
|--------|---------|----------------|
| Nutrition | `src/utils/nutrition.js` | Calcul nutritionnel à partir d'ingrédients |
| Modèle | `src/models/recipes.model.js` | Accès et mutation des données en mémoire |
| Contrôleur | `src/controllers/recipes.controller.js` | Logique métier des routes |
| Gestion d'erreurs | `src/middleware/errorHandler.js` | Middleware de gestion centralisée des erreurs |

### Hors périmètre

- Tests d'**intégration** des routes HTTP (Supertest) — non couverts par ce plan.
- Tests **end-to-end**.
- `src/server.js` : simple amorçage (`app.listen`), exclu de la couverture.
- `src/routes/recipes.routes.js` : déclaration de routes sans logique, exclu de la couverture.

## 3. Outils et environnement

- **Lanceur de tests** : Jest (`testEnvironment: node`).
- **Couverture** : `jest --coverage` (déjà configuré dans `npm test`).
- **Exécution** : `npm test`.
- **Node.js** : version du projet (voir `package.json`).

## 4. Stratégie de test

- **Isolation des dépendances** : dans les tests du contrôleur, le modèle (`recipes.model`) et l'utilitaire (`nutrition`) sont **mockés** avec `jest.mock(...)` afin de tester uniquement la logique du contrôleur.
- **Objet `res` simulé** : `res = { json: jest.fn(), status: jest.fn().mockReturnThis() }` pour vérifier les codes HTTP et les charges utiles renvoyées.
- **État du modèle** : le modèle charge les données du seed dans un tableau en mémoire au moment du `require`. Les tests qui mutent cet état (`create`, `update`, `delete`) doivent **réinitialiser le module** entre chaque test (`jest.resetModules()` + nouveau `require`, ou `jest.isolateModules`) pour rester indépendants de l'ordre d'exécution.
- **Données de test** : jeu de données issu de `data/seed.json` (20 recettes) ou objets construits à la volée dans chaque test.
- **Assertions** : un test = un comportement vérifié ; assertions explicites sur la valeur retournée, le statut HTTP et le corps de réponse.

## 5. Objectif de couverture

Couverture cible : **100 %** sur les 4 modules du périmètre. Seuil à imposer dans la configuration Jest (`package.json` → `jest.coverageThreshold`) :

```json
"coverageThreshold": {
  "global": { "branches": 100, "functions": 100, "lines": 100, "statements": 100 }
}
```

Fichiers exclus de la collecte de couverture : `src/server.js`, `src/routes/**`.

## 6. Convention de nommage

- Fichiers de test : `*.test.js`, placés à côté du module ou dans un dossier `__tests__/`.
- Identifiant de cas de test : `TC-<MODULE>-<NN>` (ex. `TC-NUT-01`).
- Structure : `describe('<module/fonction>')` → `it('devrait <comportement attendu>')`.

---

## 7. Cas de test

### 7.1 Nutrition — `calculateNutrition(ingredients)`

| ID | Scénario | Entrée | Résultat attendu |
|----|----------|--------|------------------|
| TC-NUT-01 | Argument absent | `undefined` | `{ totalCalories: 0, ingredientCount: 0 }` |
| TC-NUT-02 | Liste vide | `[]` | `{ totalCalories: 0, ingredientCount: 0 }` |
| TC-NUT-03 | Liste valide | 3 ingrédients (80 + 364 + 717) | `totalCalories = 1161`, `ingredientCount = 3` |
| TC-NUT-04 | Structure `perIngredient` | 1 ingrédient `{name, quantity, unit, calories}` | `perIngredient` = tableau de `{ name, calories }` uniquement |
| TC-NUT-05 | Ingrédient sans `calories` (cas limite) | `[{ name: 'x' }]` | `totalCalories = NaN` — **point de vigilance** : aucune validation des calories (voir §8) |

### 7.2 Modèle — `RecipeModel`

| ID | Fonction | Scénario | Entrée | Résultat attendu |
|----|----------|----------|--------|------------------|
| TC-MOD-01 | `findAll` | Liste initiale | — | Retourne les 20 recettes du seed |
| TC-MOD-02 | `findById` | Identifiant existant | `1` | Retourne la recette d'id 1 |
| TC-MOD-03 | `findById` | Identifiant en chaîne | `"2"` | Retourne la recette d'id 2 (`parseInt`) |
| TC-MOD-04 | `findById` | Identifiant inexistant | `999` | Retourne `undefined` |
| TC-MOD-05 | `create` | Données complètes | titre, ingrédients, steps, prepTime, category | Nouvelle recette avec `id` généré, `ratings: []`, `averageRating: 0` |
| TC-MOD-06 | `create` | Sans `ingredients` ni `steps` | titre, prepTime, category | `ingredients: []` et `steps: []` par défaut |
| TC-MOD-07 | `update` | Identifiant existant | `1`, `{ title: 'Nouveau' }` | Champ fusionné (`Object.assign`), recette retournée |
| TC-MOD-08 | `update` | Identifiant inexistant | `999`, `{...}` | Retourne `null` |
| TC-MOD-09 | `delete` | Identifiant existant | `1` | Retourne la recette supprimée ; absente de `findAll` ensuite |
| TC-MOD-10 | `delete` | Identifiant inexistant | `999` | Retourne `null` |

### 7.3 Contrôleur — `recipesController` (modèle et nutrition mockés)

| ID | Fonction | Scénario | Entrée | Résultat attendu |
|----|----------|----------|--------|------------------|
| TC-CTRL-01 | `getRecipes` | Sans filtre | `query = {}` | `200` + `{ success: true, data: <toutes> }` |
| TC-CTRL-02 | `getRecipes` | Filtre `category` | `query = { category: 'dessert' }` | Seules les recettes `dessert` retournées |
| TC-CTRL-03 | `getRecipes` | Filtre `maxTime` | `query = { maxTime: 30 }` | Seules les recettes `prepTime <= 30` |
| TC-CTRL-04 | `getRecipes` | Filtres combinés | `category` + `maxTime` | Intersection des deux filtres |
| TC-CTRL-05 | `getRecipeById` | Trouvée | `params.id = 1` | `200` + recette |
| TC-CTRL-06 | `getRecipeById` | Non trouvée | `params.id = 999` | `404` + `error: 'Recipe not found'` |
| TC-CTRL-07 | `createRecipe` | Champs valides | title, prepTime, category | `201` + recette créée |
| TC-CTRL-08 | `createRecipe` | `title` manquant | sans title | `400` + `error: 'Missing required fields: title, prepTime, category'` |
| TC-CTRL-09 | `createRecipe` | `prepTime` manquant | sans prepTime | `400` + message champs requis |
| TC-CTRL-10 | `createRecipe` | `category` manquant | sans category | `400` + message champs requis |
| TC-CTRL-11 | `updateRecipe` | Existante | id valide + body | `200` + recette mise à jour |
| TC-CTRL-12 | `updateRecipe` | Inexistante | `params.id = 999` | `404` + `error: 'Recipe not found'` |
| TC-CTRL-13 | `deleteRecipe` | Existante | id valide | `200` + recette supprimée |
| TC-CTRL-14 | `deleteRecipe` | Inexistante | `params.id = 999` | `404` + `error: 'Recipe not found'` |
| TC-CTRL-15 | `rateRecipe` | Recette inexistante | `params.id = 999` | `404` + `error: 'Recipe not found'` |
| TC-CTRL-16 | `rateRecipe` | Note manquante | `body = {}` | `400` + `error: 'Rating must be between 1 and 5'` |
| TC-CTRL-17 | `rateRecipe` | Note < 1 | `rating = 0` | `400` + même message |
| TC-CTRL-18 | `rateRecipe` | Note > 5 | `rating = 6` | `400` + même message |
| TC-CTRL-19 | `rateRecipe` | Note valide | `rating = 4` | Note ajoutée ; **attendu correct** : `averageRating = somme / nombre de notes` — **défaut présumé** dans le code (voir §8) |
| TC-CTRL-20 | `getNutrition` | Recette inexistante | `params.id = 999` | `404` + `error: 'Recipe not found'` |
| TC-CTRL-21 | `getNutrition` | Recette existante | id valide | `calculateNutrition` appelé avec `recipe.ingredients` ; `200` + données nutritionnelles |

### 7.4 Middleware d'erreur — `errorHandler(err, req, res, next)`

| ID | Scénario | Entrée | Résultat attendu |
|----|----------|--------|------------------|
| TC-ERR-01 | Erreur avec `status` | `{ status: 400, message: 'Bad input' }` | `res.status(400)` + `{ success: false, error: 'Bad input' }` |
| TC-ERR-02 | Erreur sans `status` ni `message` | `{}` | `res.status(500)` + `error: 'Internal server error'` |
| TC-ERR-03 | Erreur avec `message` sans `status` | `{ message: 'Boom' }` | `res.status(500)` + `error: 'Boom'` |

---

## 8. Anomalies présumées / points de vigilance

À surveiller — les cas de test ci-dessus décrivent le comportement **attendu** et révéleront ces écarts :

1. **Calcul de la moyenne des notes** (`recipes.controller.js`, `rateRecipe`) : la moyenne est calculée avec `sum / (recipe.ratings.length - 1)` au lieu de `sum / recipe.ratings.length`. Conséquence : résultat faux, et **division par zéro** (`Infinity`) lors de la toute première note. Le test TC-CTRL-19 doit cibler la formule correcte.
2. **Génération d'identifiant** (`recipes.model.js`, `create`) : `id = recipes.length + 1` peut produire des **collisions** après une suppression. À documenter / corriger si la création suit une suppression.
3. **Calories manquantes** (`nutrition.js`) : aucune validation, un ingrédient sans `calories` produit `NaN` (TC-NUT-05).

## 9. Critères d'entrée / sortie

- **Entrée** : code source compilable, dépendances installées (`npm install`).
- **Sortie (succès)** : tous les cas de test passent **et** couverture = 100 % sur le périmètre.
- **Échec** : tout test rouge ou couverture < seuil bloque la validation.

## 10. Exécution

```bash
npm test           # exécute Jest avec couverture
```

Le rapport de couverture est généré dans `coverage/` (consultable via `coverage/lcov-report/index.html`).
