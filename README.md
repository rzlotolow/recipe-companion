# Recipe Companion

A Progressive Web App for tracking recipes and generating shopping lists.

## Features

- Add and manage recipes with ingredients
- Track recipe usage frequency
- Generate consolidated shopping lists
- Search recipes by ingredient
- Google authentication
- Real-time sync across devices
- Works offline after first load
- Install on iPhone home screen

## Setup

1. Clone this repository
2. Run `npm install`
3. Update `src/firebase.js` with your Firebase config
4. Update `package.json` homepage with your GitHub username
5. Run `npm start` for local development
6. Run `npm run deploy` to deploy to GitHub Pages

## Firebase Setup

1. Create a Firebase project
2. Enable Google Authentication
3. Enable Firestore Database
4. Add Firestore security rules (see below)
5. Initialize units collection with cooking units

## Firestore Security Rules

See FIREBASE_RULES.md for the complete security rules.

## Technologies

- React
- Firebase (Auth + Firestore)
- GitHub Pages
- Progressive Web App (PWA)
