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
