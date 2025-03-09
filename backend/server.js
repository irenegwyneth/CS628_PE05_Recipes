const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://mongodb:27017/recipes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

const recipeSchema = new mongoose.Schema({
    title: String,
    ingredients: [String],
    instructions: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);

const getNavigation = () => `
    <nav>
        <ul style="display: flex; gap: 20px; background: white; padding: 10px;">
            <li><a href="/recipes" style="color: blue;">Recipes</a></li>
            <li><a href="/about" style=" color: blue;">About</a></li>
            <li><a href="/enter-recipe" style=" color: blue;">Enter Recipe</a></li>
        </ul>
    </nav>
`;

app.get('/recipes', async (req, res) => {
    const recipes = await Recipe.find();
    let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recipes</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 10px;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .card {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .card a {
                    text-decoration: none;
                    color: #007bff;
                    font-weight: bold;
                }
                .card a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            ${getNavigation()}
            <div class="container">
                <h1>Recipes</h1>
                ${recipes.map(recipe => `
                    <div class="card">
                        <h2><a href="/recipes/${recipe._id}">${recipe.title}</a></h2>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
    res.send(htmlContent);
});


// Route to view a single recipe
app.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('<h1>Recipe not found</h1>');
        }
        const commentsHTML = recipe.comments.map(comment => `
            <div class="comment">
                <p><strong>${comment.username}:</strong> ${comment.comment}</p>
                <small>${new Date(comment.date).toLocaleString()}</small>
            </div>
        `).join('');
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${recipe.title}</title>
            </head>
            <body>
                ${getNavigation()}
                <h1>${recipe.title}</h1>
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
                <p><strong>Instructions:</strong> ${recipe.instructions}</p>
                <div>
                    <h3>Comments</h3>
                    ${commentsHTML || "<p>No comments yet. Be the first to comment!</p>"}
                    <form action="/recipes/${recipe._id}/comment" method="POST">
                        <input type="text" name="username" placeholder="Your Name" required />
                        <textarea name="comment" placeholder="Write a comment..." required></textarea>
                        <button type="submit">Post Comment</button>
                    </form>
                </div>
            </body>
            </html>
        `;
        res.send(htmlContent);
    } catch (err) {
        res.status(500).send('<h1>Server Error</h1>');
    }
});

app.get('/enter-recipe', (req, res) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enter Recipe</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: white;
                }
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 10px;
                    background: #fff;
                    border-radius: 8px;
                }
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                input, textarea {
                    padding: 10px;
                    font-size: 1rem;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    width: 100%;
                }
                button {
                    padding: 10px;
                    font-size: 1rem;
                    color: #fff;
                    background-color: blue;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            ${getNavigation()}
            <div class="container">
                <h1>Enter Recipe</h1>
                <form action="/enter-recipe" method="POST">
                    <input type="text" name="title" placeholder="Recipe Title" required />
                    <textarea name="ingredients" placeholder="Ingredients" required></textarea>
                    <textarea name="instructions" placeholder="Instructions" required></textarea>
                    <button type="submit">Add Recipe</button>
                </form>
            </div>
        </body>
        </html>
    `;
    res.send(htmlContent);
});

app.post('/enter-recipe', async (req, res) => {
    const { title, ingredients, instructions } = req.body;
    const recipe = new Recipe({
        title,
        ingredients: ingredients.split(',').map(ing => ing.trim()),
        instructions,
    });
    await recipe.save();
    res.redirect('/recipes');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



