const recipesController = require('./recipes.controller');
const RecipeModel = require('../models/recipes.model');
const { calculateNutrition } = require('../utils/nutrition');

jest.mock('../models/recipes.model');
jest.mock('../utils/nutrition');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  ...overrides,
});

describe('Test des controllers de recettes', () => {
  describe('Test de getRecipes', () => {
    const allRecipes = [
      { id: 1, category: 'dessert', prepTime: 30 },
      { id: 2, category: 'plat', prepTime: 10 },
      { id: 3, category: 'dessert', prepTime: 5 },
    ];

    beforeEach(() => {
      RecipeModel.findAll.mockReturnValue([...allRecipes]);
    });

    it('Devrait retourner toutes les recettes sans filtre', () => {
      const req = mockReq();
      const res = mockRes();

      recipesController.getRecipes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: allRecipes,
      });
    });

    it('Devrait filtrer par category', () => {
      const req = mockReq({ query: { category: 'dessert' } });
      const res = mockRes();

      recipesController.getRecipes(req, res);

      const { data } = res.json.mock.calls[0][0];
      expect(data.every((r) => r.category === 'dessert')).toBe(true);
    });

    it('Devrait retourner que des recettes avec un temps de préparation inférieur à 5 minutes', () => {
      const req = mockReq({ query: { maxTime: 5 } });
      const res = mockRes();

      recipesController.getRecipes(req, res);

      const { data } = res.json.mock.calls[0][0];
      expect(data.every((r) => r.prepTime <= 5)).toBe(true);
    });

    it('Devrait retourner une erreur', () => {
      const req = mockReq({ query: { maxTime: '5min' } });
      const res = mockRes();

      recipesController.getRecipes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'maxtime should be a number',
      });
    });
  });

  describe('Test de getRecipeById', () => {
    it('Devrait retourner la recette', () => {
      RecipeModel.findById.mockReturnValue({ id: 1, title: 'Tarte' });
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();

      recipesController.getRecipeById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, title: 'Tarte' },
      });
    });

    it('Devrait retourner une 404 si la recette est introuvable', () => {
      RecipeModel.findById.mockReturnValue(null);
      const req = mockReq({ params: { id: '999' } });
      const res = mockRes();

      recipesController.getRecipeById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found',
      });
    });
  });

  describe('Test de createRecipe', () => {
    it('Devrait retourner 400 si title manquant', () => {
      const req = mockReq({ body: { prepTime: 20, category: 'plat' } });
      const res = mockRes();

      recipesController.createRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retourne 400 si prepTime manquant', () => {
      const req = mockReq({ body: { title: 'Soupe', category: 'plat' } });
      const res = mockRes();

      recipesController.createRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('Devrait retourner une 400 si ingredients & steps manquant', () => {
      RecipeModel.create.mockReturnValue({
        id: 42,
        title: 'Soupe',
        prepTime: 20,
        category: 'plat',
      });
      const req = mockReq({
        body: { title: 'Soupe', prepTime: 20, category: 'plat' },
      });
      const res = mockRes();

      recipesController.createRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('Devrait créer une recette avec tous les champs', () => {
      const newRecipe = {
        id: 5,
        title: 'Soupe',
        ingredients: [],
        steps: [],
        prepTime: 20,
        category: 'plat',
      };
      RecipeModel.create.mockReturnValue(newRecipe);
      const req = mockReq({ body: newRecipe });
      const res = mockRes();

      recipesController.createRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: newRecipe });
    });
  });

  describe('Test de rateRecipe', () => {
    const baseRecipe = () => ({
      id: 1,
      title: 'Tarte',
      ratings: [4, 5],
      averageRating: 4.5,
    });

    it('devrait retourner 404 si recette introuvable', () => {
      RecipeModel.findById.mockReturnValue(null);
      const req = mockReq({ params: { id: '1' }, body: { rating: 3 } });
      const res = mockRes();

      recipesController.rateRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si rating hors limites', () => {
      RecipeModel.findById.mockReturnValue(baseRecipe());
      const req = mockReq({ params: { id: '1' }, body: { rating: 6 } });
      const res = mockRes();

      recipesController.rateRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner une moyenne correcte', () => {
      const recipe = baseRecipe();
      RecipeModel.findById.mockReturnValue(recipe);
      const req = mockReq({ params: { id: '1' }, body: { rating: 3 } });
      const res = mockRes();

      recipesController.rateRecipe(req, res);

      const { data } = res.json.mock.calls[0][0];
      expect(data.averageRating).toBe(4.0);
    });
  });

  describe('Test de getNutrition', () => {
    it('Devrait retourner la nutrition de la recette', () => {
      RecipeModel.findById.mockReturnValue({
        id: 14,
        title: 'Smoothie banane',
        ingredients: [
          { name: 'banane', quantity: 2, unit: 'pièce', calories: 89 },
          { name: 'lait', quantity: 200, unit: 'mL', calories: 42 },
          { name: 'miel', quantity: 20, unit: 'g', calories: 304 },
        ],
        steps: ['Mixer les ingrédients', 'Servir frais'],
        prepTime: 5,
        category: 'boisson',
        ratings: [4, 5, 4],
        averageRating: 4.33,
      });
      calculateNutrition.mockReturnValue({
        totalCalories: 14658,
        ingredientCount: 3,
        perIngredient: [
          { name: 'banane', calories: 178 },
          { name: 'lait', calories: 8400 },
          { name: 'miel', calories: 6080 },
        ],
      });
      const req = mockReq({ params: { id: '14' } });
      const res = mockRes();

      recipesController.getNutrition(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalCalories: 14658,
          ingredientCount: 3,
          perIngredient: [
            { name: 'banane', calories: 178 },
            { name: 'lait', calories: 8400 },
            { name: 'miel', calories: 6080 },
          ],
        },
      });
    });

    it('Devrait retourner une 404 si la recette est introuvable', () => {
      RecipeModel.findById.mockReturnValue(null);
      const req = mockReq({ params: { id: '999' } });
      const res = mockRes();

      recipesController.getNutrition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found',
      });
    });
  });

  describe('Test de deleteRecipe', () => {
    it('Devrait supprimer la recette', () => {
      RecipeModel.delete.mockReturnValue({ id: 1, title: 'Tarte' });
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();

      recipesController.deleteRecipe(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, title: 'Tarte' },
      });
    });

    it('Devrait retourner une 404 si la recette est introuvable', () => {
      RecipeModel.delete.mockReturnValue(null);
      const req = mockReq({ params: { id: '999' } });
      const res = mockRes();

      recipesController.deleteRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found',
      });
    });
  });

  describe('Test de updateRecipe', () => {
    it('Devrait modifier la recette', () => {
      RecipeModel.findById.mockReturnValue({
        id: 1,
        title: 'Tarte',
        prepTime: 70,
      });
      RecipeModel.update.mockReturnValue({
        id: 1,
        title: 'Tarte',
        prepTime: 70,
      });
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();

      recipesController.updateRecipe(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 1,
          title: 'Tarte',
          prepTime: 70,
        },
      });
    });

    it('Devrait retourner une 404 si la recette est introuvable', () => {
      RecipeModel.findById.mockReturnValue(null);
      const req = mockReq({ params: { id: '999' } });
      const res = mockRes();

      recipesController.updateRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found',
      });
    });
  });
});
