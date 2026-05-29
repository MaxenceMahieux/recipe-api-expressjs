const express = require('express');
const recipesRouter = require('./routes/recipes.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/recipes', recipesRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
