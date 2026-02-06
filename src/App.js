import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import './App.css';
import AddRecipe from './components/AddRecipe';
import SeeAllRecipes from './components/SeeAllRecipes';
import MakeShoppingList from './components/MakeShoppingList';

function App() {
 const [user, setUser] = useState(null);
 const [activeTab, setActiveTab] = useState('add');
 const [recipes, setRecipes] = useState([]);
 const [ingredients, setIngredients] = useState([]);
 const [units, setUnits] = useState([]);
 const [editingRecipe, setEditingRecipe] = useState(null);

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
     setUser(currentUser);
   });
   return () => unsubscribe();
 }, []);

 useEffect(() => {
   if (!user) return;

   const recipesQuery = query(
     collection(db, 'recipes'),
     where('userId', '==', user.uid),
     where('deleted', '==', false)
   );
   const unsubRecipes = onSnapshot(recipesQuery, (snapshot) => {
     const recipesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     setRecipes(recipesData);
   });

   const ingredientsQuery = query(
     collection(db, 'ingredients'),
     where('userId', '==', user.uid),
     where('deleted', '==', false)
   );
   const unsubIngredients = onSnapshot(ingredientsQuery, (snapshot) => {
     const ingredientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     setIngredients(ingredientsData);
   });

   const unsubUnits = onSnapshot(collection(db, 'units'), (snapshot) => {
     const unitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     setUnits(unitsData);
   });

   return () => {
     unsubRecipes();
     unsubIngredients();
     unsubUnits();
   };
 }, [user]);

 const handleLogin = async () => {
   try {
     await signInWithPopup(auth, googleProvider);
   } catch (error) {
     console.error('Login error:', error);
   }
 };

 const handleLogout = async () => {
   try {
     await signOut(auth);
     setActiveTab('add');
     setEditingRecipe(null);
   } catch (error) {
     console.error('Logout error:', error);
   }
 };

 const handleEditRecipe = (recipe) => {
   setEditingRecipe(recipe);
   setActiveTab('add');
 };

 const handleCancelEdit = () => {
   setEditingRecipe(null);
 };

 if (!user) {
   return (
     <div className="login-container">
       <div className="login-card">
         <h1>🍳 Recipe Companion</h1>
         <p>Track your recipes and generate shopping lists</p>
         <button onClick={handleLogin} className="login-button">
           Sign in with Google
         </button>
       </div>
     </div>
   );
 }

 return (
   <div className="app">
     <header className="app-header">
       <h1>🍳 Recipe Companion</h1>
       <div className="user-info">
         <span>{user.email}</span>
         <button onClick={handleLogout} className="logout-button">Logout</button>
       </div>
     </header>

     <nav className="tabs">
       <button
         className={activeTab === 'add' ? 'tab active' : 'tab'}
         onClick={() => setActiveTab('add')}
       >
         {editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
       </button>
       <button
         className={activeTab === 'all' ? 'tab active' : 'tab'}
         onClick={() => setActiveTab('all')}
       >
         See All Recipes
       </button>
       <button
         className={activeTab === 'shopping' ? 'tab active' : 'tab'}
         onClick={() => setActiveTab('shopping')}
       >
         Make Shopping List
       </button>
     </nav>

     <main className="app-content">
       {activeTab === 'add' && (
         <AddRecipe
           user={user}
           ingredients={ingredients}
           units={units}
           editingRecipe={editingRecipe}
           onCancelEdit={handleCancelEdit}
         />
       )}
       {activeTab === 'all' && (
         <SeeAllRecipes
           recipes={recipes}
           onEdit={handleEditRecipe}
         />
       )}
       {activeTab === 'shopping' && (
         <MakeShoppingList recipes={recipes} />
       )}
     </main>
   </div>
 );
}

export default App;
