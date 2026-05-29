const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../../data/seed.json');
const recipes = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const RecipeModel = {
  findAll() {
    return recipes;
  },

  findById(id) {
    return recipes.find((r) => r.id === parseInt(id, 10));
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
    const idx = recipes.findIndex((r) => r.id === parseInt(id, 10));
    if (idx === -1) return null;
    Object.assign(recipes[idx], data);
    return recipes[idx];
  },

  delete(id) {
    const idx = recipes.findIndex((r) => r.id === parseInt(id, 10));
    if (idx === -1) return null;
    const deleted = recipes[idx];
    recipes.splice(idx, 1);
    return deleted;
  },
};

module.exports = RecipeModel;
