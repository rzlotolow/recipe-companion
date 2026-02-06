import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import './AddRecipe.css';

function AddRecipe({ user, ingredients, units, editingRecipe, onCancelEdit }) {
 const [recipeName, setRecipeName] = useState('');
 const [recipeIngredients, setRecipeIngredients] = useState([]);
 const [notes, setNotes] = useState('');

 useEffect(() => {
   if (editingRecipe) {
     setRecipeName(editingRecipe.name);
     setRecipeIngredients(editingRecipe.ingredients || []);
     setNotes(editingRecipe.notes || '');
   } else {
     setRecipeName('');
     setRecipeIngredients([]);
     setNotes('');
   }
 }, [editingRecipe]);

 const addIngredientRow = () => {
   setRecipeIngredients([...recipeIngredients, { ingredient: '', qty: '', unit: '', deleted: false, isNew: false, newIngredientName: '' }]);
 };

 const updateIngredientRow = (index, field, value) => {
   const updated = [...recipeIngredients];
   
   if (field === 'ingredient') {
     if (value === '__ADD_NEW__') {
       updated[index].isNew = true;
       updated[index].ingredient = '';
       updated[index].newIngredientName = '';
     } else {
       updated[index].isNew = false;
       updated[index].ingredient = value;
     }
   } else if (field === 'newIngredientName') {
     updated[index].newIngredientName = value;
     updated[index].ingredient = value;
   } else {
     updated[index][field] = value;
   }
   
   setRecipeIngredients(updated);
 };

 const deleteIngredientRow = (index) => {
   const updated = [...recipeIngredients];
   updated[index].deleted = true;
   setRecipeIngredients(updated);
 };

 const handleSaveRecipe = async () => {
   if (!recipeName.trim()) {
     alert('Please enter a recipe name');
     return;
   }

   const activeIngredients = recipeIngredients.filter(ing => !ing.deleted && ing.ingredient);
   if (activeIngredients.length === 0) {
     alert('Please add at least one ingredient');
     return;
   }

   try {
     const newIngredients = activeIngredients.filter(ing => ing.isNew && ing.newIngredientName.trim());
     
     for (const ing of newIngredients) {
       const existingIngredient = ingredients.find(i => i.name.toLowerCase() === ing.newIngredientName.trim().toLowerCase());
       if (!existingIngredient) {
         await addDoc(collection(db, 'ingredients'), {
           name: ing.newIngredientName.trim(),
           userId: user.uid,
           deleted: false,
           createdAt: new Date()
         });
       }
     }

     const recipeData = {
       name: recipeName.trim(),
       ingredients: activeIngredients.map(ing => ({
         ingredient: ing.ingredient.trim(),
         qty: ing.qty,
         unit: ing.unit,
         deleted: false
       })),
       notes: notes.trim(),
       userId: user.uid,
       deleted: false,
       updatedAt: new Date()
     };

     if (editingRecipe) {
       await updateDoc(doc(db, 'recipes', editingRecipe.id), recipeData);
       onCancelEdit();
     } else {
       recipeData.timesAddedToShoppingList = 0;
       recipeData.createdAt = new Date();
       await addDoc(collection(db, 'recipes'), recipeData);
     }

     setRecipeName('');
     setRecipeIngredients([]);
     setNotes('');
     alert(editingRecipe ? 'Recipe updated!' : 'Recipe saved!');
   } catch (error) {
     console.error('Error saving recipe:', error);
     alert('Error saving recipe');
   }
 };

 const handleCancel = () => {
   setRecipeName('');
   setRecipeIngredients([]);
   setNotes('');
   onCancelEdit();
 };

 const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));

 return (
   <div className="add-recipe">
     <h2>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>

     <div className="form-group">
       <label>Recipe Name *</label>
       <input
         type="text"
         value={recipeName}
         onChange={(e) => setRecipeName(e.target.value)}
         placeholder="Enter recipe name"
       />
     </div>

     <div className="form-group">
       <label>Ingredients *</label>
       <button onClick={addIngredientRow} className="add-ingredient-btn">
         + Add Ingredient
       </button>

       {recipeIngredients.map((ing, index) => (
         !ing.deleted && (
           <div key={index} className="ingredient-row">
             {!ing.isNew ? (
               <select
                 value={ing.ingredient}
                 onChange={(e) => updateIngredientRow(index, 'ingredient', e.target.value)}
               >
                 <option value="">Select ingredient</option>
                 {sortedIngredients.map(ingredient => (
                   <option key={ingredient.id} value={ingredient.name}>
                     {ingredient.name}
                   </option>
                 ))}
                 <option value="__ADD_NEW__">+ Add New Ingredient</option>
               </select>
             ) : (
               <input
                 type="text"
                 value={ing.newIngredientName}
                 onChange={(e) => updateIngredientRow(index, 'newIngredientName', e.target.value)}
                 placeholder="Enter new ingredient name"
               />
             )}

             <input
               type="number"
               step="0.01"
               value={ing.qty}
               onChange={(e) => updateIngredientRow(index, 'qty', e.target.value)}
               placeholder="Qty"
             />

             <select
               value={ing.unit}
               onChange={(e) => updateIngredientRow(index, 'unit', e.target.value)}
             >
               <option value="">Unit</option>
               {units.map(unit => (
                 <option key={unit.id} value={unit.name}>
                   {unit.name}
                 </option>
               ))}
             </select>

             <button onClick={() => deleteIngredientRow(index)} className="delete-btn">
               🗑️
             </button>
           </div>
         )
       ))}
     </div>

     <div className="form-group">
       <label>Notes</label>
       <textarea
         value={notes}
         onChange={(e) => setNotes(e.target.value)}
         placeholder="Add any notes about this recipe"
         rows="4"
       />
     </div>

     <div className="button-group">
       <button onClick={handleSaveRecipe} className="save-recipe-btn">
         {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
       </button>
       {editingRecipe && (
         <button onClick={handleCancel} className="cancel-edit-btn">
           Cancel
         </button>
       )}
     </div>
   </div>
 );
}

export default AddRecipe;
