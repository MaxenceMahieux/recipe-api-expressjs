const { calculateNutrition } = require('../utils/nutrition');

describe('Test du calcul de la nutrition de la recette', () => {
  // Utilisation d'un morceau de la seed pour test
  const defaultRecipe = [
    { name: 'spaghetti', quantity: 400, unit: 'g', calories: 371 },
    { name: 'lardons', quantity: 200, unit: 'g', calories: 337 },
    { name: 'oeuf', quantity: 4, unit: 'pièce', calories: 68 },
    { name: 'parmesan', quantity: 80, unit: 'g', calories: 431 },
  ];
  let nutrition;

  beforeEach(() => {
    nutrition = calculateNutrition(defaultRecipe);
  });

  describe('Test du calcul des calories totales', () => {
    it('devrait retourner un total de calorie de 871836950912', () => {
      expect(nutrition.totalCalories).toEqual(250552);
    });
    it('avec 0 ingrédients devrait retourner un total de calorie de 0', () => {
      nutrition = calculateNutrition([]);
      expect(nutrition.totalCalories).toEqual(0);
    });
  });

  describe("Test du calcul du nombre d'ingrédients", () => {
    it("devrait retourner un total d'ingrédients de 4", () => {
      expect(nutrition.ingredientCount).toEqual(4);
    });
    it("devrait retourner un total d'ingrédients de 0", () => {
      expect(calculateNutrition([]).ingredientCount).toEqual(0);
    });
    it("devrait retourner un total d'ingrédients de 0", () => {
      const recipeWith0Quantity = [
        { name: 'spaghetti', quantity: 0, unit: 'g', calories: 371 },
        { name: 'lardons', quantity: 0, unit: 'g', calories: 337 },
        { name: 'oeuf', quantity: 0, unit: 'pièce', calories: 68 },
        { name: 'parmesan', quantity: 0, unit: 'g', calories: 431 },
      ];
      nutrition = calculateNutrition(recipeWith0Quantity);

      expect(nutrition.ingredientCount).toEqual(0);
    });
  });

  describe('Test de la vérification des ingrédients', () => {
    it('avec aucun ingrédient valide devrait retourner une erreur', () => {
      expect(() => calculateNutrition([{}])).toThrow('Invalid ingredient');
    });
    it('avec un ingrédient incomplet devrait retourner une erreur', () => {
      expect(() => calculateNutrition([{}])).toThrow('Invalid ingredient');
      expect(() =>
        calculateNutrition([{ name: 'spaghetti', quantity: 400, unit: 'g' }]),
      ).toThrow('Invalid ingredient');
    });
    it('avec au moins un ingrédient invalide devrait retourner une erreur', () => {
      expect(() =>
        calculateNutrition([
          { name: 'spaghetti', quantity: 400, unit: 'g', calories: 371 },
          {},
          { name: 'oeuf', quantity: 4, unit: 'pièce', calories: 68 },
          { name: 'parmesan', quantity: 80, unit: 'g', calories: 431 },
        ]),
      ).toThrow('Invalid ingredient');
    });
    it('avec un ingrédient incomplet devrait retourner une erreur', () => {
      expect(() => calculateNutrition([{}])).toThrow('Invalid ingredient');
      expect(() =>
        calculateNutrition([{ name: 'spaghetti', quantity: 400, unit: 'g' }]),
      ).toThrow('Invalid ingredient');
    });
    it('avec une unitée invalide devrait retourner une erreur', () => {
      expect(() =>
        calculateNutrition([
          { name: 'spaghetti', quantity: 400, unit: 'km', calories: 371 },
        ]),
      ).toThrow('Invalid unit');
      expect(() =>
        calculateNutrition([
          { name: 'spaghetti', quantity: 400, unit: 3, calories: 371 },
        ]),
      ).toThrow('Invalid unit');
      expect(() =>
        calculateNutrition([
          { name: 'spaghetti', quantity: 400, unit: 3.2, calories: 371 },
        ]),
      ).toThrow('Invalid unit');
    });
    it('avec une quantité invalide devrait retourner une erreur', () => {
      expect(() =>
        calculateNutrition([
          { name: 'spaghetti', quantity: '400', unit: 'g', calories: 371 },
        ]),
      ).toThrow('Invalid quantity');
    });
    it('avec un nom invalide devrait retourner une erreur', () => {
      expect(() =>
        calculateNutrition([
          { name: 34, quantity: '400', unit: 'g', calories: 371 },
        ]),
      ).toThrow('Invalid quantity');
    });
    it('devrait supporter un nom long', () => {
      const size = 1024 * 1024;
      const hugeString = 'a'.repeat(size);
      expect(() =>
        calculateNutrition([
          { name: hugeString, quantity: '400', unit: 'g', calories: 371 },
        ]),
      ).not.toThrow('Invalid quantity');
    });
    it('devrait supporter une grande quantité', () => {
      expect(() =>
        calculateNutrition([
          { name: 'camembert', quantity: Infinity, unit: 'g', calories: 371 },
        ]),
      ).not.toThrow('Invalid quantity');
    });
    it('devrait supporter un grand nombre de calories', () => {
      expect(() =>
        calculateNutrition([
          { name: 'camembert', quantity: 400, unit: 'g', calories: Infinity },
        ]),
      ).not.toThrow('Invalid quantity');
    });
  });

  describe('Test du calcul des calories par ingrédient', () => {
    it('devrait retourner un résulat correct', () => {
      expect(
        calculateNutrition([
          { name: 'camembert', quantity: 400, unit: 'g', calories: 500 },
          { name: 'vin', quantity: 400, unit: 'l', calories: 500 },
        ]).perIngredient,
      ).toEqual([
        { name: 'camembert', calories: 200000 },
        { name: 'vin', calories: 200000 },
      ]);
    });
  });
});
