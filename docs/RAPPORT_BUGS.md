# Rapport de synthèse des bugs corrigés

> Projet : **recipe-api**
> Périmètre : commits marqués `:bug:` (🐛) de la branche `feat/test_utils`
> Date du rapport : 2026-06-17

Ce rapport détaille les **10 bugs** corrigés dans le projet, regroupés par couche applicative. Chaque correctif décrit le comportement fautif et la correction réellement apportée.

---

## 1. Couche utilitaire — calcul nutritionnel
**Fichier concerné : `src/utils/nutrition.js`**

### 1.1 — Calories non multipliées par la quantité
- **Commit :** `cf5a300`
- **Bug :** Le total des calories additionnait `ingredient.calories` sans tenir compte de la quantité. Une recette avec 3 unités d'un ingrédient à 100 kcal comptait 100 kcal au lieu de 300. Le détail `perIngredient` souffrait du même défaut.
- **Correction :** Le calcul utilise désormais `ingredient.calories * ingredient.quantity`, à la fois pour `totalCalories` (dans le `reduce`) et pour chaque entrée de `perIngredient`.

### 1.2 — Absence de validation des champs d'un ingrédient
- **Commit :** `dc5e5fc`
- **Bug :** La fonction `calculateNutrition` ne vérifiait pas la structure des ingrédients reçus. Un ingrédient incomplet (sans `name`, `quantity`, `unit` ou `calories`) produisait un calcul silencieusement faux (`NaN` / `undefined`).
- **Correction :** Ajout d'un contrôle des champs obligatoires `["name", "quantity", "unit", "calories"]` ; toute absence lève désormais une erreur explicite `Invalid ingredient`.

### 1.3 — Unité de mesure non contrôlée
- **Commit :** `94fe066`
- **Bug :** N'importe quelle valeur d'unité était acceptée, autorisant des unités incohérentes (ex. `"cuillère"`, `"xyz"`) sans rejet.
- **Correction :** Ajout d'une liste blanche `['kg', 'g', 'l', 'pièce', 'mL']`. Une unité hors de cette liste lève l'erreur `Invalid unit`.

### 1.4 — Types des champs non vérifiés
- **Commit :** `2c19484`
- **Bug :** La `quantity` pouvait être une chaîne et le `name` un autre type sans déclencher d'erreur, faussant les calculs (concaténation au lieu d'addition, etc.).
- **Correction :** Ajout de contrôles de type : `quantity` doit être un `number` (erreur `Invalid quantity`) et `name` doit être une `string` (erreur `Invalid name`).

### 1.5 — Comptage erroné des ingrédients
- **Commit :** `d6e2732`
- **Bug :** `ingredientCount` valait `ingredients.length`, comptant donc aussi les ingrédients de quantité nulle (`quantity === 0`), c'est-à-dire des ingrédients non réellement utilisés dans la recette.
- **Correction :** Introduction d'un compteur `ingredientCount` incrémenté uniquement lorsque `ingredient.quantity != 0`, puis retourné à la place de `ingredients.length`.

---

## 2. Couche modèle — accès aux recettes
**Fichier concerné : `src/models/recipes.model.js`**

### 2.1 — Identifiants non validés et recettes introuvables non gérées
- **Commit :** `629f525`
- **Bug :** `findById`, `update` et `delete` reposaient sur `parseInt(id, 10)` et renvoyaient `null` (ou rien) quand l'id était invalide ou inexistant, masquant les erreurs au lieu de les signaler.
- **Correction :** Ajout d'une fonction `validateId(id)` qui exige un entier positif (`typeof === 'number'`, `Number.isInteger`, `id >= 0`) sous peine d'erreur `wrong id format`. Les méthodes lèvent désormais `id not found` quand la recette n'existe pas, au lieu de renvoyer `null`.

### 2.2 — Création/mise à jour sans validation du format de recette
- **Commit :** `d2b7eed`
- **Bug :** `create` acceptait des recettes incomplètes (champs manquants comblés par des valeurs par défaut `|| []`) et autorisait les doublons de titre. `update` ne vérifiait ni les champs requis ni l'existence de l'id.
- **Correction :** Ajout de `validateRecipe(recipe, requiredFields)` qui impose la présence de tous les champs obligatoires (`title`, `ingredients`, `steps`, `prepTime`, `category`, et en plus `ratings`/`averageRating` pour `update`), sous peine d'erreur `Invalid recipe`. La création refuse aussi un titre déjà existant (`There is already a recipe with that title`), et les valeurs par défaut silencieuses ont été supprimées.

### 2.3 — Logique de validation d'id dupliquée
- **Commit :** `569378d`
- **Bug :** La vérification d'existence (`findIndex` + test `=== -1` + erreur `id not found`) était répétée dans `findById`, `update` et `delete`, source de redondance et de risque d'incohérence.
- **Correction :** `validateId` retourne désormais directement l'index trouvé (et lève `id not found` au besoin). Les trois méthodes appellent `const idx = validateId(id)` et réutilisent ce résultat, éliminant la duplication.

---

## 3. Couche contrôleur — API HTTP
**Fichier concerné : `src/controllers/recipes.controller.js`**

### 3.1 — Validation des entrées et moyenne des notes erronée
- **Commit :** `84812b9`
- **Bugs corrigés (3) :**
  1. **`maxTime` non typé** dans le filtrage : un `maxTime` non numérique était accepté. Ajout d'un contrôle `typeof maxTime != 'number'` renvoyant une erreur (`maxtime should be a number`).
  2. **Champs requis incomplets** à la création : seuls `title`, `prepTime` et `category` étaient exigés. La validation inclut désormais `ingredients` et `steps`, et rejette les tableaux vides (`ingredients.length == 0 || steps.length == 0`).
  3. **Moyenne des notes fausse** : `averageRating` était divisé par `recipe.ratings.length - 1` (erreur de type « off-by-one » faussant la moyenne, voire division par zéro à la première note). Corrigé en divisant par `recipe.ratings.length`.

### 3.2 — Absence de validation du format de l'id dans les routes
- **Commit :** `5530b06`
- **Bug :** Les handlers (`getRecipeById`, `updateRecipe`, `deleteRecipe`, `rateRecipe`, `getNutrition`) passaient `req.params.id` brut au modèle. Un id non numérique (ex. `/recipes/abc`) n'était pas intercepté avec un code HTTP adapté.
- **Correction :** Chaque handler convertit l'id via `parseInt(req.params.id)` et renvoie un **400** (`This id is not a number`) si `isNaN`, avant tout appel au modèle. L'id numérisé est ensuite transmis de façon cohérente au `RecipeModel`.

---

## Vue d'ensemble

| # | Commit | Bug | Fichier |
|---|--------|-----|---------|
| 1 | `cf5a300` | Calories non multipliées par la quantité | `src/utils/nutrition.js` |
| 2 | `dc5e5fc` | Champs d'ingrédient non validés | `src/utils/nutrition.js` |
| 3 | `94fe066` | Unité de mesure non contrôlée | `src/utils/nutrition.js` |
| 4 | `2c19484` | Types des champs non vérifiés | `src/utils/nutrition.js` |
| 5 | `d6e2732` | Comptage erroné des ingrédients (quantité 0) | `src/utils/nutrition.js` |
| 6 | `629f525` | Id non validés / recettes introuvables non gérées | `src/models/recipes.model.js` |
| 7 | `d2b7eed` | Format de recette non validé + doublons de titre | `src/models/recipes.model.js` |
| 8 | `569378d` | Validation d'id dupliquée (refactor) | `src/models/recipes.model.js` |
| 9 | `84812b9` | `maxTime`, champs requis, moyenne des notes (off-by-one) | `src/controllers/recipes.controller.js` |
| 10 | `5530b06` | Format de l'id non validé dans les routes | `src/controllers/recipes.controller.js` |
