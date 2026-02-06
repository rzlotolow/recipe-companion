import React, { useState } from 'react';
import { db } from '../firebase';
import { updateDoc, doc, writeBatch } from 'firebase/firestore';
import './MakeShoppingList.css';

function MakeShoppingList({ recipes }) {
 const [selectedRecipes, setSelectedRecipes] = useState({});
 const [searchTerm, setSearchTerm] = useState('');
 const [shoppingList, setShoppingList] = useState(null);

 const sortedRecipes = [...recipes].sort((a, b) => a.name.localeCompare(b.name));

 const filteredRecipes = searchTerm
   ? sortedRecipes.filter(recipe =>
       recipe.ingredients.some(ing =>
         !ing.deleted && ing.ingredient.toLowerCase().includes(searchTerm.toLowerCase())
       )
     )
   : sortedRecipes;

 const toggleRecipe = (recipeId) => {
   setSelectedRecipes(prev => ({
     ...prev,
     [recipeId]: !prev[recipeId]
   }));
 };

 const generateShoppingList = async () => {
   const selected = recipes.filter(recipe => selectedRecipes[recipe.id]);
   
   if (selected.length === 0) {
     alert('Please select at least one recipe');
     return;
   }

   const ingredientMap = {};

   selected.forEach(recipe => {
     recipe.ingredients.forEach(ing => {
       if (!ing.deleted && ing.ingredient && ing.qty && ing.unit) {
         const key = `${ing.ingredient}|${ing.unit}`;
         if (ingredientMap[key]) {
           ingredientMap[key].qty += parseFloat(ing.qty);
         } else {
           ingredientMap[key] = {
             ingredient: ing.ingredient,
             qty: parseFloat(ing.qty),
             unit: ing.unit
           };
         }
       }
     });
   });

   const consolidatedList = Object.values(ingredientMap).sort((a, b) =>
     a.ingredient.localeCompare(b.ingredient)
   );

   setShoppingList(consolidatedList);

   try {
     const batch = writeBatch(db);
     selected.forEach(recipe => {
       const recipeRef = doc(db, 'recipes', recipe.id);
       batch.update(recipeRef, {
         timesAddedToShoppingList: (recipe.timesAddedToShoppingList || 0) + 1
       });
     });
     await batch.commit();
   } catch (error) {
     console.error('Error updating recipe counts:', error);
   }
 };

 const clearList = () => {
   setShoppingList(null);
   setSelectedRecipes({});
   setSearchTerm('');
 };

 return (
   <div className="make-shopping-list">
     <h2>Make Shopping List</h2>

     {!shoppingList ? (
       <>
         <div className="search-box">
           <input
             type="text"
             placeholder="Search by ingredient (e.g., rice)"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="clear-search">
               ✕
             </button>
           )}
         </div>

         {filteredRecipes.length === 0 ? (
           <p className="no-results">
             {searchTerm ? 'No recipes found with that ingredient' : 'No recipes available'}
           </p>
         ) : (
           <>
             <div className="recipes-selection">
               {filteredRecipes.map(recipe => (
                 <div key={recipe.id} className="recipe-checkbox">
                   <label>
                     <input
                       type="checkbox"
                       checked={selectedRecipes[recipe.id] || false}
                       onChange={() => toggleRecipe(recipe.id)}
                     />
                     <span>{recipe.name}</span>
                   </label>
                 </div>
               ))}
             </div>

             <button onClick={generateShoppingList} className="generate-btn">
               Generate Food Shopping List
             </button>
           </>
         )}
       </>
     ) : (
       <div className="shopping-list-result">
         <h3>Your Shopping List</h3>
         <div className="shopping-items">
           {shoppingList.map((item, index) => (
             <div key={index} className="shopping-item">
               <span className="item-name">{item.ingredient}</span>
               <span className="item-qty">
                 {item.qty.toFixed(2)} {item.unit}
               </span>
             </div>
           ))}
         </div>
         <button onClick={clearList} className="new-list-btn">
           Create New Shopping List
         </button>
       </div>
     )}
   </div>
 );
}

export default MakeShoppingList;
