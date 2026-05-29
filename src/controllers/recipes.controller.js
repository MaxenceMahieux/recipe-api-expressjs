const RecipeModel = require("../models/recipes.model")
const { calculateNutrition } = require("../utils/nutrition")

const recipesController = {
  getRecipes(req, res) {
    const { category, maxTime } = req.query
    let recipes = RecipeModel.findAll()

    if (category) {
      recipes = recipes.filter((r) => r.category === category)
    }

    if (maxTime !== undefined) {
      recipes = recipes.filter((r) => r.prepTime <= maxTime)
    }

    res.json({ success: true, data: recipes })
  },

  getRecipeById(req, res) {
    const recipe = RecipeModel.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: "Recipe not found" })
    }
    res.json({ success: true, data: recipe })
  },

  createRecipe(req, res) {
    const { title, ingredients, steps, prepTime, category } = req.body

    if (!title || !prepTime || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, prepTime, category",
      })
    }

    const recipe = RecipeModel.create({
      title,
      ingredients,
      steps,
      prepTime,
      category,
    })
    res.status(201).json({ success: true, data: recipe })
  },

  updateRecipe(req, res) {
    const recipe = RecipeModel.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: "Recipe not found" })
    }

    const updated = RecipeModel.update(req.params.id, req.body)
    res.json({ success: true, data: updated })
  },

  deleteRecipe(req, res) {
    const deleted = RecipeModel.delete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Recipe not found" })
    }
    res.json({ success: true, data: deleted })
  },

  rateRecipe(req, res) {
    const recipe = RecipeModel.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: "Recipe not found" })
    }

    const { rating } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, error: "Rating must be between 1 and 5" })
    }

    recipe.ratings.push(Number(rating))
    const sum = recipe.ratings.reduce((acc, r) => acc + r, 0)
    recipe.averageRating = sum / (recipe.ratings.length - 1)

    res.json({ success: true, data: recipe })
  },

  getNutrition(req, res) {
    const recipe = RecipeModel.findById(req.params.id)
    if (!recipe) {
      return res.status(404).json({ success: false, error: "Recipe not found" })
    }

    const nutrition = calculateNutrition(recipe.ingredients)
    res.json({ success: true, data: nutrition })
  },
}

module.exports = recipesController
