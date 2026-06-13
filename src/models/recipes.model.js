const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../../data/seed.json');
const recipes = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const validateId = (id) => {
  if (typeof id != 'number' || !Number.isInteger(id) || id < 0)
    throw new Error('wrong id format');
};

const RecipeModel = {
  findAll() {
    return recipes;
  },

  findById(id) {
    validateId(id);
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`id not found`);
    }
    return recipes[idx];
  },

  create(data) {
    const recipe = {
      id: recipes.length + 1,
      title: data.title,
      ingredients: data.ingredients || [],
      steps: data.steps || [],
      prepTime: data.prepTime,
      category: data.category,
      ratings: [],
      averageRating: 0,
    };
    recipes.push(recipe);
    return recipe;
  },

  update(id, data) {
    validateId(id);
    const idx = recipes.findIndex((r) => r.id === id);
    Object.assign(recipes[idx], data);
    return recipes[idx];
  },

  delete(id) {
    validateId(id);
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`id not found`);
    }
    const deleted = recipes[idx];
    recipes.splice(idx, 1);
    return deleted;
  },
};

module.exports = RecipeModel;
