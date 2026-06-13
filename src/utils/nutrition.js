/**
 * Calculates estimated nutritional info from a list of ingredients.
 * Each ingredient has: { name, quantity, unit, calories }
 */
const calculateNutrition = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return { totalCalories: 0, ingredientCount: 0 };
<<<<<<< HEAD
  }

  const requiredFields = ["name", "quantity", "unit", "calories"];
  for (const ingredient of ingredients) {
    for (const field of requiredFields) {
      if (!(field in ingredient)) {
        throw new Error("Invalid ingredient");
      }
    }
  }

  const totalCalories = ingredients.reduce((sum, ingredient) => {
    return sum + ingredient.calories;
  }, 0);
=======
  }

  const totalCalories = ingredients.reduce(
    (sum, ingredient) => sum + ingredient.calories,
    0,
  );
>>>>>>> b7e4d5b8acf71c6de90e1b3a46f1be5cc900fac0

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
