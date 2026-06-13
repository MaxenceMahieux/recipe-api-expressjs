const RecipeModel = require('../models/recipes.model');

describe('Test du modèle de recette', () => {
  describe('Test de findAll()', () => {
    it("ne devrait pas retourner d'erreur", () => {
      expect(() => RecipeModel.findAll()).not.toThrow('No recipes found');
    });
    it('devrait pas retourner au moins une recette', () => {
      const r = RecipeModel.findAll();
      expect(r.length > 0).toEqual(true);
    });
  });

  describe('Test de findById()', () => {
    it('devrait retourner une recette', () => {
      expect(RecipeModel.findById(14)).toEqual({
        averageRating: 4.33,
        category: 'boisson',
        id: 14,
        ingredients: [
          { calories: 89, name: 'banane', quantity: 2, unit: 'pièce' },
          { calories: 42, name: 'lait', quantity: 200, unit: 'mL' },
          { calories: 304, name: 'miel', quantity: 20, unit: 'g' },
        ],
        prepTime: 5,
        ratings: [4, 5, 4],
        steps: ['Mixer les ingrédients', 'Servir frais'],
        title: 'Smoothie banane',
      });
    });
    it('avec un id inexistant devrait retourner une erreur', () => {
      expect(RecipeModel.findById(1000)).toThrow('id not found');
    });
    it('avec un id invalide devrait retourner une erreur', () => {
      expect(RecipeModel.findById(-1)).toThrow('wrong id format');
      expect(
        RecipeModel.findById('12345678-1234-5678-1234-567812345678 '),
      ).toThrow('wrong id format');
      expect(RecipeModel.findById(1.2)).toThrow('wrong id format');
    });
  });

  describe('Test de create()', () => {
    it('devrait rajouter une recette', () => {
      const receiptNumberBefore = RecipeModel.findAll().length;
      RecipeModel.create({
        title: 'Tarte aux pommes',
        ingredients: [
          { name: 'pomme', quantity: 4, unit: 'pièce', calories: 80 },
          { name: 'farine', quantity: 200, unit: 'g', calories: 364 },
        ],
        steps: ['Éplucher les pommes', 'Préparer la pâte', 'Cuire 35 min'],
        prepTime: 45,
        category: 'dessert',
      });
      const receiptNumberAfter = RecipeModel.findAll().length;
      expect(receiptNumberAfter === receiptNumberBefore + 1).toEqual(true);
    });
    it('deux recettes ne devrait pas porter le même titre', () => {
      expect(() =>
        RecipeModel.create({
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 150, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          category: 'dessert',
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toThrow('There is already a recipe with that title');
    });
    it('avec une recette incomplète devrait retourner une erreur', () => {
      expect(() =>
        RecipeModel.create({
          ingredients: [
            { name: 'pomme', quantity: 4, unit: 'pièce', calories: 80 },
            { name: 'farine', quantity: 200, unit: 'g', calories: 364 },
          ],
          steps: ['Éplucher les pommes', 'Préparer la pâte', 'Cuire 35 min'],
          prepTime: 45,
          category: 'dessert',
        }),
      ).toThrow('Invalid recipe');
      expect(() =>
        RecipeModel.create({
          title: 'Tarte aux pommes',
          steps: ['Éplucher les pommes', 'Préparer la pâte', 'Cuire 35 min'],
          prepTime: 45,
          category: 'dessert',
        }),
      ).toThrow('Invalid recipe');
      expect(() =>
        RecipeModel.create({
          title: 'Tarte aux pommes',
          ingredients: [
            { name: 'pomme', quantity: 4, unit: 'pièce', calories: 80 },
            { name: 'farine', quantity: 200, unit: 'g', calories: 364 },
          ],
          prepTime: 45,
          category: 'dessert',
        }),
      ).toThrow('Invalid recipe');
      expect(() =>
        RecipeModel.create({
          title: 'Tarte aux pommes',
          ingredients: [
            { name: 'pomme', quantity: 4, unit: 'pièce', calories: 80 },
            { name: 'farine', quantity: 200, unit: 'g', calories: 364 },
          ],
          steps: ['Éplucher les pommes', 'Préparer la pâte', 'Cuire 35 min'],
          category: 'dessert',
        }),
      ).toThrow('Invalid recipe');
      expect(() =>
        RecipeModel.create({
          title: 'Tarte aux pommes',
          ingredients: [
            { name: 'pomme', quantity: 4, unit: 'pièce', calories: 80 },
            { name: 'farine', quantity: 200, unit: 'g', calories: 364 },
          ],
          steps: ['Éplucher les pommes', 'Préparer la pâte', 'Cuire 35 min'],
          prepTime: 45,
        }),
      ).toThrow('Invalid recipe');
    });
  });

  describe('Test de update()', () => {
    const validRecipe = {
      title: 'Riz sauté',
      ingredients: [
        { name: 'riz', quantity: 200, unit: 'g', calories: 130 },
        { name: 'oeuf', quantity: 2, unit: 'pièce', calories: 70 },
        { name: 'légumes', quantity: 150, unit: 'g', calories: 50 },
      ],
      steps: [
        'Cuire le riz',
        'Faire sauter avec les ingrédients',
        'Assaisonner',
      ],
      prepTime: 25,
      category: 'plat',
      ratings: [4, 3, 4],
      averageRating: 3.67,
    };
    it('devrait retourner la recette mise à jour', () => {
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          category: 'dessert',
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toEqual({
        id: 19,
        title: 'Brownie',
        ingredients: [
          { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
          { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
          { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
        ],
        steps: [
          'Faire fondre le chocolat',
          'Mélanger les ingrédients',
          'Cuire 25 min',
        ],
        prepTime: 40,
        category: 'dessert',
        ratings: [5, 5, 5],
        averageRating: 5,
      });
    });
    it('devrait mettre à jour la recette', () => {
      RecipeModel.update(20, {
        title: 'Sandwich jambon beurre',
        ingredients: [
          { name: 'pain', quantity: 1, unit: 'pièce', calories: 265 },
          { name: 'jambon', quantity: 150, unit: 'g', calories: 145 },
          { name: 'beurre', quantity: 50, unit: 'g', calories: 717 },
        ],
        steps: [
          'Couper le pain',
          'Ajouter le jambon et le beurre',
          'Assembler',
        ],
        prepTime: 5,
        category: 'plat',
        ratings: [4, 4, 4],
        averageRating: 4,
      });
      expect(RecipeModel.findById(20)).toEqual({
        id: 20,
        title: 'Sandwich jambon beurre',
        ingredients: [
          { name: 'pain', quantity: 1, unit: 'pièce', calories: 265 },
          { name: 'jambon', quantity: 150, unit: 'g', calories: 145 },
          { name: 'beurre', quantity: 50, unit: 'g', calories: 717 },
        ],
        steps: [
          'Couper le pain',
          'Ajouter le jambon et le beurre',
          'Assembler',
        ],
        prepTime: 5,
        category: 'plat',
        ratings: [4, 4, 4],
        averageRating: 4,
      });
    });
    it('avec un id inexistant devrait retourner une erreur', () => {
      expect(RecipeModel.findById(1000, validRecipe)).toThrow('id not found');
    });
    it('avec un id invalide devrait retourner une erreur', () => {
      expect(RecipeModel.findById(-1, validRecipe)).toThrow('wrong id format');
      expect(
        RecipeModel.findById(
          '12345678-1234-5678-1234-567812345678',
          validRecipe,
        ),
      ).toThrow('wrong id format');
      expect(RecipeModel.findById(1.2, validRecipe)).toThrow('wrong id format');
    });
    it('avec une recette invalide devrait retourner une erreur', () => {
      expect(
        RecipeModel.update(19, {
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          category: 'dessert',
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toThrow('Invalid recipe');
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          category: 'dessert',
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toThrow('Invalid recipe');
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          prepTime: 40,
          category: 'dessert',
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toThrow('Invalid recipe');
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          category: 'dessert',
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toThrow('Invalid recipe');
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          ratings: [5, 5, 5],
          averageRating: 5,
        }),
      ).toThrow('Invalid recipe');
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          category: 'dessert',
          averageRating: 5,
        }),
      ).toThrow('Invalid recipe');
      expect(
        RecipeModel.update(19, {
          title: 'Brownie',
          ingredients: [
            { name: 'chocolat', quantity: 200, unit: 'g', calories: 546 },
            { name: 'beurre', quantity: 100, unit: 'g', calories: 717 },
            { name: 'sucre', quantity: 100, unit: 'g', calories: 387 },
          ],
          steps: [
            'Faire fondre le chocolat',
            'Mélanger les ingrédients',
            'Cuire 25 min',
          ],
          prepTime: 40,
          category: 'dessert',
          ratings: [5, 5, 5],
        }),
      ).toThrow('Invalid recipe');
    });
  });
  describe('Test de delete()', () => {
    it('devrait supprimer une recette', () => {
      const receiptNumberBefore = RecipeModel.findAll().length;
      RecipeModel.delete(19);
      const receiptNumberAfter = RecipeModel.findAll().length;
      expect(receiptNumberAfter === receiptNumberBefore - 1).toEqual(true);
    });
    it('avec un id inexistant devrait retourner une erreur', () => {
      expect(RecipeModel.findById(1000)).toThrow('id not found');
    });
    it('avec un id invalide devrait retourner une erreur', () => {
      expect(RecipeModel.findById(-1)).toThrow('wrong id format');
      expect(
        RecipeModel.findById('12345678-1234-5678-1234-567812345678 '),
      ).toThrow('wrong id format');
      expect(RecipeModel.findById(1.2)).toThrow('wrong id format');
    });
  });
});
