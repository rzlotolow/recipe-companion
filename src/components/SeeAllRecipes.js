import React from 'react';
import { db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';
import './SeeAllRecipes.css';

function SeeAllRecipes({ recipes, onEdit }) {
 const sortedRecipes = [...recipes].sort((a, b) => a.name.localeCompare(b.name));

 const handleDelete = async (recipe) => {
   if (window.confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
     try {
       await updateDoc(doc(db, 'recipes', recipe.id), { deleted: true });
     } catch (error) {
       console.error('Error deleting recipe:', error);
     }
   }
 };

 return (
   <div className="see-all-recipes">
     <h2>All Recipes ({sortedRecipes.length})</h2>

     {sortedRecipes.length === 0 ? (
       <p className="no-recipes">No recipes yet. Add your first recipe!</p>
     ) : (
       <div className="recipes-list">
         {sortedRecipes.map(recipe => (
           <div key={recipe.id} className="recipe-card">
             <div className="recipe-header">
               <h3>{recipe.name}</h3>
               <span className="frequency-badge">
                 Used {recipe.timesAddedToShoppingList || 0} times
               </span>
             </div>
             <div className="recipe-actions">
               <button onClick={() => onEdit(recipe)} className="edit-btn">
                 ✏️ Edit
               </button>
               <button onClick={() => handleDelete(recipe)} className="delete-btn">
                 🗑️ Delete
               </button>
             </div>
           </div>
         ))}
       </div>
     )}
   </div>
 );
}

export default SeeAllRecipes;
