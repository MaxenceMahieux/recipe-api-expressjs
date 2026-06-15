# Recipe API

API REST de gestion de recettes de cuisine développée avec Express.js.

## Installation

```bash
npm install
```

## Lancer le serveur

```bash
npm start
```

Le serveur démarre sur le port 3000 par défaut.

## Routes disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/recipes | Liste des recettes (filtres: `?category=dessert`, `?maxTime=30`) |
| GET | /api/recipes/:id | Détail d'une recette |
| POST | /api/recipes | Créer une recette |
| PUT | /api/recipes/:id | Modifier une recette |
| DELETE | /api/recipes/:id | Supprimer une recette |
| POST | /api/recipes/:id/rate | Noter une recette (1-5) |
| GET | /api/recipes/:id/nutrition | Calcul nutritionnel estimé |

## Format des requêtes

### Créer une recette (POST /api/recipes)
```json
{
  "title": "Tarte aux pommes",
  "ingredients": [
    { "name": "pomme", "quantity": 4, "unit": "pièce", "calories": 80 },
    { "name": "farine", "quantity": 200, "unit": "g", "calories": 364 }
  ],
  "steps": ["Éplucher les pommes", "Préparer la pâte", "Cuire 35 min"],
  "prepTime": 45,
  "category": "dessert"
}
```

### Noter une recette (POST /api/recipes/:id/rate)
```json
{ "rating": 4 }
```

## Format des réponses

Succès : `{ "success": true, "data": { ... } }`
Erreur : `{ "success": false, "error": "message" }`

## Convention de commits

Ce projet suit la convention **Gitmoji** : chaque message de commit commence par un emoji qui décrit la nature du changement, suivi d'une description courte en français.

### Format

```
<emoji> | <description à l'impératif>
```

- **Emoji** : indique le type de changement (voir le tableau ci-dessous). L'**emoji Unicode** (`🐛`) et son **shortcode** (`:bug:`) sont tous deux acceptés.
- **Séparateur** : une barre verticale entourée d'espaces ( ` | ` ) entre l'emoji et la description.
- **Description** : concise (≤ 50 caractères idéalement), à l'impératif présent, sans point final. La casse de la première lettre est libre (majuscule recommandée pour la lisibilité, mais le tout-minuscule est accepté).
- Un commit = un changement cohérent. On évite de mélanger plusieurs types dans un seul commit.

Un corps de message (optionnel) peut être ajouté après une ligne vide pour expliquer le **pourquoi** du changement.

### Emojis utilisés

| Emoji | Code | Quand l'utiliser |
|-------|------|------------------|
| ✨ | `:sparkles:` | Nouvelle fonctionnalité |
| 🐛 | `:bug:` | Correction de bug |
| ✅ | `:white_check_mark:` | Ajout ou mise à jour de tests |
| 🧪 | `:test_tube:` | Ajout ou mise à jour de tests (alternative à ✅) |
| ♻️ | `:recycle:` | Refactorisation (sans changement de comportement) |
| 📝 | `:memo:` | Documentation (README, commentaires) |
| 🎨 | `:art:` | Mise en forme / structure du code |
| 🔥 | `:fire:` | Suppression de code ou de fichiers |
| ⚡️ | `:zap:` | Amélioration des performances |
| 🚧 | `:construction:` | Travail en cours (work in progress) |
| ➕ | `:heavy_plus_sign:` | Ajout d'une dépendance |
| ➖ | `:heavy_minus_sign:` | Suppression d'une dépendance |
| 🔧 | `:wrench:` | Configuration (package.json, jest, CI...) |
| 🚀 | `:rocket:` | Déploiement |
| 🎉 | `:tada:` | Initialisation du projet |
| 🔀 | `:twisted_rightwards_arrows:` | Fusion de branches (commit de merge) |

### Exemples

```
✨ | Ajoute le filtrage des recettes par catégorie
🐛 | Rejette les notes en dehors de l'intervalle 1-5
✅ | Couvre le calcul nutritionnel par des tests unitaires
♻️ | Extrait la validation des recettes dans un module dédié
📝 | Documente la route POST /recipes/:id/rate
🔧 | Active la couverture de code dans la configuration Jest
```

Exemple avec corps de message :

```
🐛 | Corrige le calcul de la moyenne des notes

La moyenne était arrondie avant l'ajout de la nouvelle note,
ce qui faussait le résultat affiché côté API.
```
