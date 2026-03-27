import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProductCatalogue from './components/ProductCatalogue';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProductCatalogue />
  },
  {
    path: '/admin',
    element: <App />
  }
]);
