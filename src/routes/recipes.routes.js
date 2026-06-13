const express = require('express');

const router = express.Router();
const recipesController = require('../controllers/recipes.controller');

router.get('/', recipesController.getRecipes);
router.post('/', recipesController.createRecipe);
router.get('/:id', recipesController.getRecipeById);
router.put('/:id', recipesController.updateRecipe);
router.delete('/:id', recipesController.deleteRecipe);
router.post('/:id/rate', recipesController.rateRecipe);
router.get('/:id/nutrition', recipesController.getNutrition);

module.exports = router;
