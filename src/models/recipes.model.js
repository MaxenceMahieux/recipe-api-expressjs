const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../../data/seed.json');
const recipes = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const validateId = (id) => {
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 0)
    throw new Error('wrong id format');

  const idx = recipes.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new Error(`id not found`);
  }
  return idx;
};

const validateRecipe = (recipe, requiredFields) => {
  requiredFields.forEach((field) => {
    if (!(field in recipe)) {
      throw new Error('Invalid recipe');
    }
  });
};

const RecipeModel = {
  findAll() {
    return recipes;
  },

  findById(id) {
    const idx = validateId(id);

    return recipes[idx];
  },

  create(data) {
    const requiredFields = [
      'title',
      'ingredients',
      'steps',
      'prepTime',
      'category',
    ];
    validateRecipe(data, requiredFields);
    const idx = recipes.findIndex((r) => r.title === data.title);
    if (idx !== -1) {
      throw new Error('There is already a recipe with that title');
    }

    const recipe = {
      id: recipes.length + 1,
      title: data.title,
      ingredients: data.ingredients,
      steps: data.steps,
      prepTime: data.prepTime,
      category: data.category,
      ratings: [],
      averageRating: 0,
    };
    recipes.push(recipe);
    return recipe;
  },

  update(id, data) {
    const idx = validateId(id);
    const requiredFields = [
      'title',
      'ingredients',
      'steps',
      'prepTime',
      'category',
      'ratings',
      'averageRating',
    ];
    validateRecipe(data, requiredFields);

    Object.assign(recipes[idx], data);
    return recipes[idx];
  },

  delete(id) {
    const idx = validateId(id);

    const deleted = recipes[idx];
    recipes.splice(idx, 1);
    return deleted;
  },
};

module.exports = RecipeModel;
