import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProductCatalogue from './components/ProductCatalogue';
import MainPage from './components/MainPage';

export const router = createBrowserRouter([
  {
    path: '/catalogue',
    element: <ProductCatalogue />
  },
  {
    path: '/admin',
    element: <App />
  },
  {
    path: '/',
    element: <MainPage />
  }
]);
