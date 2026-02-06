import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if ('serviceWorker' in navigator) {
 window.addEventListener('load', () => {
   navigator.serviceWorker.register('/recipe-companion/service-worker.js')
     .then(registration => console.log('SW registered'))
     .catch(err => console.log('SW registration failed'));
 });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
   <App />
 </React.StrictMode>
);
