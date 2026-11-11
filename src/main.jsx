import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/**
 * Protección contra mutaciones del DOM provocadas por traductores del navegador
 * o extensiones (evita el error 'Failed to execute removeChild/insertBefore on Node' al cambiar de pestaña).
 */
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) {
        console.warn('Prevented removeChild crash from external DOM mutation.');
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.warn('Prevented insertBefore crash from external DOM mutation.');
      }
      return originalInsertBefore.apply(this, [newNode, null]);
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

createRoot(document.getElementById('root')).render(<App />);
