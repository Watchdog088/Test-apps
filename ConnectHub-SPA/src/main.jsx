// src/main.jsx — App entry point (tiny: only renders <App />)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

// Global error handler — prevents silent JS crashes
window.addEventListener('error', (e) => {
  console.error('[GlobalError]', e.message, 'at', e.filename, ':', e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[UnhandledPromise]', e.reason);
  e.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
