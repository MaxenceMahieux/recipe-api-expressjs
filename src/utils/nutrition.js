/**
 * Calculates estimated nutritional info from a list of ingredients.
 * Each ingredient has: { name, quantity, unit, calories }
 */
const calculateNutrition = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return { totalCalories: 0, ingredientCount: 0 }
  }

  const totalCalories = ingredients.reduce((sum, ingredient) => {
    return sum + ingredient.calories
  }, 0)

  return {
    totalCalories,
    ingredientCount: ingredients.length,
    perIngredient: ingredients.map((i) => ({
      name: i.name,
      calories: i.calories,
    })),
  }
}

module.exports = { calculateNutrition }
