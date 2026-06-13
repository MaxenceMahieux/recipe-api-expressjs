/**
 * Calculates estimated nutritional info from a list of ingredients.
 * Each ingredient has: { name, quantity, unit, calories }
 */
const calculateNutrition = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return { totalCalories: 0, ingredientCount: 0 };
  }

  const requiredFields = ['name', 'quantity', 'unit', 'calories'];
  for (const ingredient of ingredients) {
    for (const field of requiredFields) {
      if (!(field in ingredient)) {
        throw new Error('Invalid ingredient');
      }
    }
  }

  const totalCalories = ingredients.reduce((sum, ingredient) => {
    return sum + ingredient.calories;
  }, 0);

  return {
    totalCalories,
    ingredientCount: ingredients.length,
    perIngredient: ingredients.map((i) => ({
      name: i.name,
      calories: i.calories,
    })),
  };
};

module.exports = { calculateNutrition };
