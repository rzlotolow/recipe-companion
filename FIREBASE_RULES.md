# Firestore Security Rules

Copy and paste these rules into your Firebase Console under Firestore Database → Rules:

rules_version = '2';
service cloud.firestore {
 match /databases/{database}/documents {
   
   function isSignedIn() {
     return request.auth != null;
   }
   
   function isOwner(userId) {
     return isSignedIn() && request.auth.uid == userId;
   }
   
   match /recipes/{recipeId} {
     allow read: if isOwner(resource.data.userId);
     allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
     allow update: if isOwner(resource.data.userId);
     allow delete: if isOwner(resource.data.userId);
   }
   
   match /ingredients/{ingredientId} {
     allow read: if isOwner(resource.data.userId);
     allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
     allow update: if isOwner(resource.data.userId);
     allow delete: if isOwner(resource.data.userId);
   }
   
   match /units/{unitId} {
     allow read: if isSignedIn();
     allow write: if false;
   }
 }
}
