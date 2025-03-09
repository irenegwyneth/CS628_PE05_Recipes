import React, { useState, useEffect } from 'react';

function App() {
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        fetch('https://ominous-spoon-69r9v7nwpr7jfqq6-5000.app.github.dev/recipes') 
            .then((res) => res.json())
            .then((data) => setRecipes(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h1>Recipes</h1>
            {recipes.length === 0 ? (
                <p>No recipes found.</p>
            ) : (
                <ul>
                    {recipes.map((recipe) => (
                        <li key={recipe._id}>
                            <h2>{recipe.title}</h2>
                            <p>{recipe.instructions}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;

